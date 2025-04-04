'use client';

import { useState, useEffect, useRef } from 'react';

const FlipkartProcessAnimation = () => {
  const [step, setStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);

  // Update progress bar for ML processing
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 50); // 50ms * 100 = 5 seconds for full cycle
    
    return () => clearInterval(interval);
  }, []);

  // Handle animation steps
  useEffect(() => {
    const timer = setInterval(() => {
      setStep(prevStep => {
        if (prevStep >= 3) {
          // When we reach the last step, transition to first step with animation
          setTransitioning(true);
          setTimeout(() => {
            setTransitioning(false);
          }, 500);
          return 0;
        }
        return prevStep + 1;
      });
    }, 3000); // Change step every 3 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full min-h-[300px] relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 transition-opacity duration-500 ${transitioning ? 'opacity-70' : 'opacity-100'}`}
    >
      {/* Modern Particle Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/10"
            style={{
              width: `${Math.random() * 40 + 10}px`,
              height: `${Math.random() * 40 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 20 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
              animation: `float-${i % 3} ${Math.random() * 20 + 10}s infinite ease-in-out`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 20px); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 10px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -20px); }
        }
      `}</style>

      {/* PDF Document */}
      <div className={`absolute transition-all duration-700 ease-in-out ${
        step === 0 ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-100' :
        step === 1 ? 'top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 scale-75' :
        step === 2 ? 'top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 scale-75' :
        'top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 scale-75'
      }`}>
        <div className="w-64 h-80 bg-white shadow-xl rounded-md border border-gray-200 flex flex-col overflow-hidden">
          <div className="h-6 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center px-2">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="text-white text-xs ml-auto font-medium">Flipkart_Labels.pdf</div>
          </div>
          <div className="flex-grow p-3 flex flex-col gap-2 overflow-y-auto">
            {/* Flipkart Label Content - Multiple Labels */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-full bg-white rounded border border-gray-300 flex flex-col mb-2 shadow-sm">
                <div className="border-b border-gray-300 flex justify-between text-[6px] font-bold p-0.5">
                  <div className="flex items-center">
                    <span className="font-bold mr-1">STD</span>
                    <span className="text-[5px]">E-Kart Logistics</span>
                  </div>
                  <div>E</div>
                </div>
                <div className="text-[5px] border-b border-gray-300 p-0.5">
                  <div className="flex justify-between">
                    <span>OD4319861465136131{i}0</span>
                    <span>COD</span>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/3 p-0.5 flex flex-col items-center border-r border-gray-300">
                    <div className="text-[5px] text-center">Ordered through</div>
                    <div className="font-bold text-[6px] italic">Flipkart</div>
                    <div className="w-full h-8 bg-gray-800 my-1"></div>
                    <div className="text-[5px]">HBD: 08 - 08</div>
                    <div className="text-[5px]">CPD: 13 - 08</div>
                  </div>
                  <div className="w-2/3 p-0.5 flex flex-col">
                    <div className="h-12 bg-gray-800 mb-1"></div>
                    <div className="text-[5px]">
                      <div className="font-semibold">Shipping/Customer address:</div>
                      <div>Name: Customer{i}</div>
                      <div className="filter blur-[1px]">Address Line 1</div>
                      <div className="filter blur-[1px]">City, 56009{i}, IN-KA</div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-300 p-0.5 text-[5px]">
                  <div className="flex justify-between font-semibold">
                    <span>SKU ID | Description</span>
                    <span>QTY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="filter blur-[1px]">Product description text</span>
                    <span>1</span>
                  </div>
                </div>
                <div className="border-t border-gray-300 p-0.5 flex justify-between text-[5px]">
                  <span>Not for resale.</span>
                  <span className="filter blur-[1px]">Printed at 1240 hrs, 07/08/24</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ML Processing Visualization */}
      {step >= 1 && (
        <div className={`absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 transition-all duration-700 ease-in-out ${
          step === 1 ? 'opacity-100 scale-100' : 
          step === 2 ? 'opacity-100 scale-100' : 
          'opacity-100 scale-100'
        }`}>
          <div className="w-64 h-64 bg-white/80 backdrop-blur-md rounded-lg shadow-xl border border-indigo-200 p-4 flex flex-col">
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-bold mb-2 text-center">AI Analysis</div>
            
            {/* Scanning Animation */}
            <div className="relative h-24 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md mb-3 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[8px] text-blue-500 font-mono font-medium">Analyzing document structure...</div>
              </div>
              
              {/* Scanning Line */}
              <div 
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-70"
                style={{ 
                  top: `${(progress % 100) * 24 / 100}px`,
                  boxShadow: '0 0 8px 2px rgba(59, 130, 246, 0.5)'
                }}
              ></div>
              
              {/* Detected Elements */}
              {step >= 2 && (
                <>
                  <div className="absolute top-1 left-2 right-2 h-3 border border-green-500 rounded-sm opacity-60 animate-pulse"></div>
                  <div className="absolute top-6 left-2 right-2 h-6 border border-green-500 rounded-sm opacity-60 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="absolute bottom-1 left-2 right-2 h-2 border border-green-500 rounded-sm opacity-60 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </>
              )}
            </div>
            
            {/* Detection Results */}
            <div className="text-xs text-gray-700 mb-2 font-medium">
              {step === 1 && "Detecting label boundaries..."}
              {step === 2 && "Identifying key elements..."}
              {step === 3 && "Applying optimal crop settings..."}
            </div>
            
            {/* Progress Indicators */}
            <div className="space-y-2 flex-grow">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="font-medium">Boundary Detection</span>
                  <span>{step >= 2 ? "100%" : `${Math.min(progress, 100)}%`}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-300" 
                    style={{ width: step >= 2 ? "100%" : `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="font-medium">Element Recognition</span>
                  <span>{step >= 3 ? "100%" : (step >= 2 ? `${Math.min(progress, 100)}%` : "0%")}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-300" 
                    style={{ width: step >= 3 ? "100%" : (step >= 2 ? `${Math.min(progress, 100)}%` : "0%") }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="font-medium">Crop Optimization</span>
                  <span>{step >= 3 ? `${Math.min(progress, 100)}%` : "0%"}</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300" 
                    style={{ width: step >= 3 ? `${Math.min(progress, 100)}%` : "0%" }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="text-center text-xs font-medium mt-2">
              {step < 3 ? (
                <div className="text-blue-600 flex items-center justify-center">
                  <span>Processing</span>
                  <span className="ml-1 flex">
                    <span className="animate-bounce" style={{ animationDelay: '0s' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                  </span>
                </div>
              ) : (
                <span className="text-green-600">Ready for download!</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Output Document */}
      {step >= 3 && (
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 transition-all duration-700 ease-in-out">
          <div className="w-48 h-64 bg-white shadow-xl rounded-md border border-green-200 flex flex-col overflow-hidden">
            <div className="h-5 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center px-2">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="text-white text-[8px] ml-auto font-medium">Flipkart_Labels_Cropped.pdf</div>
            </div>
            <div className="flex-grow p-2 flex flex-col gap-2 overflow-y-auto">
              {/* Real Flipkart Label with Blur Effect */}
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full bg-white rounded border border-gray-300 flex flex-col mb-2 shadow-sm relative overflow-hidden">
                  <div className="border-b border-gray-300 flex justify-between text-[6px] font-bold p-0.5">
                    <div className="flex items-center">
                      <span className="font-bold mr-1">STD</span>
                      <span className="text-[5px]">E-Kart Logistics</span>
                    </div>
                    <div>E</div>
                  </div>
                  <div className="text-[5px] border-b border-gray-300 p-0.5">
                    <div className="flex justify-between">
                      <span>OD4319861465136131{i}0</span>
                      <span>COD</span>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-1/3 p-0.5 flex flex-col items-center border-r border-gray-300">
                      <div className="text-[5px] text-center">Ordered through</div>
                      <div className="font-bold text-[6px] italic">Flipkart</div>
                      <div className="w-full h-6 bg-gray-800 my-1"></div>
                      <div className="text-[5px]">HBD: 08 - 08</div>
                      <div className="text-[5px]">CPD: 13 - 08</div>
                    </div>
                    <div className="w-2/3 p-0.5 flex flex-col">
                      <div className="h-8 bg-gray-800 mb-1"></div>
                      <div className="text-[5px]">
                        <div className="font-semibold">Shipping/Customer address:</div>
                        <div>Name: Customer{i}</div>
                        <div className="filter blur-[1px]">Address Line 1</div>
                        <div className="filter blur-[1px]">City, 56009{i}, IN-KA</div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-300 p-0.5 text-[5px]">
                    <div className="flex justify-between font-semibold">
                      <span>SKU ID | Description</span>
                      <span>QTY</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="filter blur-[1px]">Product description text</span>
                      <span>1</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-300 p-0.5 flex justify-between text-[5px]">
                    <span>Not for resale.</span>
                    <span className="filter blur-[1px]">Printed at 1240 hrs, 07/08/24</span>
                  </div>
                  
                  {/* Green checkmark overlay */}
                  <div className="absolute top-1 right-1 bg-green-500 rounded-full w-3 h-3 flex items-center justify-center shadow-sm">
                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              step === i ? 'bg-gradient-to-r from-blue-500 to-indigo-600 scale-125 shadow-md' : 'bg-gray-300'
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default FlipkartProcessAnimation;
