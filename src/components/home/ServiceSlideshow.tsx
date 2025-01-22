'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const services = [
  {
    id: 1,
    title: 'Professional Photography',
    description: 'Capture your special moments with our expert photographers',
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e',
    category: 'Photography',
  },
  {
    id: 2,
    title: 'Personal Training',
    description: 'Achieve your fitness goals with personalized training sessions',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
    category: 'Fitness',
  },
  {
    id: 3,
    title: 'Home Cleaning',
    description: 'Professional cleaning services for your home',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
    category: 'Home Services',
  },
  {
    id: 4,
    title: 'Beauty & Wellness',
    description: 'Pamper yourself with our beauty and wellness services',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8',
    category: 'Beauty',
  },
  {
    id: 5,
    title: 'Event Planning',
    description: 'Make your events memorable with our planning services',
    image: 'https://images.unsplash.com/photo-1511795409834-432e51f83065',
    category: 'Events',
  },
];

export function ServiceSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % services.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <div 
      className="relative h-[600px] w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div className="relative h-full w-full">
            <Image
              src={`${services[currentIndex].image}?auto=format&fit=crop&w=1920&q=80`}
              alt={services[currentIndex].title}
              fill
              className="object-cover"
              priority={currentIndex === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 md:p-16"
            >
              <div className="max-w-7xl mx-auto">
                <span className="inline-block px-3 py-1 mb-4 text-sm font-medium text-white bg-primary/80 rounded-full">
                  {services[currentIndex].category}
                </span>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white">
                  {services[currentIndex].title}
                </h2>
                <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl">
                  {services[currentIndex].description}
                </p>
                <Link
                  href={`/services?category=${services[currentIndex].category}`}
                  className="inline-flex items-center px-6 py-3 text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
        {services.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-8' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute top-1/2 transform -translate-y-1/2 flex justify-between w-full px-4 z-10">
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + services.length) % services.length)}
          className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % services.length)}
          className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
