"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseConnection = testDatabaseConnection;
const database_1 = __importDefault(require("../config/database"));
async function testDatabaseConnection() {
    try {
        await database_1.default.$connect();
        console.log('✅ Database connection successful');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
    finally {
        await database_1.default.$disconnect();
    }
}
if (require.main === module) {
    testDatabaseConnection()
        .then((success) => {
        process.exit(success ? 0 : 1);
    })
        .catch((error) => {
        console.error('Test failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=testConnection.js.map