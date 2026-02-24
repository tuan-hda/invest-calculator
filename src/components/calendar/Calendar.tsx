"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getLunarDate } from "@dqcai/vn-lunar";

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] rounded-none overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="bg-black dark:bg-white text-white dark:text-black p-6 border-b-4 border-black dark:border-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 dark:bg-yellow-500 p-2 border-2 border-white dark:border-black transform -rotate-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <CalendarIcon className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevMonth}
            className="hover:bg-yellow-400 dark:hover:bg-yellow-500 text-black dark:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="hover:bg-yellow-400 dark:hover:bg-yellow-500 text-black dark:text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 border-b-4 border-black dark:border-white bg-slate-100 dark:bg-slate-800">
        {days.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-r-2 last:border-r-0 border-black/10 dark:border-white/10"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 bg-white dark:bg-slate-900 border-black dark:border-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMonth.toString()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="col-span-7 grid grid-cols-7"
          >
            {calendarDays.map((day) => {
              const formattedDate = format(day, "d");
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <div
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative aspect-square flex items-center justify-center border-r-2 border-b-2 last:border-r-0 border-black/10 dark:border-white/10 cursor-pointer transition-all group",
                    !isCurrentMonth &&
                      "bg-slate-50/50 dark:bg-slate-800/30 text-slate-300 dark:text-slate-600",
                    isCurrentMonth && "text-black dark:text-white font-black",
                  )}
                >
                  {/* Selection Background */}
                  {isSelected && (
                    <motion.div
                      layoutId="selected-day"
                      className="absolute inset-2 bg-yellow-400 dark:bg-yellow-500 border-2 border-black dark:border-white z-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]"
                      transition={{
                        type: "spring",
                        bounce: 0.3,
                        duration: 0.6,
                      }}
                    />
                  )}

                  {/* Hover effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/5 dark:bg-white/5 transition-opacity z-0" />

                  <span
                    className={cn(
                      "relative z-10 text-lg",
                      isSelected && "text-black",
                    )}
                  >
                    {formattedDate}
                  </span>

                  {/* Lunar Date Display */}
                  <span
                    className={cn(
                      "absolute bottom-3 right-3 z-10 text-[10px] font-bold leading-none",
                      isSelected
                        ? "text-black/60"
                        : "text-slate-400 dark:text-slate-500",
                    )}
                  >
                    {(() => {
                      const lunar = getLunarDate(
                        day.getDate(),
                        day.getMonth() + 1,
                        day.getFullYear(),
                      );
                      return lunar.day === 1
                        ? `${lunar.day}/${lunar.month}`
                        : lunar.day;
                    })()}
                  </span>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 border-t-2 border-black dark:border-white">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 dark:bg-yellow-500 border-2 border-black dark:border-white" />
          <p className="text-xs font-bold uppercase tracking-tight text-black dark:text-yellow-100">
            Solar: {format(selectedDate, "PPP")}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 bg-slate-400 dark:bg-slate-500 border-2 border-black dark:border-white" />
          <p className="text-xs font-bold uppercase tracking-tight text-black dark:text-yellow-100">
            Lunar:{" "}
            {(() => {
              const lunar = getLunarDate(
                selectedDate.getDate(),
                selectedDate.getMonth() + 1,
                selectedDate.getFullYear(),
              );
              return `${lunar.day}/${lunar.month}/${lunar.year}${lunar.leap ? " (Leap)" : ""}`;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
}
