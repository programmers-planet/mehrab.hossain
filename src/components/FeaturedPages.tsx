import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Globe, ArrowRight, Layout } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function FeaturedPages() {
  const [featuredPages, setFeaturedPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'dynamicPages'),
      where('isPublished', '==', true),
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(6)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setFeaturedPages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (!loading && featuredPages.length === 0) return null;

  return (
    <section className="py-24 relative overflow-hidden" id="featured-stories">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="space-y-4">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               className="flex items-center gap-3 text-brand-pink"
            >
              <div className="w-12 h-[2px] bg-brand-pink" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Editorial Feed</span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
              Featured <span className="text-gradient">Spotlight</span>
            </h2>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-gray-500 text-xs font-bold uppercase tracking-widest max-w-sm text-right leading-relaxed"
          >
            A curated selection of our most impactful stories, custom experiences, and digital launches.
          </motion.p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[400px] rounded-[3rem] bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPages.map((page, idx) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative h-[450px] rounded-[3rem] overflow-hidden border border-white/5 bg-black"
              >
                {page.headerImage ? (
                  <img 
                    src={page.headerImage} 
                    alt={page.title}
                    className="w-full h-full object-cover opacity-60 grayscale-0 md:grayscale md:group-hover:grayscale-0 md:group-hover:scale-110 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-800">
                    <Layout size={64} opacity={0.1} />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                <div className="absolute inset-x-8 bottom-10 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 bg-brand-pink/10 text-brand-pink border border-brand-pink/20 rounded-full text-[8px] font-black uppercase tracking-widest">
                      {page.category || 'Featured'}
                    </span>
                    <span className="w-2 h-2 bg-white/20 rounded-full" />
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                       <Globe size={10} /> /{page.slug}
                    </p>
                  </div>
                  
                  <h3 className="text-3xl font-display font-black text-white italic tracking-tight leading-tight uppercase">
                    {page.title}
                  </h3>
                  
                  <Link 
                    to={`/page/${page.slug}`}
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-brand-pink transition-all group/btn"
                  >
                    Explore Story 
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/btn:bg-brand-pink transition-all">
                       <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </div>
                
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all">
                   <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                      <Layout className="text-white" size={20} />
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-pink/5 blur-[150px] -z-10" />
    </section>
  );
}
