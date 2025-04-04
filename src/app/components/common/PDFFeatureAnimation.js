'use client';

import { useState, useEffect, useRef } from 'react';

const PDFFeatureAnimation = () => {
  const [step, setStep] = useState(0);
  const [feature, setFeature] = useState('crop'); // 'crop', 'merge', or 'remove'
  const [transitioning, setTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef(null);

  // Update progress bar
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
          // When we reach the last step, transition to next feature
          setTransitioning(true);
          setTimeout(() => {
            setFeature(prev => {
              if (prev === 'crop') return 'merge';
              if (prev === 'merge') return 'remove';
              return 'crop';
            });
            setTransitioning(false);
          }, 500);
          return 0;
        }
        return prevStep + 1;
      });
    }, 2000); // Change step every 2 seconds for a smoother experience

    return () => clearInterval(timer);
  }, []);

  // Feature-specific colors and themes
  const colors = {
    crop: {
      primary: 'from-blue-500 to-cyan-400',
      secondary: 'blue',
      accent: 'cyan',
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      ring: 'ring-blue-400',
      text: 'text-blue-600',
      glow: 'shadow-blue-200',
      darkGradient: 'from-blue-600 to-cyan-500',
      lightGradient: 'from-blue-200 to-cyan-100'
    },
    merge: {
      primary: 'from-purple-500 to-pink-400',
      secondary: 'purple',
      accent: 'pink',
      bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
      border: 'border-purple-200',
      ring: 'ring-purple-400',
      text: 'text-purple-600',
      glow: 'shadow-purple-200',
      darkGradient: 'from-purple-600 to-pink-500',
      lightGradient: 'from-purple-200 to-pink-100'
    },
    remove: {
      primary: 'from-indigo-500 to-violet-400',
      secondary: 'indigo',
      accent: 'violet',
      bg: 'bg-gradient-to-br from-indigo-50 to-violet-50',
      border: 'border-indigo-200',
      ring: 'ring-indigo-400',
      text: 'text-indigo-600',
      glow: 'shadow-indigo-200',
      darkGradient: 'from-indigo-600 to-violet-500',
      lightGradient: 'from-indigo-200 to-violet-100'
    }
  };

  const currentColor = colors[feature];
  
  // Particle elements for background
  const particles = Array(8).fill().map((_, i) => (
    <div 
      key={i}
      className={`absolute rounded-full bg-gradient-to-br ${currentColor.lightGradient} opacity-20 animate-float`}
      style={{
        width: `${Math.random() * 30 + 10}px`,
        height: `${Math.random() * 30 + 10}px`,
        top: `${Math.random() * 80 + 10}%`,
        left: `${Math.random() * 80 + 10}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${Math.random() * 4 + 3}s`
      }}
    ></div>
  ));

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-[350px] rounded-xl shadow-xl overflow-hidden transition-all duration-500 ${currentColor.bg} noise-bg hover-lift`}
    >
      {/* Particles */}
      {particles}
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className={`absolute top-5 left-5 w-20 h-20 rounded-full bg-gradient-to-br ${currentColor.primary} opacity-10 blur-xl animate-pulse`}></div>
        <div className={`absolute bottom-10 right-10 w-32 h-32 rounded-full bg-gradient-to-br ${currentColor.primary} opacity-10 blur-xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Progress bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 bg-opacity-30">
        <div 
          className={`h-full bg-gradient-to-r ${currentColor.primary}`}
          style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
        ></div>
      </div>
      
      {/* Feature title with gradient */}
      <div className="relative z-10 w-full pt-6 pb-2 text-center">
        <h3 className={`text-xl font-bold bg-gradient-to-r ${currentColor.primary} bg-clip-text text-transparent text-shadow`}>
          {feature === 'crop' ? 'Auto Crop PDF' : 
           feature === 'merge' ? 'Merge PDFs' : 
           'Remove Empty Pages'}
        </h3>
        <div className="mt-1 text-xs text-gray-500 opacity-70">
          {step === 0 ? 'Starting...' : 
           step === 1 ? 'Analyzing...' : 
           step === 2 ? 'Processing...' : 
           'Finalizing...'}
        </div>
      </div>
      
      <div className={`transition-opacity duration-500 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        {feature === 'crop' ? (
          // Auto Crop Animation - Enhanced Version
          <div className="w-full h-full p-4 flex flex-col items-center justify-center relative">
            {/* Original PDF with margins */}
            <div className="w-[280px] h-[200px] glass-effect rounded-lg flex items-center justify-center relative animate-float">
              {/* PDF Content */}
              <div className={`w-[80%] h-[80%] bg-white shadow-md p-3 flex flex-col transition-all duration-300 ${step >= 1 ? `ring-2 ${currentColor.ring} ring-offset-2` : ''}`}>
                <div className="w-full h-4 bg-gray-200 mb-2 rounded"></div>
                <div className="w-[90%] h-3 bg-gray-200 mb-2 rounded"></div>
                <div className="w-[85%] h-3 bg-gray-200 mb-3 rounded"></div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="bg-gray-100 rounded"></div>
                  <div className="bg-gray-100 rounded"></div>
                  <div className="bg-gray-100 rounded"></div>
                  <div className="bg-gray-100 rounded"></div>
                </div>
              </div>
              
              {/* Crop Markers */}
              {step >= 1 && (
                <>
                  <div className={`absolute top-[10%] left-[10%] w-3 h-3 bg-gradient-to-br ${currentColor.primary} rounded-full animate-pulse`}></div>
                  <div className={`absolute top-[10%] right-[10%] w-3 h-3 bg-gradient-to-br ${currentColor.primary} rounded-full animate-pulse`} style={{ animationDelay: '0.2s' }}></div>
                  <div className={`absolute bottom-[10%] left-[10%] w-3 h-3 bg-gradient-to-br ${currentColor.primary} rounded-full animate-pulse`} style={{ animationDelay: '0.4s' }}></div>
                  <div className={`absolute bottom-[10%] right-[10%] w-3 h-3 bg-gradient-to-br ${currentColor.primary} rounded-full animate-pulse`} style={{ animationDelay: '0.6s' }}></div>
                </>
              )}
              
              {/* Scanning Line */}
              {step === 1 && (
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer" style={{ 
                  animation: 'scanDown 1.5s linear infinite, shimmer 2s infinite',
                }}></div>
              )}
            </div>
            
            {/* Cropped Result */}
            {step >= 2 && (
              <div className="absolute bottom-4 left-0 w-full flex justify-center items-center">
                <div className={`glass-effect rounded-lg p-3 shadow-lg ${step === 2 ? 'animate-fadeIn' : 'animate-slideInRight'}`}>
                  <div className={`text-sm font-medium mb-1 ${currentColor.text} flex items-center`}>
                    {step === 2 ? (
                      <>
                        <div className="mr-2 w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-rotate"></div>
                        Detecting content...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Margins removed!
                      </>
                    )}
                  </div>
                  {step >= 3 && (
                    <div className="w-[180px] h-[100px] bg-white shadow-md rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 to-transparent"></div>
                      <div className="w-[90%] h-[90%] bg-white flex flex-col relative z-10">
                        <div className="w-full h-3 bg-gray-200 mb-1 rounded"></div>
                        <div className="w-[90%] h-2 bg-gray-200 mb-1 rounded"></div>
                        <div className="flex-1 grid grid-cols-2 gap-1">
                          <div className="bg-gray-100 rounded"></div>
                          <div className="bg-gray-100 rounded"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : feature === 'merge' ? (
          // Merge PDFs Animation - Enhanced Version
          <div className="w-full h-full p-4 flex flex-col items-center justify-center relative">
            <div className="relative w-[280px] h-[200px]">
              {/* First PDF */}
              <div 
                className={`absolute glass-effect w-[140px] h-[180px] rounded-lg shadow-lg flex flex-col p-3 ${step < 2 ? 'animate-float' : ''}`}
                style={{
                  left: step < 2 ? '20px' : `${70 + (step-2) * 25}px`,
                  top: '10px',
                  transition: 'left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <div className="w-full h-3 bg-gradient-to-r from-red-300 to-red-200 mb-1 rounded"></div>
                <div className="w-[90%] h-2 bg-red-100 mb-1 rounded"></div>
                <div className="flex-1 bg-gradient-to-br from-red-50 to-white rounded relative overflow-hidden">
                  {/* Decorative content */}
                  <div className="absolute top-2 left-2 w-[60%] h-1.5 bg-red-100 rounded"></div>
                  <div className="absolute top-6 left-2 w-[40%] h-1.5 bg-red-100 rounded"></div>
                  <div className="absolute top-10 left-2 w-[50%] h-1.5 bg-red-100 rounded"></div>
                </div>
              </div>
              
              {/* Second PDF */}
              <div 
                className={`absolute glass-effect w-[140px] h-[180px] rounded-lg shadow-lg flex flex-col p-3 ${step < 2 ? 'animate-float' : ''}`}
                style={{
                  right: step < 2 ? '20px' : `${70 + (step-2) * 25}px`,
                  top: '10px',
                  transition: 'right 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <div className="w-full h-3 bg-gradient-to-r from-blue-300 to-blue-200 mb-1 rounded"></div>
                <div className="w-[90%] h-2 bg-blue-100 mb-1 rounded"></div>
                <div className="flex-1 bg-gradient-to-br from-blue-50 to-white rounded relative overflow-hidden">
                  {/* Decorative content */}
                  <div className="absolute top-2 left-2 w-[60%] h-1.5 bg-blue-100 rounded"></div>
                  <div className="absolute top-6 left-2 w-[40%] h-1.5 bg-blue-100 rounded"></div>
                  <div className="absolute top-10 left-2 w-[50%] h-1.5 bg-blue-100 rounded"></div>
                </div>
              </div>
              
              {/* Connection line when merging */}
              {step === 2 && (
                <div className="absolute top-[90px] left-0 w-full flex justify-center">
                  <div className="w-[100px] h-[2px] bg-gradient-to-r from-red-300 via-purple-300 to-blue-300 animate-pulse"></div>
                </div>
              )}
              
              {/* Merged Result */}
              {step >= 3 && (
                <div className="absolute top-[30px] left-[70px] w-[140px] h-[180px] glass-effect rounded-lg shadow-xl flex flex-col p-3 z-10 animate-scaleIn">
                  <div className="w-full h-3 bg-gradient-to-r from-purple-300 to-pink-300 mb-1 rounded"></div>
                  <div className="w-[90%] h-2 bg-purple-100 mb-1 rounded"></div>
                  <div className="h-[40%] bg-gradient-to-br from-red-50 to-white rounded mb-1 relative overflow-hidden">
                    {/* Decorative content */}
                    <div className="absolute top-2 left-2 w-[60%] h-1.5 bg-red-100 rounded"></div>
                    <div className="absolute top-6 left-2 w-[40%] h-1.5 bg-red-100 rounded"></div>
                  </div>
                  <div className="h-[40%] bg-gradient-to-br from-blue-50 to-white rounded relative overflow-hidden">
                    {/* Decorative content */}
                    <div className="absolute top-2 left-2 w-[60%] h-1.5 bg-blue-100 rounded"></div>
                    <div className="absolute top-6 left-2 w-[40%] h-1.5 bg-blue-100 rounded"></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Status Message */}
            {step >= 2 && (
              <div className="absolute bottom-4 left-0 w-full flex justify-center items-center">
                <div className={`glass-effect rounded-lg p-3 shadow-lg ${step === 2 ? 'animate-fadeIn' : 'animate-slideInRight'}`}>
                  <div className={`text-sm font-medium ${currentColor.text} flex items-center`}>
                    {step === 2 ? (
                      <>
                        <div className="mr-2 w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-rotate"></div>
                        Combining documents...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        PDFs merged successfully!
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Remove Empty Pages Animation - Enhanced Version
          <div className="w-full h-full p-4 flex flex-col items-center justify-center relative">
            <div className="relative w-[280px] h-[200px]">
              {/* PDF Document with Pages */}
              <div className="absolute top-[10px] left-[70px] w-[140px] h-[180px] glass-effect rounded-lg shadow-lg flex flex-col items-center justify-center animate-float">
                {/* Page 1 - With content */}
                <div className={`w-[80%] h-[40px] bg-white shadow-sm mb-3 flex flex-col justify-center p-1 transition-all duration-300 ${step >= 1 ? 'ring-1 ring-green-400' : ''}`}>
                  <div className="w-[90%] h-2 bg-gray-200 rounded"></div>
                  <div className="w-[70%] h-2 bg-gray-200 mt-1 rounded"></div>
                </div>
                
                {/* Page 2 - Empty page */}
                <div className={`w-[80%] h-[40px] bg-white shadow-sm mb-3 relative transition-all duration-300 ${step >= 1 ? 'ring-1 ring-red-400' : ''}`}>
                  {step >= 1 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md animate-pulse">
                      ✕
                    </div>
                  )}
                </div>
                
                {/* Page 3 - With content */}
                <div className={`w-[80%] h-[40px] bg-white shadow-sm flex flex-col justify-center p-1 transition-all duration-300 ${step >= 1 ? 'ring-1 ring-green-400' : ''}`}>
                  <div className="w-[90%] h-2 bg-gray-200 rounded"></div>
                  <div className="w-[70%] h-2 bg-gray-200 mt-1 rounded"></div>
                </div>
              </div>
              
              {/* Scanning effect */}
              {step === 1 && (
                <div className="absolute top-[10px] left-[70px] w-[140px] h-[180px] pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer" style={{ 
                    animation: 'scanDown 1.5s linear infinite, shimmer 2s infinite',
                  }}></div>
                </div>
              )}
              
              {/* Empty page being removed animation */}
              {step === 2 && (
                <div className="absolute top-[80px] left-[70px] w-[112px] h-[40px] bg-white shadow-sm opacity-70 animate-fadeIn"
                     style={{
                       animation: 'fadeIn 0.3s forwards, slideInLeft 0.5s forwards',
                       transform: 'translateX(50px)',
                       opacity: 0
                     }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-xs text-red-500 font-medium">Empty page</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                    ✕
                  </div>
                </div>
              )}
              
              {/* Result - PDF with empty pages removed */}
              {step >= 3 && (
                <div className="absolute top-[50px] right-[40px] w-[120px] h-[140px] glass-effect rounded-lg shadow-xl flex flex-col items-center justify-center p-2 animate-slideInRight">
                  {/* Page 1 - With content */}
                  <div className="w-[80%] h-[40px] bg-white shadow-sm mb-3 flex flex-col justify-center p-1">
                    <div className="w-[90%] h-2 bg-gray-200 rounded"></div>
                    <div className="w-[70%] h-2 bg-gray-200 mt-1 rounded"></div>
                  </div>
                  
                  {/* Page 3 - With content */}
                  <div className="w-[80%] h-[40px] bg-white shadow-sm flex flex-col justify-center p-1">
                    <div className="w-[90%] h-2 bg-gray-200 rounded"></div>
                    <div className="w-[70%] h-2 bg-gray-200 mt-1 rounded"></div>
                  </div>
                  
                  {/* Success indicator */}
                  <div className="mt-3 flex items-center">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-1">
                      <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                    <div className="text-xs text-green-500">1 page removed</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Status Message */}
            {step >= 2 && (
              <div className="absolute bottom-4 left-0 w-full flex justify-center items-center">
                <div className={`glass-effect rounded-lg p-3 shadow-lg ${step === 2 ? 'animate-fadeIn' : 'animate-slideInRight'}`}>
                  <div className={`text-sm font-medium ${currentColor.text} flex items-center`}>
                    {step === 2 ? (
                      <>
                        <div className="mr-2 w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-rotate"></div>
                        Detecting empty pages...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Empty pages removed!
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFFeatureAnimation;
