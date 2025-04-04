'use client'
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '../components/common/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // In a real application, you would send this data to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form submitted:', formData);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('There was an error sending your message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Modern Floating Header with Glass Morphism */}
      <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-md shadow-sm border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo-pdf.png" 
                alt="PDF Editor Logo" 
                width={60} 
                height={60} 
                className="transition-transform hover:scale-105"
              />
              <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-2xl font-bold">
                Contact Us
              </h1>
            </div>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2 transition-all duration-300 hover:translate-x-[-2px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">Get in Touch</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">We'd love to hear from you. Whether you have a question about our services, need help with a PDF, or just want to say hello.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Contact Info Cards */}
          <div className="space-y-6">
            <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-slate-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-slate-800">Contact Information</CardTitle>
                <CardDescription>Reach out to us through any of these channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-semibold text-slate-800">Email</h4>
                    <a href="mailto:support@pdfeditor.com" className="text-blue-600 hover:text-blue-800 transition-colors">
                      support@pdfeditor.com
                    </a>
                    <p className="text-sm text-slate-500 mt-1">We'll respond as quickly as possible</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-semibold text-slate-800">Phone</h4>
                    <a href="tel:+1-800-123-4567" className="text-blue-600 hover:text-blue-800 transition-colors">
                      +1 (800) 123-4567
                    </a>
                    <p className="text-sm text-slate-500 mt-1">Monday-Friday, 9am-5pm EST</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-base font-semibold text-slate-800">Office</h4>
                    <p className="text-slate-600">
                      123 Innovation Drive<br />
                      San Francisco, CA 94107
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-slate-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-slate-800">Our Hours</CardTitle>
                <CardDescription>When you can reach us</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Monday - Friday</span>
                  <span className="text-slate-600">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Saturday</span>
                  <span className="text-slate-600">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Sunday</span>
                  <span className="text-slate-600">Closed</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Contact Form */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-slate-200/50">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="text-2xl font-bold">Send Us a Message</CardTitle>
                <CardDescription className="text-blue-100">
                  We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {submitSuccess ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-6 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-green-800">Message Sent Successfully!</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Thank you for reaching out. We'll get back to you as soon as possible.</p>
                        </div>
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            onClick={() => setSubmitSuccess(false)}
                            className="text-green-700 bg-green-50 hover:bg-green-100 border-green-200"
                          >
                            Send another message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {submitError && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                              <p>{submitError}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        type="text"
                        name="subject"
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="How can we help you?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Your Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="min-h-[120px] transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Please provide details about your inquiry..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      variant="gradient"
                      className="w-full h-12 text-base"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          Send Message
                          <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                          </svg>
                        </div>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Card className="overflow-hidden backdrop-blur-sm bg-white/80 border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Frequently Asked Questions</CardTitle>
              <CardDescription className="text-center">Find quick answers to common questions about our PDF Editor</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">How do I crop a PDF?</h4>
                  <p className="text-slate-600">
                    Upload your PDF, click the "Crop" button, select the area you want to keep, and then click "Apply Crop".
                  </p>
                </div>
                
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">Can I crop multiple pages at once?</h4>
                  <p className="text-slate-600">
                    Yes! When cropping a multi-page PDF, you can enable the "Crop All Pages" toggle to apply the same crop to all pages.
                  </p>
                </div>
                
                <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                  <h4 className="text-lg font-semibold text-slate-800 mb-2">Is my PDF data secure?</h4>
                  <p className="text-slate-600">
                    Absolutely. All processing happens in your browser, and your files are never uploaded to our servers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
