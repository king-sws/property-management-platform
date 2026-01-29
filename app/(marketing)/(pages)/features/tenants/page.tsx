'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, UserCheck, FileText, CreditCard, MessageSquare, Bell, Shield, CheckCircle, ClipboardCheck, Search, ArrowRight, Star, Clock, DollarSign, FileSearch, Mail } from 'lucide-react';

const TenantManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'screening' | 'management' | 'communication'>('screening');

  const screeningSteps = [
    {
      step: '01',
      title: 'Application Submitted',
      description: 'Tenant completes your custom application form',
      icon: <FileText className="w-5 h-5" />
    },
    {
      step: '02',
      title: 'Instant Screening',
      description: 'Background check, credit report, and employment verification run automatically',
      icon: <Search className="w-5 h-5" />
    },
    {
      step: '03',
      title: 'Review & Decide',
      description: 'Get comprehensive report with recommendation score',
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      step: '04',
      title: 'Approve & Onboard',
      description: 'Send lease agreement and collect deposit digitally',
      icon: <UserCheck className="w-5 h-5" />
    },
  ];

  const tabContent = {
    screening: {
      title: 'Comprehensive Tenant Screening',
      description: 'Make confident decisions with thorough background checks, credit reports, and employment verification—all in minutes.',
      features: [
        { icon: <FileSearch className="w-5 h-5" />, text: 'National criminal background checks' },
        { icon: <CreditCard className="w-5 h-5" />, text: 'Credit reports from all major bureaus' },
        { icon: <CheckCircle className="w-5 h-5" />, text: 'Employment & income verification' },
        { icon: <FileText className="w-5 h-5" />, text: 'Previous landlord references' },
      ]
    },
    management: {
      title: 'Effortless Tenant Management',
      description: 'Track leases, collect rent, and manage renewals automatically with smart automation tools.',
      features: [
        { icon: <CreditCard className="w-5 h-5" />, text: 'Automated rent collection & tracking' },
        { icon: <Bell className="w-5 h-5" />, text: 'Lease renewal reminders' },
        { icon: <FileText className="w-5 h-5" />, text: 'Digital lease agreements with e-signatures' },
        { icon: <DollarSign className="w-5 h-5" />, text: 'Late fee automation & payment plans' },
      ]
    },
    communication: {
      title: 'Centralized Communication Hub',
      description: 'Keep all tenant communications organized in one place with automated notifications and messaging.',
      features: [
        { icon: <MessageSquare className="w-5 h-5" />, text: 'In-app messaging with conversation threading' },
        { icon: <Mail className="w-5 h-5" />, text: 'Automated email & SMS notifications' },
        { icon: <Bell className="w-5 h-5" />, text: 'Maintenance request tracking' },
        { icon: <Clock className="w-5 h-5" />, text: 'Message history & archives' },
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header Section */}
      <section className="relative w-full border-b border-border bg-gradient-to-b from-muted/50 to-transparent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Tenant Management</span>
            </div>
            
            <h1 className="font-display font-medium text-pretty text-4xl tracking-tighter md:text-5xl mb-6">
              Screen, Manage, and Communicate with Tenants
            </h1>
            
            <p className="text-[#b4b4b5] text-lg md:text-xl mb-8 max-w-3xl">
              Everything you need to find great tenants and maintain positive relationships throughout their lease.
            </p>

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">10,000+ screenings completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-muted-foreground">98% on-time payment rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-muted-foreground">Average 2-day screening time</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-3 mb-12 max-w-2xl mx-auto justify-center">
            <button
              onClick={() => setActiveTab('screening')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'screening'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Screening
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'management'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Management
            </button>
            <button
              onClick={() => setActiveTab('communication')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'communication'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Communication
            </button>
          </div>

          {/* Tab Content */}
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">
                  {tabContent[activeTab].title}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {tabContent[activeTab].description}
                </p>
                
                <div className="space-y-4 pt-4">
                  {tabContent[activeTab].features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        {feature.icon}
                      </div>
                      <p className="text-foreground pt-1">{feature.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-border rounded-2xl p-8 lg:sticky lg:top-8">
                <div className="aspect-square bg-muted/50 rounded-xl flex items-center justify-center mb-6">
                  {activeTab === 'screening' && <UserCheck className="w-24 h-24 text-primary" />}
                  {activeTab === 'management' && <ClipboardCheck className="w-24 h-24 text-primary" />}
                  {activeTab === 'communication' && <MessageSquare className="w-24 h-24 text-primary" />}
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {activeTab === 'screening' && 'Complete in 48 Hours'}
                  {activeTab === 'management' && 'Automate Everything'}
                  {activeTab === 'communication' && 'Stay Connected'}
                </h3>
                
                <p className="text-muted-foreground mb-6">
                  {activeTab === 'screening' && 'From application to approval, screen tenants thoroughly in less than 2 days with automated checks.'}
                  {activeTab === 'management' && 'Set it and forget it. Rent collection, late fees, and lease renewals happen automatically.'}
                  {activeTab === 'communication' && 'Every conversation, request, and notification in one organized inbox.'}
                </p>

                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors w-full"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screening Process Timeline */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How Tenant Screening Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A simple, automated process that saves you time and reduces risk
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {screeningSteps.map((step, index) => (
              <div key={index} className="relative flex gap-6 pb-12 last:pb-0">
                {/* Timeline line */}
                {index !== screeningSteps.length - 1 && (
                  <div className="absolute left-6 top-14 w-0.5 h-full bg-border"></div>
                )}
                
                {/* Step number */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {step.icon}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-border rounded-xl p-6">
              <div className="text-4xl font-bold text-foreground mb-2">10,000+</div>
              <div className="text-muted-foreground">Tenants Screened</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-border rounded-xl p-6">
              <div className="text-4xl font-bold text-foreground mb-2">48hrs</div>
              <div className="text-muted-foreground">Average Screening Time</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-border rounded-xl p-6">
              <div className="text-4xl font-bold text-foreground mb-2">98%</div>
              <div className="text-muted-foreground">On-Time Payment Rate</div>
            </div>
            <div className="bg-gradient-to-br from-pink-500/10 to-transparent border border-border rounded-xl p-6">
              <div className="text-4xl font-bold text-foreground mb-2">4.9/5</div>
              <div className="text-muted-foreground flex items-center gap-1">
                Tenant Satisfaction
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA - Minimal */}
      <section className="py-16 md:py-20 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to find better tenants?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Start screening applicants and managing tenants today
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TenantManagementPage;