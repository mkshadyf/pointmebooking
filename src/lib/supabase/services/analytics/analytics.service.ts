// Define the types locally to avoid import issues
export interface RecentActivity {
  id: string;
  type: 'booking' | 'review' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'cancelled';
  amount?: number;
}

export interface BusinessMetrics {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
  newCustomers: number;
  repeatCustomers: number;
  topServices: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
  revenueByDay: Array<{
    date: string;
    amount: number;
  }>;
}

/**
 * Service for analytics operations
 */
class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  /**
   * Get the singleton instance of the AnalyticsService
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Get business metrics for a business
   * @param businessId The business ID
   * @returns Business metrics
   */
  async getBusinessMetrics(): Promise<{ data: BusinessMetrics | null; error: string | null }> {
    try {
      // Mock data for now - would be replaced with actual database queries
      const metrics: BusinessMetrics = {
        totalBookings: 125,
        totalRevenue: 12500,
        averageRating: 4.7,
        completionRate: 92,
        newCustomers: 45,
        repeatCustomers: 80,
        topServices: [
          { id: '1', name: 'Service 1', bookings: 50, revenue: 5000 },
          { id: '2', name: 'Service 2', bookings: 30, revenue: 3000 },
          { id: '3', name: 'Service 3', bookings: 20, revenue: 2000 },
        ],
        revenueByDay: [
          { date: '2023-01-01', amount: 500 },
          { date: '2023-01-02', amount: 700 },
          { date: '2023-01-03', amount: 600 },
          { date: '2023-01-04', amount: 800 },
          { date: '2023-01-05', amount: 900 },
        ],
      };

      return { data: metrics, error: null };
    } catch (error) {
      console.error('Error in getBusinessMetrics:', error);
      return { data: null, error: String(error) };
    }
  }

  /**
   * Get recent activity for a business
   * @param businessId The business ID
   * @returns Recent activity
   */
  async getRecentActivity(): Promise<{ data: RecentActivity[] | null; error: string | null }> {
    try {
      // Mock data for now - would be replaced with actual database queries
      const activities: RecentActivity[] = [
        {
          id: '1',
          type: 'booking',
          title: 'New booking',
          description: 'Booking #12345678',
          timestamp: new Date().toISOString(),
          status: 'pending',
          amount: 100,
        },
        {
          id: '2',
          type: 'payment',
          title: 'Payment received',
          description: 'Payment #87654321',
          timestamp: new Date().toISOString(),
          amount: 100,
        },
        {
          id: '3',
          type: 'review',
          title: 'New review',
          description: '5-star review from John Doe',
          timestamp: new Date().toISOString(),
        },
      ];

      return { data: activities, error: null };
    } catch (error) {
      console.error('Error in getRecentActivity:', error);
      return { data: null, error: String(error) };
    }
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance(); 