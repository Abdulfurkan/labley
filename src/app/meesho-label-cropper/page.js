'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import AdSpace from '../components/ads/AdSpace';
import Footer from '../components/common/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { transferPDFFile } from '../lib/utils';
import { useSharedPDF } from '../context/PDFContext';
import PDFUploader from '../components/pdf-editor/PDFUploader';
import MeeshoProcessAnimation from '../components/meesho/MeeshoProcessAnimation';

// Set the worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Dynamically import PDFEditor to avoid SSR issues
const PDFEditor = dynamic(
  () => import('../components/pdf-editor/PDFEditor'),
  { ssr: false }
);

export default function MeeshoLabelCropperPage() {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [pdfName, setPdfName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [sortByCourier, setSortByCourier] = useState(false);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [courierOrder, setCourierOrder] = useState([
    "Delhivery",
    "Ecom Express",
    "Shadowfax",
    "Xpress Bees",
    "Valmo",
    "Other"
  ]);
  const [multiQuantityOrder, setMultiQuantityOrder] = useState(false);
  const { sharedPDF, clearSharedPDF } = useSharedPDF();

  // Check for shared PDF data on component mount
  useEffect(() => {
    if (sharedPDF) {
      console.log('Received shared PDF in Meesho Label Cropper:', sharedPDF);
      setPdfFiles([sharedPDF]);
      setPdfName(sharedPDF.name || "shared-document.pdf");

      // Clear the shared PDF to avoid loading it again if user navigates back
      clearSharedPDF();
    }
  }, [sharedPDF, clearSharedPDF]);

  const handleFileSelected = (file) => {
    console.log("File selected:", file);
    console.log("File properties:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.file ? file.file.lastModified : 'N/A',
      hasArrayBuffer: file.file && typeof file.file.arrayBuffer === 'function'
    });

    // Add the new file to the array
    setPdfFiles(prevFiles => [...prevFiles, file]);
    setShowConfirmation(true);
  };

  const handleRemoveFile = (index) => {
    setPdfFiles(prevFiles => {
      const newFiles = [...prevFiles];
      // Revoke the URL to prevent memory leaks
      if (newFiles[index].url) {
        URL.revokeObjectURL(newFiles[index].url);
      }
      newFiles.splice(index, 1);
      if (newFiles.length === 0) {
        setShowConfirmation(false);
      }
      return newFiles;
    });
  };

  const processMeeshoLabel = async (file) => {
    setIsProcessing(true);
    setShowConfirmation(false);
    setProcessingStatus(`Processing ${file.name}...`);

    try {
      console.log("Starting Meesho label processing with file:", file.name);

      // Load the PDF as an ArrayBuffer
      let arrayBuffer;

      // Handle both File objects (which have arrayBuffer method) and Blob objects (from shared PDFs)
      if (typeof file.file === 'object' && file.file instanceof Blob) {
        // This is a shared PDF from another page (has file property that is a Blob)
        console.log("Processing shared PDF Blob");
        arrayBuffer = await file.file.arrayBuffer();
      } else if (file.arrayBuffer) {
        // This is a direct File upload (has arrayBuffer method)
        console.log("Processing direct File upload");
        arrayBuffer = await file.arrayBuffer();
      } else {
        // Fallback for other formats - try to use the URL
        console.log("Using fallback method for PDF processing");
        const response = await fetch(file.url);
        arrayBuffer = await response.arrayBuffer();
      }

      console.log("File loaded as ArrayBuffer, size:", arrayBuffer.byteLength);

      // Load the PDF document with pdf-lib
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      console.log("PDF loaded successfully, page count:", pageCount);

      if (pageCount === 0) {
        throw new Error("The PDF file doesn't contain any pages.");
      }

      // Load the PDF with pdf.js for text extraction
      const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // Create a new PDF document
      const newPdfDoc = await PDFDocument.create();

      // Array to store processed pages with their metadata
      const processedPages = [];

      // Process each page
      for (let i = 0; i < pageCount; i++) {
        try {
          setProcessingStatus(`Processing ${file.name} - page ${i + 1} of ${pageCount}`);
          console.log(`Processing page ${i + 1} of ${pageCount}`);

          // Copy the page from the original document
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);

          // Get original dimensions
          const originalWidth = copiedPage.getWidth();
          const originalHeight = copiedPage.getHeight();
          console.log(`Page dimensions: ${originalWidth} x ${originalHeight}`);

          // Account for 8pt margins on left, right, and top
          const margin = 8; // 8pt margin
          const contentWidth = originalWidth - 2 * margin; // Remove left and right margins
          const contentStartX = margin; // Start from the left margin (to exclude it)
          const contentStartY = margin; // Start from the top margin (to exclude it)

          // Extract text using pdf.js
          const page = await pdfJsDoc.getPage(i + 1);
          const textContent = await page.getTextContent();
          let taxInvoiceY = null;
          let productDetailsY = null;

          // Variables for courier detection
          let detectedCourier = "Other";

          // First pass: Check for multi-quantity orders and find Product Details section
          for (const item of textContent.items) {
            const text = item.str.trim();

            // Check for Product Details section
            if (text === "Product Details") {
              productDetailsY = item.transform[5];
              console.log(`Found "Product Details" at position ${productDetailsY} on page ${i + 1}`);
            }

            // Check for quantity indicator
            if (text === "Qty" && productDetailsY !== null) {
              // Look for quantity value in nearby text items
              for (const qtyItem of textContent.items) {
                // Only check items that are in the same horizontal area as the Qty label
                const qtyText = qtyItem.str.trim();
                const isNearQty = Math.abs(qtyItem.transform[5] - item.transform[5]) < 10;

                if (isNearQty && /^\d+$/.test(qtyText) && parseInt(qtyText) > 1) {
                  setMultiQuantityOrder(true);
                  console.log(`Detected multi-quantity order: ${qtyText} items`);
                  break;
                }
              }
            }
          }

          // Find the Y-coordinate of "TAX INVOICE" and detect courier
          let taxInvoiceItems = [];
          for (const item of textContent.items) {
            const text = item.str.trim();

            // Check for TAX INVOICE
            if (text.includes("TAX INVOICE")) {
              taxInvoiceItems.push({
                y: item.transform[5],
                text: text
              });
              console.log(`Found "TAX INVOICE" at position ${item.transform[5]} on page ${i + 1}`);
            }

            // Detect courier service if sorting by courier is enabled
            if (sortByCourier) {
              // Check for each courier in the text
              if (text.includes("Delhivery") || text.match(/DELHIVERY/i)) {
                detectedCourier = "Delhivery";
              } else if (text.includes("Ecom Express") || text.match(/ECOM\s*EXPRESS/i)) {
                detectedCourier = "Ecom Express";
              } else if (text.includes("Shadowfax") || text.match(/SHADOWFAX/i)) {
                detectedCourier = "Shadowfax";
              } else if (text.includes("Xpress Bees") || text.match(/XPRESS\s*BEES/i) || text.match(/XPRESSBEES/i)) {
                detectedCourier = "Xpress Bees";
              } else if (text.includes("Valmo") || text.match(/VALMO/i)) {
                detectedCourier = "Valmo";
              }
            }
          }

          // Sort TAX INVOICE items by Y position (highest Y value is the main header)
          taxInvoiceItems.sort((a, b) => b.y - a.y);

          // If we found multiple TAX INVOICE instances and it's a multi-quantity order,
          // use the first one (which should be the main header)
          if (taxInvoiceItems.length > 0) {
            taxInvoiceY = taxInvoiceItems[0].y;
            console.log(`Selected "TAX INVOICE" at position ${taxInvoiceY} on page ${i + 1}`);
          }

          let contentHeight;
          if (taxInvoiceY !== null) {
            // Convert pdf.js Y-coordinate (bottom-up) to pdf-lib Y-coordinate (top-down)
            const pageHeight = page.view[3]; // Page height in pdf.js
            const taxInvoiceYFromTop = pageHeight - taxInvoiceY;

            // For multi-quantity orders, add a small buffer to ensure we don't cut off important content
            const buffer = multiQuantityOrder ? 5 : 0;
            contentHeight = taxInvoiceYFromTop - margin - buffer; // Stop just above "TAX INVOICE"

            console.log(`Page height: ${pageHeight}, TAX INVOICE from top: ${taxInvoiceYFromTop}`);
            console.log(`Multi-quantity order: ${multiQuantityOrder}, using buffer: ${buffer}pt`);
          } else {
            // Fallback to percentage-based cropping if text not found
            console.warn(`"TAX INVOICE" not found on page ${i + 1}, using fallback percentage`);
            const contentHeightPercentage = 0.58;
            contentHeight = originalHeight * contentHeightPercentage;
          }

          // Ensure the content height doesn't exceed the page height
          contentHeight = Math.min(contentHeight, originalHeight - margin);

          // Define the crop box
          const cropBox = {
            left: contentStartX,
            bottom: originalHeight - contentHeight - margin,
            right: contentStartX + contentWidth,
            top: originalHeight - margin,
          };

          // Log the crop box for debugging
          console.log(`Crop box for page ${i + 1}:`, cropBox);
          console.log(`Cropped height: ${contentHeight}pt (${(contentHeight / originalHeight * 100).toFixed(1)}% of original height)`);

          // Apply the crop
          copiedPage.setMediaBox(
            cropBox.left,
            cropBox.bottom,
            contentWidth,
            contentHeight
          );

          // Store the page with metadata for sorting
          processedPages.push({
            page: copiedPage,
            courier: detectedCourier,
            originalIndex: i
          });

          console.log(`Processed page ${i + 1}, courier: ${detectedCourier}`);
        } catch (err) {
          console.error(`Error processing page ${i + 1}:`, err);
          console.error("Full error:", err.stack);
          continue; // Skip to next page on error
        }
      }

      // Sort pages based on user preferences
      if (sortByCourier) {
        console.log("Sorting pages based on courier service");

        processedPages.sort((a, b) => {
          // Sort by courier according to the courier order
          const courierIndexA = courierOrder.indexOf(a.courier);
          const courierIndexB = courierOrder.indexOf(b.courier);

          if (courierIndexA !== courierIndexB) {
            return courierIndexA - courierIndexB;
          }

          // Fallback to original order if couriers are the same
          return a.originalIndex - b.originalIndex;
        });

        // Log the sorting results
        console.log("Sorted pages order:", processedPages.map(p =>
          `Page ${p.originalIndex + 1}: Courier=${p.courier}`).join('\n'));
      }

      // Add sorted pages to the new document
      for (const processedPage of processedPages) {
        newPdfDoc.addPage(processedPage.page);
      }

      if (newPdfDoc.getPageCount() === 0) {
        throw new Error("Failed to process any pages. Please try another file.");
      }

      // Save the new PDF
      const newPdfBytes = await newPdfDoc.save();
      console.log("New PDF created, size:", newPdfBytes.byteLength);

      // Create a blob and URL
      const newPdfBlob = new Blob([newPdfBytes], { type: "application/pdf" });
      const newPdfUrl = URL.createObjectURL(newPdfBlob);

      // Create processed file object
      const processedFile = {
        url: newPdfUrl,
        name: file.name.replace(".pdf", "_cropped.pdf"),
        size: newPdfBlob.size,
        sortedByCourier: sortByCourier,
        originalName: file.name
      };

      // Add to processed files array
      setProcessedFiles(prevFiles => [...prevFiles, processedFile]);

      console.log("Processing complete, ready for download");
      return processedFile;
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert(`Error processing ${file.name}: ${error.message || "An error occurred while processing the PDF."}`);
      return null;
    }
  };

  const processAllFiles = async () => {
    setIsProcessing(true);
    setShowConfirmation(false);
    setProcessedFiles([]);

    try {
      for (let i = 0; i < pdfFiles.length; i++) {
        setCurrentProcessingIndex(i);
        await processMeeshoLabel(pdfFiles[i]);
      }
      setProcessingStatus("All files processed successfully!");
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    // Revoke URLs to prevent memory leaks
    pdfFiles.forEach(file => {
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    });

    processedFiles.forEach(file => {
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    });

    setPdfFiles([]);
    setProcessedFiles([]);
    setShowConfirmation(false);
    setSortByCourier(false);
    setMultiQuantityOrder(false);
    setIsProcessing(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white backdrop-filter backdrop-blur-lg bg-opacity-70 border-b border-gray-100 sticky top-0 z-50 py-4">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center group">
            <div className="relative mr-2">
              <Image
                src="/logo-pdf.png"
                alt="PDF Editor Logo"
                width={60}
                height={60}
                className="relative z-10"
              />
            </div>
            <Link href="/" className="text-2xl font-bold text-black tracking-tight">
              PDF Editor
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition duration-300">
              Home
            </Link>
            <Link href="/crop-pdf" className="text-gray-600 hover:text-blue-600 font-medium transition duration-300">
              Crop PDF
            </Link>
            <Link href="/remove-pages" className="text-gray-600 hover:text-blue-600 font-medium transition duration-300">
              Remove Pages
            </Link>
            <Link href="/merge-pdfs" className="text-gray-600 hover:text-blue-600 font-medium transition duration-300">
              Merge PDFs
            </Link>
            <Link href="/meesho-label-cropper" className="text-blue-600 font-medium transition duration-300 border-b-2 border-blue-600">
              Meesho Label Cropper
            </Link>
            <Link href="/flipkart-label-cropper" className="text-gray-600 hover:text-blue-600 font-medium transition duration-300">
              Flipkart Label Cropper
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Home
              </Link>
              <Link href="/crop-pdf" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Crop PDF
              </Link>
              <Link href="/remove-pages" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Remove Pages
              </Link>
              <Link href="/merge-pdfs" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Merge PDFs
              </Link>
              <Link href="/meesho-label-cropper" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 bg-gray-50">
                Meesho Label Cropper
              </Link>
              <Link href="/flipkart-label-cropper" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                Flipkart Label Cropper
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
              Meesho Label Cropper
            </h1>
          </div>

          {/* Banner Ad - Before file upload section */}
          <AdSpace type="banner" className="mb-8" />

          <div className="flex flex-col lg:flex-row justify-between gap-4">
            {/* Left sidebar ad - visible only on large screens */}
            <div className="hidden lg:block lg:w-[300px] sticky top-24 self-start">
              <AdSpace type="sidebar" className="mb-4" />
              <AdSpace type="box" className="mt-4" />
            </div>

            {/* Center content */}
            <div className="flex-1 min-w-0">
              {!pdfFiles.length ? (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8 mt-6">
                  <PDFUploader onFileSelected={handleFileSelected} pageType="crop" isMeeshoPage={true} />
                </div>
              ) : !isProcessing && !processedFiles.length ? (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Confirm Processing</h2>

                  <div className="mb-6">
                    <div className="flex items-center mb-4 text-green-600">
                      <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-700">Files uploaded: {pdfFiles.length}</p>
                    </div>

                    <div className="w-full p-4 border border-gray-200 rounded-lg mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">File List:</h3>
                      <ul className="divide-y divide-gray-200">
                        {pdfFiles.map((file, index) => (
                          <li key={index} className="py-3 flex justify-between items-center">
                            <div className="flex items-center">
                              <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium text-gray-700">{file.name}</span>
                              <span className="ml-2 text-sm text-gray-500">({formatFileSize(file.size)})</span>
                            </div>
                            <button
                              onClick={() => handleRemoveFile(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              aria-label="Remove file"
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-6">
                      <label className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded cursor-pointer transition-colors inline-flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add More Files
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const files = Array.from(e.target.files);
                              files.forEach(file => {
                                handleFileSelected({
                                  file: file,
                                  url: URL.createObjectURL(file),
                                  name: file.name,
                                  size: file.size,
                                  type: file.type
                                });
                              });
                              // Clear the input value to allow selecting the same file again
                              e.target.value = null;
                            }
                          }}
                          multiple
                        />
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="sortByCourier"
                          checked={sortByCourier}
                          onChange={(e) => setSortByCourier(e.target.checked)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="sortByCourier" className="ml-2 text-sm text-gray-700">
                          Sort by Courier Service
                        </label>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleReset}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Reset
                        </button>

                        <button
                          onClick={processAllFiles}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {pdfFiles.length > 1 ? `Process ${pdfFiles.length} Files` : "Process PDF"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isProcessing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-lg text-gray-700">{processingStatus}</p>
                  <p className="text-sm text-gray-500 mt-2">Processing file {currentProcessingIndex + 1} of {pdfFiles.length}</p>
                </div>
              ) : processedFiles.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Processed Files</h2>

                  <div className="mb-6">
                    <div className="flex items-center mb-4 text-green-600">
                      <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-gray-700">Successfully processed {processedFiles.length} files</p>
                    </div>

                    <div className="w-full p-4 border border-gray-200 rounded-lg mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">Download Files:</h3>
                      <ul className="divide-y divide-gray-200">
                        {processedFiles.map((file, index) => (
                          <li key={index} className="py-3 flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center">
                                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium text-gray-700">{file.name}</span>
                                <span className="ml-2 text-sm text-gray-500">({formatFileSize(file.size)})</span>
                              </div>
                              {file.sortedByCourier && (
                                <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
                                  Sorted by Courier
                                </span>
                              )}
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() => downloadFile(file)}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm flex items-center"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Download
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Process More Files
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-700">File uploaded: <span className="font-medium">{pdfFiles[0].name}</span> ({formatFileSize(pdfFiles[0].size)})</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sortByCourier"
                        checked={sortByCourier}
                        onChange={(e) => setSortByCourier(e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="sortByCourier" className="ml-2 text-sm text-gray-700">
                        Sort by Courier Service
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Reset
                      </button>

                      <button
                        onClick={() => setShowConfirmation(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Process PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right sidebar ad - visible only on large screens */}
            <div className="hidden lg:block lg:w-[300px] sticky top-24 self-start">
              <AdSpace type="sidebar" className="mb-4" />
              <AdSpace type="box" className="mt-4" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8 mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">How Meesho Label Cropper Can Help You</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              The <span className="font-semibold">Meesho Shipping Label Crop Tool</span> is an essential gamechanger tool for Meesho sellers, offering a simple and effective way to manage shipping labels. Here's what you can expect:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-blue-500 mb-4 flex justify-center">
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 01-2-2H6a2 2 0 01-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Unlimited Use</h3>
              <p className="text-gray-600">
                Process as many Meesho shipping labels as you need without any limitations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-blue-500 mb-4 flex justify-center">
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2V7h-4v2h2z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Speedy Process</h3>
              <p className="text-gray-600">
                Our tool processes your shipping labels quickly, saving you valuable time.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-blue-500 mb-4 flex justify-center">
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Accessible Anywhere</h3>
              <p className="text-gray-600">
                Access our tool online through any browser, on any device, at any time, from any location.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-blue-500 mb-4 flex justify-center">
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 01-2-2H6a2 2 0 01-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Batch Cropping</h3>
              <p className="text-gray-600">
                Process multiple shipping labels at once, saving time on bulk orders.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-blue-500 mb-4 flex justify-center">
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Easy to Use</h3>
              <p className="text-gray-600">
                Our tool is designed for everyone, regardless of technical expertise. Cropping PDFs is simple and accessible for all users.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-blue-500 mb-4 flex justify-center">
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 01-2-2H6a2 2 0 01-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Security</h3>
              <p className="text-gray-600">
                Your files are processed securely and never stored on our servers after processing.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 h-[350px]">
              <MeeshoProcessAnimation />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Do You Need Label Cropping Tool For Meesho?</h2>
              <p className="text-gray-700 mb-4">
                If you're looking for a label cropping tool for Meesho, then <span className="text-pink-500 font-semibold">PDF Editor's</span> Meesho
                Label Cropper is the best choice for you.
              </p>
              <p className="text-gray-700 mb-4">
                Our goal is to reduce the manual cropping process and help you save time.
                Our tool helps you in —
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Automatically detecting and cropping shipping labels</li>
                <li>Sorting labels by courier service for easier processing</li>
                <li>Preserving all important shipping information</li>
                <li>Batch processing multiple labels at once</li>
                <li>Optimizing the output for clean printing</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="w-full mt-8 mb-8">
            <AdSpace type="banner" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
