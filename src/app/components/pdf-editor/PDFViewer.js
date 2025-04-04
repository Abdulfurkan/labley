'use client';

import { useState, useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';

// Disable the canvas factory to prevent canvas dependency issues
if (typeof window !== 'undefined') {
  const PDFJS = pdfjs;
  // Disable worker to avoid additional dependencies
  PDFJS.disableWorker = true;
  // Set worker source to null to prevent worker loading
  PDFJS.GlobalWorkerOptions.workerSrc = null;
}

export default function PDFViewer({
  file,
  onDocumentLoadSuccess,
  onPageLoadSuccess,
  scale = 1.0,
  currentPage = 1,
  numPages = 0,
  viewType = 'single', // 'single' or 'thumbnails'
  selectedPages = [],
  togglePageSelection,
}) {
  const [pdfDocument, setPdfDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageRendering, setPageRendering] = useState(false);
  const canvasRefs = useRef({});

  // Load PDF document
  useEffect(() => {
    if (!file || typeof window === 'undefined') return;

    const loadPdf = async () => {
      try {
        // If file is a URL string
        const pdfData = typeof file === 'string' ? file : file;
        
        // Configure pdfjs for browser environment
        const loadingTask = pdfjs.getDocument({
          url: pdfData,
          disableWorker: true,
          disableAutoFetch: true,
          disableStream: true,
          isEvalSupported: false
        });
        
        const pdf = await loadingTask.promise;
        
        setPdfDocument(pdf);
        setLoading(false);
        
        if (onDocumentLoadSuccess) {
          onDocumentLoadSuccess({ numPages: pdf.numPages });
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        setLoading(false);
        setError('Failed to load PDF. Please try a different file.');
      }
    };

    loadPdf();
  }, [file, onDocumentLoadSuccess]);

  // Render a specific page
  const renderPage = async (pageNumber, canvasRef) => {
    if (!pdfDocument || !canvasRef || pageRendering || typeof window === 'undefined') return;
    
    setPageRendering(true);
    
    try {
      const page = await pdfDocument.getPage(pageNumber);
      
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef;
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      setPageRendering(false);
      
      if (onPageLoadSuccess) {
        onPageLoadSuccess(page);
      }
    } catch (err) {
      console.error('Error rendering page:', err);
      setPageRendering(false);
    }
  };

  // Effect to render pages when document is loaded
  useEffect(() => {
    if (!pdfDocument || typeof window === 'undefined') return;
    
    // For single view, render current page
    if (viewType === 'single' && currentPage && canvasRefs.current[`page-${currentPage}`]) {
      renderPage(currentPage, canvasRefs.current[`page-${currentPage}`]);
    }
    
    // For thumbnails view, render all pages
    if (viewType === 'thumbnails' && numPages) {
      for (let i = 1; i <= numPages; i++) {
        if (canvasRefs.current[`page-${i}`]) {
          renderPage(i, canvasRefs.current[`page-${i}`]);
        }
      }
    }
  }, [pdfDocument, currentPage, numPages, viewType, scale, onPageLoadSuccess]);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (loading) {
    return (
      <div className="text-blue-500 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
        Loading PDF...
      </div>
    );
  }

  if (viewType === 'thumbnails') {
    // Render thumbnails
    return (
      <div className="thumbnail-document">
        {Array.from(new Array(numPages || 0), (_, index) => (
          <div 
            key={`thumbnail-${index + 1}`}
            className={`mb-3 cursor-pointer border-2 ${
              selectedPages.includes(index + 1) ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => togglePageSelection && togglePageSelection(index + 1)}
          >
            <canvas
              ref={(ref) => canvasRefs.current[`page-${index + 1}`] = ref}
              width={150}
              className="max-w-full"
            />
            <div className="text-center text-sm mt-1">Page {index + 1}</div>
          </div>
        ))}
      </div>
    );
  }

  // Render single page
  return (
    <div className="flex justify-center">
      <canvas
        ref={(ref) => canvasRefs.current[`page-${currentPage}`] = ref}
        className="max-w-full"
      />
    </div>
  );
}
