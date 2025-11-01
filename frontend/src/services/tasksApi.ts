import { api } from './api';

// 태스크 관리 관련 타입 정의
export interface Task {
  id: string;
  userId: string;
  type: 'vital_sign' | 'exercise' | 'medication' | 'journal';
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateTaskRequest {
  type: 'vital_sign' | 'exercise' | 'medication' | 'journal';
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
}

export interface UpdateTaskRequest {
  description?: string;
  priority?: 'high' | 'medium' | 'low';
  completed?: boolean;
  dueDate?: string;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  todayTasks: number;
  todayCompleted: number;
}

export const tasksApi = {
  // 태스크 기본 CRUD (요구사항 4.5)
  async getTasks(includeCompleted = true, date?: string): Promise<Task[]> {
    const params = new URLSearchParams();
    if (!includeCompleted) params.append('includeCompleted', 'false');
    if (date) params.append('date', date);
    
    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  async getTodayTasks(): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/tasks/today?date=${today}`);
    return response.data;
  },

  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  async updateTask(id: string, updateData: UpdateTaskRequest): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, updateData);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  // 태스크 완료 상태 토글 (요구사항 4.5)
  async toggleTaskCompletion(id: string): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/toggle`);
    return response.data;
  },

  // 태스크 통계 (요구사항 4.5)
  async getTaskStats(period = 'today'): Promise<TaskStats> {
    const response = await api.get(`/tasks/stats?period=${period}`);
    return response.data;
  },

  // 태스크 검색 및 필터링
  async searchTasks(searchTerm: string, type?: string, priority?: string): Promise<Task[]> {
    const params = new URLSearchParams();
    params.append('q', searchTerm);
    if (type) params.append('type', type);
    if (priority) params.append('priority', priority);
    
    const response = await api.get(`/tasks/search?${params.toString()}`);
    return response.data;
  },

  // 태스크 템플릿 생성 (일반적인 건강 태스크들)
  async createDefaultTasks(): Promise<Task[]> {
    const defaultTasks: CreateTaskRequest[] = [
      {
        type: 'vital_sign',
        description: '혈압 측정하기',
        priority: 'high'
      },
      {
        type: 'vital_sign',
        description: '체중 측정하기',
        priority: 'medium'
      },
      {
        type: 'exercise',
        description: '30분 걷기',
        priority: 'medium'
      },
      {
        type: 'medication',
        description: '복약 일정 확인하기',
        priority: 'high'
      },
      {
        type: 'journal',
        description: '건강 일지 작성하기',
        priority: 'low'
      }
    ];

    const createdTasks: Task[] = [];
    for (const taskData of defaultTasks) {
      try {
        const task = await this.createTask(taskData);
        createdTasks.push(task);
      } catch (error) {
        console.error('Error creating default task:', error);
      }
    }

    return createdTasks;
  }
};