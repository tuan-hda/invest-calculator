"use client";

import { useState } from "react";
import { Calendar } from "@/components/calendar/Calendar";
import { ModeToggle } from "@/components/mode-toggle";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export default function CalendarPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/calendar/export", {
        method: "GET",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to export ICS");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "lunar-events.ics";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert(error instanceof Error ? error.message : "Failed to export ICS");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-300 dark:bg-slate-950 py-10 sm:mx-4 sm:px-6 lg:px-8 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter dark:text-white uppercase mb-4 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] inline-block bg-black dark:bg-slate-900 text-white p-4 transform rotate-1 border-2 border-white dark:border-white">
            Lunar Calendar
          </h1>

          <div className="flex justify-center">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-white dark:bg-slate-900 text-black dark:text-white border-4 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all h-14 px-8 text-lg font-black uppercase italic rounded-none"
            >
              {isExporting ? (
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
              ) : (
                <Download className="w-6 h-6 mr-2" />
              )}
              {isExporting ? "Exporting..." : "Export to ICS"}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center pt-8"
        >
          <Calendar />
        </motion.div>
      </div>
    </div>
  );
}
