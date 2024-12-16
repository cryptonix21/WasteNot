import { api } from './api';

export interface AnalyticsData {
  totalDonations: number;
  totalQuantity: number;
  estimatedPeopleServed: number;
  estimatedCO2Saved: number;
  categoryDistribution: Record<string, number>;
}

export const analyticsApi = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    const response = await api.get('/analytics');
    return response.data;
  },
};
