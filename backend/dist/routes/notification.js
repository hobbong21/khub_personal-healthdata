"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', notificationController_1.NotificationController.getNotifications);
router.get('/unread-count', notificationController_1.NotificationController.getUnreadCount);
router.get('/stats', notificationController_1.NotificationController.getStats);
router.put('/:id/read', notificationController_1.NotificationController.markAsRead);
router.post('/medication-reminders', notificationController_1.NotificationController.createMedicationReminders);
router.post('/interaction-alert', notificationController_1.NotificationController.createInteractionAlert);
router.post('/refill-reminder', notificationController_1.NotificationController.createRefillReminder);
router.post('/test-push', notificationController_1.NotificationController.testPushNotification);
exports.default = router;
//# sourceMappingURL=notification.js.map