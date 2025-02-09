import {
    CalendarIcon,
    ChartBarIcon,
    ClipboardIcon,
    ClockIcon,
    CogIcon,
    HomeIcon,
    UserGroupIcon,
    UserIcon,
} from '@heroicons/react/24/outline';

export const businessNavigation = [
  {
    category: 'Overview',
    items: [
      { 
        name: 'Dashboard', 
        href: '/dashboard/business',
        icon: HomeIcon,
        description: 'View your business overview'
      },
      { 
        name: 'Analytics', 
        href: '/dashboard/business/analytics',
        icon: ChartBarIcon,
        description: 'Track your business performance'
      }
    ]
  },
  {
    category: 'Management',
    items: [
      { 
        name: 'Appointments', 
        href: '/dashboard/business/appointments',
        icon: CalendarIcon,
        description: 'Manage your bookings'
      },
      { 
        name: 'Services', 
        href: '/dashboard/business/services',
        icon: ClipboardIcon,
        description: 'Manage your service offerings'
      },
      { 
        name: 'Staff', 
        href: '/dashboard/business/staff',
        icon: UserGroupIcon,
        description: 'Manage your team'
      }
    ]
  },
  {
    category: 'Settings',
    items: [
      { 
        name: 'Business Profile', 
        href: '/dashboard/business/settings/profile',
        icon: UserIcon,
        description: 'Update your business information'
      },
      { 
        name: 'Preferences', 
        href: '/dashboard/business/settings',
        icon: CogIcon,
        description: 'Manage your account settings'
      }
    ]
  }
];

export const customerNavigation = [
  {
    category: 'Overview',
    items: [
      { 
        name: 'My Bookings', 
        href: '/dashboard/customer',
        icon: CalendarIcon,
        description: 'View your current bookings'
      },
      { 
        name: 'History', 
        href: '/dashboard/customer/history',
        icon: ClockIcon,
        description: 'View your booking history'
      }
    ]
  },
  {
    category: 'Settings',
    items: [
      { 
        name: 'Profile', 
        href: '/dashboard/customer/settings/profile',
        icon: UserIcon,
        description: 'Update your profile'
      },
      { 
        name: 'Preferences', 
        href: '/dashboard/customer/settings',
        icon: CogIcon,
        description: 'Manage your account settings'
      }
    ]
  }
];

export type NavigationItem = {
  name: string;
  href: string;
  icon: any;
  description: string;
};

export type NavigationSection = {
  category: string;
  items: NavigationItem[];
};

export const getNavigation = (role: 'business' | 'customer'): NavigationSection[] => {
  return role === 'business' ? businessNavigation : customerNavigation;
}; 