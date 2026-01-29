import CTASection from '@/components/landing/CTASection'
import Footer from '@/components/landing/LandingFooter'
import Navbar from '@/components/landing/LandingNavbar'
import TopNotice from '@/components/landing/TopNotice' // Add this import
import React from 'react'

const layout = ({children} : {children: React.ReactNode}) => {
  return (
    <div>
        {/* <TopNotice /> Add TopNotice above Navbar */}
        <Navbar />
        {children}
        <CTASection />
        <Footer />
    </div>
  )
}

export default layout