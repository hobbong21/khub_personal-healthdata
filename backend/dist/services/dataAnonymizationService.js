"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataAnonymizationService = void 0;
const DataAnonymization_1 = require("../models/DataAnonymization");
exports.DataAnonymizationService = {
    async anonymizeUserData(userId, dataTypes, purpose, anonymizationMethod) {
        return DataAnonymization_1.DataAnonymizationModel.anonymizeUserData(userId, dataTypes, purpose, anonymizationMethod);
    },
    async getAnonymizationLogs(userId, purpose, limit = 50) {
        return DataAnonymization_1.DataAnonymizationModel.getAnonymizationLogs(userId, purpose, limit);
    },
    async getAnonymizationStats() {
        return DataAnonymization_1.DataAnonymizationModel.getAnonymizationStats();
    },
};
//# sourceMappingURL=dataAnonymizationService.js.map