'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import PDFUploader from '../components/pdf-editor/PDFUploader';
import AdSpace from '../components/ads/AdSpace';
import Footer from '../components/common/Footer';
import Link from 'next/link';
import { useSharedPDF } from '../context/PDFContext';

// Dynamically import PDFEditor to avoid SSR issues
const PDFEditor = dynamic(
  () => import('../components/pdf-editor/PDFEditor'),
  { ssr: false }
);

export default function CropPDFPage() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { sharedPDF, clearSharedPDF } = useSharedPDF();

  // Check for shared PDF data on component mount
  useEffect(() => {
    if (sharedPDF) {
      console.log('Received shared PDF:', sharedPDF);
      setPdfFile(sharedPDF);
      setPdfName(sharedPDF.name || "shared-document.pdf");
      
      // Clear the shared PDF to avoid loading it again if user navigates back
      clearSharedPDF();
    }
  }, [sharedPDF, clearSharedPDF]);

  const handleFileSelected = (file) => {
    // If there's an existing file, revoke its URL to prevent memory leaks
    if (pdfFile && pdfFile.url) {
      URL.revokeObjectURL(pdfFile.url);
    }
    setPdfFile(file);
  };

  const handleReset = () => {
    // Revoke the URL to prevent memory leaks
    if (pdfFile && pdfFile.url) {
      URL.revokeObjectURL(pdfFile.url);
    }
    setPdfFile(null);
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
            <h1 className="text-2xl font-bold text-black tracking-tight">PDF Editor</h1>
          </div>
          <nav className="hidden md:flex items-center">
            <div className="relative mx-2">
              <Link href="/" className="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 transition-colors relative group">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
            <div className="relative mx-2">
              <Link href="/crop-pdf" className="px-4 py-2 font-medium text-blue-600 relative group">
                Crop PDF
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-all duration-300"></span>
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
              <Link href="/flipkart-label-cropper" className="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 transition-colors relative group">
                Flipkart Label Cropper
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
          </nav>
          {/* Button removed as requested */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-b-lg mt-1 mx-4 overflow-hidden transition-all duration-300 ease-in-out">
            <div className="flex flex-col py-2">
              <Link
                href="/"
                className="px-6 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-blue-600 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/crop-pdf"
                className="px-6 py-3 text-blue-600 font-medium border-l-4 border-blue-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Crop PDF
              </Link>
              <Link
                href="/remove-pages"
                className="px-6 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-blue-600 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Remove Pages
              </Link>
              <Link
                href="/merge-pdfs"
                className="px-6 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-blue-600 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Merge PDFs
              </Link>
              <Link
                href="/meesho-label-cropper"
                className="px-6 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-blue-600 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Meesho Label Cropper
              </Link>
              <Link
                href="/flipkart-label-cropper"
                className="px-6 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-blue-600 transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Flipkart Label Cropper
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Title section first */}
        <div className="text-center mb-10 px-4">
          <div className="relative inline-block">
            <span className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-xl rounded-full"></span>
            <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-4 tracking-tight">
              Crop PDF Tool
            </h1>
          </div>
          <div className="max-w-2xl mx-auto relative">
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Easily remove unwanted margins and white space from your PDF documents.
              <span className="hidden sm:inline"> Our tool gives you precise control over your document's appearance.</span>
            </p>
            <div className="flex justify-center gap-3 mb-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
                Free
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
                </svg>
                Secure
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                </svg>
                Fast
              </span>
            </div>
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full mt-2 mb-1 transform transition-all duration-300 hover:w-24 hover:scale-110"></div>
        </div>

        {/* Enhanced Ad Space before PDF upload section */}
        <div className="mb-10">
          {/* Main banner ad */}
          <AdSpace type="banner" className="mx-auto mb-6" />
        </div>

        {!pdfFile ? (
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            {/* Left sidebar ad - visible only on large screens */}
            <div className="hidden lg:block lg:w-[300px] sticky top-24 self-start">
              <AdSpace type="sidebar" className="mb-4" />
              <AdSpace type="box" className="mt-4" />
            </div>

            {/* Center content */}
            <div className="flex-1 min-w-0">
              <PDFUploader onFileSelected={handleFileSelected} pageType="crop" />
            </div>

            {/* Right sidebar ad - visible only on large screens */}
            <div className="hidden lg:block lg:w-[300px] sticky top-24 self-start">
              <AdSpace type="sidebar" className="mb-4" />
              <AdSpace type="box" className="mt-4" />
            </div>
          </div>
        ) : (
          <PDFEditor file={pdfFile} onReset={handleReset} />
        )}
      </main>

      <Footer />
    </div>
  );
}
