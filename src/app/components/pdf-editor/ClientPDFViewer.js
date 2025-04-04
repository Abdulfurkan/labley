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

export default function ClientPDFViewer({
  file,
  onLoadSuccess,
  onLoadError,
  currentPage,
  numPages,
  scale = 1.0,
  onPageLoadSuccess,
  selectedPages = [],
  togglePageSelection,
  viewType = 'single', // 'single', 'thumbnails', or 'grid'
  onMouseDown,
  onMouseMove,
  onMouseUp,
  cursorStyle
}) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentLoaded, setDocumentLoaded] = useState(false);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageRendering, setPageRendering] = useState(false);
  const canvasRefs = useRef({});

  // Use an iframe as a fallback if pdfjs fails
  const [useIframe, setUseIframe] = useState(false);

  useEffect(() => {
    // Reset state when file changes
    setError(null);
    setLoading(true);
    setDocumentLoaded(false);
    setUseIframe(false);
    setPdfDocument(null);
    
    if (!file) return;

    // Load the PDF document
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
        setDocumentLoaded(true);
        
        if (onLoadSuccess) {
          onLoadSuccess({ numPages: pdf.numPages });
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF. Please try again or use a different file.');
        setLoading(false);
        setUseIframe(true);
        
        if (onLoadError) {
          onLoadError(err);
        }
      }
    };

    loadPdf();
  }, [file, onLoadSuccess, onLoadError]);

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
    
    // For grid or thumbnails view, render all pages
    if ((viewType === 'grid' || viewType === 'thumbnails') && numPages) {
      for (let i = 1; i <= numPages; i++) {
        if (canvasRefs.current[`page-${i}`]) {
          renderPage(i, canvasRefs.current[`page-${i}`]);
        }
      }
    }
  }, [documentLoaded, pdfDocument, currentPage, numPages, viewType, scale]);

  // Handle mouse events for cropping
  const handleMouseEvents = (e, eventType) => {
    if (onMouseDown || onMouseMove || onMouseUp) {
      // Prevent default behavior to avoid text selection
      e.preventDefault();

      // Pass the event to the parent component
      if (eventType === 'mousedown' && onMouseDown) {
        console.log('ClientPDFViewer: mousedown event');
        onMouseDown(e);
      } else if (eventType === 'mousemove' && onMouseMove) {
        onMouseMove(e);
      } else if (eventType === 'mouseup' && onMouseUp) {
        console.log('ClientPDFViewer: mouseup event');
        onMouseUp(e);
      }
    }
  };

  if (useIframe) {
    return (
      <iframe
        src={file}
        className="w-full"
        style={{
          height: '600px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
        title="PDF Viewer"
      />
    );
  }

  if (error && !useIframe) {
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

  if (documentLoaded && viewType === 'grid' && numPages > 0) {
    // Grid view for PDFRemover
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {Array.from(new Array(numPages), (_, index) => (
          <div
            key={`page-${index + 1}`}
            className={`border border-gray-300 rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
              selectedPages.includes(index + 1) ? 'border-2 border-red-500' : ''
            }`}
            onClick={() => togglePageSelection && togglePageSelection(index + 1)}
          >
            <div className="relative flex justify-center items-center p-4 bg-white min-h-[300px]">
              <canvas
                ref={(ref) => canvasRefs.current[`page-${index + 1}`] = ref}
                className="max-w-full"
              />
              {selectedPages.includes(index + 1) && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
              )}
            </div>
            <div className="text-center py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-800">Page {index + 1}</p>
            </div>
          </div>
        ))}
      </div>
    );
  } 
  
  if (documentLoaded && viewType === 'thumbnails' && numPages > 0) {
    // Render thumbnails
    return (
      <div className="thumbnail-document">
        {Array.from(new Array(numPages), (_, index) => (
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
            <div className="text-center text-sm mt-1 text-gray-800 font-medium">Page {index + 1}</div>
          </div>
        ))}
      </div>
    );
  }
  
  if (documentLoaded && currentPage && currentPage <= numPages) {
    // Render single page
    return (
      <div className="flex justify-center items-center w-full h-full m-0 p-0">
        <canvas
          ref={(ref) => canvasRefs.current[`page-${currentPage}`] = ref}
          className={`m-0 p-0 ${cursorStyle ? `cursor-${cursorStyle}` : ''}`}
          onMouseDown={(e) => handleMouseEvents(e, 'mousedown')}
          onMouseMove={(e) => handleMouseEvents(e, 'mousemove')}
          onMouseUp={(e) => handleMouseEvents(e, 'mouseup')}
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
