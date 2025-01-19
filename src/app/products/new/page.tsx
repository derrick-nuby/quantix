'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProduct } from '@/hooks/useStockManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-hot-toast';

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [lowStock, setLowStock] = useState(5);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (file) {
        // TODO: Implement file upload logic here
        // For now, we'll just use a placeholder URL
        setImageUrl('/placeholder.svg');
      }

      await createProduct.mutateAsync({ name, imageUrl, lowStock });
      toast.success('Product created successfully');
      router.push('/products');
    } catch (error) {
      console.error('Failed to create product:', error);
      toast.error('Failed to create product');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
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
                <Label htmlFor="lowStock">Low Stock Threshold</Label>
                <Input
                  id="lowStock"
                  type="number"
                  value={lowStock}
                  onChange={(e) => setLowStock(parseInt(e.target.value))}
                  required
                />
              </div>
              <Tabs defaultValue="url">
                <TabsList>
                  <TabsTrigger value="url">Image URL</TabsTrigger>
                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                </TabsList>
                <TabsContent value="url">
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="upload">
                  <div>
                    <Label htmlFor="imageUpload">Upload Image</Label>
                    <Input
                      id="imageUpload"
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={createProduct.isPending}>
            {createProduct.isPending ? 'Adding...' : 'Add Product'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

