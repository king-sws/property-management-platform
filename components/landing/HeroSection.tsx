"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Star, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";

function WordSwitcher({ words, index }: { words: string[]; index: number }) {
  return (
    <span className="relative inline-block align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ 
            opacity: 0, 
            y: 20,
            filter: "blur(8px)",
            scale: 0.95
          }}
          animate={{ 
            opacity: 1, 
            y: 0,
            filter: "blur(0px)",
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            y: -20,
            filter: "blur(8px)",
            scale: 0.95
          }}
          transition={{ 
            duration: 0.6,
            ease: [0.23, 1, 0.32, 1],
            opacity: { duration: 0.4 },
            filter: { duration: 0.4 }
          }}
          className="inline-block relative"
        >
          <span className="relative inline-block">
            {/* Background glow effect */}
            <span 
              className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 blur-xl opacity-30 dark:opacity-20"
              aria-hidden="true"
            />
            
            {/* Main gradient text */}
            <span className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent font-normal whitespace-nowrap">
              {words[index]}
            </span>
            
            {/* Animated underline */}
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: 0.2,
                ease: [0.23, 1, 0.32, 1]
              }}
              className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-cyan-500/40 rounded-full origin-left"
            />
          </span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function HeroSection() {
  const WORDS = ["properties", "tenants", "maintenance", "rent collection"];
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORDS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-10 overflow-hidden">
      {/* Dynamic Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20 dark:from-gray-950 dark:via-[#0a0a0b] dark:to-purple-950/20" />
        
        {/* Animated mesh gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-300/25 to-purple-300/20 dark:from-cyan-700/15 dark:to-purple-800/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-pink-300/20 to-purple-300/20 dark:from-pink-600/10 dark:to-purple-600/10 rounded-full blur-3xl" />
        </div>

        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-6 max-w-7xl py-10 lg:py-20">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className="text-center"
        >
          {/* Trust Badges */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            {[
              {
                icon: <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
                text: "Enterprise-grade security"
              },
              {
                icon: <Zap className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />,
                text: "Trusted by 1,000+ property owners"
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 text-sm border border-[#222]/10  px-3 py-1 rounded-lg dark:border-slate-700/60
                ${idx < 2 ? "hidden lg:flex" : ""}`}
              >
                <span className="text-slate-500 dark:text-slate-400">
                  {item.icon}
                </span>

                <span className="font-normal text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {item.text}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Headline */}
          <motion.div variants={itemVariants} className="max-w-5xl mx-auto mb-8">
            <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal text-[#1a1a2e] dark:text-white leading-[1.1] tracking-tight">
              Manage your business, not your <WordSwitcher words={WORDS} index={index} />
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-[14px] sm:text-lg text-slate-700/80 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12"
          >
            Streamline property management with automation, smart analytics, and tenant communication tools designed for modern landlords.
          </motion.p>

          {/* CTA */}
          <motion.div 
  variants={itemVariants}
  className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16"
>
  <Button
    size="lg"
    className="
      w-full sm:w-auto
      min-w-[200px] sm:min-w-[220px]
      group relative overflow-hidden rounded-lg
      bg-gradient-to-br from-purple-600 to-pink-600
      dark:from-purple-500 dark:to-pink-500
      px-6 sm:px-10 py-3 sm:py-6
      text-sm sm:text-base font-medium text-white
      shadow-xl
      hover:from-purple-700 hover:to-pink-700
      transition-all duration-300 ease-in-out
    "
    asChild
  >
    <Link href="/sign-up" className="flex items-center justify-center gap-2">
      Start Free Trial
      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  </Button>

  <Button
    size="lg"
    variant="outline"
    className="
      w-full sm:w-auto
      min-w-[200px] sm:min-w-[220px]
      px-6 sm:px-10 py-3 sm:py-6
      text-sm sm:text-base
      bg-white/60 dark:bg-white/5 backdrop-blur-sm
      border-slate-200 dark:border-slate-700
      hover:bg-white dark:hover:bg-white/10
    "
    asChild
  >
    <Link href="/#features" className="flex items-center justify-center">
      See How It Works
    </Link>
  </Button>
</motion.div>


          {/* Stats */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { number: "10K+", label: "Properties Managed" },
              { number: "Always on", label: "Reliable platform access" },
              { number: "$2M+", label: "Rent Collected Monthly" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-semibold text-[#1a1a2e] dark:text-white mb-1">{stat.number}</div>
                <div className="text-[12px] text-slate-700/70 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom divider line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 dark:via-gray-700 to-transparent" />
    </section>
  );
}