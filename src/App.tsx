/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Testimonials from './components/Testimonials';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import DynamicSection from './components/DynamicSection';
import FeaturedPages from './components/FeaturedPages';
import { motion, useScroll, useSpring } from 'motion/react';
import React, { useEffect, useState, Component } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { useAuth } from './hooks/useAuth';
import AdminDashboard from './admin/Dashboard';
import LoginPage from './admin/LoginPage';
import PortfolioPage from './pages/PortfolioPage';
import BlogPage from './pages/BlogPage';
import BlogPost from './pages/BlogPost';
import ElementPage from './pages/ElementPage';
import SectionPage from './pages/SectionPage';
import DynamicPage from './pages/DynamicPage';
import CustomStyles from './components/CustomStyles';

function MainSite() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [isLoading, setIsLoading] = useState(true);
  const [dynamicSections, setDynamicSections] = useState<any[]>([]);
  const [sectionConfig, setSectionConfig] = useState<any>(null);

  useEffect(() => {
    // We'll track how many critical configs have loaded
    let loadedCount = 0;
    const totalCritical = 2; // customSections and sectionConfig

    const q = query(
      collection(db, 'customSections'), 
      orderBy('order', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const allSections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDynamicSections(allSections.filter((s: any) => s.isPublished && s.showInHome));
      
      loadedCount++;
      if (loadedCount >= totalCritical) setIsLoading(false);
    }, () => {
      loadedCount++;
      if (loadedCount >= totalCritical) setIsLoading(false);
    });

    const configUnsub = onSnapshot(doc(db, 'config', 'sections'), (snapshot) => {
      if (snapshot.exists()) {
        setSectionConfig(snapshot.data());
      } else {
        setSectionConfig({
          about: true,
          services: true,
          portfolio: true,
          testimonials: true,
          blog: true,
          contact: true
        });
      }
      loadedCount++;
      if (loadedCount >= totalCritical) setIsLoading(false);
    }, () => {
      loadedCount++;
      if (loadedCount >= totalCritical) setIsLoading(false);
    });

    return () => {
      unsub();
      configUnsub();
    };
  }, []);

  if (isLoading || !sectionConfig) {
    return (
      <div className="h-screen w-full bg-dark-surface flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 bg-gradient rounded-full animate-ping opacity-20" />
          <h1 className="text-2xl font-display font-bold tracking-[0.4em] uppercase text-gradient">
            Loading...
          </h1>
        </motion.div>
      </div>
    );
  }

  const renderDynamicSections = (position: string) => {
    return (
      <>
        {sectionConfig.featuredPages !== false && (sectionConfig.featuredPagesPosition === position || (!sectionConfig.featuredPagesPosition && position === 'after-hero')) && <FeaturedPages />}
        {dynamicSections
          .filter((s: any) => s.position === position || (!s.position && position === 'after-portfolio'))
          .map(section => (
            <DynamicSection key={section.id} section={section} />
          ))}
      </>
    );
  };

  return (
    <div className="bg-dark-surface min-h-screen selection:bg-brand-pink relative overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient z-[60] origin-left"
        style={{ scaleX }}
      />

      <Navbar />
      
      {/* Background Glows System - Contained to prevent overflow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10">
        <Hero />
        {renderDynamicSections('after-hero')}
        
        {sectionConfig.about !== false && <About />}
        {renderDynamicSections('after-about')}
        
        {sectionConfig.services !== false && <Services />}
        {renderDynamicSections('after-services')}
        
        {sectionConfig.portfolio !== false && <Portfolio />}
        {renderDynamicSections('after-portfolio')}
        
        {sectionConfig.testimonials !== false && <Testimonials />}
        {renderDynamicSections('after-testimonials')}
        
        {sectionConfig.blog !== false && <Blog />}
        {renderDynamicSections('after-blog')}
        
        {sectionConfig.contact !== false && <Contact />}
      </main>

      <Footer />
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen w-full bg-dark-surface flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-pink" />
    </div>
  );
  
  // Checking for specific admin email for security
  const isAdmin = user && user.email === 'mehrabhossain211@gmail.com';
  
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <CustomStyles />
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/element/:id" element={<ElementPage />} />
        <Route path="/section/:slug" element={<SectionPage />} />
        <Route path="/page/:slug" element={<DynamicPage />} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route 
          path="/admin/*" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
