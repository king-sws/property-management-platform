/* eslint-disable @typescript-eslint/no-empty-object-type */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, Home, Users, FileText, Wrench, DollarSign, BarChart, Building2, Zap, Shield } from 'lucide-react';

// Types
interface DropdownItem {
  icon?: React.ReactNode;
  title: string;
  desc?: string;
  href: string;
}

interface CustomerStoryItem {
  logo: string;
  quote: string;
  cta: string;
  href: string;
}

interface ProductCategories {
  [key: string]: DropdownItem[];
}

interface ResourceItem extends DropdownItem {}

type ResourceCategories = {
  LEARN: ResourceItem[];
  RESOURCES: ResourceItem[];
  SUPPORT: ResourceItem[];
  'CUSTOMER STORIES': CustomerStoryItem[];
}

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Optimized scroll handler with requestAnimationFrame for better performance
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          const shouldBeScrolled = scrollPosition > 10;
          
          // Only update state if it changed to avoid unnecessary re-renders
          if (shouldBeScrolled !== isScrolled) {
            setIsScrolled(shouldBeScrolled);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoized toggle function for better performance
  const toggleDropdown = useCallback((dropdown: string) => {
    setActiveDropdown(prev => prev === dropdown ? null : dropdown);
  }, []);

  // Product dropdown - 3 column layout
  const productCategories: ProductCategories = {
    'CORE FEATURES': [
      { icon: <Home className="w-5 h-5" />, title: 'Property Management', desc: 'Manage properties and units', href: '/features/properties' },
      { icon: <Users className="w-5 h-5" />, title: 'Tenant Portal', desc: 'Self-service for tenants', href: '/features/tenants' },
      { icon: <FileText className="w-5 h-5" />, title: 'Lease Management', desc: 'Digital leases & e-signatures', href: '/features/leases' },
    ],
    'OPERATIONS': [
      { icon: <Wrench className="w-5 h-5" />, title: 'Maintenance', desc: 'Track work orders', href: '/features/maintenance' },
      { icon: <DollarSign className="w-5 h-5" />, title: 'Payments', desc: 'Automated rent collection', href: '/features/payments' },
      { icon: <BarChart className="w-5 h-5" />, title: 'Analytics', desc: 'Financial insights', href: '/features/analytics' },
    ],
    'RESOURCES': [
      { title: 'Pricing', href: '/#pricing' },
      { title: 'State of Property Management', href: '/resources/state' },
    ]
  };

  // Solutions dropdown - 2 column layout
  const solutionsCategories: ProductCategories = {
    'BY USER': [
      { icon: <Building2 className="w-5 h-5" />, title: 'Landlords', desc: 'For individual property owners', href: '/solutions/landlords' },
      { icon: <Zap className="w-5 h-5" />, title: 'Property Managers', desc: 'Manage at scale', href: '/solutions/managers' },
      { icon: <Shield className="w-5 h-5" />, title: 'HOAs', desc: 'Community management', href: '/solutions/hoa' },
    ],
    'BY PROPERTY TYPE': [
      { icon: <Home className="w-5 h-5" />, title: 'Residential', desc: 'Single & multi-family', href: '/solutions/residential' },
      { icon: <Building2 className="w-5 h-5" />, title: 'Commercial', desc: 'Office & retail spaces', href: '/solutions/commercial' },
      { icon: <Users className="w-5 h-5" />, title: 'Multi-Unit', desc: 'Apartments & complexes', href: '/solutions/multi-unit' },
    ]
  };

  // Resources dropdown - 4 column layout
const resourcesCategories: ResourceCategories = {
  'LEARN': [
    { title: 'Help Center', href: '/help' },
    { title: 'Video Tutorials', href: '/videos' },
    { title: 'Landlord Guide', href: '/guide' },
    { title: 'Webinars', href: '/webinars' },
  ],
  'RESOURCES': [
    { title: 'Blog', href: '/blog' },
    { title: 'Case Studies', href: '/case-studies' },
    { title: 'Templates', href: '/templates' },  // Lease templates, etc.
    { title: 'Legal Resources', href: '/legal' },
  ],
  'SUPPORT': [
    { title: 'Contact Support', href: '/support' },
    { title: 'FAQs', href: '/#faq' },
    { title: 'Live Chat', href: '/chat' },
    { title: 'Status Page', href: '/status' },
  ],
  'CUSTOMER STORIES': [
    { 
      logo: '🏢',
      quote: 'Propely helped us manage 50+ properties efficiently',
      cta: 'Read the story →',
      href: '/case-studies/1'
    }
  ]
};

  // Determine navbar background state - instant change with no delay
  const shouldBeSolid = isScrolled || activeDropdown !== null || isMobileMenuOpen;
  
  const navbarBg = shouldBeSolid
    ? 'bg-black/95 backdrop-blur-md border-b border-gray-800 shadow-lg' 
    : 'bg-transparent';

  const dropdownBg = 'bg-black/98 backdrop-blur-md border-b border-gray-800';

  return (
    <>
      <style jsx>{`
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-rainbow {
          animation: rainbow 6s linear infinite;
        }
        
        /* Faster, smoother transitions using cubic-bezier easing */
        .navbar-transition {
          transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        // 
        
        /* Instant button state changes for responsive feel */
        .button-instant {
          transition: background-color 100ms ease-out,
                      color 100ms ease-out;
        }
        
        /* Icon scale animation */
        .icon-scale {
          transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Mobile menu slide animation */
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slide-in-from-top 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <nav ref={dropdownRef} className={`fixed top-0 left-0 right-0 z-50 navbar-transition ${navbarBg}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation Links - Left Side */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <Image
                  src="/propely-light.svg"
                  alt="Propely"
                  width={80}
                  height={32}
                  className="dark:invert"
                />
              </Link>

              {/* Divider */}
              <div className="hidden lg:block text-gray-500 text-lg font-light">/</div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {/* Product Dropdown */}
                <button 
                  onClick={() => toggleDropdown('product')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md font-medium text-sm button-instant ${
                    activeDropdown === 'product' ? 'bg-gray-800 text-white' : 'text-foreground hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  Product
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
                </button>

                {/* Solutions Dropdown */}
                <button 
                  onClick={() => toggleDropdown('solutions')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md font-medium text-sm button-instant ${
                    activeDropdown === 'solutions' ? 'bg-gray-800 text-white' : 'text-foreground hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  Solutions
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
                </button>

                {/* Pricing - Simple Link */}
                <Link
                  href="/#pricing"
                  className="px-3 py-2 rounded-md font-medium text-foreground text-sm hover:text-gray-300 hover:bg-gray-800/50 button-instant"
                >
                  Pricing
                </Link>

                {/* Integrations - Simple Link */}
                <Link
                  href="/integrations"
                  className="px-3 py-2 rounded-md font-medium text-foreground text-sm hover:text-gray-300 hover:bg-gray-800/50 button-instant"
                >
                  Integrations
                </Link>

                {/* Resources Dropdown */}
                <button 
                  onClick={() => toggleDropdown('resources')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md font-medium text-sm button-instant ${
                    activeDropdown === 'resources' ? 'bg-gray-800 text-white' : 'text-foreground hover:text-gray-300 hover:bg-gray-800/50'
                  }`}
                >
                  Resources
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
                </button>

                
              </div>
            </div>

            {/* Right Side Buttons */}
            <div className="flex gap-x-2 gap-y-1 flex-row items-center place-content-start ml-auto">
              {/* Desktop CTA Buttons */}
              <div className="hidden lg:flex items-center gap-4">
                <Link
                  href="/sign-in"
                  className="text-gray-300 hover:text-white hover:bg-white/10 rounded-full px-4 py-2 text-sm font-medium button-instant"
                >
                  Sign In
                </Link>
                
                <Link
                  href="/sign-up"
                  className="group/button inline-flex items-center justify-center font-medium text-[0.8125rem] leading-tight whitespace-nowrap hover:z-10 relative text-background animate-rainbow hover:opacity-85 bg-[linear-gradient(var(--foreground),var(--foreground)),linear-gradient(var(--background)_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,#10b981,#06b6d4,#8b5cf6,#3b82f6,#6366f1,#a855f7,#ec4899,#f43f5e,#f97316,#eab308,#84cc16,#10b981)] bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.125rem)_solid_transparent] before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,#10b981,#06b6d4,#8b5cf6,#3b82f6,#6366f1,#a855f7,#ec4899,#f43f5e,#f97316,#eab308,#84cc16,#10b981)] before:[filter:blur(0.75rem)] px-4 py-2 rounded-full transition-opacity duration-150"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Tablet & Mobile Buttons */}
              <div className="flex lg:hidden items-center gap-2">
                <Link
                  href="/sign-in"
                  className="group/button inline-flex items-center justify-center font-medium text-[0.8125rem] text-start leading-tight whitespace-nowrap hover:z-10 disabled:opacity-60 disabled:pointer-events-none text-foreground hover:bg-foreground/10 px-3 py-2 gap-[0.66ch] rounded-full max-md:hidden"
                >
                  <span className="hidden md:inline">Sign in</span>
                  <span className="md:hidden">Sign in</span>
                </Link>

                <Link
                  href="/sign-up"
                  className="group/button inline-flex items-center justify-center font-medium text-[0.8125rem] leading-tight whitespace-nowrap hover:z-10 relative text-background animate-rainbow hover:opacity-85 bg-[linear-gradient(var(--foreground),var(--foreground)),linear-gradient(var(--background)_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,#10b981,#06b6d4,#8b5cf6,#3b82f6,#6366f1,#a855f7,#ec4899,#f43f5e,#f97316,#eab308,#84cc16,#10b981)] bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.125rem)_solid_transparent] before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,#10b981,#06b6d4,#8b5cf6,#3b82f6,#6366f1,#a855f7,#ec4899,#f43f5e,#f97316,#eab308,#84cc16,#10b981)] before:[filter:blur(0.75rem)] px-3 py-2 rounded-full transition-opacity duration-150"
                >
                  <span className="hidden md:inline">Start Free Trial</span>
                  <span className="md:hidden">Start Free Trial</span>
                </Link>
                
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-400 hover:text-white p-2 button-instant rounded-md hover:bg-white/10"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Dropdowns - Enhanced with faster animations */}
        {activeDropdown && (
          <div className={`hidden lg:block w-full ${dropdownBg} shadow-2xl dropdown-transition`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Product Dropdown - 3 Columns with Icons */}
              {activeDropdown === 'product' && (
                <div className="grid grid-cols-3 gap-8">
                  {Object.entries(productCategories).map(([category, items]) => (
                    <div key={category}>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        {category}
                      </div>
                      <div className="space-y-2">
                        {items.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 button-instant group"
                          >
                            {item.icon && (
                              <div className="text-blue-400 mt-0.5 group-hover:scale-110 icon-scale">
                                {item.icon}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-sm text-white mb-0.5">{item.title}</div>
                              {item.desc && (
                                <div className="text-xs text-gray-400 leading-snug">{item.desc}</div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Solutions Dropdown - 2 Columns */}
              {activeDropdown === 'solutions' && (
                <div className="grid grid-cols-2 gap-12">
                  {Object.entries(solutionsCategories).map(([category, items]) => (
                    <div key={category}>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        {category}
                      </div>
                      <div className="space-y-2">
                        {items.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 button-instant group"
                          >
                            {item.icon && (
                              <div className="text-purple-400 mt-0.5 group-hover:scale-110 icon-scale">
                                {item.icon}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-sm text-white mb-0.5">{item.title}</div>
                              {item.desc && (
                                <div className="text-xs text-gray-400 leading-snug">{item.desc}</div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Resources Dropdown - 4 Columns */}
              {activeDropdown === 'resources' && (
                <div className="grid grid-cols-4 gap-8">
                  {Object.entries(resourcesCategories).map(([category, items]) => (
                    <div key={category}>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        {category}
                      </div>
                      <div className="space-y-2">
                        {items.map((item, index) => (
                          category === 'CUSTOMER STORIES' ? (
                            <Link
                              key={index}
                              href={(item as CustomerStoryItem).href}
                              onClick={() => setActiveDropdown(null)}
                              className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 button-instant"
                            >
                              <div className="text-3xl mb-2">{(item as CustomerStoryItem).logo}</div>
                              <div className="text-sm text-white font-medium mb-2">{(item as CustomerStoryItem).quote}</div>
                              <div className="text-xs text-blue-400">{(item as CustomerStoryItem).cta}</div>
                            </Link>
                          ) : (
                            <Link
                              key={index}
                              href={(item as ResourceItem).href}
                              onClick={() => setActiveDropdown(null)}
                              className="block p-2 rounded-lg hover:bg-white/5 button-instant text-sm text-gray-300 hover:text-white"
                            >
                              {(item as ResourceItem).title}
                            </Link>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu - Enhanced with Accordions */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-black/98 backdrop-blur-md border-t border-gray-800 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {/* Product Accordion */}
              <div className="border-b border-gray-800 pb-2">
                <button
                  onClick={() => toggleDropdown('mobile-product')}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/5 button-instant"
                >
                  <span>Product</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'mobile-product' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'mobile-product' && (
                  <div className="mt-2 pl-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {Object.entries(productCategories).map(([category, items]) => (
                      <div key={category} className="mb-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-3">
                          {category}
                        </div>
                        {items.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setActiveDropdown(null);
                            }}
                            className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 button-instant"
                          >
                            {item.icon && <div className="text-blue-400 mt-0.5">{item.icon}</div>}
                            <div>
                              <div className="font-medium">{item.title}</div>
                              {item.desc && <div className="text-xs text-gray-500">{item.desc}</div>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Solutions Accordion */}
              <div className="border-b border-gray-800 pb-2">
                <button
                  onClick={() => toggleDropdown('mobile-solutions')}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/5 button-instant"
                >
                  <span>Solutions</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'mobile-solutions' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'mobile-solutions' && (
                  <div className="mt-2 pl-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {Object.entries(solutionsCategories).map(([category, items]) => (
                      <div key={category} className="mb-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-3">
                          {category}
                        </div>
                        {items.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setActiveDropdown(null);
                            }}
                            className="flex items-start gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 button-instant"
                          >
                            {item.icon && <div className="text-purple-400 mt-0.5">{item.icon}</div>}
                            <div>
                              <div className="font-medium">{item.title}</div>
                              {item.desc && <div className="text-xs text-gray-500">{item.desc}</div>}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing - Simple Link */}
              <Link 
                href="/#pricing" 
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/5 button-instant" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>

              {/* Integrations - Simple Link */}
              <Link 
                href="/integrations" 
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/5 button-instant" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Integrations
              </Link>

              {/* Resources Accordion */}
              <div className="border-b border-gray-800 pb-2">
                <button
                  onClick={() => toggleDropdown('mobile-resources')}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/5 button-instant"
                >
                  <span>Resources</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'mobile-resources' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'mobile-resources' && (
                  <div className="mt-2 pl-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {Object.entries(resourcesCategories).map(([category, items]) => (
                      <div key={category} className="mb-3">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-3">
                          {category}
                        </div>
                        {items.map((item, index) => (
                          category === 'CUSTOMER STORIES' ? (
                            <Link
                              key={index}
                              href={(item as CustomerStoryItem).href}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setActiveDropdown(null);
                              }}
                              className="block px-3 py-2 rounded-lg hover:bg-white/5 button-instant"
                            >
                              <div className="text-2xl mb-1">{(item as CustomerStoryItem).logo}</div>
                              <div className="text-sm text-white font-medium mb-1">{(item as CustomerStoryItem).quote}</div>
                              <div className="text-xs text-blue-400">{(item as CustomerStoryItem).cta}</div>
                            </Link>
                          ) : (
                            <Link
                              key={index}
                              href={(item as ResourceItem).href}
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setActiveDropdown(null);
                              }}
                              className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 button-instant"
                            >
                              {(item as ResourceItem).title}
                            </Link>
                          )
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>



              {/* Sign In - Separated with border */}
              <Link 
                href="/sign-in" 
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/5 button-instant border-t border-gray-800 mt-2 pt-4" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;