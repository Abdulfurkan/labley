'use client';

import { useState, useEffect, useRef } from 'react';
import { getDocument, pdfjs } from '@/lib/pdfjs-setup';

export default function PDFViewer({
  file,
  onDocumentLoadSuccess,
  currentPage,
  numPages,
  scale = 1.0,
  onPageLoadSuccess,
  selectedPages = [],
  togglePageSelection,
  viewType = 'single', // 'single' or 'thumbnails'
  onMouseDown,
  onMouseMove,
  onMouseUp,
  cursorStyle
}) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageRendering, setPageRendering] = useState(false);
  const canvasRefs = useRef({});

  // Load PDF document
  useEffect(() => {
    if (!file || typeof window === 'undefined') return;

    const loadPdf = async () => {
      try {
        // If file is a URL string
        const pdfData = typeof file === 'string' ? file : file;
        
        // Use our custom getDocument function
        const loadingTask = getDocument(pdfData);
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

  // Handle mouse events for cropping
  const handleMouseEvents = (e, eventType) => {
    if (eventType === 'mousedown' && onMouseDown) {
      onMouseDown(e);
    } else if (eventType === 'mousemove' && onMouseMove) {
      onMouseMove(e);
    } else if (eventType === 'mouseup' && onMouseUp) {
      onMouseUp(e);
    }
  };

  if (error) {
    return <div className="text-red-500 p-4" data-component-name="PDFViewer">{error}</div>;
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
        className={`max-w-full ${cursorStyle ? `cursor-${cursorStyle}` : ''}`}
        onMouseDown={(e) => handleMouseEvents(e, 'mousedown')}
        onMouseMove={(e) => handleMouseEvents(e, 'mousemove')}
        onMouseUp={(e) => handleMouseEvents(e, 'mouseup')}
      />
    </div>
  );
}
