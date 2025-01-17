"use client";

import { useState } from 'react';
import { DailyStockTable } from '@/components/DailyStockTable';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useStartDay } from '@/hooks/useDailyStock';

export default function DailyStockPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const startDay = useStartDay();

  const handleStartDay = () => {
    if (date) {
      startDay.mutate(format(date, 'yyyy-MM-dd'));
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daily Stock Management</h1>
        <div className="flex space-x-4">
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
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleStartDay} disabled={!date || startDay.isPending}>
            Start Day
          </Button>
        </div>
      </div>
      {date && (
        <DailyStockTable date={format(date, 'yyyy-MM-dd')} />
      )}
    </div>
  );
}

