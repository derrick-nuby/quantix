'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDailySummaryRange } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

export default function HashesPage() {
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: summaries, isLoading, error } = useQuery({
    queryKey: ['dailySummaries', startDate, endDate],
    queryFn: () => getDailySummaryRange(startDate, endDate),
    enabled: !!startDate && !!endDate
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refetch when startDate or endDate changes
  };

  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">View Hashes</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit">View Hashes</Button>
          </form>
        </CardContent>
      </Card>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {summaries?.map((summary) => (
            <Card key={summary.id}>
              <CardHeader>
                <CardTitle>{format(new Date(summary.date), 'MMMM d, yyyy')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Edit Hash: {summary.editHash}</p>
                <p>Total Profit: ${summary.totalProfit.toFixed(2)}</p>
                <p>Total Inflow: ${summary.totalInflow.toFixed(2)}</p>
                <p>Total Outflow: ${summary.totalOutflow.toFixed(2)}</p>
                <p>Locked: {summary.isLocked ? 'Yes' : 'No'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

