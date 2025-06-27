export const loadingMessages = [
  "Thinking",
  "Analyzing sources",
  "Searching knowledge base",
  "Processing your request",
  "Crafting response",
  "Consulting the archives",
  "Gathering insights",
  "Connecting the dots",
  "Diving deep",
  "Synthesizing information",
  "Contemplating",
  "Researching",
  "Formulating answer",
  "Accessing memory banks",
  "Computing response",
];

// API Configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/python'  // Vercel serverless function
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';  // Local development
