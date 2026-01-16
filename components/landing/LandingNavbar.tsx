"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Menu, X, Sun, Moon, ChevronDown, Home, Users, TrendingUp, Settings, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image';

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ];

  const megaMenuItems = {
    'Features': {
      featured: {
        title: 'Property Management Suite',
        description: 'Manage all your properties, tenants, and maintenance in one powerful platform designed for modern landlords.',
        icon: Building2,
        href: '/features/suite',
        cta: 'Explore all features',
        gradient: 'from-blue-600/20 via-purple-600/20 to-pink-600/20',
      },
      sections: [
        {
          title: 'Core Features',
          items: [
            {
              icon: Home,
              iconColor: 'text-blue-400',
              iconBg: 'bg-blue-500/10',
              title: 'Property Management',
              description: 'Centralize all property data, documents, and communication in one place',
              href: '/features/property-management',
            },
            {
              icon: Users,
              iconColor: 'text-blue-400',
              iconBg: 'bg-blue-500/10',
              title: 'Tenant Portal',
              description: 'Give tenants 24/7 access to pay rent, submit requests, and communicate',
              href: '/features/tenant-portal',
            },
            {
              icon: TrendingUp,
              iconColor: 'text-blue-400',
              iconBg: 'bg-blue-500/10',
              title: 'Financial Reports',
              description: 'Track income, expenses, and generate detailed financial insights',
              href: '/features/financial-reports',
            },
          ],
        },
        {
          title: 'Advanced Tools',
          items: [
            {
              icon: Settings,
              iconColor: 'text-blue-400',
              iconBg: 'bg-blue-500/10',
              title: 'Maintenance Tracking',
              description: 'Streamline work orders and vendor management',
              href: '/features/maintenance',
            },
            {
              icon: Shield,
              iconColor: 'text-blue-400',
              iconBg: 'bg-blue-500/10',
              title: 'Lease Management',
              description: 'Digital lease signing and automated renewals',
              href: '/features/lease-management',
            },
            {
              icon: Zap,
              iconColor: 'text-blue-400',
              iconBg: 'bg-blue-500/10',
              title: 'Automation',
              description: 'Automate rent collection, reminders, and workflows',
              href: '/features/automation',
            },
          ],
        },
      ],
    },
  };

  // Handle component mount for theme
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = (itemName: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveDropdown(itemName);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Determine which logo to show
  const logoSrc = theme === 'dark' ? '/propely-dark.svg' : '/propely-light.svg';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0a0a0b] backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              {mounted ? (
                <Image
                  src={logoSrc}
                  alt="Propely"
                  width={120}
                  height={36}
                  className="h-9 w-auto"
                  priority
                />
              ) : (
                // Fallback while mounting to prevent flash
                <div className="flex items-center gap-2.5 font-semibold text-lg">
                  <div className="h-9 w-9 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white dark:text-slate-900" />
                  </div>
                  <span className="text-slate-900 dark:text-white">Propely</span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {/* Features Mega Menu */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('Features')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-all rounded-lg ${
                    activeDropdown === 'Features'
                      ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  Features
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'Features' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Desktop CTA & Theme Toggle */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <Button variant="ghost" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white" asChild>
                <Link href="/sign-up">Get started</Link>
              </Button>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-400"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Mega Menu Dropdown */}
        {activeDropdown === 'Features' && megaMenuItems['Features'] && (
          <div
            className="hidden md:block absolute left-0 right-0 bg-white/95 dark:bg-[#0a0a0b]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl"
            onMouseEnter={() => handleMouseEnter('Features')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="container mx-auto px-6 py-10">
              <div className="grid grid-cols-12 gap-8">
                {/* Featured Card - Left Side */}
                {megaMenuItems['Features'].featured && (
                  <div className="col-span-4">
                    <Link
                      href={megaMenuItems['Features'].featured.href}
                      className={`block h-full bg-gradient-to-br ${megaMenuItems['Features'].featured.gradient} backdrop-blur-sm rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300 border border-slate-200 dark:border-white/10 group`}
                    >
                      
                      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 leading-tight">
                        {megaMenuItems['Features'].featured.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        {megaMenuItems['Features'].featured.description}
                      </p>
                      <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm group-hover:gap-3 transition-all">
                        {megaMenuItems['Features'].featured.cta}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </div>
                )}

                {/* Grid Items - Right Side */}
                <div className="col-span-8">
                  <div className="grid grid-cols-2 gap-8">
                    {megaMenuItems['Features'].sections.map((section, sectionIdx) => (
                      <div key={sectionIdx}>
                        {section.title && (
                          <h4 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">
                            {section.title}
                          </h4>
                        )}
                        <div className="space-y-1">
                          {section.items.map((dropItem) => {
                            const Icon = dropItem.icon;
                            return (
                              <Link
                                key={dropItem.title}
                                href={dropItem.href}
                                className="flex items-start gap-4 px-4 py-4 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all duration-200 group border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                              >
                                <div className="shrink-0 mt-0.5">
                                  <div className={`w-11 h-11 rounded-xl ${dropItem.iconBg} flex items-center justify-center backdrop-blur-sm border border-slate-200 dark:border-white/5 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-5 h-5 ${dropItem.iconColor}`} />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                      {dropItem.title}
                                    </h5>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                                    {dropItem.description}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-16 left-0 right-0 bottom-0 bg-white dark:bg-[#0a0a0b] border-t border-slate-200 dark:border-slate-800 z-40 md:hidden overflow-y-auto"
            >
              <div className="container mx-auto px-6 py-6 space-y-4">
                {/* Mobile Features Mega Menu */}
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'Features' ? null : 'Features')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <span>Features</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'Features' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === 'Features' && megaMenuItems['Features'] && (
                    <div className="mt-2 space-y-3">
                      {/* Mobile Featured Card */}
                      {megaMenuItems['Features'].featured && (
                        <Link
                          href={megaMenuItems['Features'].featured.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block bg-gradient-to-br ${megaMenuItems['Features'].featured.gradient} backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-white/10`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-slate-900 dark:text-white font-bold mb-1 text-sm">
                                {megaMenuItems['Features'].featured.title}
                              </h4>
                              <p className="text-slate-600 dark:text-slate-300 text-xs mb-2 leading-relaxed line-clamp-2">
                                {megaMenuItems['Features'].featured.description}
                              </p>
                              <span className="text-slate-900 dark:text-white text-xs font-semibold inline-flex items-center gap-1.5">
                                {megaMenuItems['Features'].featured.cta} <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      )}

                      {/* Mobile Dropdown Items */}
                      <div className="space-y-2">
                        {megaMenuItems['Features'].sections.map((section, sectionIdx) => (
                          <div key={sectionIdx}>
                            {section.title && (
                              <h5 className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2 mt-2">
                                {section.title}
                              </h5>
                            )}
                            {section.items.map((dropItem) => {
                              const Icon = dropItem.icon;
                              return (
                                <Link
                                  key={dropItem.title}
                                  href={dropItem.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                                >
                                  <div className="mt-0.5 shrink-0">
                                    <div className={`w-9 h-9 rounded-lg ${dropItem.iconBg} flex items-center justify-center border border-slate-200 dark:border-white/5`}>
                                      <Icon className={`w-4 h-4 ${dropItem.iconColor}`} />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">
                                      {dropItem.title}
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                                      {dropItem.description}
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-base font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    {link.name}
                  </a>
                ))}

                <div className="pt-4 space-y-3 border-t border-slate-200 dark:border-slate-800">
                  <Button variant="outline" className="w-full border-slate-300 dark:border-slate-700" asChild>
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white" asChild>
                    <Link href="/sign-up">Get started</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}