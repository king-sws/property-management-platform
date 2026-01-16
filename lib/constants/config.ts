
// lib/constants/config.ts
export const APP_CONFIG = {
  name: "Propely",
  description: "Property Management System",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  
  features: {
    emailVerification: true,
    twoFactorAuth: false,
    socialAuth: true,
  },
  
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedDocumentTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  
  stripe: {
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  },
} as const;