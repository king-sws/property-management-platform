"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Menu, 
  Sun, 
  Moon, 
  ChevronDown, 
  Home, 
  Users, 
  TrendingUp, 
  Settings, 
  ArrowRight, 
  Shield, 
  Zap 
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image';

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();

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
        gradient: 'from-blue-500/10 via-indigo-500/10 to-purple-500/10',
      },
      sections: [
        {
          title: 'Core Features',
          items: [
            {
              icon: Home,
              iconColor: 'text-blue-600 dark:text-blue-400',
              iconBg: 'bg-blue-50 dark:bg-blue-500/10',
              title: 'Property Management',
              description: 'Centralize all property data, documents, and communication in one place',
              href: '/features/property-management',
            },
            {
              icon: Users,
              iconColor: 'text-indigo-600 dark:text-indigo-400',
              iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
              title: 'Tenant Portal',
              description: 'Give tenants 24/7 access to pay rent, submit requests, and communicate',
              href: '/features/tenant-portal',
            },
            {
              icon: TrendingUp,
              iconColor: 'text-purple-600 dark:text-purple-400',
              iconBg: 'bg-purple-50 dark:bg-purple-500/10',
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
              iconColor: 'text-emerald-600 dark:text-emerald-400',
              iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
              title: 'Maintenance Tracking',
              description: 'Streamline work orders and vendor management',
              href: '/features/maintenance',
            },
            {
              icon: Shield,
              iconColor: 'text-amber-600 dark:text-amber-400',
              iconBg: 'bg-amber-50 dark:bg-amber-500/10',
              title: 'Lease Management',
              description: 'Digital lease signing and automated renewals',
              href: '/features/lease-management',
            },
            {
              icon: Zap,
              iconColor: 'text-rose-600 dark:text-rose-400',
              iconBg: 'bg-rose-50 dark:bg-rose-500/10',
              title: 'Automation',
              description: 'Automate rent collection, reminders, and workflows',
              href: '/features/automation',
            },
          ],
        },
      ],
    },
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

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

  const currentTheme = mounted ? resolvedTheme : 'light';
  const logoSrc = currentTheme === 'dark' ? '/propely-dark.svg' : '/propely-light.svg';

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
              {mounted ? (
                <Image
                  src={logoSrc}
                  alt="Propely"
                  width={120}
                  height={36}
                  className="h-8 w-auto"
                  priority
                />
              ) : (
                <div className="flex items-center gap-2.5 font-semibold text-lg">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-foreground">Propely</span>
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
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all rounded-md ${
                    activeDropdown === 'Features'
                      ? 'text-foreground bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  Features
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'Features' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent/50"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Desktop CTA & Theme Toggle */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
                className="h-9 w-9"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px] p-0">
                  <SheetHeader className="px-6 py-4 border-b">
                    <SheetTitle className="text-left">Menu</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-5rem)]">
                    <div className="px-6 py-6 space-y-4">
                      {/* Mobile Features Section */}
                      <div className="space-y-3">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === 'Features' ? null : 'Features')}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-accent rounded-md transition-colors"
                        >
                          <span>Features</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'Features' ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {activeDropdown === 'Features' && megaMenuItems['Features'] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-3 overflow-hidden"
                            >
                              {/* Mobile Featured Card */}
                              {megaMenuItems['Features'].featured && (
                                <Link
                                  href={megaMenuItems['Features'].featured.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={`block bg-gradient-to-br ${megaMenuItems['Features'].featured.gradient} rounded-lg p-4 border hover:shadow-md transition-all`}
                                >
                                  <div className="flex items-start gap-3">
                                    
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-foreground font-normal mb-1 text-sm">
                                        {megaMenuItems['Features'].featured.title}
                                      </h4>
                                      <p className="text-muted-foreground text-xs mb-2 leading-relaxed line-clamp-2">
                                        {megaMenuItems['Features'].featured.description}
                                      </p>
                                      <span className="text-primary text-xs font-medium inline-flex items-center gap-1.5">
                                        {megaMenuItems['Features'].featured.cta} <ArrowRight className="w-3 h-3" />
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              )}

                              {/* Mobile Dropdown Items */}
                              <div className="space-y-4">
                                {megaMenuItems['Features'].sections.map((section, sectionIdx) => (
                                  <div key={sectionIdx} className="space-y-2">
                                    {section.title && (
                                      <>
                                        {sectionIdx > 0 && <Separator className="my-3" />}
                                        <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
                                          {section.title}
                                        </h5>
                                      </>
                                    )}
                                    <div className="space-y-1">
                                      {section.items.map((dropItem) => {
                                        const Icon = dropItem.icon;
                                        return (
                                          <Link
                                            key={dropItem.title}
                                            href={dropItem.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-accent transition-colors group"
                                          >
                                            <div className="mt-0.5 shrink-0">
                                              <div className={`w-8 h-8 rounded-md ${dropItem.iconBg} flex items-center justify-center`}>
                                                <Icon className={`w-4 h-4 ${dropItem.iconColor}`} />
                                              </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm font-medium text-foreground mb-0.5 group-hover:text-primary transition-colors">
                                                {dropItem.title}
                                              </div>
                                              <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                {dropItem.description}
                                              </div>
                                            </div>
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Separator />

                      {/* Other Nav Links */}
                      <div className="space-y-1">
                        {navLinks.map((link) => (
                          <a
                            key={link.name}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                          >
                            {link.name}
                          </a>
                        ))}
                      </div>

                      <Separator />

                      {/* Mobile CTA Buttons */}
                      <div className="space-y-2 pt-2">
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/sign-in">Sign in</Link>
                        </Button>
                        <Button className="w-full" asChild>
                          <Link href="/sign-up">Get started</Link>
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Desktop Mega Menu Dropdown */}
        <AnimatePresence>
          {activeDropdown === 'Features' && megaMenuItems['Features'] && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            className="hidden md:block absolute left-0 right-0 bg-white/95 dark:bg-[#0a0a0b]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl"
              onMouseEnter={() => handleMouseEnter('Features')}
              onMouseLeave={handleMouseLeave}
            >
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-12 gap-6">
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
                    <div className="grid grid-cols-2 gap-6">
                      {megaMenuItems['Features'].sections.map((section, sectionIdx) => (
                        <div key={sectionIdx}>
                          {section.title && (
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
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
                                  className="flex items-start gap-3 px-3 py-3 hover:bg-accent rounded-lg transition-all duration-200 group border border-transparent hover:border-border"
                                >
                                  <div className="shrink-0 mt-0.5">
                                    <div className={`w-10 h-10 rounded-lg ${dropItem.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                      <Icon className={`w-5 h-5 ${dropItem.iconColor}`} />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {dropItem.title}
                                      </h5>
                                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
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
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}