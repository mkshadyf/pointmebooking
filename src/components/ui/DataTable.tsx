'use client';

import { Input } from '@/components/ui/Input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export interface Column<T> {
  key: keyof T;
  header: string;
  editable?: boolean;
  type?: 'text' | 'number' | 'boolean' | 'select' | 'currency';
  options?: { value: string; label: string }[];
  width?: string;
  render?: (value: unknown, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T, field: keyof T, value: unknown) => void;
  onDelete?: (item: T) => void;
  isLoading?: boolean;
  searchable?: boolean;
  searchFields?: (keyof T)[];
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  isLoading,
  searchable = true,
  searchFields,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof T } | null>(null);

  const filteredData = searchTerm
    ? data.filter((item) =>
        searchFields
          ? searchFields.some((field) =>
              String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
            )
          : Object.values(item).some((value) =>
              String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
      )
    : data;

  const handleEdit = (item: T, field: keyof T, value: unknown) => {
    onEdit?.(item, field, value);
    setEditingCell(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {searchable && (
        <div className="relative">
          <Input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-6 py-4">
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No results found
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id}>
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {editingCell?.id === item.id && editingCell?.field === column.key ? (
                        <Input
                          type={column.type || 'text'}
                          value={String(item[column.key])}
                          onChange={(e) => handleEdit(item, column.key, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                        />
                      ) : column.render ? (
                        column.render(item[column.key], item)
                      ) : (
                        <div
                          className={column.editable ? 'cursor-pointer hover:bg-gray-50 p-1 -m-1 rounded' : ''}
                          onClick={() =>
                            column.editable &&
                            setEditingCell({ id: item.id, field: column.key })
                          }
                        >
                          {String(item[column.key])}
                        </div>
                      )}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item, 'id', item.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 