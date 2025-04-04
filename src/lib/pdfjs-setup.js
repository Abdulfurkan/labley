'use client';

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js for browser environment
if (typeof window !== 'undefined') {
  // Disable worker to avoid additional dependencies
  pdfjsLib.GlobalWorkerOptions.workerSrc = null;
  
  // Explicitly disable the canvas factory
  const originalNodeCanvasFactory = pdfjsLib.NodeCanvasFactory;
  pdfjsLib.NodeCanvasFactory = null;
}

// Custom document loader that doesn't depend on canvas
const getDocument = (source) => {
  const options = {
    disableWorker: true,
    disableAutoFetch: true,
    disableStream: true,
    isEvalSupported: false
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
