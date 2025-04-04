'use client';

import { useState, useRef, useEffect } from 'react';

export default function PDFUploader({ onFileSelected, pageType = "default", isMeeshoPage = false }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return false;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError("File size exceeds 50MB limit");
      return false;
    }

    setError("");
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);

      if (isMeeshoPage || pageType === "merge") {
        // For Meesho page or merge page, handle multiple files
        files.forEach(file => {
          if (validateFile(file)) {
            onFileSelected({
              file: file,
              url: URL.createObjectURL(file),
              name: file.name,
              size: file.size,
              type: file.type
            });
          }
        });
      } else {
        // For other pages, handle single file
        const file = e.dataTransfer.files[0];
        if (validateFile(file)) {
          onFileSelected({
            file: file,
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            type: file.type
          });
        }
      }
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (isMeeshoPage || pageType === "merge") {
        // For Meesho page or merge page, handle multiple files
        Array.from(files).forEach(file => {
          if (validateFile(file)) {
            onFileSelected({
              file: file,
              url: URL.createObjectURL(file),
              name: file.name,
              size: file.size,
              type: file.type
            });
          }
        });
      } else {
        // For other pages, handle single file
        const file = files[0];
        if (validateFile(file)) {
          onFileSelected({
            file: file,
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            type: file.type
          });
        }
      }

      // Clear the input value to allow selecting the same file again
      e.target.value = null;
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div
        className={`border-2 ${dragActive ? "border-blue-500 bg-blue-50" : "border-dashed border-gray-300"
          } rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>

        <p className="mt-2 text-sm text-gray-600">
          {isMeeshoPage || pageType === "merge"
            ? "Drag and drop your PDF files here, or click to browse"
            : "Drag and drop your PDF file here, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-gray-500">PDF (max 50MB)</p>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept="application/pdf"
          multiple={isMeeshoPage || pageType === "merge"}
        />
      </div>

      {/* Added design elements below the upload div */}
      <div className="mt-8 space-y-6">
        {/* Feature highlights section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 shadow-sm">
          <h3 className="text-center text-xl font-semibold text-gray-800 mb-6">
            {isMeeshoPage && "Why Use Our Meesho Label Cropper?"}
            {!isMeeshoPage && pageType === 'crop' && "Why Use Our PDF Cropping Tool?"}
            {!isMeeshoPage && pageType === 'remove' && "Why Use Our Page Removal Tool?"}
            {!isMeeshoPage && pageType === 'merge' && "Why Use Our PDF Merger Tool?"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 transform transition-transform duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMeeshoPage && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />}
                    {!isMeeshoPage && pageType === 'crop' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
                    {!isMeeshoPage && pageType === 'remove' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />}
                    {!isMeeshoPage && pageType === 'merge' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />}
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {isMeeshoPage && "Automatic Label Detection"}
                    {!isMeeshoPage && pageType === 'crop' && "Precise Margin Control"}
                    {!isMeeshoPage && pageType === 'remove' && "Selective Page Removal"}
                    {!isMeeshoPage && pageType === 'merge' && "Combine Multiple PDFs"}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {isMeeshoPage && "Upload your PDF to automatically detect and crop Meesho shipping labels to the perfect size"}
                    {!isMeeshoPage && pageType === 'crop' && "Adjust margins with pixel-perfect precision to remove unwanted white space from your PDF documents"}
                    {!isMeeshoPage && pageType === 'remove' && "Select and remove specific pages from your document with just a few clicks"}
                    {!isMeeshoPage && pageType === 'merge' && "Combine multiple PDF files into a single document in the order you choose"}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 transform transition-transform duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMeeshoPage && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
                    {!isMeeshoPage && pageType === 'crop' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5m-5 5v-4m0 4h4" />}
                    {!isMeeshoPage && pageType === 'remove' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z M11 16l-4-4m0 0l4-4m-4 4h14" />}
                    {!isMeeshoPage && pageType === 'merge' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />}
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {isMeeshoPage && "Courier Service Sorting"}
                    {!isMeeshoPage && pageType === 'crop' && "Batch Processing"}
                    {!isMeeshoPage && pageType === 'remove' && "Preserve Document Quality"}
                    {!isMeeshoPage && pageType === 'merge' && "Reorder Pages"}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {isMeeshoPage && "Sort your shipping labels by courier service to streamline your shipping workflow"}
                    {!isMeeshoPage && pageType === 'crop' && "Process multiple pages at once with the same crop settings to save time"}
                    {!isMeeshoPage && pageType === 'remove' && "Our tool maintains the original quality and formatting of your PDF document"}
                    {!isMeeshoPage && pageType === 'merge' && "Drag and drop to arrange pages in any order before merging"}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 transform transition-transform duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMeeshoPage && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                    {!isMeeshoPage && pageType === 'crop' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
                    {!isMeeshoPage && pageType === 'remove' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                    {!isMeeshoPage && pageType === 'merge' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 01-2-2H6a2 2 0 01-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {isMeeshoPage && "Perfect Size Every Time"}
                    {!isMeeshoPage && pageType === 'crop' && "Secure Processing"}
                    {!isMeeshoPage && pageType === 'remove' && "Preview Before Saving"}
                    {!isMeeshoPage && pageType === 'merge' && "Secure & Private"}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {isMeeshoPage && "Labels are cropped to the exact dimensions needed for printing and shipping"}
                    {!isMeeshoPage && pageType === 'crop' && "Your files are processed locally in your browser - we never upload your sensitive documents to any server"}
                    {!isMeeshoPage && pageType === 'remove' && "See exactly how your document will look before finalizing the changes"}
                    {!isMeeshoPage && pageType === 'merge' && "Your files never leave your computer - all processing happens in your browser"}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 transform transition-transform duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMeeshoPage && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />}
                    {!isMeeshoPage && pageType === 'crop' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />}
                    {!isMeeshoPage && pageType === 'remove' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />}
                    {!isMeeshoPage && pageType === 'merge' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />}
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {isMeeshoPage && "Secure & Private"}
                    {!isMeeshoPage && pageType === 'crop' && "Instant Download"}
                    {!isMeeshoPage && pageType === 'remove' && "Instant Download"}
                    {!isMeeshoPage && pageType === 'merge' && "Instant Download"}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {isMeeshoPage && "Your shipping labels never leave your computer - all processing happens in your browser"}
                    {!isMeeshoPage && pageType === 'crop' && "Download your cropped PDF immediately - no waiting for server processing"}
                    {!isMeeshoPage && pageType === 'remove' && "Download your edited PDF immediately after removing pages"}
                    {!isMeeshoPage && pageType === 'merge' && "Download your merged PDF immediately - no waiting for server processing"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to use section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {isMeeshoPage && "How to Use Our Meesho Label Cropper"}
            {!isMeeshoPage && pageType === 'crop' && "How to Crop Your PDF"}
            {!isMeeshoPage && pageType === 'remove' && "How to Remove Pages"}
            {!isMeeshoPage && pageType === 'merge' && "How to Merge Your PDFs"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                <span className="text-lg font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Upload Your PDF{isMeeshoPage ? "s" : ""}</h4>
              <p className="text-sm text-gray-600">
                {isMeeshoPage && "Drag & drop your file or use the upload button"}
                {!isMeeshoPage && pageType === 'crop' && "Drag & drop your file or use the upload button"}
                {!isMeeshoPage && pageType === 'remove' && "Drag & drop your file or use the upload button"}
                {!isMeeshoPage && pageType === 'merge' && "Upload multiple PDF files that you want to combine"}
              </p>
            </div>

            <div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                <span className="text-lg font-bold">2</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">
                {isMeeshoPage && "Select Your Courier Service"}
                {!isMeeshoPage && pageType === 'crop' && "Adjust Crop Settings"}
                {!isMeeshoPage && pageType === 'remove' && "Select Pages to Remove"}
                {!isMeeshoPage && pageType === 'merge' && "Arrange Your Pages"}
              </h4>
              <p className="text-sm text-gray-600">
                {isMeeshoPage && "Choose the courier service for your shipping labels"}
                {!isMeeshoPage && pageType === 'crop' && "Set margins or use the visual crop tool to select the area you want to keep"}
                {!isMeeshoPage && pageType === 'remove' && "Check the pages you want to remove from your document"}
                {!isMeeshoPage && pageType === 'merge' && "Drag and drop to reorder pages or documents as needed"}
              </p>
            </div>

            <div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                <span className="text-lg font-bold">3</span>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Download Result</h4>
              <p className="text-sm text-gray-600">Save your {isMeeshoPage ? "cropped shipping labels" : pageType === 'crop' ? 'cropped' : pageType === 'remove' ? 'edited' : 'merged'} PDF with one click</p>
            </div>
          </div>
        </div>

        {/* Tips section */}
        <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
          <div className="flex items-start">
            <div className="bg-indigo-100 p-2 rounded-full mr-4 mt-1">
              <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Pro Tips</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {isMeeshoPage && (
                  <>
                    <li>Use the "Apply to All Pages" option to save time when cropping multi-page documents</li>
                    <li>For precise control, use the numeric inputs to set exact margin values</li>
                    <li>The preview shows exactly how your cropped PDF will look</li>
                    <li>You can crop different pages differently by navigating between pages</li>
                  </>
                )}
                {!isMeeshoPage && pageType === 'crop' && (
                  <>
                    <li>Use the "Apply to All Pages" option to save time when cropping multi-page documents</li>
                    <li>For precise control, use the numeric inputs to set exact margin values</li>
                    <li>The preview shows exactly how your cropped PDF will look</li>
                    <li>You can crop different pages differently by navigating between pages</li>
                  </>
                )}
                {!isMeeshoPage && pageType === 'remove' && (
                  <>
                    <li>Use the thumbnail view to quickly identify pages you want to remove</li>
                    <li>You can select a range of pages by using the "Range Selection" option</li>
                    <li>The preview updates in real-time as you select pages</li>
                    <li>You can always undo your selection if you change your mind</li>
                  </>
                )}
                {!isMeeshoPage && pageType === 'merge' && (
                  <>
                    <li>You can upload multiple PDFs at once by selecting them all in the file dialog</li>
                    <li>Drag and drop files directly from your computer for faster uploading</li>
                    <li>Use the preview to ensure pages are in the correct order before merging</li>
                    <li>You can remove individual pages from any document before merging</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
