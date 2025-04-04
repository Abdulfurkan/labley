'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/common/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function PrivacyPolicy() {
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
              <CardTitle className="text-2xl font-bold text-gray-800">Privacy Policy</CardTitle>
              <CardDescription className="text-gray-600">
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-8 px-6 space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  Welcome to PDF Editor. We are committed to protecting your privacy and providing you with a safe and secure online experience. This Privacy Policy outlines our practices regarding the collection, use, and disclosure of information through our website and services.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using our website, you agree to the terms of this Privacy Policy. If you do not agree with the terms of this policy, please do not access or use our services.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">2. Information We Collect</h2>
                <p className="text-gray-600 leading-relaxed">
                  We collect information to provide better services to our users. The types of information we collect include:
                </p>
                <ul className="list-disc pl-6 text-gray-600 leading-relaxed space-y-2">
                  <li>
                    <span className="font-medium">Information you provide to us:</span> We may collect personal information that you voluntarily provide when using our services, such as your email address when you contact us.
                  </li>
                  <li>
                    <span className="font-medium">Files you upload:</span> When you use our PDF editing services, we temporarily process the files you upload. These files are automatically deleted from our servers once processing is complete or after a short period of time.
                  </li>
                  <li>
                    <span className="font-medium">Usage information:</span> We collect information about how you use our services, including your interactions with our website, features you use, and the time, frequency, and duration of your activities.
                  </li>
                  <li>
                    <span className="font-medium">Device information:</span> We collect device-specific information such as your hardware model, operating system version, unique device identifiers, and mobile network information.
                  </li>
                  <li>
                    <span className="font-medium">Log information:</span> When you use our services, we automatically collect and store certain information in server logs, including details of how you used our service, IP address, and cookies that may uniquely identify your browser.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">3. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 leading-relaxed space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Develop new services, features, and functionality</li>
                  <li>Process and deliver your PDF files according to your requests</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                  <li>Detect, prevent, and address technical issues</li>
                  <li>Protect against harmful, unauthorized, or illegal activity</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">4. Cookies and Similar Technologies</h2>
                <p className="text-gray-600 leading-relaxed">
                  We use cookies and similar technologies to collect information about your activity, browser, and device. Cookies are small data files stored on your browser or device. They help us improve our services and your experience, customize your preferences, and understand how users interact with our website.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  You can configure your browser to accept or reject cookies, or to notify you when a cookie is being sent. However, some features of our services may not function properly if cookies are disabled.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">5. Advertising</h2>
                <p className="text-gray-600 leading-relaxed">
                  We display advertisements on our website through third-party advertising partners, including Google AdSense. These partners may use cookies, web beacons, and similar technologies to collect information about your activities on our website and other sites to provide you with targeted advertising based on your browsing activities and interests.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Google AdSense uses cookies to serve ads on our website. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to our site and/or other sites on the Internet. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Google's Ads Settings</a>.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">6. Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">7. Children's Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our services are not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">8. Changes to This Privacy Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">9. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">Email:</span> support@pdfeditor.com
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
