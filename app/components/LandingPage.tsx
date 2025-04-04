"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import Auth from '@/app/components/Auth';

const LandingPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    // Set loaded state after a short delay for animations
    const timer = setTimeout(() => setIsLoaded(true), 300);
    
    // Track scroll position for parallax effects
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);
  
  // Animation effect
  useEffect(() => {
    setIsLoaded(true);
    controls.start({
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    });
  }, [controls]);

  // Features list with icons
  const features = [
    {
      icon: "🌱",
      title: "Personalized Tracking",
      description: "Track your carbon footprint with personalized insights tailored to your lifestyle."
    },
    {
      icon: "📊",
      title: "Real-time Analytics",
      description: "Monitor your impact with real-time data visualization and actionable insights."
    },
    {
      icon: "🏆",
      title: "Gamified Experience",
      description: "Earn achievements and compete on leaderboards as you reduce your emissions."
    },
    {
      icon: "💡",
      title: "Smart Recommendations",
      description: "Receive intelligent suggestions to reduce your carbon footprint effectively."
    }
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-blue-50 text-slate-800 min-h-screen">
      {/* Background elements */}
      <div className="relative">
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-400/20 to-teal-300/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-emerald-400/10 to-blue-300/10 blur-3xl rounded-full translate-y-1/4 -translate-x-1/4"></div>
        
        {/* Interactive particles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => {
            // Create consistent random values using the index
            const randomWidth = 2 + ((i * 13) % 8);
            const randomHeight = 2 + ((i * 17) % 8);
            const randomLeft = ((i * 7919) % 100);
            const randomTop = ((i * 6971) % 100);
            const randomOpacity = 0.05 + ((i * 2347) % 15) / 100;
            const randomDuration = 20 + ((i * 3967) % 20);
            const randomYMove = ((i * 5113) % 200) - 100;
            const randomXMove = ((i * 4957) % 200) - 100;
            
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full bg-teal-500"
                initial={{ 
                  width: randomWidth, 
                  height: randomHeight,
                  x: 0, 
                  y: 0,
                  opacity: randomOpacity
                }}
                animate={{ 
                  y: [0, randomYMove], 
                  x: [0, randomXMove],
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  duration: randomDuration,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${randomLeft}%`,
                  top: `${randomTop}%`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Header navigation */}
      <header className="py-4 px-6 md:px-12 flex items-center justify-between relative z-10 bg-white/70 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-500">
            EcoTrack
          </span>
        </motion.div>
        
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-center space-x-8"
        >
          <a href="#features" className="text-sm text-slate-700 hover:text-teal-500 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm text-slate-700 hover:text-teal-500 transition-colors">How It Works</a>
          <a href="#about" className="text-sm text-slate-700 hover:text-teal-500 transition-colors">About</a>
          <Link href="/login" className="text-sm px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
            Login
          </Link>
        </motion.nav>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-slate-700 focus:outline-none"
            aria-label="Open Menu"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md p-6 z-50 border-b border-slate-200 md:hidden shadow-lg"
        >
          <div className="flex flex-col space-y-4 py-2">
            <a 
              href="#features" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-sm text-slate-700 hover:text-teal-500 transition-colors py-2"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-sm text-slate-700 hover:text-teal-500 transition-colors py-2"
            >
              How It Works
            </a>
            <a 
              href="#about" 
              onClick={() => setIsMenuOpen(false)} 
              className="text-sm text-slate-700 hover:text-teal-500 transition-colors py-2"
            >
              About
            </a>
            <div className="pt-4 flex flex-col space-y-3">
              <Link 
                href="/login" 
                className="text-sm px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all text-center"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white text-center shadow-md shadow-teal-500/20"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero section */}
      <section className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -50 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6 text-center md:text-left"
            >
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                <span className="block text-slate-800">Smart Insights for a</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-500">
                  Sustainable Future
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 max-w-xl mx-auto md:mx-0">
                Leverage real-time analytics to monitor, reduce, and offset your carbon footprint with our award-winning platform built for the eco-conscious generation.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                <Link href="/signup" className="group">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 rounded-full text-white font-bold shadow-lg shadow-teal-500/20 flex items-center justify-center relative overflow-hidden"
                  >
                    <span className="relative z-10">Get Started — It's Free</span>
                    <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  </motion.button>
                </Link>
                
                <a href="#features">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-8 py-4 border border-slate-300 hover:border-slate-400 bg-white/50 backdrop-blur-sm rounded-full text-slate-700 flex items-center justify-center transition-colors"
                  >
                    Learn More
                  </motion.button>
                </a>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 1, delay: 1 }}
                className="pt-8 flex items-center space-x-4 text-slate-500 justify-center md:justify-start"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Real-time analytics</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-teal-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Personalized insights</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="pt-4 flex items-center justify-center md:justify-start"
              >
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center overflow-hidden">
                      <span className="text-white text-xs font-bold">{String.fromCharCode(65 + i)}</span>
                    </div>
                  ))}
                </div>
                <div className="ml-2 text-sm text-slate-600">
                  <span className="font-semibold">10,000+</span> users reducing their carbon footprint
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="relative flex justify-center"
            >
              {/* 3D-style dashboard mockup */}
              <div className="relative w-full max-w-lg">
                {/* Dashboard frame with shadow */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-xl blur-2xl transform rotate-6 scale-105"></div>
                
                <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                  {/* Dashboard header */}
                  <div className="bg-slate-800 p-4 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-xs text-white/70">EcoTrack Dashboard</div>
                    <div className="text-xs text-white/70">User: demo@ecotrack.io</div>
                  </div>
                  
                  {/* Dashboard content */}
                  <div className="p-4">
                    {/* Carbon footprint overview */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-slate-700 mb-2">Your Carbon Footprint</h3>
                      <div className="flex items-center">
                        <div className="text-2xl font-bold text-teal-500">246</div>
                        <div className="ml-2 text-xs text-slate-500">kg CO₂e this month</div>
                        <div className="ml-auto flex items-center text-green-500 text-xs">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          18% reduction
                        </div>
                      </div>
                    </div>
                    
                    {/* Analytics chart */}
                    <div className="h-32 mb-4 bg-slate-50 rounded-lg overflow-hidden relative">
                      {/* Simulated area chart */}
                      <div className="absolute inset-0">
                        <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                          <defs>
                            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(56, 178, 172, 0.5)" />
                              <stop offset="100%" stopColor="rgba(56, 178, 172, 0)" />
                            </linearGradient>
                          </defs>
                          <path 
                            d="M0,50 Q10,40 20,45 T40,30 T60,40 T80,20 T100,30 V100 H0 Z" 
                            fill="url(#chart-gradient)" 
                          />
                          <path 
                            d="M0,50 Q10,40 20,45 T40,30 T60,40 T80,20 T100,30" 
                            fill="none" 
                            stroke="#38B2AC" 
                            strokeWidth="2"
                          />
                          {/* Data points */}
                          {[0, 20, 40, 60, 80, 100].map((x, i) => {
                            const y = [50, 45, 30, 40, 20, 30][i];
                            return (
                              <circle key={i} cx={x} cy={y} r="2" fill="#38B2AC" />
                            );
                          })}
                        </svg>
                      </div>
                      
                      {/* X-axis labels */}
                      <div className="absolute bottom-0 w-full flex justify-between px-4 text-xs text-slate-400">
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                      </div>
                    </div>
                    
                    {/* Category breakdown */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-700 mb-2">Emission Sources</h3>
                      <div className="space-y-2">
                        {[
                          { name: 'Transport', value: 45, color: 'bg-blue-500' },
                          { name: 'Energy', value: 30, color: 'bg-orange-500' },
                          { name: 'Food', value: 15, color: 'bg-green-500' },
                          { name: 'Other', value: 10, color: 'bg-purple-500' }
                        ].map((category, i) => (
                          <div key={i} className="flex items-center text-xs">
                            <div className="w-20 flex-shrink-0 text-slate-600">{category.name}</div>
                            <div className="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${category.color}`} style={{ width: `${category.value}%` }}></div>
                            </div>
                            <div className="w-10 text-right text-slate-600 ml-2">{category.value}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-20 px-6 md:px-12 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800 mb-4">
              Innovative Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">Intelligent Tracking & Analytics</h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Our cutting-edge platform leverages real-time data and predictive AI to provide accurate insights into your environmental impact.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Real-Time Carbon Tracking",
                description: "Monitor your daily carbon footprint with precise measurements across transportation, home energy, and consumption habits.",
                color: "from-emerald-500 to-teal-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                ),
                title: "Advanced Analytics Dashboard",
                description: "Visualize your environmental impact with interactive charts and insights tailored to your specific lifestyle patterns.",
                color: "from-blue-500 to-indigo-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: "Personalized Recommendations",
                description: "Receive custom strategies to reduce your footprint based on AI analysis of your unique habits and local environment.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Community Challenges",
                description: "Join eco-challenges with friends and other users to multiply your impact through collaborative sustainability efforts.",
                color: "from-amber-500 to-orange-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-xl p-6 border border-slate-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-100 relative overflow-hidden group"
              >
                {/* Feature card background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Icon with gradient background */}
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4 relative z-10">
                  {feature.icon}
                </div>
                
                <h3 className="text-xl font-bold mb-2 text-slate-800 relative z-10">{feature.title}</h3>
                <p className="text-slate-600 relative z-10">{feature.description}</p>
                
                {/* Decorative corner accent */}
                <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-tl opacity-10 rounded-tl-3xl"></div>
              </motion.div>
            ))}
          </div>
          
          {/* Interactive feature highlight - Animated stat */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-20 bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12"
          >
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-1 bg-gradient-to-b from-teal-500 to-blue-500 rounded-full mr-4"></div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-800">Transform Data Into Action</h3>
                </div>
                <p className="text-slate-600 mb-6">
                  Our platform doesn't just track your carbon footprint—it transforms complex environmental data into 
                  clear, actionable insights that make sustainable living intuitive and measurable.
                </p>
                <ul className="space-y-3">
                  {['Predictive trend analysis', 'Actionable reduction strategies', 'Progress tracking & gamification'].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <div className="mt-1 mr-3 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hidden md:block">
                <div className="bg-slate-50 rounded-xl p-6 relative">
                  {/* Analytics visualization */}
                  <div className="flex justify-between items-end h-40 mb-4">
                    {[35, 65, 45, 80, 55, 70, 90].map((height, i) => (
                      <div key={i} className="w-6 rounded-t-md bg-gradient-to-t from-teal-500 to-blue-500" style={{ height: `${height}%` }}></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                  
                  {/* Performance indicator */}
                  <div className="absolute top-4 right-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      28% Improvement
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-4">
              Streamlined Process
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
              Simple Steps to Sustainable Living
            </h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Start your sustainability journey with our intuitive, data-driven approach to environmental impact tracking.
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-slate-200"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ),
                  title: "Create Your Profile",
                  description: "Sign up in seconds and customize your account with relevant information about your lifestyle and consumption patterns."
                },
                {
                  icon: (
                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                  title: "Track Your Activities",
                  description: "Connect your devices, input your energy usage, or track your travel to automatically calculate your carbon footprint."
                },
                {
                  icon: (
                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  ),
                  title: "Get Personalized Insights",
                  description: "Receive AI-driven recommendations and visualize your impact over time with our intuitive analytics dashboard."
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative text-center flex flex-col items-center"
                >
                  {/* Step number */}
                  <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-xl font-bold text-blue-600 mb-6 relative z-10 border-4 border-white">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-5">
                    {step.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-slate-800">{step.title}</h3>
                  <p className="text-slate-600 max-w-xs mx-auto">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* The platform demo section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="mt-24 bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-0 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-0 items-center">
              <div className="p-6 md:p-12">
                <div className="inline-block rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800 mb-6">
                  Intuitive Design
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-slate-800">
                  Designed for Real People, Not Just Data Scientists
                </h3>
                <p className="text-slate-600 mb-8">
                  Our platform turns complex environmental metrics into intuitive visualizations that anyone can understand and act upon.
                </p>
                <Link href="/signup" className="inline-flex items-center group">
                  <span className="text-teal-600 font-medium group-hover:text-teal-700 transition-colors">
                    Try it for free 
                  </span>
                  <svg className="ml-2 w-5 h-5 text-teal-600 group-hover:text-teal-700 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
              
              <div className="bg-gradient-to-tr from-blue-50 to-teal-50 p-6 md:p-8 h-full flex items-center">
                {/* Mobile app mockup */}
                <div className="mx-auto max-w-xs relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-teal-500/20 rounded-3xl blur-2xl transform rotate-3 scale-105"></div>
                  <div className="relative bg-slate-800 rounded-3xl overflow-hidden border-8 border-slate-700 shadow-xl">
                    <div className="p-2">
                      {/* App header */}
                      <div className="bg-slate-700 rounded-t-xl p-3 flex items-center justify-between">
                        <div className="text-xs text-white font-medium">EcoTrack Mobile</div>
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                        </div>
                      </div>
                      
                      {/* App content */}
                      <div className="bg-white rounded-b-xl p-3">
                        {/* Simplified dashboard */}
                        <h4 className="text-xs font-medium text-slate-800 mb-2">My Footprint</h4>
                        
                        {/* Circular progress */}
                        <div className="w-20 h-20 mx-auto mb-3 rounded-full border-8 border-teal-100 flex items-center justify-center">
                          <div className="text-sm font-bold text-teal-600">-12%</div>
                        </div>
                        
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-slate-100 rounded p-2 text-center">
                            <div className="text-xs text-slate-500">This Week</div>
                            <div className="text-sm font-bold text-slate-800">32kg</div>
                          </div>
                          <div className="bg-slate-100 rounded p-2 text-center">
                            <div className="text-xs text-slate-500">Goal</div>
                            <div className="text-sm font-bold text-slate-800">28kg</div>
                          </div>
                        </div>
                        
                        {/* Activity feed */}
                        <div className="text-xs font-medium text-slate-800 mb-1">Recent Activity</div>
                        <div className="space-y-1.5">
                          {[
                            "Car trip: 5km (+1.2kg CO₂e)",
                            "Energy saved: 2.4kWh (-0.8kg CO₂e)",
                            "Meal logged: Vegetarian (-1.5kg CO₂e)"
                          ].map((activity, i) => (
                            <div key={i} className="text-xs bg-slate-50 p-1.5 rounded">
                              {activity}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 md:px-12 relative bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 mb-4">
              User Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">
              Trusted by Forward-Thinking Individuals
            </h2>
            <p className="text-lg text-slate-600 max-w-xl mx-auto">
              Join thousands of environmentally conscious users who are already making a measurable difference with EcoTrack.
            </p>
          </motion.div>
          
          {/* Testimonial cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "EcoTrack has transformed how I think about my daily choices. The data visualization makes it so easy to see my impact and make better decisions.",
                name: "Emma C.",
                title: "Marketing Director",
                image: "/images/testimonial-1.jpg"
              },
              {
                quote: "I've tried several carbon footprint calculators, but EcoTrack is by far the most comprehensive and user-friendly. The insights are incredibly valuable.",
                name: "Michael T.",
                title: "Software Engineer",
                image: "/images/testimonial-2.jpg"
              },
              {
                quote: "The device tracking feature is amazing! I can finally see which appliances use the most energy and make informed decisions about upgrades.",
                name: "Sarah L.",
                title: "Environmental Scientist",
                image: "/images/testimonial-3.jpg"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-xl border border-slate-100 relative"
              >
                {/* Quote icon */}
                <div className="absolute top-6 right-6 text-slate-100">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 20H7.5C6.12 20 5 18.88 5 17.5V12.5C5 11.12 6.12 10 7.5 10H12.5C13.88 10 15 11.12 15 12.5V17.5C15 18.88 13.88 20 12.5 20ZM30 20H25C23.62 20 22.5 18.88 22.5 17.5V12.5C22.5 11.12 23.62 10 25 10H30C31.38 10 32.5 11.12 32.5 12.5V17.5C32.5 18.88 31.38 20 30 20ZM12.5 37.5H7.5C6.12 37.5 5 36.38 5 35V30C5 28.62 6.12 27.5 7.5 27.5H12.5C13.88 27.5 15 28.62 15 30V35C15 36.38 13.88 37.5 12.5 37.5ZM30 37.5H25C23.62 37.5 22.5 36.38 22.5 35V30C22.5 28.62 23.62 27.5 25 27.5H30C31.38 27.5 32.5 28.62 32.5 30V35C32.5 36.38 31.38 37.5 30 37.5Z" fill="currentColor"/>
                  </svg>
                </div>
                
                {/* Rating stars */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-slate-700 mb-6 relative z-10">"{testimonial.quote}"</p>
                
                {/* User info */}
                <div className="flex items-center">
                  {/* Avatar (fallback if image doesn't load) */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                    <p className="text-sm text-slate-600">{testimonial.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Metrics row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {[
              { value: "10,000+", label: "Active Users" },
              { value: "25%", label: "Average Reduction" },
              { value: "500,000", label: "kg CO₂e Saved" },
              { value: "4.9/5", label: "User Rating" }
            ].map((stat, index) => (
              <div key={index} className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white">
                <div className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
          
          {/* Trust badges */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-70"
          >
            {["Carbon Trust", "Climate Neutral", "Green Business", "Eco Certified", "Energy Star"].map((badge, i) => (
              <div key={i} className="flex items-center">
                <div className="w-6 h-6 bg-slate-400 rounded-full mr-2"></div>
                <span className="text-slate-600 font-medium">{badge}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12 relative bg-gradient-to-b from-blue-50 to-slate-50">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-12 border border-slate-100 text-center relative overflow-hidden"
          >
            {/* Background gradient accent */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full opacity-70"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full opacity-70"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 mb-6">
                Start Today
              </div>
              
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-slate-800">
                Ready to Reduce Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-500">Environmental Impact?</span>
              </h2>
              
              <p className="text-slate-600 max-w-2xl mx-auto mb-8">
                Join thousands of environmentally conscious individuals already using EcoTrack to track, analyze, and reduce their carbon footprint.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/signup">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 rounded-full text-white font-bold shadow-lg shadow-teal-500/20 w-full sm:w-auto"
                  >
                    Get Started For Free
                  </motion.button>
                </Link>
                
                <Link href="/login">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 md:px-8 py-3 md:py-4 border border-slate-200 hover:border-slate-300 bg-white rounded-full text-slate-700 font-medium w-full sm:w-auto"
                  >
                    Login to Dashboard
                  </motion.button>
                </Link>
              </div>
              
              <p className="mt-6 text-sm text-slate-500">
                No credit card required • Free plan available • Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4">
            <div className="col-span-1 md:col-span-1">
              <h4 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-500">EcoTrack</h4>
              <p className="text-sm text-slate-600 mb-4">
                Making carbon footprint tracking accessible and actionable for everyone.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                  <a key={social} href="#" className="text-slate-400 hover:text-teal-500 transition-colors">
                    <span className="sr-only">{social}</span>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="text-sm">{social[0].toUpperCase()}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Integrations", "Pricing", "Changelog"]
              },
              {
                title: "Resources",
                links: ["Blog", "Documentation", "Guides", "Help Center"]
              },
              {
                title: "Company",
                links: ["About", "Careers", "Contact", "Privacy"]
              }
            ].map((column, index) => (
              <div key={index} className="col-span-1">
                <h4 className="font-semibold mb-4 text-slate-800">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-sm text-slate-600 hover:text-teal-500 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} EcoTrack. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex flex-wrap justify-center gap-4 md:gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-teal-500 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-slate-500 hover:text-teal-500 transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-slate-500 hover:text-teal-500 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Global styles */}
      <style jsx global>{`
        @keyframes sparkle {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage; 