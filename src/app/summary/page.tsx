'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, LockIcon, UnlockIcon, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailySummary } from '@/hooks/useStockManagement';
import { formatCurrency } from '@/utils/formatters';

export default function DailyStockPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Format date for query
  const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;

  // Fetch the daily summary
  const { data: summary, isLoading, error } = useDailySummary(formattedDate || '');

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  const formatDateForTitle = (date: Date) => {
    return format(date, "EEEE, do MMMM yyyy");
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[280px] justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {isLoading && <div>Loading summary...</div>}
      {error && <div>Error loading summary: {error.message}</div>}

      {summary && (
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-primary">
            Daily Stock Summary for {formatDateForTitle(new Date(summary.date))}
          </h1>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalProfit)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Inflow</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalInflow)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Outflow</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalOutflow)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                {summary.isLocked ? (
                  <LockIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <UnlockIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.isLocked ? 'Locked' : 'Unlocked'}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Date:</strong> {format(new Date(summary.date), 'PPP')}</p>
              <p><strong>Edit Hash:</strong> {summary.editHash}</p>
              <p><strong>Created At:</strong> {format(new Date(summary.createdAt), 'PPP')}</p>
              <p><strong>Updated At:</strong> {format(new Date(summary.updatedAt), 'PPP')}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

