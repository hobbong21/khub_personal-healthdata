"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const i18next_fs_backend_1 = __importDefault(require("i18next-fs-backend"));
i18next_1.default
    .use(i18next_fs_backend_1.default)
    .init({
    fallbackLng: 'ko',
    backend: {
        loadPath: __dirname + '/../locales/{{lng}}.json',
    },
    ns: ['userUtils', 'aiInsightsService'],
    defaultNS: 'userUtils',
});
exports.default = i18next_1.default;
//# sourceMappingURL=i18n.js.map