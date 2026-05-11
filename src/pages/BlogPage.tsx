import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { Search, Calendar, ArrowLeft, ArrowUpRight, Clock, Tag } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, doc, limit, startAfter, getDocs, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [pageConfig, setPageConfig] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchInitialPosts();

    const unsubConfig = onSnapshot(doc(db, 'config', 'pages'), (doc) => {
      if (doc.exists() && doc.data().blog) {
        setPageConfig(doc.data().blog);
      } else {
        setPageConfig({
          title: "Tech",
          highlight: "Insights",
          description: "Diving deep into AI, automation, and the future of technology. Articles and tutorials crafted for the modern developer."
        });
      }
    });

    return () => {
      unsubConfig();
    };
  }, []);

  const fetchInitialPosts = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'blog'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc'),
        limit(POSTS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setPosts(docs);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    
    try {
      const q = query(
        collection(db, 'blog'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(POSTS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (docs.length > 0) {
        setPosts(prev => [...prev, ...docs]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-dark-surface min-h-screen">
      <Navbar />
      
      <main className="pt-32 pb-24 relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          {pageConfig && (
            <div className="mb-16 space-y-6">
              <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-pink transition-colors group">
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> Back to Home
              </Link>
              <h1 className="text-5xl md:text-7xl font-display font-bold">
                {pageConfig.title} <span className="text-gradient">{pageConfig.highlight}</span>
              </h1>
              <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
                {pageConfig.description}
              </p>
            </div>
          )}

          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            <div className="flex-grow relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-pink transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search articles, topics, or insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 outline-none focus:border-brand-pink/50 focus:bg-white/10 transition-all font-medium"
              />
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mr-2 shrink-0">
                 <Tag size={14} /> Filter:
               </div>
               {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black transition-all border uppercase tracking-[0.2em] shrink-0 ${
                    activeCategory === cat 
                    ? 'bg-brand-pink border-brand-pink text-white shadow-[0_0_20px_rgba(255,8,126,0.3)]' 
                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="group bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-brand-pink/30 hover:bg-white/[0.07] transition-all duration-500 flex flex-col"
                >
                  {/* Card Media */}
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img 
                      src={post.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop"} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                    <div className="absolute top-6 left-6 bg-brand-pink/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                      {post.category}
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-8 pb-10 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-6">
                      <span className="flex items-center gap-1.5"><Calendar size={12} className="text-brand-pink" /> {post.date || 'Recently'}</span>
                      <span className="flex items-center gap-1.5 tracking-tighter opacity-50">•</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> 5 min read</span>
                    </div>
                    
                    <h3 className="text-2xl font-display font-bold mb-4 group-hover:text-brand-pink transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm mb-8 line-clamp-3 leading-relaxed opacity-80">
                      {post.excerpt || (post.content ? post.content.replace(/[#*`]/g, '').substring(0, 120) + '...' : '')}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-white/5">
                      <Link to={`/blog/${post.id}`} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-brand-pink transition-colors group/link">
                        Read Story <ArrowUpRight size={14} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredPosts.length === 0 && !loading && (
            <div className="py-24 text-center space-y-4">
              <div className="text-4xl">✍️</div>
              <h3 className="text-2xl font-display font-bold">No articles found</h3>
              <p className="text-gray-500">We couldn't find any articles matching your search query.</p>
              <button 
                onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                className="text-brand-pink font-bold text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {hasMore && !searchTerm && activeCategory === 'All' && (
            <div className="mt-20 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-12 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-brand-pink hover:border-brand-pink transition-all shadow-xl disabled:opacity-50 group"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Syncing Data...
                  </div>
                ) : (
                  <span>Load More Stories</span>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
