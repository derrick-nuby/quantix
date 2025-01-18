// file location: src/app/daily-stock/page.tsx

'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import DailyStockTable from '@/components/DailyStockTable';
import { useStartDay } from '@/hooks/useStockManagement';
import toast from 'react-hot-toast';

export default function DailyStockPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const startDay = useStartDay();

  const handleDateChange = async (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setIsLoading(true);
      const newFormattedDate = format(newDate, 'yyyy-MM-dd');
      try {
        const result = await startDay.mutateAsync(newFormattedDate);
        if (result.exists) {
          toast.success('Fetched existing day data');
        } else {
          toast.success('New day created successfully');
        }
      } catch (error) {
        console.error('Failed to fetch or create day:', error);
        toast.error('Failed to fetch or create day data');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
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
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        date && <DailyStockTable date={date} />
      )}
    </div>
  );
}

