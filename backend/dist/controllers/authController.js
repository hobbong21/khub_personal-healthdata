"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getProfile = getProfile;
exports.refreshAuthToken = refreshAuthToken;
exports.validateToken = validateToken;
exports.changePassword = changePassword;
const userService_1 = require("../services/userService");
const jwt_1 = require("../utils/jwt");
async function register(req, res) {
    try {
        const userData = req.body;
        const user = await userService_1.UserService.registerUser(userData);
        res.status(201).json({ success: true, message: 'User registered successfully', data: user });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ success: false, error: { code: 'REGISTRATION_FAILED', message: errorMessage } });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await userService_1.UserService.authenticateUser(email, password);
        if (!user) {
            res.status(401).json({
                success: false,
                error: { code: 'LOGIN_FAILED', message: 'Invalid credentials' },
            });
            return;
        }
        const token = (0, jwt_1.generateToken)({ userId: user.id, email: user.email });
        const response = { user, token };
        res.json({ success: true, message: 'Login successful', data: response });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'LOGIN_ERROR', message: errorMessage } });
    }
}
async function logout(req, res) {
    res.json({ success: true, message: 'Logout successful' });
}
async function getProfile(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
            return;
        }
        const userProfile = await userService_1.UserService.getUserProfile(req.user.id);
        res.json({ success: true, data: userProfile });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(500).json({ success: false, error: { code: 'PROFILE_FETCH_ERROR', message: errorMessage } });
    }
}
async function refreshAuthToken(req, res) {
    const { token } = req.body;
    if (!token) {
        res.status(400).json({ success: false, error: { code: 'TOKEN_MISSING', message: 'Refresh token is required' } });
        return;
    }
    try {
        const newToken = (0, jwt_1.refreshToken)(token);
        res.json({ success: true, data: { token: newToken } });
    }
    catch (error) {
        res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' } });
    }
}
async function validateToken(req, res) {
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    res.json({ success: true, message: 'Token is valid', data: { user: req.user } });
}
async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        return;
    }
    try {
        await userService_1.UserService.changePassword(req.user.id, currentPassword, newPassword);
        res.json({ success: true, message: 'Password changed successfully' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ success: false, error: { code: 'PASSWORD_CHANGE_FAILED', message: errorMessage } });
    }
}
//# sourceMappingURL=authController.js.map