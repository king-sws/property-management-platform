/* eslint-disable react/no-unescaped-entities */
'use client'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <div className="mx-auto w-full max-w-3xl text-center space-y-8">

        {/* 404 Text */}
        <div className="flex items-center justify-center">
          <h1 className="text-8xl md:text-9xl font-bold text-white">404</h1>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Page Not Found
          </h2>

          <p className="text-lg md:text-xl text-gray-400 leading-relaxed mx-auto max-w-xl">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Divider */}
        <div className="mx-auto h-px w-28 bg-gray-800"></div>

        {/* Button */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white px-6 py-3 font-medium text-white hover:bg-white hover:text-black transition duration-200"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  )
}