'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';

// Dynamically import the Document and Page components from react-pdf
// This ensures they're only loaded on the client side
const PDFDocument = dynamic(
  () => import('react-pdf').then(mod => mod.Document),
  { ssr: false }
);

const PDFPage = dynamic(
  () => import('react-pdf').then(mod => mod.Page),
  { ssr: false }
);

// Import the worker from a separate file
import { pdfjs } from 'react-pdf';
// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewerClient = ({ file, pageNumber = 1, scale = 1, className = '' }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageLoaded, setPageLoaded] = useState(false);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function onPageLoadSuccess() {
    setPageLoaded(true);
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-4">
        <div className="overflow-auto max-h-[600px]">
          {file && (
            <PDFDocument
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex flex-col items-center"
            >
              <PDFPage
                pageNumber={pageNumber}
                scale={scale}
                onLoadSuccess={onPageLoadSuccess}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                canvasBackground="transparent"
              />
            </PDFDocument>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFViewerClient;
