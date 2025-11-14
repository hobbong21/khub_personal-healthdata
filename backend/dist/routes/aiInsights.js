"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aiInsightsController_1 = require("../controllers/aiInsightsController");
const auth_1 = require("../middleware/auth");
const cache_1 = require("../middleware/cache");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/', (0, cache_1.cacheMiddleware)(300), aiInsightsController_1.getPersonalizedRecommendations);
exports.default = router;
//# sourceMappingURL=aiInsights.js.map