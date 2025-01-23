'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useStockManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { PaginatedContent } from '@/components/PaginatedContent';
import { ProductCard } from '@/components/ProductCard';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Fixed number of items per page
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, error } = useProducts({ page, limit, search: searchQuery, sortBy, order });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderProducts = (products: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );

  const renderLoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(limit)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 h-[300px] rounded-lg"></div>
        </div>
      ))}
    </div>
  );

  if (error) {
    return <div>Error loading products: {error.message}</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <Button type="submit" variant="ghost" className="absolute right-0 top-0 h-full">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="createdAt">Date Added</SelectItem>
            <SelectItem value="lowStock">Low Stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={order} onValueChange={(value) => setOrder(value as 'asc' | 'desc')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PaginatedContent
        data={data?.products || []}
        currentPage={data?.pagination.page || 1}
        totalPages={data?.pagination.totalPages || 1}
        isLoading={isLoading}
        onPageChange={setPage}
        renderContent={renderProducts}
        renderLoading={renderLoadingState}
      />
    </div>
  );
}

