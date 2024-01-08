"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const exec_content_1 = require("./providers/exec-content");
const exec_codelens_1 = require("./providers/exec-codelens");
function getConfig() {
    var _a;
    return vscode_1.workspace.getConfiguration('vscode-graphql-execution', (_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri);
}
function activate(context) {
    const outputChannel = vscode_1.window.createOutputChannel('GraphQL Operation Execution');
    const config = getConfig();
    if (config.debug) {
        console.log('Extension "vscode-graphql-execution" is now active!');
    }
    const commandShowOutputChannel = vscode_1.commands.registerCommand('vscode-graphql-execution.showOutputChannel', () => {
        outputChannel.show();
    });
    context.subscriptions.push(commandShowOutputChannel);
    const registerCodeLens = () => {
        context.subscriptions.push(vscode_1.languages.registerCodeLensProvider([
            'javascript',
            'typescript',
            'javascriptreact',
            'typescriptreact',
            'graphql',
        ], new exec_codelens_1.GraphQLCodeLensProvider(outputChannel)));
    };
    registerCodeLens();
    let commandContentProvider;
    const registerContentProvider = () => {
        return vscode_1.commands.registerCommand('vscode-graphql-execution.contentProvider', (literal) => {
            const uri = vscode_1.Uri.parse('graphql://authority/graphql');
            const panel = vscode_1.window.createWebviewPanel('vscode-graphql-execution.results-preview', 'GraphQL Execution Result', vscode_1.ViewColumn.Two, {});
            commandContentProvider = new exec_content_1.GraphQLContentProvider(uri, outputChannel, literal, panel);
            const registration = vscode_1.workspace.registerTextDocumentContentProvider('graphql', commandContentProvider);
            context.subscriptions.push(registration);
            panel.webview.html = commandContentProvider.getCurrentHtml();
        });
    };
    const provider = registerContentProvider();
    context.subscriptions.push(provider);
    vscode_1.workspace.onDidSaveTextDocument(async (e) => {
        if (e.fileName.includes('graphql.config') ||
            e.fileName.includes('graphqlrc')) {
            await commandContentProvider.loadConfig();
        }
    });
}
exports.activate = activate;
function deactivate() {
    console.log('Extension "vscode-graphql-execution" is now de-active!');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map