'use client';

import React, { useState, useEffect } from 'react';
import { format, subDays, isSameDay } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DailyStockTable from '@/components/DailyStockTable';
import { useStartDay, useDailyStock } from '@/hooks/useStockManagement';
import toast from 'react-hot-toast';

export default function DailyStockPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showInitDialog, setShowInitDialog] = useState(false);
  const [showPreviousDayDialog, setShowPreviousDayDialog] = useState(false);
  const startDay = useStartDay();

  const formattedDate = format(date, 'yyyy-MM-dd');
  const { data: dailyStockData, isLoading: isLoadingData } = useDailyStock(formattedDate);

  const previousDate = subDays(date, 1);
  const formattedPreviousDate = format(previousDate, 'yyyy-MM-dd');
  const { data: previousDayData } = useDailyStock(formattedPreviousDate);

  useEffect(() => {
    if (!isLoadingData) {
      if (!dailyStockData || dailyStockData.length === 0) {
        if (!previousDayData || previousDayData.length === 0) {
          setShowPreviousDayDialog(true);
        } else {
          setShowInitDialog(true);
        }
      }
    }
  }, [date, isLoadingData, dailyStockData, previousDayData]);

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    setIsLoading(true);
  };

  const handleInitializeDay = async () => {
    setIsLoading(true);
    try {
      await startDay.mutateAsync(formattedDate);
      toast.success('Day data initialized successfully');
      setShowInitDialog(false);
    } catch (error) {
      console.error('Failed to initialize day:', error);
      toast.error('Failed to initialize day data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setDate(previousDate);
    setShowInitDialog(false);
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
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && handleDateChange(newDate)}
              initialFocus
              modifiers={{
                disabled: (day) => isSameDay(day, new Date()) || day > new Date(),
              }}
              modifiersStyles={{
                disabled: { pointerEvents: 'none', opacity: 0.5 },
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <DailyStockTable date={date} />
      )}

      <Dialog open={showInitDialog} onOpenChange={setShowInitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initialize Day&apos;s Entries</DialogTitle>
            <DialogDescription>
              It looks like you haven&apos;t started entries for {format(date, "MMMM d, yyyy")}. Would you like to initialize them now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCancel} variant="outline">
              Go to Previous Day
            </Button>
            <Button onClick={handleInitializeDay}>Initialize</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviousDayDialog} onOpenChange={setShowPreviousDayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Previous Day Incomplete</DialogTitle>
            <DialogDescription>
              Please complete the entries for {format(previousDate, "MMMM d, yyyy")} before starting a new day.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => {
              setDate(previousDate);
              setShowPreviousDayDialog(false);
            }}>
              Go to Previous Day
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
