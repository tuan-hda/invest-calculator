'use client';

import { useEffect, useState } from 'react';
import { ModeToggle } from '@/components/mode-toggle';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const FMARKET_SPREADSHEET_ID = '16u_ogbNTrFO119iKRf8fvIMy--Cz3mC0Ja56UzEMny4';
const FMARKET_SHEET_GID = '1096936645';
const CRYPTO_SPREADSHEET_ID = '1kzA4eYqft8gEkht91Bf9fSXkFHw-9aKrKbe7-808gRs';
const CRYPTO_SHEET_GID = '1028488115';

export default function ChartPage() {
  const [fmarketUrl, setFmarketUrl] = useState('');
  const [cryptoUrl, setCryptoUrl] = useState('');

  useEffect(() => {
    // Construct the embed URL for the fmarket Google Sheet
    const fmarketDisplayUrl = `https://docs.google.com/spreadsheets/d/${FMARKET_SPREADSHEET_ID}/edit?usp=sharing&gid=${FMARKET_SHEET_GID}`;
    setFmarketUrl(fmarketDisplayUrl);

    // Construct the embed URL for the crypto Google Sheet
    const cryptoDisplayUrl = `https://docs.google.com/spreadsheets/d/${CRYPTO_SPREADSHEET_ID}/edit?usp=sharing&gid=${CRYPTO_SHEET_GID}`;
    setCryptoUrl(cryptoDisplayUrl);
  }, []);

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
            Trackers
          </h1>
        </motion.div>

        {fmarketUrl && cryptoUrl && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="pt-8"
          >
            <Tabs defaultValue="fmarket" className="w-full">
              <div className="flex justify-center mb-6">
                <TabsList>
                  <TabsTrigger value="fmarket">
                    Fmarket Tracker
                  </TabsTrigger>
                  <TabsTrigger value="crypto">
                    Crypto Tracker
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="fmarket" className="w-full">
                <div 
                  className="w-full bg-background rounded-lg border border-border overflow-hidden shadow-md"
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  style={{ overscrollBehavior: 'contain' }}
                >
                  <iframe
                    src={fmarketUrl}
                    className="w-full"
                    style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
                    frameBorder="0"
                    title="Fmarket Google Sheet"
                  />
                </div>
              </TabsContent>

              <TabsContent value="crypto" className="w-full">
                <div 
                  className="w-full bg-background rounded-lg border border-border overflow-hidden shadow-md"
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  style={{ overscrollBehavior: 'contain' }}
                >
                  <iframe
                    src={cryptoUrl}
                    className="w-full"
                    style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
                    frameBorder="0"
                    title="Crypto Google Sheet"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
}
