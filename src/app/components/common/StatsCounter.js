'use client';

import { useStats } from '@/app/context/StatsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function StatsCounter() {
  const { stats } = useStats();
  const pathname = usePathname();
  
  // Don't render on the Meesho Label Cropper page
  if (pathname === '/meesho-label-cropper') {
    return null;
  }
  
  const [displayStats, setDisplayStats] = useState({
    merged: '00000',
    cropped: '00000',
    removed: '00000'
  });

  // Animate the counter from right to left
  useEffect(() => {
    const animateCounter = (current, target, statKey) => {
      // Convert to 5-digit string with leading zeros
      const formatNumber = num => num.toString().padStart(5, '0');
      const currentFormatted = formatNumber(current);
      const targetFormatted = formatNumber(target);
      
      // If they're already the same, no need to animate
      if (currentFormatted === targetFormatted) return;
      
      // Animate each digit from right to left
      let timer;
      let currentNum = current;
      
      const updateDigit = () => {
        if (currentNum < target) {
          currentNum += 1;
          setDisplayStats(prev => ({
            ...prev,
            [statKey]: formatNumber(currentNum)
          }));
          
          if (currentNum < target) {
            timer = setTimeout(updateDigit, 50);
          }
        }
      };
      
      updateDigit();
      
      return () => clearTimeout(timer);
    };
    
    animateCounter(parseInt(displayStats.merged), stats.merged, 'merged');
    animateCounter(parseInt(displayStats.cropped), stats.cropped, 'cropped');
    animateCounter(parseInt(displayStats.removed), stats.removed, 'removed');
  }, [stats, displayStats]);

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 py-8 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="PDFs Merged" 
            value={displayStats.merged} 
            color="from-blue-500 to-blue-700"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 7v8a2 2 0 0 0 2 2h6M8 7V5a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293l4.414 4.414a1 1 0 0 1 .293.707V15a2 2 0 0 1-2 2h-2"></path>
                <path d="M2 15h6"></path>
                <path d="M5 12v6"></path>
              </svg>
            }
          />
          <StatCard 
            title="PDFs Cropped" 
            value={displayStats.cropped} 
            color="from-indigo-500 to-indigo-700"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2v4h12V2"></path>
                <path d="M6 18v4h12v-4"></path>
                <path d="M2 6h4v12H2"></path>
                <path d="M18 6h4v12h-4"></path>
                <rect x="6" y="6" width="12" height="12"></rect>
              </svg>
            }
          />
          <StatCard 
            title="Pages Removed" 
            value={displayStats.removed} 
            color="from-purple-500 to-purple-700"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 rounded-lg`} data-component-name="StatCard"></div>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <div className="p-2 bg-white rounded-full shadow-sm">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-4xl font-bold tracking-widest text-center">
          {value.split('').map((digit, index) => (
            <span 
              key={index} 
              className="inline-block w-8 text-center mx-0.5 bg-gray-100 rounded-md shadow-inner text-gray-800"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animationName: 'countUp',
                animationDuration: '0.5s',
                animationTimingFunction: 'ease-out'
              }}
            >
              {digit}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
