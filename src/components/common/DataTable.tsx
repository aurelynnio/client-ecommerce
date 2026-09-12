'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationControls } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { PaginationData } from '@/types/common';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchKey?: keyof T;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  pagination?: PaginationData | null;
  onPageChange?: (page: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = 'Tìm kiếm...',
  searchValue,
  onSearchChange,
  pagination,
  onPageChange,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription = 'Hiện chưa có bản ghi nào để hiển thị.',
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('space-y-4', className)}>
      {onSearchChange !== undefined && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
      )}

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead key={idx} className={col.headerClassName}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} className={col.className}>
                      <Skeleton className="h-6 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-64 p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    className="border-0 rounded-none bg-transparent"
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIdx) => (
                <TableRow key={rowIdx} className="hover:bg-muted/30 transition-colors">
                  {columns.map((col, colIdx) => (
                    <TableCell key={colIdx} className={col.className}>
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                          ? String(row[col.accessorKey] ?? '')
                          : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && onPageChange && (
        <PaginationControls pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}
