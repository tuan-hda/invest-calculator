import { memo, useEffect } from "react";
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
  useEffect(() => {
    const saved = { x: 0, y: 0 };
    let locked = false;

    const save = () => {
      saved.x = window.scrollX;
      saved.y = window.scrollY;
    };

    const restore = () => window.scrollTo(saved.x, saved.y);

    // While iframe is focused, any scroll that slips through gets immediately reverted
    const handleScroll = () => {
      if (locked) {
        requestAnimationFrame(restore);
      } else {
        save();
      }
    };

    // Window loses focus → iframe gained it
    const handleBlur = () => {
      save();
      locked = true;
      requestAnimationFrame(restore); // snap back in case blur itself scrolled
    };

    // Window regains focus → unlock after restoring
    const handleFocus = () => {
      requestAnimationFrame(() => {
        restore();
        locked = false;
      });
    };

    // Nuclear: prevent iframe's internal scrollIntoView() from moving the parent page
    const origScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (...args) {
      if (!locked) origScrollIntoView.apply(this, args);
    };

    // Nuclear: force preventScroll on any focus() call while iframe is active
    const origFocus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (options?: FocusOptions) {
      origFocus.call(
        this,
        locked ? { ...options, preventScroll: true } : options,
      );
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      Element.prototype.scrollIntoView = origScrollIntoView;
      HTMLElement.prototype.focus = origFocus;
    };
  }, []);

  if (!fmarketUrl || !cryptoUrl) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-8"
    >
      <Tabs defaultValue="fmarket" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList>
            <TabsTrigger value="fmarket">Fmarket Tracker</TabsTrigger>
            <TabsTrigger value="crypto">Crypto Tracker</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="fmarket" className="w-full">
          <div
            className="iframe-container w-full bg-background rounded-lg border border-border overflow-hidden shadow-md"
            style={{ overscrollBehavior: "contain" }}
          >
            <div
              tabIndex={-1}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                opacity: 0,
                pointerEvents: "none",
              }}
            ></div>
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
            className="w-full bg-background rounded-lg border border-border overflow-hidden shadow-md"
            style={{ overscrollBehavior: "contain" }}
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
