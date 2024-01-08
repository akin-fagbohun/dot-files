"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkHelper = void 0;
const graphql_1 = require("graphql");
const graphql_tag_1 = require("graphql-tag");
const fetch_1 = require("@whatwg-node/fetch");
const node_https_1 = require("node:https");
const ws = __importStar(require("ws"));
const wonka_1 = require("wonka");
const vscode_1 = require("vscode");
const graphql_ws_1 = require("graphql-ws");
const core_1 = require("@urql/core");
const source_1 = require("./source");
class NetworkHelper {
    constructor(outputChannel, sourceHelper) {
        this.buildSubscribeConsumer = (cb, operation) => (result) => {
            const { errors, data, error } = result;
            if (errors || data) {
                cb(formatData(result), operation);
            }
            if (error) {
                if (error.graphQLErrors && error.graphQLErrors.length > 0) {
                    cb(JSON.stringify({ errors: error.graphQLErrors }, null, 2), operation);
                }
                if (error.networkError) {
                    cb(error.networkError.toString(), operation);
                }
            }
        };
        this.outputChannel = outputChannel;
        this.sourceHelper = sourceHelper;
    }
    buildClient({ operation, endpoint, }) {
        var _a;
        const { rejectUnauthorized } = vscode_1.workspace.getConfiguration('vscode-graphql');
        const agent = new node_https_1.Agent({ rejectUnauthorized });
        const exchanges = [...core_1.defaultExchanges];
        if (operation === 'subscription') {
            const wsEndpointURL = endpoint.url.replace(/^http/, 'ws');
            const wsClient = (0, graphql_ws_1.createClient)({
                url: wsEndpointURL,
                connectionAckWaitTimeout: 3000,
                webSocketImpl: ws,
            });
            exchanges.push((0, core_1.subscriptionExchange)({
                forwardSubscription: op => ({
                    subscribe: sink => ({
                        unsubscribe: wsClient.subscribe(op, sink),
                    }),
                }),
            }));
        }
        return (0, core_1.createClient)({
            url: endpoint.url,
            fetch: (_a = global.fetch) !== null && _a !== void 0 ? _a : fetch_1.fetch,
            fetchOptions: {
                headers: endpoint.headers,
                agent: new URL(endpoint.url).protocol === 'https:' ? agent : undefined,
            },
            exchanges,
        });
    }
    async executeOperation({ endpoint, literal, variables, updateCallback, projectConfig, }) {
        const operationTypes = [];
        (0, graphql_1.visit)(literal.ast, {
            OperationDefinition(node) {
                operationTypes.push(node.operation);
            },
        });
        const fragmentDefinitions = await this.sourceHelper.getFragmentDefinitions(projectConfig);
        if (fragmentDefinitions) {
            const fragmentInfos = await (0, source_1.getFragmentDependenciesForAST)(literal.ast, fragmentDefinitions);
            for (const fragmentInfo of fragmentInfos) {
                literal.content = fragmentInfo.content + '\n' + literal.content;
            }
        }
        const parsedOperation = (0, graphql_tag_1.gql) `
      ${literal.content}
    `;
        return Promise.all(operationTypes.map(async (operation) => {
            const subscriber = this.buildSubscribeConsumer(updateCallback, operation);
            this.outputChannel.appendLine(`NetworkHelper: operation: ${operation}`);
            this.outputChannel.appendLine(`NetworkHelper: endpoint: ${endpoint.url}`);
            try {
                const urqlClient = this.buildClient({
                    operation,
                    endpoint,
                    updateCallback,
                });
                if (operation === 'subscription') {
                    (0, wonka_1.pipe)(urqlClient.subscription(parsedOperation, variables), (0, wonka_1.subscribe)(subscriber));
                }
                else if (operation === 'query') {
                    (0, wonka_1.pipe)(urqlClient.query(parsedOperation, variables), (0, wonka_1.subscribe)(subscriber));
                }
                else {
                    (0, wonka_1.pipe)(urqlClient.mutation(parsedOperation, variables), (0, wonka_1.subscribe)(subscriber));
                }
            }
            catch (err) {
                this.outputChannel.appendLine(`error executing operation:\n${err}`);
            }
        }));
    }
}
exports.NetworkHelper = NetworkHelper;
function formatData({ data, errors }) {
    return JSON.stringify({ data, errors }, null, 2);
}
//# sourceMappingURL=network.js.map