"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageServiceExecutionExtension = exports.EndpointsExtension = void 0;
const code_file_loader_1 = require("@graphql-tools/code-file-loader");
const EndpointsExtension = () => {
    return {
        name: 'endpoints',
    };
};
exports.EndpointsExtension = EndpointsExtension;
const LanguageServiceExecutionExtension = api => {
    api.loaders.schema.register(new code_file_loader_1.CodeFileLoader());
    api.loaders.documents.register(new code_file_loader_1.CodeFileLoader());
    return { name: 'languageServiceExecution' };
};
exports.LanguageServiceExecutionExtension = LanguageServiceExecutionExtension;
//# sourceMappingURL=extensions.js.map