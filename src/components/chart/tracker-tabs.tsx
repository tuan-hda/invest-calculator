import { memo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface TrackerTabsProps {
  fmarketUrl: string;
  cryptoUrl: string;
}

export const TrackerTabs = memo(function TrackerTabs({
  fmarketUrl,
  cryptoUrl,
}: TrackerTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const fmarketContainerRef = useRef<HTMLDivElement>(null);
  const cryptoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent all keyboard events from bubbling out of the iframe containers
    const handleKeyEvent = (e: KeyboardEvent) => {
      e.stopPropagation();
    };

    const attachListeners = (container: HTMLDivElement | null) => {
      if (!container) return;
      
      // Capture all keyboard events in the capture phase and stop propagation
      container.addEventListener("keydown", handleKeyEvent, { capture: true });
      container.addEventListener("keyup", handleKeyEvent, { capture: true });
      container.addEventListener("keypress", handleKeyEvent, { capture: true });
    };

    const removeListeners = (container: HTMLDivElement | null) => {
      if (!container) return;
      
      container.removeEventListener("keydown", handleKeyEvent);
      container.removeEventListener("keyup", handleKeyEvent);
      container.removeEventListener("keypress", handleKeyEvent);
    };

    attachListeners(fmarketContainerRef.current);
    attachListeners(cryptoContainerRef.current);

    return () => {
      removeListeners(fmarketContainerRef.current);
      removeListeners(cryptoContainerRef.current);
    };
  }, []);

  if (!fmarketUrl || !cryptoUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-8"
    >
      <Tabs defaultValue="fmarket" className="w-full" ref={tabsRef}>
        <div className="flex justify-center mb-6">
          <TabsList>
            <TabsTrigger value="fmarket">Fmarket Tracker</TabsTrigger>
            <TabsTrigger value="crypto">Crypto Tracker</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="fmarket" className="w-full">
          <div
            ref={fmarketContainerRef}
            className="w-full bg-background rounded-lg border border-border overflow-hidden shadow-md"
            style={{ overscrollBehavior: "contain" }}
            tabIndex={0}
          >
            <iframe
              src={fmarketUrl}
              className="w-full"
              style={{
                height: "calc(100vh - 200px)",
                minHeight: "600px",
              }}
              frameBorder="0"
              title="Fmarket Google Sheet"
            />
          </div>
        </TabsContent>

        <TabsContent value="crypto" className="w-full">
          <div
            ref={cryptoContainerRef}
            className="w-full bg-background rounded-lg border border-border overflow-hidden shadow-md"
            style={{ overscrollBehavior: "contain" }}
            tabIndex={0}
          >
            <iframe
              src={cryptoUrl}
              className="w-full"
              style={{
                height: "calc(100vh - 200px)",
                minHeight: "600px",
              }}
              frameBorder="0"
              title="Crypto Google Sheet"
            />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
});
