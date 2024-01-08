"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLContentProvider = void 0;
const vscode_1 = require("vscode");
const graphql_config_1 = require("graphql-config");
const graphql_1 = require("graphql");
const network_1 = require("../helpers/network");
const source_1 = require("../helpers/source");
const extensions_1 = require("../helpers/extensions");
class GraphQLContentProvider {
    constructor(uri, outputChannel, literal, panel) {
        this._onDidChange = new vscode_1.EventEmitter();
        this.html = '';
        this.timeout = (ms) => new Promise(res => setTimeout(res, ms));
        this.uri = uri;
        this.outputChannel = outputChannel;
        this.sourceHelper = new source_1.SourceHelper(this.outputChannel);
        this.networkHelper = new network_1.NetworkHelper(this.outputChannel, this.sourceHelper);
        this.panel = panel;
        this.rootDir = vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.file(literal.uri));
        this.literal = literal;
        this.panel.webview.options = {
            enableScripts: true,
        };
        this.loadProvider().catch(err => {
            this.html = err.toString();
        });
    }
    getCurrentHtml() {
        return this.html;
    }
    updatePanel() {
        this.panel.webview.html = this.html;
    }
    async getVariablesFromUser(variableDefinitionNodes) {
        await this.timeout(500);
        let variables = {};
        for await (const node of variableDefinitionNodes) {
            const variableType = this.sourceHelper.getTypeForVariableDefinitionNode(node);
            variables = {
                ...variables,
                [node.variable.name.value]: this.sourceHelper.typeCast((await vscode_1.window.showInputBox({
                    ignoreFocusOut: true,
                    placeHolder: `Please enter the value for ${node.variable.name.value}`,
                    validateInput: (value) => this.sourceHelper.validate(value, variableType),
                })), variableType),
            };
        }
        return variables;
    }
    async getEndpointName(endpointNames) {
        let [endpointName] = endpointNames;
        if (endpointNames.length > 1) {
            const pickedValue = await vscode_1.window.showQuickPick(endpointNames, {
                canPickMany: false,
                ignoreFocusOut: true,
                placeHolder: 'Select an endpoint',
            });
            if (pickedValue) {
                endpointName = pickedValue;
            }
        }
        return endpointName;
    }
    validUrlFromSchema(pathOrUrl) {
        return /^https?:\/\//.test(pathOrUrl);
    }
    reportError(message) {
        this.outputChannel.appendLine(message);
        this.setContentAndUpdate(message);
    }
    setContentAndUpdate(html) {
        this.html = html;
        this.update(this.uri);
        this.updatePanel();
    }
    async loadEndpoint() {
        var _a, _b, _c, _d;
        let endpoints = (_b = (_a = this._projectConfig) === null || _a === void 0 ? void 0 : _a.extensions) === null || _b === void 0 ? void 0 : _b.endpoints;
        if (!endpoints) {
            endpoints = {
                default: { url: '' },
            };
            this.update(this.uri);
            this.updatePanel();
            if ((_c = this._projectConfig) === null || _c === void 0 ? void 0 : _c.schema) {
                this.outputChannel.appendLine("Warning: endpoints missing from graphql config. will try 'schema' value(s) instead");
                const { schema } = this._projectConfig;
                if (schema && Array.isArray(schema)) {
                    for (const s of schema) {
                        if (this.validUrlFromSchema(s)) {
                            endpoints.default.url = s.toString();
                        }
                    }
                }
                else if (schema && this.validUrlFromSchema(schema)) {
                    endpoints.default.url = schema.toString();
                }
            }
            else if ((_d = endpoints === null || endpoints === void 0 ? void 0 : endpoints.default) === null || _d === void 0 ? void 0 : _d.url) {
                this.outputChannel.appendLine(`Warning: No Endpoints configured. Attempting to execute operation with 'config.schema' value '${endpoints.default.url}'`);
            }
            else {
                this.reportError('Warning: No Endpoints configured. Config schema contains no URLs');
                return null;
            }
        }
        const endpointNames = Object.keys(endpoints);
        if (endpointNames.length === 0) {
            this.reportError('Error: endpoint data missing from graphql config endpoints extension');
            return null;
        }
        const endpointName = await this.getEndpointName(endpointNames);
        return endpoints[endpointName] || endpoints.default;
    }
    async loadProvider() {
        try {
            const rootDir = vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.file(this.literal.uri));
            if (!rootDir) {
                this.reportError('Error: this file is outside the workspace.');
                return;
            }
            await this.loadConfig();
            const projectConfig = this._projectConfig;
            if (!projectConfig) {
                return;
            }
            const endpoint = await this.loadEndpoint();
            if (endpoint === null || endpoint === void 0 ? void 0 : endpoint.url) {
                const variableDefinitionNodes = [];
                (0, graphql_1.visit)(this.literal.ast, {
                    VariableDefinition(node) {
                        variableDefinitionNodes.push(node);
                    },
                });
                const updateCallback = (data, operation) => {
                    if (operation === 'subscription') {
                        this.html = `<pre>${data}</pre>` + this.html;
                    }
                    else {
                        this.html += `<pre>${data}</pre>`;
                    }
                    this.update(this.uri);
                    this.updatePanel();
                };
                if (variableDefinitionNodes.length > 0) {
                    const variables = await this.getVariablesFromUser(variableDefinitionNodes);
                    await this.networkHelper.executeOperation({
                        endpoint,
                        literal: this.literal,
                        variables,
                        updateCallback,
                        projectConfig,
                    });
                }
                else {
                    await this.networkHelper.executeOperation({
                        endpoint,
                        literal: this.literal,
                        variables: {},
                        updateCallback,
                        projectConfig,
                    });
                }
            }
            else {
                this.reportError('Error: no endpoint url provided');
                return;
            }
        }
        catch (err) {
            this.reportError(`Error: graphql operation failed\n ${err.toString()}`);
            return;
        }
    }
    async loadConfig() {
        var _a;
        const { rootDir, literal } = this;
        if (!rootDir) {
            this.reportError('Error: this file is outside the workspace.');
            return;
        }
        const config = await (0, graphql_config_1.loadConfig)({
            rootDir: rootDir.uri.fsPath,
            throwOnEmpty: false,
            throwOnMissing: false,
            legacy: true,
            extensions: [extensions_1.LanguageServiceExecutionExtension, extensions_1.EndpointsExtension],
        });
        this._projectConfig = config === null || config === void 0 ? void 0 : config.getProjectForFile(literal.uri);
        if (!((_a = this._projectConfig) === null || _a === void 0 ? void 0 : _a.schema)) {
            this.reportError('Error: schema from graphql config');
        }
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        this._onDidChange.fire(uri);
    }
    provideTextDocumentContent(_) {
        return this.html;
    }
}
exports.GraphQLContentProvider = GraphQLContentProvider;
//# sourceMappingURL=exec-content.js.map