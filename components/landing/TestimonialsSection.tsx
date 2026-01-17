/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from 'react';
import { Star, Quote, GripVertical } from 'lucide-react';

const initialTestimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Property Manager",
    company: "Metro Properties",
    rating: 5,
    content: "This platform has transformed how I manage my 15 properties. The automated rent collection alone saves me hours every month. Highly recommend!",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800/50"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Landlord",
    company: "8 Units",
    rating: 5,
    content: "The maintenance tracking feature is a game-changer. My tenants submit requests through the app, and I can assign vendors instantly. Everything is organized in one place.",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800/50"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Real Estate Investor",
    company: "12 Properties",
    rating: 5,
    content: "Financial reporting is incredibly detailed. I can see exactly where every dollar goes and generate tax reports in seconds. Worth every penny!",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-pink-200 dark:border-pink-800/50"
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Property Owner",
    company: "5 Units",
    rating: 5,
    content: "The tenant portal has reduced my workload significantly. Tenants can pay rent, view documents, and communicate all in one place. No more back-and-forth emails!",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800/50"
  },
  {
    id: 5,
    name: "Lisa Martinez",
    role: "Portfolio Manager",
    company: "20+ Properties",
    rating: 5,
    content: "Switched from another platform and couldn't be happier. The interface is intuitive, and the customer support team is incredibly responsive. Best decision I've made!",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800/50"
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Landlord",
    company: "3 Properties",
    rating: 5,
    content: "As a first-time landlord, this platform made everything so easy. The lease templates and automated reminders ensure I never miss important dates.",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-teal-200 dark:border-teal-800/50"
  }
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [draggedItem, setDraggedItem] = useState<number | null>(null); // ✅ Fixed type
  const [dragOverItem, setDragOverItem] = useState<number | null>(null); // ✅ Fixed type

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => { // ✅ Fixed parameter type
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => { // ✅ Fixed parameter type
    e.preventDefault();
    setDragOverItem(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { // ✅ Fixed parameter type
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    const newTestimonials = [...testimonials];
    const draggedContent = newTestimonials[draggedItem];
    
    newTestimonials.splice(draggedItem, 1);
    newTestimonials.splice(dropIndex, 0, draggedContent);
    
    setTestimonials(newTestimonials);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <section id='testimonials' className="py-20 relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-[#0a0a0b] dark:to-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-200/20 dark:bg-pink-600/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container relative z-10 px-4 mx-auto max-w-6xl">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight text-slate-900 dark:text-white mb-4">
            Loved by{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Property Managers
            </span>
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            See what landlords and property managers are saying about our platform
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2 flex items-center justify-center gap-2">
            <GripVertical className="w-4 h-4" />
            Drag cards to reorder
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`group cursor-move transition-all duration-200 ${
                draggedItem === index ? 'opacity-50 scale-95' : ''
              } ${
                dragOverItem === index && draggedItem !== index ? 'scale-105' : ''
              }`}
            >
              <div className={`relative rounded-3xl ${testimonial.bgColor} p-8 h-full flex flex-col border ${testimonial.borderColor} transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-purple-900/20`}>
                
                {/* Drag handle indicator */}
                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-50 transition-opacity">
                  <GripVertical className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                </div>

                {/* Quote icon */}
                <div className="absolute top-6 right-6 opacity-10 dark:opacity-20">
                  <Quote className="w-12 h-12 text-slate-900 dark:text-white" />
                </div>

                {/* Rating stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Testimonial content */}
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-6 flex-1 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author info */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {testimonial.role} • {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}