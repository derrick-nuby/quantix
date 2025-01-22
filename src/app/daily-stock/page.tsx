"use client";

import React, { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DailyStockTable from "@/components/DailyStockTable";
import { useStartDay, useDailyStock } from "@/hooks/useStockManagement";
import toast from "react-hot-toast";

export default function DailyStockPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [showInitDialog, setShowInitDialog] = useState(false);
  const [showPreviousDayDialog, setShowPreviousDayDialog] = useState(false);
  const startDay = useStartDay();

  const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
  const { data: dailyStockData, isLoading: isLoadingData } = useDailyStock(formattedDate);

  const previousDate = date ? subDays(date, 1) : undefined;
  const formattedPreviousDate = previousDate ? format(previousDate, "yyyy-MM-dd") : "";
  const { data: previousDayData } = useDailyStock(formattedPreviousDate);

  useEffect(() => {
    if (date && !isLoadingData) {
      if (!dailyStockData || dailyStockData.length === 0) {
        if (!previousDayData || previousDayData.length === 0) {
          setShowPreviousDayDialog(true);
        } else {
          setShowInitDialog(true);
        }
      }
    }
  }, [date, isLoadingData, dailyStockData, previousDayData]);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setIsLoading(true);
    }
  };

  const handleInitializeDay = async () => {
    if (date) {
      setIsLoading(true);
      const newFormattedDate = format(date, "yyyy-MM-dd");
      try {
        await startDay.mutateAsync(newFormattedDate);
        toast.success("Day data initialized successfully");
        setShowInitDialog(false);
      } catch (error) {
        console.error("Failed to initialize day:", error);
        toast.error("Failed to initialize day data");
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
              className={cn("w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
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

      <Dialog open={showInitDialog} onOpenChange={setShowInitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Initialize Day&apos;s Entries</DialogTitle>
            <DialogDescription>
              It looks like you haven&apos;t started today&apos;s entries. Would you like to initialize them now?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowInitDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleInitializeDay}>Initialize</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviousDayDialog} onOpenChange={setShowPreviousDayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Previous Day Incomplete</DialogTitle>
            <DialogDescription>Please complete the previous day&apos;s entries before starting a new day.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowPreviousDayDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

