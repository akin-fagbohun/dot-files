"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLCodeLensProvider = void 0;
const vscode_1 = require("vscode");
const source_1 = require("../helpers/source");
const capitalize_1 = __importDefault(require("capitalize"));
class GraphQLCodeLensProvider {
    constructor(outputChannel) {
        this.outputChannel = outputChannel;
        this.sourceHelper = new source_1.SourceHelper(this.outputChannel);
    }
    provideCodeLenses(document, _token) {
        const literals = this.sourceHelper.extractAllTemplateLiterals(document, [
            'gql',
            'graphql',
            '/\\* GraphQL \\*/',
        ]);
        const results = literals.map(literal => {
            return new vscode_1.CodeLens(new vscode_1.Range(new vscode_1.Position(literal.position.line, 0), new vscode_1.Position(literal.position.line, 0)), {
                title: `Execute ${(0, capitalize_1.default)(literal.definition.operation)}`,
                command: 'vscode-graphql-execution.contentProvider',
                arguments: [literal],
            });
        });
        return results;
    }
}
exports.GraphQLCodeLensProvider = GraphQLCodeLensProvider;
//# sourceMappingURL=exec-codelens.js.map