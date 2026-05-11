import { motion } from 'motion/react';
import { ArrowRight, Clock, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, limit, orderBy, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'blog'), 
      where('showInHome', '==', true),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((item: any) => item.isPublished !== false);
      setPosts(docs);
      setIsLoading(false);
    }, (err) => {
      // Fallback
      onSnapshot(collection(db, 'blog'), (snap) => {
        setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter((i: any) => i.isPublished !== false && i.showInHome !== false));
        setIsLoading(false);
      });
    });
    return unsub;
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (posts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const slidesVisible = typeof window !== 'undefined' ? (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1) : 1;
        const maxIndex = Math.max(0, posts.length - slidesVisible);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [posts.length]);

  if (isLoading) {
    return (
      <section id="blog" className="py-24 bg-black/20 overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/30 font-display font-medium">Loading Blog...</p>
        </div>
      </section>
    );
  }

  const isSlider = posts.length > 3;
  const slidesVisible = typeof window !== 'undefined' ? (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1) : 1;
  const maxIndex = Math.max(0, posts.length - slidesVisible);
  const displayDots = posts.slice(0, maxIndex + 1);

  return (
    <section id="blog" className="py-24 bg-black/20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-sm font-bold tracking-[0.4em] uppercase text-brand-pink"
          >
            Insights
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-display font-bold blog-feed-title"
          >
            Recent <span className="text-gradient">Articles</span>
          </motion.h3>
        </div>

        {isSlider ? (
          <div className="relative group overflow-hidden">
            <motion.div 
              className="flex gap-8 cursor-grab active:cursor-grabbing"
              animate={{ x: `calc(-${currentIndex * (100 / slidesVisible)}%)` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              {posts.map((post, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="min-w-[100%] md:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.333%-1.33rem)] glass-dark rounded-[2rem] overflow-hidden border border-white/5 group hover:border-brand-pink/20 transition-all cursor-pointer"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 glass px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-brand-pink">
                      {post.category || 'Tech'}
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="flex items-center gap-6 text-xs font-bold text-white/40 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Clock size={14} /> {post.date || 'Recently'}</span>
                      <span className="flex items-center gap-2"><User size={14} />By {post.author || 'Shahed'}</span>
                    </div>
                    
                    <h4 className="text-2xl font-display font-bold leading-tight group-hover:text-brand-pink transition-colors line-clamp-2 blog-post-title">
                      {post.title}
                    </h4>
                    <p className="text-white/50 leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <Link 
                      to={post.id && !post.id.startsWith('default') ? `/blog/${post.id}` : "/blog"} 
                      className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-pink group/btn hover:text-white transition-colors"
                    >
                      Read More <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Dots Navigation */}
            <div className="flex justify-center gap-3 mt-12">
              {displayDots.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 transition-all duration-500 rounded-full ${currentIndex === idx ? 'w-8 bg-brand-pink' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-dark rounded-[2rem] overflow-hidden border border-white/5 group hover:border-brand-pink/20 transition-all cursor-pointer"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 glass px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-brand-pink">
                    {post.category || 'Tech'}
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="flex items-center gap-6 text-xs font-bold text-white/40 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Clock size={14} /> {post.date || 'Recently'}</span>
                    <span className="flex items-center gap-2"><User size={14} />By {post.author || 'Shahed'}</span>
                  </div>
                  
                  <h4 className="text-2xl font-display font-bold leading-tight group-hover:text-brand-pink transition-colors line-clamp-2 blog-post-title">
                    {post.title}
                  </h4>
                  <p className="text-white/50 leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <Link 
                    to={post.id && !post.id.startsWith('default') ? `/blog/${post.id}` : "/blog"} 
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-pink group/btn hover:text-white transition-colors"
                  >
                    Read More <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-16 flex justify-center">
          <Link 
            to="/blog" 
            className="group relative px-12 py-5 bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-brand-pink/50"
          >
            <div className="absolute inset-0 bg-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
            <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] text-white">
              View All Articles
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
