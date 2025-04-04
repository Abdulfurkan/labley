'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PDFDocument } from 'pdf-lib';
import AdSpace from '../ads/AdSpace';
import { useStats } from '@/app/context/StatsContext';

// Dynamically import ClientPDFViewer with no SSR
const ClientPDFViewer = dynamic(
  () => import('./ClientPDFViewer'),
  { ssr: false }
);

export default function PDFRemover({ file, onReset }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPages, setSelectedPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pagesToRemove, setPagesToRemove] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processedFile, setProcessedFile] = useState(null);
  const [showProcessedPreview, setShowProcessedPreview] = useState(false);
  const [currentProcessedPage, setCurrentProcessedPage] = useState(1);
  const [processedPdfLoaded, setProcessedPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isDetectingEmptyPages, setIsDetectingEmptyPages] = useState(false);
  const [emptyThreshold, setEmptyThreshold] = useState(70); // Default 70% empty space threshold
  const [maxTextLines, setMaxTextLines] = useState(5); // Default max 5 lines of text
  const [showEmptySettings, setShowEmptySettings] = useState(false);
  const { incrementRemoved } = useStats();

  // Update pdfFile when file prop changes
  useEffect(() => {
    if (file && file.url) {
      console.log('File prop changed:', file);
      setPdfFile(file);

      // Use pdf-lib to get page count directly
      const getPageCount = async () => {
        try {
          // Create a simple request to get the PDF data
          const response = await fetch(file.url);
          const pdfBytes = await response.arrayBuffer();

          // Load the PDF document
          const pdfDoc = await PDFDocument.load(pdfBytes);

          // Get the page count
          const pageCount = pdfDoc.getPageCount();
          console.log('PDF has', pageCount, 'pages');

          // Update state
          setNumPages(pageCount);
          setIsLoading(false);
          setPdfError(null);
        } catch (error) {
          console.error('Error loading PDF:', error);
          setPdfError('Failed to load PDF. Please try uploading again.');
          setIsLoading(false);
        }
      };

      setIsLoading(true);
      getPageCount();
    }
  }, [file]);

  // Document load success handler for the main viewer
  const onDocumentLoadSuccess = (pdf) => {
    console.log('Document loaded successfully with', pdf.numPages, 'pages');
    setNumPages(pdf.numPages);
    setCurrentPage(1);
    setIsLoading(false);
    setPdfError(null);
  };

  // Document load error handler
  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    setPdfError('Failed to load PDF. Please try uploading again.');
  };

  // Toggle page selection
  const togglePageSelection = (pageNum) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNum)) {
        return prev.filter(p => p !== pageNum);
      } else {
        return [...prev, pageNum].sort((a, b) => a - b);
      }
    });
  };

  // Detect empty pages in the PDF
  const detectEmptyPages = async () => {
    if (!pdfFile || !pdfFile.url) {
      alert('Please upload a PDF file first.');
      return;
    }

    setIsDetectingEmptyPages(true);

    try {
      // Use pdf-lib to analyze the PDF structure
      const arrayBuffer = await fetch(pdfFile.url).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Get the total number of pages
      const pageCount = pdfDoc.getPageCount();
      const emptyPages = [];

      // Load PDF.js for text extraction
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      // Load the PDF document with PDF.js for text extraction
      const loadingTask = pdfjsLib.getDocument(pdfFile.url);
      const pdfJsDoc = await loadingTask.promise;

      // For each page, check if it's empty using multiple criteria
      for (let i = 0; i < pageCount; i++) {
        // Get the page from pdf-lib for content stream analysis
        const pdfLibPage = pdfDoc.getPage(i);

        // Get content streams for the page
        const contentStreams = pdfLibPage.node.Contents();

        // Initialize variables for emptiness detection
        let isEmpty = false;
        let emptyReason = '';

        // Method 1: Check content stream size (original method)
        if (!contentStreams) {
          // No content streams means the page is empty
          isEmpty = true;
          emptyReason = 'No content streams';
        } else {
          // Check the size of the content stream
          const contentSize = contentStreams.sizeInBytes();

          // If content size is very small, mark as empty
          if (contentSize < 200) {
            isEmpty = true;
            emptyReason = 'Minimal content stream size';
          }
        }

        // If not already marked as empty, use PDF.js to check text content
        if (!isEmpty) {
          try {
            // Get the page from PDF.js
            const pdfJsPage = await pdfJsDoc.getPage(i + 1); // PDF.js uses 1-indexed pages

            // Extract text content
            const textContent = await pdfJsPage.getTextContent();

            // Count text lines (items that end with line breaks or are separated)
            let textLines = 0;
            let lastY = null;

            for (const item of textContent.items) {
              // If y-position is different from the last item, it's likely a new line
              if (lastY === null || Math.abs(item.transform[5] - lastY) > 5) {
                textLines++;
                lastY = item.transform[5];
              }
            }

            // Check if the page has fewer lines than the threshold
            if (textLines <= maxTextLines) {
              isEmpty = true;
              emptyReason = `Only ${textLines} lines of text`;
            }

            // Calculate the approximate content area vs page area
            // Get page dimensions
            const viewport = pdfJsPage.getViewport({ scale: 1.0 });
            const pageArea = viewport.width * viewport.height;

            // Estimate content area based on text item positions
            let minX = viewport.width;
            let maxX = 0;
            let minY = viewport.height;
            let maxY = 0;

            // Find the bounding box of all text content
            for (const item of textContent.items) {
              const x = item.transform[4];
              const y = item.transform[5];
              const width = item.width || 0;
              const height = 12; // Approximate text height

              minX = Math.min(minX, x);
              maxX = Math.max(maxX, x + width);
              minY = Math.min(minY, y - height);
              maxY = Math.max(maxY, y);
            }

            // Calculate content area (if there's any content)
            let contentArea = 0;
            if (textContent.items.length > 0) {
              contentArea = (maxX - minX) * (maxY - minY);
            }

            // Calculate percentage of empty space
            const emptyPercentage = 100 - ((contentArea / pageArea) * 100);

            // If the empty percentage is above the threshold, mark as empty
            if (emptyPercentage >= emptyThreshold) {
              isEmpty = true;
              emptyReason = `${Math.round(emptyPercentage)}% empty space`;
            }

          } catch (textError) {
            console.error(`Error analyzing text on page ${i + 1}:`, textError);
            // Fall back to the original method if text analysis fails
          }
        }

        if (isEmpty) {
          // Add 1 to i because page numbers are 1-indexed for the UI
          emptyPages.push(i + 1);
          console.log(`Page ${i + 1} detected as empty: ${emptyReason}`);
        }
      }

      // Update the selected pages with the detected empty pages
      if (emptyPages.length > 0) {
        // Create a new Set from the existing selection and add the empty pages
        const combinedSelection = new Set([...selectedPages, ...emptyPages]);
        // Convert back to array and sort
        const newSelection = Array.from(combinedSelection).sort((a, b) => a - b);
        
        setSelectedPages(newSelection);
        setPagesToRemove(newSelection.join(', '));
        alert(`Added ${emptyPages.length} empty or nearly empty pages to your selection: ${emptyPages.join(', ')}`);
      } else {
        alert('No empty pages detected in this document.');
      }
    } catch (error) {
      console.error('Error detecting empty pages:', error);
      alert('An error occurred while detecting empty pages. Please try again.');
    } finally {
      setIsDetectingEmptyPages(false);
    }
  };

  // Handle input change for pages to remove
  const handlePagesToRemoveChange = (e) => {
    setPagesToRemove(e.target.value);

    // Clear validation error when input is empty
    if (!e.target.value.trim()) {
      setValidationError(null);
    }
  };

  // Parse the pages to remove input
  const parsePageRanges = (input, totalPages) => {
    if (!input.trim()) return [];

    const selectedPages = new Set();
    const ranges = input.split(',').map(range => range.trim());

    for (const range of ranges) {
      if (range.includes('-')) {
        // Handle range like "1-5"
        const [start, end] = range.split('-').map(num => parseInt(num.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (i >= 1 && i <= totalPages) {
              selectedPages.add(i);
            }
          }
        }
      } else {
        // Handle single page like "3"
        const page = parseInt(range, 10);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
          selectedPages.add(page);
        }
      }
    }

    return Array.from(selectedPages).sort((a, b) => a - b);
  };

  // Apply page selection from input
  const applyPageSelection = () => {
    // Clear any previous validation errors
    setValidationError(null);

    // Check if input contains any page numbers that exceed the total
    const inputRanges = pagesToRemove.split(',').map(range => range.trim());
    let hasInvalidPages = false;
    let highestInvalidPage = 0;

    for (const range of inputRanges) {
      if (range.includes('-')) {
        // Handle range like "1-5"
        const [start, end] = range.split('-').map(num => parseInt(num.trim(), 10));
        if (!isNaN(start) && start > numPages) {
          hasInvalidPages = true;
          highestInvalidPage = Math.max(highestInvalidPage, start);
        }
        if (!isNaN(end) && end > numPages) {
          hasInvalidPages = true;
          highestInvalidPage = Math.max(highestInvalidPage, end);
        }
      } else {
        // Handle single page like "3"
        const page = parseInt(range, 10);
        if (!isNaN(page) && page > numPages) {
          hasInvalidPages = true;
          highestInvalidPage = Math.max(highestInvalidPage, page);
        }
      }
    }

    if (hasInvalidPages) {
      setValidationError(`Invalid page number(s): This PDF only has ${numPages} pages, but you entered page ${highestInvalidPage > numPages ? highestInvalidPage : 'numbers that exceed the total'}.`);
      return;
    }

    const pages = parsePageRanges(pagesToRemove, numPages);
    setSelectedPages(pages);
  };

  // Remove selected pages
  const removePages = async () => {
    if (!pdfFile || selectedPages.length === 0 || selectedPages.length === numPages) {
      alert('Please select at least one page to remove, but not all pages.');
      return;
    }

    setIsProcessing(true);

    try {
      // Load the PDF
      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Get the pages to keep (all pages except the selected ones)
      const pagesToKeep = Array.from({ length: numPages }, (_, i) => i + 1)
        .filter(pageNum => !selectedPages.includes(pageNum));

      // Create a new PDF with only the pages to keep
      const newPdfDoc = await PDFDocument.create();

      // Copy pages from the original to the new document
      for (const pageNum of pagesToKeep) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
        newPdfDoc.addPage(copiedPage);
      }

      // Save the modified PDF
      const modifiedPdfBytes = await newPdfDoc.save();

      // Create a new Blob and URL
      const modifiedPdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const modifiedPdfUrl = URL.createObjectURL(modifiedPdfBlob);

      // Set the processed file
      const processedData = {
        file: modifiedPdfBlob,
        url: modifiedPdfUrl,
        name: `modified-${pdfFile.name || 'document.pdf'}`,
        size: modifiedPdfBlob.size,
        numPages: pagesToKeep.length
      };

      setProcessedFile(processedData);
      setShowProcessedPreview(true);
      setCurrentProcessedPage(1);

    } catch (error) {
      console.error('Error removing pages:', error);
      alert('An error occurred while removing pages. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Download the processed PDF
  const downloadProcessedPDF = () => {
    if (!processedFile || !processedFile.url) {
      console.error("No processed PDF data available for download");
      return;
    }

    console.log("Downloading processed PDF:", processedFile);
    const link = document.createElement('a');
    link.href = processedFile.url;
    link.download = processedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Increment the removed counter when a PDF with removed pages is downloaded
    incrementRemoved();
  };

  // Close processed preview and return to editor
  const closeProcessedPreview = () => {
    setShowProcessedPreview(false);
    setProcessedPdfLoaded(false);
  };

  // Helper function to pass the modified file back to the parent
  const onFileSelected = (newFile) => {
    // Clean up the old URL to prevent memory leaks
    if (pdfFile && pdfFile.url) {
      URL.revokeObjectURL(pdfFile.url);
    }

    // Reset state for the new file
    setCurrentPage(1);

    // Update the file
    onReset();
    // Use a timeout to ensure the component is fully reset before setting the new file
    setTimeout(() => {
      setPdfFile(newFile);
    }, 100);
  };

  // Function to generate a data URL for a PDF page
  const generatePageThumbnail = async (pageNumber) => {
    if (!pdfFile || !pdfFile.url) return null;

    try {
      // Create a canvas element to render the PDF page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Set dimensions
      canvas.width = 150;
      canvas.height = 200;

      // Draw a white background
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Return the canvas as a data URL
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return null;
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        {showProcessedPreview ? (
          /* Processed PDF Preview Section */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left sidebar - Processed page thumbnails */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-200 bg-green-50">
                  <h3 className="font-medium text-gray-800">Modified Pages</h3>
                </div>

                <div className="max-h-[500px] overflow-y-auto p-4 bg-gray-50">
                  {processedFile && (
                    <ClientPDFViewer
                      file={processedFile.url}
                      onLoadSuccess={(pdf) => {
                        console.log("Processed PDF thumbnails loaded successfully", pdf);
                      }}
                      currentPage={currentProcessedPage}
                      numPages={processedFile.numPages}
                      viewType="thumbnails"
                      selectedPages={[currentProcessedPage]}
                      togglePageSelection={(pageNum) => {
                        setCurrentProcessedPage(pageNum);
                      }}
                    />
                  )}
                </div>

                {/* Left Sidebar Ad */}
                <div className="p-4 border-t border-gray-200">
                  <AdSpace type="box" className="rounded overflow-hidden" />
                </div>
              </div>
            </div>

            {/* Right sidebar - Processed PDF info */}
            <div className="w-full lg:w-64 flex-shrink-0 order-first lg:order-last">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-200 bg-green-50">
                  <h3 className="font-medium text-gray-800">Modified PDF</h3>
                </div>

                <div className="p-4 space-y-4">
                  {/* Success message */}
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                      </svg>
                      <span className="font-medium text-green-800">Pages Removed Successfully</span>
                    </div>
                    <p className="text-sm text-green-700">Your PDF has been modified with the selected pages removed.</p>
                  </div>

                  {/* Modification information */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-blue-800">Modification Information</h4>
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Original Pages:</span>
                        <span className="font-medium text-gray-800">{numPages}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Pages Removed:</span>
                        <span className="font-medium text-gray-800">{selectedPages.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remaining Pages:</span>
                        <span className="font-medium text-gray-800">{processedFile?.numPages || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">File Size:</span>
                        <span className="font-medium text-gray-800">{(processedFile?.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col space-y-2">
                    <button
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      onClick={downloadProcessedPDF}
                    >
                      <span className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                        </svg>
                        Download Modified PDF
                      </span>
                    </button>
                    <button
                      className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                      onClick={closeProcessedPreview}
                    >
                      Back to Editor
                    </button>
                  </div>
                </div>

                {/* Left Sidebar Ad */}
                <div className="p-4 border-t border-gray-200">
                  <AdSpace type="box" className="rounded overflow-hidden" />
                </div>
              </div>
            </div>

            {/* Main content - Processed PDF viewer */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 p-3 flex justify-between items-center">
                  <h3 className="font-medium text-gray-800">Modified PDF Preview</h3>

                  {/* Page Navigation for processed PDF */}
                  {processedFile && processedFile.numPages > 1 && (
                    <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-md p-1 shadow-sm">
                      <button
                        className="p-2 rounded text-xs text-center flex flex-col items-center"
                        onClick={() => setCurrentProcessedPage(prev => Math.max(1, prev - 1))}
                        disabled={currentProcessedPage <= 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                      <div className="text-sm text-blue-800">
                        Page <span className="font-medium text-blue-800">{currentProcessedPage}</span> of <span className="font-medium text-blue-800">{processedFile.numPages || 0}</span>
                      </div>
                      <button
                        className="p-2 rounded text-xs text-center flex flex-col items-center"
                        onClick={() => setCurrentProcessedPage(prev => Math.min(processedFile.numPages || 1, prev + 1))}
                        disabled={!processedFile.numPages || currentProcessedPage >= processedFile.numPages}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* PDF Viewer for processed PDF */}
                <div className="relative border-gray-200 flex justify-center items-center overflow-hidden p-4 min-h-[500px]">
                  {processedFile ? (
                    <>
                      <ClientPDFViewer
                        file={processedFile.url}
                        currentPage={currentProcessedPage}
                        onLoadSuccess={(pdf) => {
                          console.log("Processed PDF loaded successfully", pdf);
                          setProcessedPdfLoaded(true);
                        }}
                        onLoadError={(error) => {
                          console.error("Error loading processed PDF:", error);
                        }}
                        numPages={processedFile.numPages || 1}
                        viewType="single"
                        onPageLoadSuccess={(page) => {
                          console.log("Processed PDF page loaded", page);
                        }}
                      />
                      {!processedPdfLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
                            <p className="text-blue-500">Loading modified PDF...</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center">
                      <p>No modified PDF available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Original Editor UI */
          <div className="flex flex-col gap-6">
            {/* Main content area with PDF grid view and right sidebar */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main content - PDF grid view */}
              <div className="flex-1">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Toolbar */}
                  <div className="border-b border-gray-200 bg-gray-50 p-3">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <div className="text-sm text-gray-600">
                        {numPages ? `${numPages} pages` : ''}
                      </div>
                    </div>
                  </div>

                  {/* PDF Grid View */}
                  <div className="p-6">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      </div>
                    ) : pdfError ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mx-auto mb-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <p className="text-red-700">{pdfError}</p>
                          <button
                            onClick={onReset}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Upload a Different PDF
                          </button>
                        </div>
                      </div>
                    ) : numPages === null ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                          <p className="text-blue-600">Loading PDF document...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        {pdfFile && pdfFile.url && (
                          <ClientPDFViewer
                            file={pdfFile.url}
                            numPages={numPages}
                            viewType="grid"
                            selectedPages={selectedPages}
                            togglePageSelection={togglePageSelection}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right sidebar - Remove Pages UI */}
              <div className="w-full lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
                  <div className="p-4 border-b border-gray-200 bg-red-50">
                    <h3 className="font-medium text-gray-800">Remove pages</h3>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Instructions */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800">
                        Click on pages to remove from document. You can use "shift" key to set ranges.
                      </p>
                    </div>

                    {/* Page count */}
                    <div className="text-sm text-gray-700">
                      Total pages: <span className="font-medium">{numPages || 0}</span>
                    </div>

                    {/* Pages to remove input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pages to remove:
                      </label>
                      <div className="flex space-x-2 flex-wrap">
                        <input
                          type="text"
                          value={pagesToRemove}
                          onChange={handlePagesToRemoveChange}
                          placeholder="e.g. 3,6,7-9"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-w-[120px] mb-2 text-gray-800"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={applyPageSelection}
                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                      {/* Validation Error Message */}
                      {validationError && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-600">{validationError}</p>
                        </div>
                      )}
                    </div>

                    {/* Selected pages display */}
                    {selectedPages.length > 0 && (
                      <div className="p-3 bg-gray-50 rounded border border-gray-200">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Selected pages:</span>
                          <span className="text-sm font-medium text-blue-600">{selectedPages.length}</span>
                        </div>
                        <div className="text-sm text-gray-600 break-words">
                          {selectedPages.join(', ')}
                        </div>
                      </div>
                    )}

                    {/* Empty page detection button */}
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <button
                          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md shadow-md hover:shadow-lg hover:translate-y-[-1px] transition-all duration-200 flex items-center justify-center"
                          onClick={detectEmptyPages}
                          disabled={isDetectingEmptyPages || isProcessing || isLoading || numPages === null}
                        >
                          {isDetectingEmptyPages ? (
                            <>
                              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Detecting...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                              </svg>
                              Detect Empty Pages
                            </>
                          )}
                        </button>
                        <button
                          className="ml-2 p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                          onClick={() => setShowEmptySettings(!showEmptySettings)}
                          title="Configure empty page detection settings"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      {showEmptySettings && (
                        <div className="p-4 bg-gray-100 rounded-md mb-4">
                          <h4 className="font-medium mb-3">Empty Page Detection Settings</h4>

                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Empty Space Threshold: {emptyThreshold}%
                            </label>
                            <div className="flex items-center">
                              <span className="text-xs mr-2">50%</span>
                              <input
                                type="range"
                                min="50"
                                max="95"
                                value={emptyThreshold}
                                onChange={(e) => setEmptyThreshold(parseInt(e.target.value))}
                                className="w-full"
                              />
                              <span className="text-xs ml-2">95%</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Pages with at least this percentage of empty space will be detected as empty
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Maximum Text Lines: {maxTextLines}
                            </label>
                            <div className="flex items-center">
                              <span className="text-xs mr-2">1</span>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={maxTextLines}
                                onChange={(e) => setMaxTextLines(parseInt(e.target.value))}
                                className="w-full"
                              />
                              <span className="text-xs ml-2">10</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Pages with this number of text lines or fewer will be detected as empty
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Remove pages button */}
                    <button
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                      onClick={removePages}
                      disabled={selectedPages.length === 0 || isProcessing || isLoading || numPages === null}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Remove pages
                    </button>

                    {/* Upload New PDF button */}
                    <button
                      onClick={onReset}
                      className="w-full mt-2 px-2 py-1 rounded-md bg-gradient-to-r from-blue-600 to-indigo-700 text-white transition-all duration-300 shadow hover:shadow-lg hover:translate-y-[-2px] flex items-center justify-center text-xs"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      Upload New PDF
                    </button>

                    {/* Right Sidebar Ad */}
                    <div className="p-4 border-t border-gray-200">
                      <AdSpace type="sidebar" className="rounded overflow-hidden" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Ad Banner */}
      <div className="container mx-auto px-4 py-4">
        <AdSpace type="large" className="rounded-lg overflow-hidden shadow-sm" />
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg font-medium">Processing PDF...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
