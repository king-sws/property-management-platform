"use client";

import React from 'react';
import { 
  Building2, 
  Users, 
  Wrench, 
  DollarSign, 
  BarChart3,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: Building2,
    title: "Multi-Property Management",
    description: "Manage unlimited properties and units from a single dashboard with real-time updates and instant notifications.",
    bgColor: "bg-[#e3f2fd] dark:bg-blue-950/30",
    titleColor: "text-blue-900 dark:text-blue-300",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    arrowColor: "text-blue-500 dark:text-blue-400"
  },
  {
    icon: Users,
    title: "Tenant Portal",
    description: "Empower tenants with self-service access to pay rent, submit requests, and view documents 24/7.",
    bgColor: "bg-[#f3e5f5] dark:bg-purple-950/30",
    titleColor: "text-purple-900 dark:text-purple-300",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    arrowColor: "text-purple-500 dark:text-purple-400"
  },
  {
    icon: DollarSign,
    title: "Automated Rent Collection",
    description: "Accept payments via ACH, cards, and track rent automatically with smart payment reminders.",
    bgColor: "bg-[#e8f5e9] dark:bg-green-950/30",
    titleColor: "text-green-900 dark:text-green-300",
    badgeColor: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
    arrowColor: "text-green-500 dark:text-green-400"
  },
  {
    icon: Wrench,
    title: "Maintenance Tracking",
    description: "Track tickets, assign vendors, schedule appointments, and manage work orders in real-time.",
    bgColor: "bg-[#fff3e0] dark:bg-orange-950/30",
    titleColor: "text-orange-900 dark:text-orange-300",
    badgeColor: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    arrowColor: "text-orange-500 dark:text-orange-400"
  },
  {
    icon: BarChart3,
    title: "Financial Reporting",
    description: "Generate income statements, expense reports, and tax documents with comprehensive analytics.",
    bgColor: "bg-[#e0f2f1] dark:bg-teal-950/30",
    titleColor: "text-teal-900 dark:text-teal-300",
    badgeColor: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
    arrowColor: "text-teal-500 dark:text-teal-400"
  },
  {
    icon: Zap,
    title: "Automated Workflows",
    description: "Set up automatic late fees, rent reminders, lease renewals, and custom notifications effortlessly.",
    bgColor: "bg-[#fffde7] dark:bg-yellow-950/30",
    titleColor: "text-yellow-900 dark:text-yellow-300",
    badgeColor: "bg-yellow-600/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
    arrowColor: "text-yellow-600 dark:text-yellow-400"
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-14 relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-[#0a0a0b] dark:to-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-200/20 dark:bg-cyan-600/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container relative z-10 px-4 mx-auto max-w-6xl">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight text-slate-900 dark:text-white">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <a 
                key={feature.title} 
                href="#" 
                className="group relative block overflow-hidden"
              >
                <div className={`relative rounded-3xl ${feature.bgColor} p-8 min-h-[280px] transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-purple-900/20 border border-transparent dark:border-slate-800/50`}>
                  
                  {/* Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${feature.badgeColor} text-xs font-bold mb-4`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    Featured
                  </div>

                  {/* Title with unique color */}
                  <h3 className={`text-2xl font-semibold ${feature.titleColor} dark:text-white mb-3`}>
                    {feature.title}
                  </h3>

                  {/* Description - gray text */}
                  <p className="text-sm text-gray-600 dark:text-slate-400 font-normal leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover arrow */}
                  <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                    <ArrowRight className={`w-5 h-5 ${feature.arrowColor}`} />
                  </div>

                </div>
              </a>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-600 dark:text-slate-400">
            Want to see more?{' '}
            <a href="#" className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">
              View all features →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}