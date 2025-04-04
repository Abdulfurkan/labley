'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import * as pdfjs from 'pdfjs-dist';

// Disable the canvas factory to prevent canvas dependency issues
if (typeof window !== 'undefined') {
  const PDFJS = pdfjs;
  // Disable worker to avoid additional dependencies
  PDFJS.disableWorker = true;
  // Set worker source to null to prevent worker loading
  PDFJS.GlobalWorkerOptions.workerSrc = null;
}

const PDFViewerClient = ({ file, pageNumber = 1, scale = 1, className = '' }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const canvasRef = useRef(null);

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
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setLoading(false);
        setError('Failed to load PDF. Please try a different file.');
      }
    };

    loadPdf();
  }, [file]);

  // Render the PDF page
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current || typeof window === 'undefined') return;

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(pageNumber);
        
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        setPageLoaded(true);
      } catch (err) {
        console.error('Error rendering page:', err);
        setError('Failed to render PDF page.');
      }
    };

    renderPage();
  }, [pdfDocument, pageNumber, scale]);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4">
        <div className="overflow-auto max-h-[600px]">
          {loading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading PDF...</span>
            </div>
          )}
          
          {error && (
            <div className="text-red-500 p-4">
              {error}
            </div>
          )}
          
          {!loading && !error && (
            <div className="flex flex-col items-center">
              <canvas ref={canvasRef} className="max-w-full" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFViewerClient;
