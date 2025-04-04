'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/common/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function TermsOfService() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear();

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
              <Link href="/flipkart-label-cropper" className="px-4 py-2 font-medium text-gray-700 hover:text-blue-600 transition-colors relative group">
                Flipkart Label Cropper
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
          </nav>
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
                className="px-6 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-blue-600 transition-all duration-200"
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
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-2xl font-bold text-gray-800">Terms of Service</CardTitle>
              <CardDescription className="text-gray-600">
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-8 px-6 space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using the PDF Editor service, website, and any other linked pages or services offered by us (collectively, the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
                </p>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">2. Description of Service</h2>
                <p className="text-gray-600 leading-relaxed">
                  PDF Editor provides online tools for editing, cropping, merging, and managing PDF files. Our Service is designed to be used as is and we make no guarantees about its availability or functionality.
                </p>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">3. User Data and Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We respect your privacy and are committed to protecting your personal data. All PDF processing is done client-side in your browser. We do not store your PDF files on our servers. For more information about how we handle your data, please refer to our <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>.
                </p>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">4. User Obligations</h2>
                <p className="text-gray-600 leading-relaxed">
                  You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for ensuring that you have the right to edit and modify any PDF files you upload to our Service.
                </p>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">5. Intellectual Property</h2>
                <p className="text-gray-600 leading-relaxed">
                  The Service and its original content, features, and functionality are owned by PDF Editor and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">6. Disclaimer of Warranties</h2>
                <p className="text-gray-600 leading-relaxed">
                  The Service is provided on an "AS IS" and "AS AVAILABLE" basis. PDF Editor expressly disclaims all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                </p>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">7. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  In no event shall PDF Editor be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                </p>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">8. Changes to Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">9. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about these Terms, please <Link href="/contact" className="text-blue-600 hover:text-blue-800">contact us</Link>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
