'use client';

import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdSpace from '../components/ads/AdSpace';
import Footer from '../components/common/Footer';
import FlipkartProcessAnimation from '../components/flipkart/FlipkartProcessAnimation';
import Image from 'next/image';

// Set up pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function FlipkartLabelCropperPage() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFile, setProcessedFile] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setProcessedFile(null);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid PDF file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setProcessedFile(null);
      setError(null);
    } else {
      setError('Please drop a valid PDF file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
  };

  const resetForm = () => {
    setFile(null);
    setProcessedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFlipkartLabel = async (file) => {
    try {
      setIsProcessing(true);
      setProcessingStatus('Loading PDF...');
      setError(null);

      // Load the PDF using pdf-lib
      const fileArrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileArrayBuffer);
      const pages = pdfDoc.getPages();

      // Create a new PDF document for the processed pages
      const newPdfDoc = await PDFDocument.create();

      // Load the PDF using pdf.js for text extraction
      const pdfJsDoc = await pdfjs.getDocument({ data: new Uint8Array(fileArrayBuffer) }).promise;

      setProcessingStatus(`Processing ${pages.length} pages...`);

      // Process each page
      const processedPages = [];
      for (let i = 0; i < pages.length; i++) {
        try {
          setProcessingStatus(`Processing page ${i + 1} of ${pages.length}...`);

          const page = pages[i];
          const { width: originalWidth, height: originalHeight } = page.getSize();

          // Copy the page to the new document
          const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);

          // Extract text using pdf.js
          const pdfJsPage = await pdfJsDoc.getPage(i + 1);
          const textContent = await pdfJsPage.getTextContent();
          let notForResaleY = null;
          let stdX = null;
          let stdY = null;
          let eX = null;
          let eY = null;

          // Find the Y-coordinate of "Not for resale" and detect courier
          for (const item of textContent.items) {
            const text = item.str.trim();

            // Check for "Not for resale" text
            if (text.includes("Not for resale")) {
              notForResaleY = item.transform[5]; // Y-coordinate in pdf.js coordinate system (bottom-up)
              console.log(`Found "Not for resale" at position ${notForResaleY} on page ${i + 1}`);
            }

            // Check for "STD" text in top-left corner
            if (text === "STD") {
              stdX = item.transform[4]; // X-coordinate
              stdY = item.transform[5]; // Y-coordinate
              console.log(`Found "STD" at position (${stdX}, ${stdY}) on page ${i + 1}`);
            }

            // Check for "E" text in top-right corner
            if (text === "E" && item.transform[5] > originalHeight * 0.8) { // Check if it's near the top
              eX = item.transform[4]; // X-coordinate
              eY = item.transform[5]; // Y-coordinate
              console.log(`Found "E" at position (${eX}, ${eY}) on page ${i + 1}`);
            }
          }

          // Use exact margin values for Flipkart labels
          const leftMargin = 188; // 142pt left margin
          const rightMargin = 188; // 142pt right margin
          const topMargin = 27; // 21pt top margin

          let contentHeight;
          if (notForResaleY !== null) {
            // Convert pdf.js Y-coordinate (bottom-up) to pdf-lib Y-coordinate (top-down)
            const pageHeight = pdfJsPage.view[3]; // Page height in pdf.js
            const notForResaleYFromTop = pageHeight - notForResaleY;
            // Add a small buffer below "Not for resale" to ensure it's included
            contentHeight = notForResaleYFromTop + 5; // Small buffer to include "Not for resale" text
            console.log(`Page height: ${pageHeight}, Not for resale from top: ${notForResaleYFromTop}`);
          } else {
            // Fallback to percentage-based cropping if text not found
            console.warn(`"Not for resale" not found on page ${i + 1}, using fallback percentage`);
            const contentHeightPercentage = 0.65; // Approximate percentage for Flipkart labels
            contentHeight = originalHeight * contentHeightPercentage;
          }

          // Ensure the content height doesn't exceed the page height
          contentHeight = Math.min(contentHeight, originalHeight);

          // Calculate the effective width after applying margins
          const effectiveWidth = originalWidth - leftMargin - rightMargin;
          // Calculate the effective height after applying top margin and content height
          const effectiveHeight = contentHeight - topMargin;

          // Define the crop box using the exact margin values
          const cropBox = {
            left: leftMargin,
            bottom: originalHeight - contentHeight,
            right: originalWidth - rightMargin,
            top: originalHeight - topMargin,
          };

          // Log the crop box for debugging
          console.log(`Crop box for page ${i + 1}:`, cropBox);
          console.log(`Effective dimensions: ${effectiveWidth}pt × ${effectiveHeight}pt`);

          // Apply the crop using the exact margin values
          copiedPage.setMediaBox(
            cropBox.left,
            cropBox.bottom,
            cropBox.right - cropBox.left,
            cropBox.top - cropBox.bottom
          );

          // Store the page with metadata for sorting
          newPdfDoc.addPage(copiedPage);
          processedPages.push({
            page: copiedPage,
            originalIndex: i
          });

          console.log(`Processed page ${i + 1}`);
        } catch (err) {
          console.error(`Error processing page ${i + 1}:`, err);
          setError(`Error processing page ${i + 1}: ${err.message}`);
        }
      }

      // Save the processed PDF
      const processedPdfBytes = await newPdfDoc.save();
      const processedPdfBlob = new Blob([processedPdfBytes], { type: 'application/pdf' });
      const processedPdfUrl = URL.createObjectURL(processedPdfBlob);

      setProcessedFile({
        url: processedPdfUrl,
        name: file.name.replace('.pdf', '_cropped.pdf')
      });

      setProcessingStatus('Processing complete!');
      return processedPdfUrl;
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError(`Error processing PDF: ${error.message}`);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcess = async () => {
    if (file) {
      await processFlipkartLabel(file);
    } else {
      setError('Please select a PDF file first');
    }
  };

  const handleDownload = () => {
    if (processedFile) {
      const a = document.createElement('a');
      a.href = processedFile.url;
      a.download = processedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
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
            <Link href="/">
              <h1 className="text-2xl font-bold text-black tracking-tight">PDF Editor</h1>
            </Link>
          </div>
          <nav className="hidden md:flex items-center">
            <div className="relative mx-2">
              <Link href="/" className="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 transition-colors relative group">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
            <div className="relative mx-2">
              <Link href="/crop-pdf" className="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 transition-colors relative group">
                Crop PDF
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
            <div className="relative mx-2">
              <Link href="/remove-pages" className="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 transition-colors relative group">
                Remove Pages
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
            <div className="relative mx-2">
              <Link href="/merge-pdfs" className="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 transition-colors relative group">
                Merge PDFs
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
            <div className="relative mx-2">
              <Link href="/meesho-label-cropper" className="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 transition-colors relative group">
                Meesho Label Cropper
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
            <div className="relative mx-2">
              <Link href="/flipkart-label-cropper" className="px-4 py-2 font-medium text-blue-600 relative group">
                Flipkart Label Cropper
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-all duration-300"></span>
              </Link>
            </div>
          </nav>
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-b-lg mt-2 py-2 px-4 space-y-1 absolute w-full z-50">
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
            <Link href="/meesho-label-cropper" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
              Meesho Label Cropper
            </Link>
            <Link href="/flipkart-label-cropper" className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 bg-gray-50">
              Flipkart Label Cropper
            </Link>
          </div>
        )}
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Flipkart Label Cropper</h1>
          <p className="text-gray-600 mt-2">Automatically crop Flipkart shipping labels to the perfect size</p>
        </div>

        {/* Banner Ad - Before file upload section */}
        <AdSpace type="banner" className="mb-8" />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-6">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />

              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>

              <p className="mt-2 text-sm text-gray-600">
                {file ? file.name : 'Drag and drop your PDF file here, or click to browse'}
              </p>

              {file && (
                <p className="mt-1 text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isProcessing || !file}
              >
                Reset
              </button>

              <button
                onClick={handleProcess}
                disabled={isProcessing || !file}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isProcessing ? 'Processing...' : 'Process PDF'}
              </button>
            </div>
          </div>

          {isProcessing && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full w-full animate-pulse"></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{processingStatus}</p>
            </div>
          )}

          {processedFile && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Processing Complete!</h3>
                  <p className="text-sm text-gray-600">Your Flipkart shipping labels have been cropped successfully.</p>
                </div>

                {/* Banner Ad - After processing is complete */}
                <AdSpace type="large" className="my-4 w-full" />

                <button
                  onClick={handleDownload}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Download Cropped PDF
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Upload</h3>
              <p className="text-gray-600">Upload your Flipkart shipping label PDF file</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">2. Process</h3>
              <p className="text-gray-600">Our tool automatically crops the shipping label portion</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Download</h3>
              <p className="text-gray-600">Download your cropped shipping labels ready for printing</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 h-[350px]">
              <FlipkartProcessAnimation />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Do You Need Label Cropping Tool For Flipkart?</h2>
              <p className="text-gray-700 mb-4">
                If you're looking for a label cropping tool for Flipkart, then <span className="text-blue-500 font-semibold">PDF Editor's</span> Flipkart
                Label Cropper is the best choice for you.
              </p>
              <p className="text-gray-700 mb-4">
                Our goal is to reduce the manual cropping process and help you save time.
                Our tool helps you in —
              </p>
              <ul className="list-disc pl-5 text-gray-700 mb-4">
                <li className="mb-2">Batch Label Cropping for multiple labels</li>
                <li className="mb-2">Automatic measurements of width and length</li>
                <li className="mb-2">Perfect cropping of Flipkart shipping labels</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="py-12 px-4 bg-gray-50 rounded-lg shadow-sm mb-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">How Flipkart Label Cropper Can Help You</h2>

          <p className="text-center mb-10 max-w-3xl mx-auto">
            The <span className="font-semibold">Flipkart Shipping Label Crop Tool</span> is an essential gamechanger tool for Flipkart sellers,
            offering a simple and effective way to manage shipping labels. Here's what you can expect:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-start hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
              <div className="bg-blue-500 p-3 rounded-lg mr-4 flex-shrink-0">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Instant Label Cropping</h3>
                <p className="text-gray-600">Automatically crop your Flipkart labels in seconds with precision.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-start hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
              <div className="bg-blue-500 p-3 rounded-lg mr-4 flex-shrink-0">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Organized by SKU</h3>
                <p className="text-gray-600">All your labels are automatically sorted by SKU for hassle-free order preparation.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-start hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
              <div className="bg-blue-500 p-3 rounded-lg mr-4 flex-shrink-0">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Automatic Size Adjustment</h3>
                <p className="text-gray-600">The tool adjusts the label size to match its length, ensuring accuracy.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-start hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out">
              <div className="bg-blue-500 p-3 rounded-lg mr-4 flex-shrink-0">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Optional SKU Display</h3>
                <p className="text-gray-600">You can choose to add SKU details to the labels for better product identification.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <AdSpace />
        </div>
      </main>

      <Footer />
    </div>
  );
}
