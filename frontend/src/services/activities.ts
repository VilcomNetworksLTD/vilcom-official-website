import api from '@/lib/axios';

export interface Activity {
  id: number;
  action: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
}

export const activitiesApi = {
  getRecent: async (limit = 5): Promise<Activity[]> => {
    const response = await api.get(`/api/v1/admin/activities?limit=${limit}`);
    return response.data.data;
  },
};
