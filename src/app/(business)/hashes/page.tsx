'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clipboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDayHashes } from '@/hooks/useStockManagement';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';

export default function DailyStockPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;


  const { data, isLoading, error } = useDayHashes(formattedDate || '');

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
  };

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success('Hash copied to clipboard!');
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
      <div>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error loading data</p>}

        {data && (
          <div>
            {data.hashes.map((hash: string) => (
              <Card key={hash} className="mb-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hash</CardTitle>
                  <Clipboard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span>{hash}</span>
                  <Button variant="outline" onClick={() => handleCopy(hash)}>
                    <Clipboard className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
