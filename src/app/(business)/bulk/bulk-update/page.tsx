'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateBulkDailyStock } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function BulkDailyStockUpdatePage() {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updates = JSON.parse(jsonInput);
      await updateBulkDailyStock(date, updates);
      toast.success('Bulk daily stock update successful');
      router.push('/daily-stock');
    } catch (error) {
      console.error('Failed to update daily stocks in bulk:', error);
      toast.error('Failed to update daily stocks in bulk');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Bulk Update Daily Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="jsonInput">JSON Input</Label>
                <Textarea
                  id="jsonInput"
                  value={jsonInput}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJsonInput(e.target.value)}
                  rows={10}
                  placeholder='[{"productId": "123", "soldQuantity": 5, "newStock": 10}]'
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Bulk Update'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

