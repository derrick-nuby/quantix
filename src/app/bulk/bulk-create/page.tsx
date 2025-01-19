'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { createBulkProducts } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function BulkProductCreatePage() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const products = JSON.parse(jsonInput);
      await createBulkProducts(products);
      toast.success('Bulk product creation successful');
      router.push('/products');
    } catch (error) {
      console.error('Failed to create products in bulk:', error);
      toast.error('Failed to create products in bulk');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Bulk Create Products</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="jsonInput" className="block text-sm font-medium text-gray-700">
                  JSON Input
                </label>
                <Textarea
                  id="jsonInput"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={10}
                  placeholder='[{"name": "Product 1", "imageUrl": "http://example.com/image1.jpg", "lowStock": 5}]'
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Bulk Create'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}