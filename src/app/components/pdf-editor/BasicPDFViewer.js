'use client';

import { useState, useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function BasicPDFViewer({
  file,
  onDocumentLoadSuccess,
  currentPage = 1,
  numPages,
  scale = 1.0,
  onPageLoadSuccess,
  selectedPages = [],
  togglePageSelection,
  viewType = 'single'
}) {
  const [errorMessage, setErrorMessage] = useState(null);
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageRendering, setPageRendering] = useState(false);
  const canvasRefs = useRef({});

  // Load PDF document
  useEffect(() => {
    if (!file) return;

    const loadPdf = async () => {
      try {
        // If file is a URL string
        const pdfData = typeof file === 'string' ? file : file;
        
        // Load the PDF document
        const loadingTask = pdfjs.getDocument(pdfData);
        const pdf = await loadingTask.promise;
        
        setPdfDocument(pdf);
        setLoading(false);
        setDocumentLoaded(true);
        
        if (onDocumentLoadSuccess) {
          onDocumentLoadSuccess({ numPages: pdf.numPages });
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        setLoading(false);
        setErrorMessage('Failed to load PDF. Please try a different file.');
      }
    };

    loadPdf();
  }, [file, onDocumentLoadSuccess]);

  // Render a specific page
  const renderPage = async (pageNumber, canvasRef) => {
    if (!pdfDocument || !canvasRef || pageRendering) return;
    
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
    if (!documentLoaded || !pdfDocument) return;
    
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
  }, [documentLoaded, pdfDocument, currentPage, numPages, viewType, scale, onPageLoadSuccess]);

  if (errorMessage) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded bg-red-50">
        {errorMessage}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">Loading PDF...</p>
      </div>
    );
  }

  if (!documentLoaded) {
    return (
      <div className="text-center p-4">
        <p>No PDF file selected.</p>
      </div>
    );
  }

  if (viewType === 'thumbnails' && numPages > 0) {
    return (
      <div className="pdf-container">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from(new Array(numPages), (_, index) => (
            <div
              key={`thumbnail-${index + 1}`}
              className={`cursor-pointer border-2 p-1 ${
                selectedPages.includes(index + 1) ? 'border-blue-500' : 'border-gray-300'
              }`}
              onClick={() => togglePageSelection && togglePageSelection(index + 1)}
            >
              <canvas
                ref={(ref) => canvasRefs.current[`page-${index + 1}`] = ref}
                width={150}
                className="max-w-full"
              />
              <p className="text-center text-sm mt-1">Page {index + 1}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentPage && currentPage <= numPages) {
    return (
      <div className="pdf-container flex justify-center">
        <canvas
          ref={(ref) => canvasRefs.current[`page-${currentPage}`] = ref}
          className="max-w-full"
        />
      </div>
    );
  }

  return (
    <div className="text-center p-4">
      <p>Preparing document for viewing...</p>
    </div>
  );
}
