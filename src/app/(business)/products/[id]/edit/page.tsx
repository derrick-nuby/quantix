'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProduct } from '@/lib/api';
import { useUpdateProduct } from '@/hooks/useStockManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EditProductPage() {
  const params = useParams<{ id: string; }>();
  const router = useRouter();
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => getProduct(params.id),
  });
  const updateProduct = useUpdateProduct();

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [lowStock, setLowStock] = useState(0);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setImageUrl(product.imageUrl || '');
      setLowStock(product.lowStock);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProduct.mutateAsync({
        id: params.id,
        product: { name, imageUrl, lowStock },
      });
      toast.success('Product updated successfully');
      router.push(`/products/${params.id}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lowStock">Low Stock Threshold</Label>
                <Input
                  id="lowStock"
                  type="number"
                  value={lowStock}
                  onChange={(e) => setLowStock(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={updateProduct.isPending}>
            {updateProduct.isPending ? 'Updating...' : 'Update Product'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

