'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PDFDocument } from 'pdf-lib';
import AdSpace from '../ads/AdSpace';
import { useStats } from '@/app/context/StatsContext';
import Link from 'next/link';
import { useSharedPDF } from '@/app/context/PDFContext';
import { useRouter } from 'next/navigation';

// Dynamically import ClientPDFViewer with no SSR
const ClientPDFViewer = dynamic(
  () => import('./ClientPDFViewer'),
  { ssr: false }
);

export default function PDFMerger({ files, onReset, onRemoveFile, onAddFile }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFile, setProcessedFile] = useState(null);
  const [showProcessedPreview, setShowProcessedPreview] = useState(false);
  const [currentProcessedPage, setCurrentProcessedPage] = useState(1);
  const [processedPdfLoaded, setProcessedPdfLoaded] = useState(false);
  const [pdfError, setPdfError] = useState(null);
  const [fileDetails, setFileDetails] = useState([]);
  const { incrementMerged } = useStats();
  const { sharePDF } = useSharedPDF();
  const router = useRouter();

  // Update file details when files prop changes
  useEffect(() => {
    const loadFileDetails = async () => {
      const details = await Promise.all(
        files.map(async (file, index) => {
          try {
            // Create a simple request to get the PDF data
            const response = await fetch(file.url);
            const pdfBytes = await response.arrayBuffer();

            // Load the PDF document
            const pdfDoc = await PDFDocument.load(pdfBytes);

            // Get the page count
            const pageCount = pdfDoc.getPageCount();

            return {
              ...file,
              index,
              numPages: pageCount,
              error: null
            };
          } catch (error) {
            console.error(`Error loading PDF at index ${index}:`, error);
            return {
              ...file,
              index,
              numPages: 0,
              error: 'Failed to load PDF'
            };
          }
        })
      );

      setFileDetails(details);
    };

    if (files.length > 0) {
      loadFileDetails();
    } else {
      setFileDetails([]);
    }
  }, [files]);

  // Handle file input for adding more PDFs
  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      if (files[0].type === 'application/pdf') {
        processFile(files[0]);
      } else {
        setPdfError('Please upload a PDF file.');
        setTimeout(() => setPdfError(null), 3000);
      }
    }
  };

  const processFile = (file) => {
    try {
      // Direct URL creation - simplest approach
      const fileUrl = URL.createObjectURL(file);

      // Pass the file to the parent component
      onAddFile({
        file: file,
        url: fileUrl,
        name: file.name,
        size: file.size
      });

      setPdfError(null);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setPdfError('There was an error processing your PDF. Please try another file.');
      setTimeout(() => setPdfError(null), 3000);
    }
  };

  // Move file up in the list
  const moveFileUp = (index) => {
    if (index === 0) return; // Already at the top

    const newFileDetails = [...fileDetails];
    const temp = newFileDetails[index];
    newFileDetails[index] = newFileDetails[index - 1];
    newFileDetails[index - 1] = temp;

    setFileDetails(newFileDetails);
  };

  // Move file down in the list
  const moveFileDown = (index) => {
    if (index === fileDetails.length - 1) return; // Already at the bottom

    const newFileDetails = [...fileDetails];
    const temp = newFileDetails[index];
    newFileDetails[index] = newFileDetails[index + 1];
    newFileDetails[index + 1] = temp;

    setFileDetails(newFileDetails);
  };

  // Merge PDFs
  const mergePDFs = async () => {
    if (files.length < 2) {
      alert('Please upload at least two PDF files to merge.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create a new PDF document
      const mergedPdf = await PDFDocument.create();

      // Process each file in order
      for (const fileDetail of fileDetails) {
        try {
          // Load the PDF
          const arrayBuffer = await fileDetail.file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);

          // Copy all pages from this PDF
          const pageIndices = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i);
          const copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);

          // Add all pages to the merged PDF
          copiedPages.forEach(page => {
            mergedPdf.addPage(page);
          });
        } catch (error) {
          console.error(`Error processing file ${fileDetail.name}:`, error);
          // Continue with the next file
        }
      }

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();

      // Create a new Blob and URL
      const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const mergedPdfUrl = URL.createObjectURL(mergedPdfBlob);

      // Set the processed file
      const processedData = {
        file: mergedPdfBlob,
        url: mergedPdfUrl,
        name: `merged-document.pdf`,
        size: mergedPdfBlob.size,
        numPages: mergedPdf.getPageCount()
      };

      setProcessedFile(processedData);
      setShowProcessedPreview(true);
      setCurrentProcessedPage(1);

    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('An error occurred while merging PDFs. Please try again.');
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
    
    // Increment the merged counter when a PDF is downloaded
    incrementMerged();
  };

  // Close processed preview and return to editor
  const closeProcessedPreview = () => {
    setShowProcessedPreview(false);
    setProcessedPdfLoaded(false);
  };

  return (
    <div className="w-full bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        {showProcessedPreview ? (
          /* Processed PDF Preview Section */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left sidebar - Processed page thumbnails */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-200 bg-green-50">
                  <h3 className="font-medium text-gray-800">Merged PDF Pages</h3>
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

            {/* Center - PDF Viewer */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium text-gray-800">Merged PDF Preview</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={closeProcessedPreview}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                    >
                      Back to Editor
                    </button>
                    <button
                      onClick={downloadProcessedPDF}
                      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>

                <div className="p-4 h-[600px] bg-gray-100 flex flex-col">
                  {processedFile && (
                    <>
                      <div className="flex-1 overflow-auto flex flex-col" style={{ maxHeight: "530px" }}>
                        <div className="pt-4 pb-2 flex justify-center">
                          <div className="pdf-container">
                            <ClientPDFViewer
                              file={processedFile.url}
                              onLoadSuccess={(pdf) => {
                                console.log("Processed PDF loaded successfully", pdf);
                                setProcessedPdfLoaded(true);
                              }}
                              onLoadError={(error) => {
                                console.error("Error loading processed PDF:", error);
                                setPdfError("Failed to load the merged PDF. Please try again.");
                                setTimeout(() => setPdfError(null), 3000);
                              }}
                              currentPage={currentProcessedPage}
                              numPages={processedFile.numPages}
                              scale={1.1}
                              viewType="single"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Page navigation controls */}
                      {processedPdfLoaded && (
                        <div className="mt-4 flex items-center space-x-4">
                          <button
                            onClick={() => setCurrentProcessedPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentProcessedPage <= 1}
                            className={`p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors ${currentProcessedPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>

                          <span className="text-sm font-medium text-black">
                            Page {currentProcessedPage} of {processedFile.numPages}
                          </span>

                          <button
                            onClick={() => setCurrentProcessedPage(prev => Math.min(prev + 1, processedFile.numPages))}
                            disabled={currentProcessedPage >= processedFile.numPages}
                            className={`p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors ${currentProcessedPage >= processedFile.numPages ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {pdfError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      {pdfError}
                    </div>
                  )}
                </div>

                {/* Continue to other tools section */}
                {processedPdfLoaded && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Continue to other tools</h3>
                      <p className="text-sm text-gray-600 mt-1">What would you like to do with your PDF next?</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button 
                        onClick={() => {
                          if (processedFile) {
                            sharePDF(processedFile);
                            router.push('/crop-pdf');
                          }
                        }}
                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 group"
                      >
                        <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2v4h12V2"></path>
                            <path d="M6 18v4h12v-4"></path>
                            <path d="M2 6h4v12H2"></path>
                            <path d="M18 6h4v12h-4"></path>
                            <rect x="6" y="6" width="12" height="12" rx="1" strokeDasharray="2 2" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900 group-hover:text-blue-700">Crop PDF</span>
                        <span className="text-xs text-gray-500 mt-1 text-center">Remove margins or resize</span>
                      </button>
                      
                      <Link href="/remove-pages" 
                        onClick={() => {
                          if (processedFile) {
                            sharePDF(processedFile);
                          }
                        }}
                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 group"
                      >
                        <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900 group-hover:text-indigo-700">Remove Pages</span>
                        <span className="text-xs text-gray-500 mt-1 text-center">Delete unwanted pages</span>
                      </Link>
                      
                      <Link href="/meesho-label-cropper" 
                        onClick={() => {
                          if (processedFile) {
                            sharePDF(processedFile);
                          }
                        }}
                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 group"
                      >
                        <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2z" />
                            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                            <rect x="8" y="8" width="8" height="8" rx="1" strokeDasharray="2 2" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900 group-hover:text-purple-700">Meesho Label Cropper</span>
                        <span className="text-xs text-gray-500 mt-1 text-center">Auto-crop shipping labels</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right sidebar - Processed PDF info */}
            <div className="w-full lg:w-64 flex-shrink-0 order-first lg:order-last">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-200 bg-green-50">
                  <h3 className="font-medium text-gray-800">Merged PDF</h3>
                </div>

                <div className="p-4 space-y-4">
                  {/* Success message */}
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-green-800">PDFs Merged Successfully</span>
                    </div>
                    <p className="text-sm text-green-700">Your PDFs have been merged into a single document.</p>
                  </div>

                  {/* Modification information */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Pages:</span>
                      <span className="font-medium text-gray-800">{processedFile?.numPages || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">File Size:</span>
                      <span className="font-medium text-gray-800">
                        {processedFile ? `${Math.round(processedFile.size / 1024)} KB` : '0 KB'}
                      </span>
                    </div>
                  </div>

                  {/* Download button */}
                  <button
                    onClick={downloadProcessedPDF}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download PDF
                  </button>

                  {/* Back to editor button */}
                  <button
                    onClick={closeProcessedPreview}
                    className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                  >
                    Back to Editor
                  </button>
                </div>

                {/* Right Sidebar Ad */}
                <div className="p-4 border-t border-gray-200">
                  <AdSpace type="box" className="rounded overflow-hidden" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PDF Merger Editor Section */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content area */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800">Merge PDFs</h3>
                  <p className="text-sm text-gray-600 mt-1">Reorder your PDFs using the arrow buttons before merging.</p>
                </div>

                {pdfError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
                    {pdfError}
                  </div>
                )}

                {fileDetails.length === 1 && (
                  <div className="mb-6 p-4 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg flex items-start">
                    <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>
                      <span className="font-medium">You need one more PDF!</span> Please upload at least one more PDF file to enable merging.
                    </p>
                  </div>
                )}

                <div className="p-4">
                  <div className="space-y-3">
                    {fileDetails.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="border rounded-lg p-3 bg-gray-50 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-lg p-2 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 truncate max-w-xs">{file.name}</h4>
                            <div className="flex text-xs text-gray-500 mt-1">
                              <span className="mr-3">{Math.round(file.size / 1024)} KB</span>
                              <span>{file.numPages} pages</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex mr-2">
                            <button
                              onClick={() => moveFileUp(index)}
                              disabled={index === 0}
                              className={`p-1 rounded-full hover:bg-gray-200 transition-colors ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <button
                              onClick={() => moveFileDown(index)}
                              disabled={index === fileDetails.length - 1}
                              className={`p-1 rounded-full hover:bg-gray-200 transition-colors ${index === fileDetails.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={() => onRemoveFile(index)}
                            className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add more PDFs button */}
                  <div className="mt-4">
                    <label className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded cursor-pointer transition-colors border border-gray-300">
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add More PDFs
                      </span>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                    </label>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-3">
                  <button
                    onClick={mergePDFs}
                    disabled={isProcessing || fileDetails.length < 2}
                    className={`px-5 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-700 text-white transition-all duration-300 shadow hover:shadow-lg hover:translate-y-[-2px] flex items-center ${(isProcessing || fileDetails.length < 2) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        Merge PDFs
                      </>
                    )}
                  </button>
                  <button
                    onClick={onReset}
                    className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>

              {/* Ad space */}
              <AdSpace type="banner" className="mb-6" />
            </div>

            {/* Right sidebar - Instructions */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-200 bg-blue-50">
                  <h3 className="font-medium text-gray-800">How to Merge PDFs</h3>
                </div>

                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600 font-medium mr-2 flex-shrink-0">1</div>
                      <p className="text-sm text-gray-700">Upload two or more PDF files that you want to merge.</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600 font-medium mr-2 flex-shrink-0">2</div>
                      <p className="text-sm text-gray-700">Use the arrow buttons to reorder the files as needed.</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600 font-medium mr-2 flex-shrink-0">3</div>
                      <p className="text-sm text-gray-700">Click "Merge PDFs" to combine them into a single document.</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600 font-medium mr-2 flex-shrink-0">4</div>
                      <p className="text-sm text-gray-700">Preview the merged PDF and download it to your device.</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="flex items-center mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium text-yellow-800">Note</span>
                    </div>
                    <p className="text-sm text-yellow-700">All processing happens in your browser. Your files are not uploaded to any server.</p>
                  </div>
                </div>

                {/* Right Sidebar Ad */}
                <div className="p-4 border-t border-gray-200">
                  <AdSpace type="box" className="rounded overflow-hidden" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
