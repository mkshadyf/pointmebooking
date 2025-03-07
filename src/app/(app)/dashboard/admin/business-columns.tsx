'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Column } from '@/components/ui/DataTable';
import { MoreHorizontal } from 'lucide-react';

// Define the shape of our business data
export interface BusinessData {
  id: string;
  business_name: string;
  created_at: string;
}

export const businessColumns: Column<BusinessData>[] = [
  {
    key: 'business_name',
    header: 'Business Name',
  },
  {
    key: 'created_at',
    header: 'Created At',
    render: (value) => {
      const date = new Date(value as string);
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    key: 'id',
    header: 'Actions',
    render: (_, item) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log('Edit', item)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log('Delete', item)}
              className="text-red-500"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 