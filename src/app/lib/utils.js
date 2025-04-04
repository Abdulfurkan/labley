"use client"

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Function to transfer PDF file state between pages
export function transferPDFFile(file) {
  // Store the file data in sessionStorage
  const fileData = {
    name: file.name,
    size: file.size,
    type: file.type,
    url: file.url,
    lastModified: file.lastModified,
  };
  sessionStorage.setItem('transferredPDFFile', JSON.stringify(fileData));
}

// Function to retrieve transferred PDF file
export function getTransferredPDFFile() {
  const fileData = sessionStorage.getItem('transferredPDFFile');
  if (!fileData) return null;
  
  try {
    const parsedData = JSON.parse(fileData);
    // Clear the stored data after retrieving
    sessionStorage.removeItem('transferredPDFFile');
    return parsedData;
  } catch (error) {
    console.error('Error retrieving transferred PDF file:', error);
    return null;
  }
}
