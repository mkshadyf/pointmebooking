'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type UserData = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export const userColumns: ColumnDef<UserData>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const date = new Date(row.getValue('created_at'));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }: { row: { original: UserData } }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log('Edit', user)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => console.log('Delete', user)}
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