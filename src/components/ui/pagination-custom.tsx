import React from 'react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, limit, total, onPageChange, onLimitChange }) => {
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="flex items-center justify-between px-2 py-4 border-t">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>Hiển thị</span>
        <Select 
          value={limit.toString()} 
          onValueChange={(val) => {
            onLimitChange(Number(val));
            onPageChange(1); // Reset page on limit change
          }}
        >
          <SelectTrigger className="w-[80px] h-8">
            <SelectValue placeholder={limit.toString()} />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 50].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>dòng / trang</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm text-muted-foreground">
          Trang {page} / {totalPages} (Tổng số: {total})
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
};
