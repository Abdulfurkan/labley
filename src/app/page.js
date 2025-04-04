'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from './components/common/Footer';
import PDFFeatureAnimation from './components/common/PDFFeatureAnimation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const features = [
    {
      title: "Crop PDF",
      description: "Remove unwanted margins and resize your PDF documents with precision.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2v4h12V2"></path>
          <path d="M6 18v4h12v-4"></path>
          <path d="M2 6h4v12H2"></path>
          <path d="M18 6h4v12h-4"></path>
          <rect x="6" y="6" width="12" height="12"></rect>
        </svg>
      ),
      link: "/crop-pdf"
    },
    {
      title: "Remove Pages",
      description: "Easily delete unwanted pages from your PDF documents in seconds.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      ),
      link: "/remove-pages"
    },
    {
      title: "Merge PDFs",
      description: "Combine multiple PDF files into a single document with ease.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 7v8a2 2 0 0 0 2 2h6M8 7V5a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293l4.414 4.414a1 1 0 0 1 .293.707V15a2 2 0 0 1-2 2h-2"></path>
          <path d="M2 15h6"></path>
          <path d="M5 12v6"></path>
        </svg>
      ),
      link: "/merge-pdfs"
    },
    {
      title: "Meesho Label Cropper",
      description: "Automatically crop Meesho shipping labels with precision in seconds.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M9 14.5L11.5 12 9 9.5" strokeWidth="1.5" />
          <path d="M11.5 12L9 14.5" strokeWidth="1.5" />
          <path d="M14 16.5l2.5-2.5-2.5-2.5" strokeWidth="1.5" />
          <path d="M16.5 14l-2.5 2.5" strokeWidth="1.5" />
          <rect x="8" y="8" width="8" height="8" rx="1" strokeDasharray="2 2" />
        </svg>
      ),
      link: "/meesho-label-cropper"
    },
    {
      title: "Flipkart Label Cropper",
      description: "Automatically crop Flipkart shipping labels with precision in seconds.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.342a2 2 0 0 0-.602-1.43l-4.44-4.342A2 2 0 0 0 13.56 2H6a2 2 0 0 0-2 2z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M9 14.5L11.5 12 9 9.5" strokeWidth="1.5" />
          <path d="M11.5 12L9 14.5" strokeWidth="1.5" />
          <path d="M14 16.5l2.5-2.5-2.5-2.5" strokeWidth="1.5" />
          <path d="M16.5 14l-2.5 2.5" strokeWidth="1.5" />
          <rect x="8" y="8" width="8" height="8" rx="1" strokeDasharray="2 2" />
        </svg>
      ),
      link: "/flipkart-label-cropper"
    }
  ];

  const showWelcomeToast = () => {
    toast({
      title: "Welcome to PDF Editor!",
      description: "Try our powerful PDF editing tools.",
      variant: "default",
    });
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
              <Link href="/" className="px-4 py-2 font-medium text-blue-600 relative group">
                Home
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-all duration-300"></span>
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
                className="px-6 py-3 text-blue-600 font-medium border-l-4 border-blue-600"
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

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                  Powerful PDF Editing <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Made Simple</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Edit, crop, merge, and manage your PDF documents with our easy-to-use online tools. No installation required.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="default" size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800" asChild>
                    <Link href="/crop-pdf" className="text-white">Get Started</Link>
                  </Button>
                  <Button variant="outline" size="lg" onClick={showWelcomeToast} asChild>
                    <Link href="#features">Explore Features</Link>
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur-xl"></div>
                  <PDFFeatureAnimation />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful PDF Tools</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our suite of PDF editing tools helps you manage your documents efficiently
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <CardHeader>
                    <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mb-2">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-300" asChild>
                      <Link href={feature.link}>Try Now</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Simple steps to edit your PDF documents in seconds
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-lg">
                <CardHeader className="relative pb-2">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">1</div>
                  <CardTitle className="mt-4">Upload Your PDF</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Select and upload the PDF document you want to edit from your device.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardHeader className="relative pb-2">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">2</div>
                  <CardTitle className="mt-4">Edit as Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Use our intuitive tools to crop, remove pages, or merge PDFs according to your needs.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardHeader className="relative pb-2">
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold">3</div>
                  <CardTitle className="mt-4">Download Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Download your edited PDF document instantly to your device.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Edit Your PDFs?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
              Get started with our free online PDF tools today. No registration required.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10" asChild>
                <Link href="/crop-pdf">Crop PDF</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10" asChild>
                <Link href="/remove-pages">Remove Pages</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white/10" asChild>
                <Link href="/merge-pdfs">Merge PDFs</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
