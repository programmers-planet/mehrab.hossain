import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, ArrowLeft, Filter } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, doc, limit, startAfter, getDocs, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProjectModal from '../components/ProjectModal';

const PROJECTS_PER_PAGE = 6;

export default function PortfolioPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [pageConfig, setPageConfig] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchInitialProjects();

    const unsubConfig = onSnapshot(doc(db, 'config', 'pages'), (doc) => {
      if (doc.exists() && doc.data().portfolio) {
        setPageConfig(doc.data().portfolio);
      } else {
        setPageConfig({
          title: "Full",
          highlight: "Portfolio",
          description: "Explore my complete collection of projects, ranging from AI automation to sophisticated web applications and IoT solutions."
        });
      }
    });

    return () => {
      unsubConfig();
    };
  }, []);

  const fetchInitialProjects = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'projects'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc'),
        limit(PROJECTS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setProjects(docs);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PROJECTS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    
    try {
      const q = query(
        collection(db, 'projects'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PROJECTS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (docs.length > 0) {
        setProjects(prev => [...prev, ...docs]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === PROJECTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more projects:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];

  const filteredProjects = projects.filter(project => {
    const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.category?.toLowerCase().includes(searchTerm.toLowerCase());
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

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            <div className="flex-grow relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-pink transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search projects by name, category, or technology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 outline-none focus:border-brand-pink/50 focus:bg-white/10 transition-all font-medium"
              />
            </div>
            
            <div className="flex items-center gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mr-2 shrink-0">
                 <Filter size={14} /> Filter:
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

          {/* Results Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 aspect-[4/3] cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <img 
                    src={project.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000&auto=format&fit=crop"} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="absolute inset-0 bg-linear-to-t from-dark-surface via-dark-surface/60 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <div className="text-xs font-bold text-brand-pink uppercase tracking-widest mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform font-black">
                      {project.category}
                    </div>
                    <h4 className="text-2xl font-display font-bold text-white mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      {project.title}
                    </h4>
                    <p className="text-white/60 text-xs mb-6 transform translate-y-2 group-hover:translate-y-0 transition-transform line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex gap-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-brand-pink transition-colors">
                        <ExternalLink size={14} /> Full Project
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredProjects.length === 0 && !loading && (
            <div className="py-24 text-center space-y-4">
              <div className="text-4xl">🔍</div>
              <h3 className="text-2xl font-display font-bold">No projects found</h3>
              <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
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
                    Expanding Grid...
                  </div>
                ) : (
                  <span>Load More Projects</span>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      <ProjectModal 
        project={selectedProject} 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

      <Footer />
    </div>
  );
}
