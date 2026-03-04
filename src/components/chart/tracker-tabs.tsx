import { memo } from "react";
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
            className="w-full bg-background rounded-lg border border-border overflow-hidden shadow-md"
            style={{ overscrollBehavior: "contain" }}
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
