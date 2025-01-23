'use client';


import { useState } from "react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RefreshCcw, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLoadPreviousDayData, useStartDay } from "@/hooks/useStockManagement";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import DailyStockTable from "@/components/DailyStockTable";
import { Calendar } from "@/components/ui/calendar";

export default function DailyStockPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const startDay = useStartDay();
  const loadPreviousDayData = useLoadPreviousDayData();

  const handleDateChange = async (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      setIsLoading(true);
      const newFormattedDate = format(newDate, "yyyy-MM-dd");
      try {
        await startDay.mutateAsync(newFormattedDate);
        toast.success("Day data initialized successfully");
      } catch (error) {
        console.error("Failed to initialize day:", error);
        toast.error("Failed to initialize day data");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLoadPreviousDayData = async () => {
    if (date) {
      const previousDay = new Date(date);
      previousDay.setDate(previousDay.getDate() - 1);
      setDate(previousDay);
      setIsLoading(true);
      const formattedDate = format(previousDay, "yyyy-MM-dd");
      try {
        await loadPreviousDayData.mutateAsync(formattedDate);
        toast.success("Previous day data loaded successfully");
      } catch (error) {
        console.error("Failed to load previous day data:", error);
        toast.error("Failed to load previous day data");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-4">
      <div className="mb-12 flex items-center justify-between">
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
              {date ? format(date, "PPP") : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange} // Fixed: Pass the handler directly
              initialFocus
              modifiers={{
                disabled: (day) => day > new Date(), // Fixed: Only disable future dates
              }}
              modifiersStyles={{
                disabled: { pointerEvents: 'none', opacity: 0.5 },
              }}
            />
          </PopoverContent>
        </Popover>
        <Button onClick={handleLoadPreviousDayData} className="mr-2">
          <RefreshCcw className="h-4 w-4" /> Load Previous Day Data
        </Button>
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

