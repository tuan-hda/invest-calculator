"use client";

import Link from "next/link";
import { Calculator, BarChart2, LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";

interface SidebarItemProps {
  item: {
    title: string;
    url: string;
    icon: LucideIcon;
  };
  isActive: boolean;
}

function SidebarItem({ item, isActive }: SidebarItemProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150 };
  const tx = useSpring(useTransform(mouseX, [-20, 20], [-5, 5]), springConfig);
  const ty = useSpring(useTransform(mouseY, [-20, 20], [-5, 5]), springConfig);
  const rotateX = useSpring(
    useTransform(mouseY, [-20, 20], [10, -10]),
    springConfig,
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-20, 20], [-10, 10]),
    springConfig,
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <Link
        href={item.url}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "group relative flex items-center justify-center p-5 rounded-2xl border-4 border-black dark:border-white transition-colors duration-200",
          isActive
            ? "bg-primary text-primary-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] translate-x-1 translate-y-1 shadow-none"
            : "bg-background text-foreground hover:bg-muted shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-1 hover:-translate-y-1",
        )}
        style={{
          perspective: "1000px",
        }}
      >
        <motion.div
          style={{
            x: tx,
            y: ty,
            rotateX,
            rotateY,
          }}
          className="relative z-10"
        >
          <item.icon className="w-10 h-10" />
        </motion.div>

        {/* Tooltip Label */}
        <AnimatePresence>
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            whileHover={{ opacity: 1, x: 40 }}
            className="absolute left-full ml-4 px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black text-sm font-black rounded-lg border-2 border-black dark:border-white pointer-events-none whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] uppercase tracking-tighter"
          >
            {item.title}
          </motion.span>
        </AnimatePresence>

        {/* Active Indicator */}
        {isActive && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 bg-primary/20 -z-10 rounded-xl"
            initial={false}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </Link>
    </motion.div>
  );
}

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
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-8">
      {items.map((item) => (
        <SidebarItem
          key={item.title}
          item={item}
          isActive={pathname === item.url}
        />
      ))}
    </div>
  );
}
