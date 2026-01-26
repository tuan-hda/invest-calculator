"use client";

import Link from "next/link";
import { Calculator, BarChart2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  const items = [
    {
      title: "Calculator",
      url: "/",
      icon: Calculator,
    },
    {
      title: "Chart",
      url: "/chart",
      icon: BarChart2,
    },
  ];

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
      {items.map((item) => (
        <Link
          key={item.title}
          href={item.url}
          className={cn(
            "group relative flex items-center justify-center p-5 rounded-xl border-2 border-black dark:border-white transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            "hover:scale-110 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]",
            "[transform:perspective(1000px)_rotateY(30deg)] hover:[transform:perspective(1000px)_rotateY(0deg)] origin-left",
            pathname === item.url
              ? "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] [transform:perspective(1000px)_rotateY(30deg)]"
              : "bg-background text-foreground shadow-none",
          )}
        >
          <item.icon className="w-10 h-10" />

          {/* Tooltip-like label appearing on hover */}
          <span className="absolute left-full ml-4 px-2 py-1 bg-black text-white dark:bg-white dark:text-black text-xs font-bold rounded border-2 border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
            {item.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
