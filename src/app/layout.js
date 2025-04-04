import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { StatsProvider } from "./context/StatsContext";
import { PDFProvider } from "./context/PDFContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PDF Editor - Crop, Remove Pages & Merge PDFs",
  description: "Free online PDF editor with tools to crop PDFs, remove pages, and merge multiple documents. Easy to use with no installation required.",
  keywords: "pdf editor, pdf crop, remove pdf pages, merge pdfs, pdf tool, online pdf editor",
  icons: {
    icon: '/logo-pdf.png',
    apple: '/logo-pdf.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StatsProvider>
          <PDFProvider>
            {children}
          </PDFProvider>
        </StatsProvider>
        <Toaster />
      </body>
    </html>
  );
}
