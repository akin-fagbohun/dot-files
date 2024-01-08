"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFragmentDependenciesForAST = exports.getFragmentDependencies = exports.SourceHelper = void 0;
const graphql_1 = require("graphql");
const nullthrows_1 = __importDefault(require("nullthrows"));
class SourceHelper {
    constructor(outputChannel) {
        this.outputChannel = outputChannel;
        this.fragmentDefinitions = new Map();
    }
    getTypeForVariableDefinitionNode(node) {
        let namedTypeNode = null;
        let isList = false;
        (0, graphql_1.visit)(node, {
            ListType(_listNode) {
                isList = true;
            },
            NamedType(namedNode) {
                namedTypeNode = namedNode;
            },
        });
        if (isList) {
            return 'ListNode';
        }
        if (namedTypeNode) {
            return namedTypeNode.name.value;
        }
        return 'String';
    }
    validate(value, type) {
        try {
            switch (type) {
                case 'Int':
                    if (parseInt(value, 10)) {
                        return null;
                    }
                    break;
                case 'Float':
                    if (parseFloat(value)) {
                        return null;
                    }
                    break;
                case 'Boolean':
                    if (value === 'true' || value === 'false') {
                        return null;
                    }
                    break;
                case 'String':
                case 'ID':
                case 'Enum':
                    if (value.length && !Array.isArray(value)) {
                        return null;
                    }
                    break;
                default:
                    try {
                        JSON.parse(value);
                        return null;
                    }
                    catch (_a) {
                        return;
                    }
            }
        }
        catch (_b) {
            return `${value} is not a valid ${type}`;
        }
        return `${value} is not a valid ${type}`;
    }
    typeCast(value, type) {
        if (type === 'Int') {
            return parseInt(value, 10);
        }
        if (type === 'Float') {
            return parseFloat(value);
        }
        if (type === 'Boolean') {
            return Boolean(value);
        }
        if (type === 'String' || type === 'ID' || type === 'Enum') {
            return value;
        }
        try {
            return JSON.parse(value);
        }
        catch (_a) {
            this.outputChannel.appendLine('Failed to parse user input as JSON, please use double quotes.');
            return value;
        }
    }
    async getFragmentDefinitions(projectConfig) {
        try {
            const sources = await projectConfig.getDocuments();
            const { fragmentDefinitions } = this;
            for (const source of sources) {
                if (!source.document) {
                    continue;
                }
                (0, graphql_1.visit)(source.document, {
                    FragmentDefinition(node) {
                        const existingDef = fragmentDefinitions.get(node.name.value);
                        const newVal = (0, graphql_1.print)(node);
                        if ((existingDef && existingDef.content !== newVal) ||
                            !existingDef) {
                            fragmentDefinitions.set(node.name.value, {
                                definition: node,
                                content: newVal,
                                filePath: source.location,
                            });
                        }
                    },
                });
            }
            return fragmentDefinitions;
        }
        catch (err) {
            this.outputChannel.append(`${err}`);
        }
    }
    extractAllTemplateLiterals(document, tags = ['gql']) {
        const text = document.getText();
        const documents = [];
        if (document.languageId === 'graphql') {
            try {
                const documentText = document.getText();
                processGraphQLString(documentText, 0);
                return documents;
            }
            catch (_a) { }
        }
        for (const tag of tags) {
            const regExpGQL = new RegExp(tag + '\\s*`([\\s\\S]+?)`', 'mg');
            let result;
            while ((result = regExpGQL.exec(text)) !== null) {
                const contents = result[1];
                if (contents.match('/${(.+)?}/g')) {
                    continue;
                }
                try {
                    processGraphQLString(contents, result.index + tag.length + 1);
                }
                catch (_b) { }
            }
        }
        return documents;
        function processGraphQLString(textString, offset) {
            const ast = (0, graphql_1.parse)(textString);
            const operations = ast.definitions.filter(def => def.kind === 'OperationDefinition');
            for (const operation of operations) {
                const op = operation;
                const filteredAst = {
                    ...ast,
                    definitions: ast.definitions.filter(def => {
                        if (def.kind === 'OperationDefinition' && def !== op) {
                            return false;
                        }
                        return true;
                    }),
                };
                documents.push({
                    content: (0, graphql_1.print)(filteredAst),
                    uri: document.uri.path,
                    position: document.positionAt(op.loc.start + offset),
                    definition: op,
                    ast: filteredAst,
                });
            }
        }
    }
}
exports.SourceHelper = SourceHelper;
const getFragmentDependencies = async (query, fragmentDefinitions) => {
    if (!fragmentDefinitions) {
        return [];
    }
    let parsedQuery;
    try {
        parsedQuery = (0, graphql_1.parse)(query);
    }
    catch (_a) {
        return [];
    }
    return (0, exports.getFragmentDependenciesForAST)(parsedQuery, fragmentDefinitions);
};
exports.getFragmentDependencies = getFragmentDependencies;
const getFragmentDependenciesForAST = async (parsedQuery, fragmentDefinitions) => {
    if (!fragmentDefinitions) {
        return [];
    }
    const existingFrags = new Map();
    const referencedFragNames = new Set();
    (0, graphql_1.visit)(parsedQuery, {
        FragmentDefinition(node) {
            existingFrags.set(node.name.value, true);
        },
        FragmentSpread(node) {
            if (!referencedFragNames.has(node.name.value)) {
                referencedFragNames.add(node.name.value);
            }
        },
    });
    const asts = new Set();
    for (const name of referencedFragNames) {
        if (!existingFrags.has(name) && fragmentDefinitions.has(name)) {
            asts.add((0, nullthrows_1.default)(fragmentDefinitions.get(name)));
        }
    }
    const referencedFragments = [];
    for (const ast of asts) {
        (0, graphql_1.visit)(ast.definition, {
            FragmentSpread(node) {
                if (!referencedFragNames.has(node.name.value) &&
                    fragmentDefinitions.get(node.name.value)) {
                    asts.add((0, nullthrows_1.default)(fragmentDefinitions.get(node.name.value)));
                    referencedFragNames.add(node.name.value);
                }
            },
        });
        if (!existingFrags.has(ast.definition.name.value)) {
            referencedFragments.push(ast);
        }
    }
    return referencedFragments;
};
exports.getFragmentDependenciesForAST = getFragmentDependenciesForAST;
//# sourceMappingURL=source.js.map