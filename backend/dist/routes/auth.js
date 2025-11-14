"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.post('/register', validation_1.validateRegistration, authController_1.register);
router.post('/login', validation_1.validateLogin, authController_1.login);
router.post('/refresh', authController_1.refreshAuthToken);
router.use(auth_1.authenticateToken);
router.post('/logout', authController_1.logout);
router.get('/profile', authController_1.getProfile);
router.post('/validate', authController_1.validateToken);
router.post('/change-password', authController_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map