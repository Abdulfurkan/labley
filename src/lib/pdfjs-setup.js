'use client';

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';

// Configure PDF.js for browser environment
if (typeof window !== 'undefined') {
  // Disable worker to avoid additional dependencies
  pdfjsLib.GlobalWorkerOptions.workerSrc = null;
  
  // Mock NodeCanvasFactory to prevent canvas dependency issues
  pdfjsLib.NodeCanvasFactory = null;
  
  // Disable autoFetch and stream
  pdfjsLib.disableAutoFetch = true;
  pdfjsLib.disableStream = true;
  pdfjsLib.disableCreateObjectURL = true;
  
  // Mock version property
  if (!pdfjsLib.version) {
    pdfjsLib.version = '3.4.120';
  }
}

// Custom document loader that doesn't depend on canvas
const getDocument = (source) => {
  const options = {
    disableWorker: true,
    disableAutoFetch: true,
    disableStream: true,
    isEvalSupported: false,
    canvasFactory: null
  };
  
  // Handle different source types
  if (typeof source === 'string') {
    options.url = source;
  } else if (source instanceof Uint8Array) {
    options.data = source;
  } else if (source instanceof ArrayBuffer) {
    options.data = new Uint8Array(source);
  } else if (typeof source === 'object') {
    Object.assign(options, source);
  }
  
  return pdfjsLib.getDocument(options);
};

export { getDocument, pdfjsLib as pdfjs };
