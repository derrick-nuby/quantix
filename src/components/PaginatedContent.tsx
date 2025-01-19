// components/PaginatedContent.tsx
import React, { ReactNode } from 'react';
import { CustomPagination } from './CustomPagination';

interface PaginatedContentProps<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  renderContent: (data: T[]) => ReactNode;
  renderLoading: () => ReactNode;
}

export function PaginatedContent<T>({
  data,
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
  renderContent,
  renderLoading,
}: PaginatedContentProps<T>) {
  return (
    <div>
      <div className="mb-8">
        {isLoading ? renderLoading() : renderContent(data)}
      </div>
      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}