'use client';

import { Notifications } from './Notifications';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';

export function DashboardHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <SearchBar />
          <div className="flex items-center space-x-4">
            <Notifications />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
} 