'use client';

import { createContext, useContext, useState } from 'react';

// Create the context
const PDFContext = createContext();

// Create a provider component
export function PDFProvider({ children }) {
  const [sharedPDF, setSharedPDF] = useState(null);

  // Function to share a PDF between pages
  const sharePDF = (pdfData) => {
    setSharedPDF(pdfData);
  };

  // Function to clear the shared PDF
  const clearSharedPDF = () => {
    setSharedPDF(null);
  };

  return (
    <PDFContext.Provider value={{ sharedPDF, sharePDF, clearSharedPDF }}>
      {children}
    </PDFContext.Provider>
  );
}

// Custom hook to use the PDF context
export function useSharedPDF() {
  const context = useContext(PDFContext);
  if (context === undefined) {
    throw new Error('useSharedPDF must be used within a PDFProvider');
  }
  return context;
}
