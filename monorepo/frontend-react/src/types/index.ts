/**
 * Shared TypeScript types for the admin panel.
 */

export interface Provider {
  id: number;
  userId: number;
  bio: string | null;
  photos: string[];
  expertise: string[];
  status: 'pending' | 'approved' | 'rejected';
  walletBalance: number;
  registrationFeePaidAt: string | null;
  createdAt: string;
  user?: { id: number; name: string; phone: string; email: string | null };
  services?: Service[];
  completedServicesCount?: number;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  imageUrl?: string | null;
  price: number;
  durationMinutes: number;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: 'provider' | 'customer' | 'admin';
  deletedAt?: string | null;
  createdAt: string;
}

export interface Booking {
  id: number;
  customerId: number;
  providerId: number;
  serviceId: number;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  createdAt: string;
  customer?: { id: number; name: string; phone: string };
  provider?: { id: number; user?: { name: string } };
  service?: { name: string };
}

export interface Payment {
  id: number;
  userId: number;
  type: 'registration' | 'service';
  referenceId: number | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

export interface DashboardStats {
  pendingProviders: number;
  approvedProviders: number;
  totalCustomers: number;
  totalBookings: number;
  totalRevenue: number;
}

export interface DashboardTrends {
  registrationsLast14Days: Array<{ day: string; count: number }>;
  monthlyRevenueLast6Months: Array<{ month: string; amount: number }>;
}

export interface AccountSettings {
  razorpayKeyId: string | null;
  razorpayKeySecret: string | null;
  upiId: string | null;
  codEnabled: boolean;
}
