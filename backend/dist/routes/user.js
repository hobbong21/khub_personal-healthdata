"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.put('/profile', validation_1.validateProfileUpdate, userController_1.updateProfile);
router.put('/profile/basic', userController_1.updateBasicInfo);
router.put('/profile/physical', userController_1.updatePhysicalInfo);
router.put('/profile/lifestyle', userController_1.updateLifestyleHabits);
router.post('/bmi/calculate', userController_1.calculateBMI);
router.get('/profile/completeness', userController_1.getProfileCompleteness);
router.delete('/account', userController_1.deleteAccount);
exports.default = router;
//# sourceMappingURL=user.js.map