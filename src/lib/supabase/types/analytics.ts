export interface BusinessMetrics {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  completedBookings: number;
  cancelledBookings: number;
  activeServices: number;
  topServices: { name: string; count: number }[];
  revenueByPeriod: { period: string; revenue: number }[];
  bookingsByStatus: { status: string; count: number }[];
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
} 