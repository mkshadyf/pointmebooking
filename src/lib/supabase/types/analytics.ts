export interface BusinessMetrics {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  completedBookings: number;
  cancelledBookings: number;
  activeServices: number;
  topServices: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
  }>;
  bookingsByStatus: Array<{
    status: string;
    count: number;
  }>;
} 