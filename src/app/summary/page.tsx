'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDailySummary } from '@/hooks/useStockManagement';

export default function DailyStockPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Format date for query
  const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;

  // Fetch the daily summary
  const { data: summary, isLoading, error } = useDailySummary(formattedDate || '');

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
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
        <div className="bg-gray-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Summary for {formattedDate}</h2>
          <p><strong>Total Profit:</strong> ${summary.totalProfit.toFixed(2)}</p>
          <p><strong>Total Inflow:</strong> ${summary.totalInflow.toFixed(2)}</p>
          <p><strong>Total Outflow:</strong> ${summary.totalOutflow.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
