import { Request, Response } from 'express';
import { AppointmentService } from '../services/appointmentService';
import { 
  CreateAppointmentRequest, 
  UpdateAppointmentRequest,
  AppointmentFilters,
  AppointmentStatus
} from '../types/appointment';

export class AppointmentController {
  /**
   * Create a new appointment
   */
  static async createAppointment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
      }

      const data: CreateAppointmentRequest = req.body;

      // Validate input data
      const validationErrors = AppointmentService.validateAppointmentData(data);
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: '입력 데이터가 올바르지 않습니다.',
          details: validationErrors
        });
      }

      const appointment = await AppointmentService.createAppointment(userId, data);
      
      res.status(201).json({
        message: '예약이 성공적으로 생성되었습니다.',
        appointment
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ error: '예약 생성 중 오류가 발생했습니다.' });
    }
  }

  /**
   * Get appointment by ID
   */
  static async getAppointment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
      }

      const { id } = req.params;
      const appointment = await AppointmentService.getAppointment(id, userId);

      if (!appointment) {
        return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
      }

      res.json({ appointment });
    } catch (error) {
      console.error('Error getting appointment:', error);
      res.status(500).json({ error: '예약 조회 중 오류가 발생했습니다.' });
    }
  }

  /**
   * Update appointment
   */
  static async updateAppointment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
      }

      const { id } = req.params;
      const data: UpdateAppointmentRequest = req.body;

      // Validate input data
      const validationErrors = AppointmentService.validateAppointmentData(data);
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: '입력 데이터가 올바르지 않습니다.',
          details: validationErrors
        });
      }

      const appointment = await AppointmentService.updateAppointment(id, userId, data);

      if (!appointment) {
        return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
      }

      res.json({
        message: '예약이 성공적으로 수정되었습니다.',
        appointment
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ error: '예약 수정 중 오류가 발생했습니다.' });
    }
  }

  /**
   * Delete appointment
   */
  static async deleteAppointment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
      }

      const { id } = req.params;
      const success = await AppointmentService.deleteAppointment(id, userId);

      if (!success) {
        return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
      }

      res.json({ message: '예약이 성공적으로 삭제되었습니다.' });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({ error: '예약 삭제 중 오류가 발생했습니다.' });
    }
  }

  /**
   * Get appointments with filters and pagination
   */
  static async getAppointments(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const filters: AppointmentFilters = {};
      
      if (req.query.status) {
        filters.status = Array.isArray(req.query.status) 
          ? req.query.status as AppointmentStatus[]
          : [req.query.status as AppointmentStatus];
      }

      if (req.query.department) {
        filters.department = Array.isArray(req.query.department)
          ? req.query.department as string[]
          : [req.query.department as string];
      }

      if (req.query.appointmentType) {
        filters.appointmentType = Array.isArray(req.query.appointmentType)
          ? req.query.appointmentType as any[]
          : [req.query.appointmentType as any];
      }

      if (req.query.dateFrom) {
        filters.dateFrom = req.query.dateFrom as string;
      }

      if (req.query.dateTo) {
        filters.dateTo = req.query.dateTo as string;
      }

      if (req.query.hospitalName) {
        filters.hospitalName = req.query.hospitalName as string;
      }

      if (req.query.doctorName) {
        filters.doctorName = req.query.doctorName as string;
      }

      const result = await AppointmentService.getAppointments(userId, filters, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Error getting appointments:', error);
      res.status(500).json({ error: '예약 목록 조회 중 오류가 발생했습니다.' });
    }
  }

  /**
   * Get upcoming appointments
   */
  static async getUpcomingAppointments(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
      }

      const days = parseInt(req.query.days as string) || 30;
      const appointments = await AppointmentService.getUpcomingAppointments(userId, days);

      res.json({ appointments });
    } catch (error) {
      console.error('Error getting upcoming appointments:', error);
      res.status(500).json({ error: '예정된 예약 조회 중 오류가 발생했습니다.' });
    }
  }

  /**
   * Get appointment statistics
   */
  static async getAppointmentStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
      }

      const stats = await AppointmentService.getAppointmentStats(userId);
      res.json({ stats });
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      res.status(500).json({ error: '예약 통계 조회 중 오류가 발생했습니다.' });
    }
  }

  /**
   * Update appointment status
   */
  static async updateAppointmentStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: '상태값이 필요합니다.' });
      }

      const appointment = await AppointmentService.updateAppointmentStatus(id, userId, status);

      if (!appointment) {
        return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
      }

      res.json({
        message: '예약 상태가 성공적으로 변경되었습니다.',
        appointment
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      res.status(500).json({ error: '예약 상태 변경 중 오류가 발생했습니다.' });
    }
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
      }

      const { id } = req.params;
      const appointment = await AppointmentService.cancelAppointment(id, userId);

      if (!appointment) {
        return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
      }

      res.json({
        message: '예약이 성공적으로 취소되었습니다.',
        appointment
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      res.status(500).json({ error: '예약 취소 중 오류가 발생했습니다.' });
    }
  }

  /**
   * Get appointments for calendar
   */
  static async getAppointmentsForCalendar(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: '시작일과 종료일이 필요합니다.' });
      }

      const appointments = await AppointmentService.getAppointmentsForCalendar(
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json({ appointments });
    } catch (error) {
      console.error('Error getting calendar appointments:', error);
      res.status(500).json({ error: '캘린더 예약 조회 중 오류가 발생했습니다.' });
    }
  }

  /**
   * Search appointments
   */
  static async searchAppointments(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
      }

      const { q: query } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query) {
        return res.status(400).json({ error: '검색어가 필요합니다.' });
      }

      const appointments = await AppointmentService.searchAppointments(
        userId,
        query as string,
        limit
      );

      res.json({ appointments });
    } catch (error) {
      console.error('Error searching appointments:', error);
      res.status(500).json({ error: '예약 검색 중 오류가 발생했습니다.' });
    }
  }

  /**
   * Reschedule appointment
   */
  static async rescheduleAppointment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
      }

      const { id } = req.params;
      const { newDate, notes } = req.body;

      if (!newDate) {
        return res.status(400).json({ error: '새로운 예약 날짜가 필요합니다.' });
      }

      const newAppointmentDate = new Date(newDate);
      if (newAppointmentDate < new Date()) {
        return res.status(400).json({ error: '예약 날짜는 현재 시간 이후여야 합니다.' });
      }

      const appointment = await AppointmentService.rescheduleAppointment(
        id,
        userId,
        newAppointmentDate,
        notes
      );

      if (!appointment) {
        return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
      }

      res.json({
        message: '예약이 성공적으로 변경되었습니다.',
        appointment
      });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      res.status(500).json({ error: '예약 변경 중 오류가 발생했습니다.' });
    }
  }

  /**
   * Get today's appointments
   */
  static async getTodaysAppointments(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
      }

      const appointments = await AppointmentService.getTodaysAppointments(userId);
      res.json({ appointments });
    } catch (error) {
      console.error('Error getting today\'s appointments:', error);
      res.status(500).json({ error: '오늘의 예약 조회 중 오류가 발생했습니다.' });
    }
  }
}