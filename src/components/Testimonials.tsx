import { motion } from 'motion/react';
import { Quote, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTestimonials(docs);
      setIsLoading(false);
    }, () => setIsLoading(false));
    return unsub;
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials]);

  if (isLoading) {
    return (
      <section id="testimonials" className="py-24 relative overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/30 font-display font-medium">Loading Reviews...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/3">
            <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-brand-pink mb-4">Reviews</h2>
            <h3 className="font-display font-bold leading-tight mb-6 testimonials-title">What My <span className="text-gradient">Clients</span> Say</h3>
            <p className="text-white/40 leading-relaxed mb-8">
              User satisfaction is at the core of my work. Here is what some of my recent clients have to say about our collaborations.
            </p>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-12 bg-brand-pink' : 'w-4 bg-white/20'}`}
                />
              ))}
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <div className="relative min-h-[400px] md:h-[400px]">
              {testimonials.map((t, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: activeIndex === idx ? 1 : 0, 
                    x: activeIndex === idx ? 0 : 20,
                    scale: activeIndex === idx ? 1 : 0.98,
                    display: activeIndex === idx ? 'flex' : 'none'
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`md:absolute inset-0 glass p-8 md:p-12 rounded-[2rem] border border-white/5 flex flex-col justify-between gap-8 ${activeIndex === idx ? 'z-20 relative' : 'z-10 pointer-events-none'}`}
                >
                  <div className="flex flex-col gap-6">
                    <div className="text-brand-pink">
                      <Quote size={40} className="md:w-12 md:h-12" fill="currentColor" opacity="0.2" />
                    </div>
                    <p className="text-lg md:text-2xl text-white/90 font-medium italic leading-relaxed testimonials-text">
                      "{t.content}"
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <img src={t.image} alt={t.name} className="w-12 h-12 md:w-16 md:h-16 rounded-2xl border border-white/10 object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="text-base md:text-lg font-bold">{t.name}</h4>
                        <p className="text-xs md:text-sm text-white/40">{t.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className="md:w-[18px] md:h-[18px]" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
