"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelehealthService = void 0;
const Appointment_1 = require("../models/Appointment");
exports.TelehealthService = {
    async scheduleTelehealthSession(userId, dateTime, providerId) {
        const appointmentData = {
            hospitalName: 'Telehealth',
            department: 'Remote Consultation',
            doctorName: providerId,
            appointmentType: 'telehealth',
            purpose: 'Telehealth session',
            appointmentDate: dateTime,
            duration: 30,
        };
        return Appointment_1.AppointmentModel.create(userId, appointmentData);
    },
    async getTelehealthSessions(userId) {
        const { appointments } = await Appointment_1.AppointmentModel.findMany(userId, { appointmentType: ['telehealth'] }, 1, 100);
        return appointments;
    },
    async getTelehealthSessionDetails(sessionId, userId) {
        return Appointment_1.AppointmentModel.findById(sessionId, userId);
    },
    async cancelTelehealthSession(sessionId, userId) {
        return Appointment_1.AppointmentModel.updateStatus(sessionId, userId, 'cancelled');
    },
    async connectToTelehealthSession(sessionId, userId) {
        const session = await Appointment_1.AppointmentModel.findById(sessionId, userId);
        if (!session) {
            throw new Error('Telehealth session not found.');
        }
        return {
            connectUrl: `https://telehealth.example.com/session/${sessionId}?token=${Math.random().toString(36).substring(2)}`,
            status: 'Connection initiated',
        };
    },
};
//# sourceMappingURL=telehealthService.js.map