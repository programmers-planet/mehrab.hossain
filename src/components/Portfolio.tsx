import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ExternalLink, ExternalLink as ViewIcon, Layout } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, limit, where, orderBy } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import ProjectModal from './ProjectModal';

export default function Portfolio() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'projects'), 
      where('showInHome', '==', true),
      orderBy('order', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((item: any) => item.isPublished !== false);
      setProjects(docs);
      setIsLoading(false);
    }, (err) => {
      // Fallback if index not ready
      const simpleQ = query(collection(db, 'projects'));
      onSnapshot(simpleQ, (snap) => {
         const docs = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((item: any) => item.isPublished !== false && item.showInHome !== false);
         setProjects(docs);
         setIsLoading(false);
      });
    });
    return unsub;
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (projects.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const slidesVisible = typeof window !== 'undefined' ? (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1) : 1;
        const maxIndex = Math.max(0, projects.length - slidesVisible);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [projects.length]);

  if (isLoading) {
    return (
      <section id="portfolio" className="py-24 relative overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/30 font-display font-medium">Loading Portfolio...</p>
        </div>
      </section>
    );
  }

  // Get unique categories from projects
  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  const isSlider = filteredProjects.length > 3;
  
  const slidesVisible = typeof window !== 'undefined' ? (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1) : 1;
  const maxIndex = Math.max(0, filteredProjects.length - slidesVisible);
  const displayDots = filteredProjects.slice(0, maxIndex + 1);

  return (
    <section id="portfolio" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between md:items-end items-start gap-8 mb-16">
          <div className="space-y-4">
            <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-brand-pink">Selected Works</h2>
            <h3 className="font-display font-bold section-title">Latest <span className="text-gradient">Projects</span></h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all border uppercase tracking-[0.2em] ${
                  activeCategory === cat 
                  ? 'bg-brand-pink border-brand-pink text-white glow-shadow' 
                  : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isSlider ? (
          <div className="relative group overflow-hidden">
            <motion.div 
              className="flex gap-8 cursor-grab active:cursor-grabbing"
              animate={{ x: `calc(-${currentIndex * (100 / slidesVisible)}%)` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              {filteredProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="min-w-[100%] md:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.333%-1.33rem)] group relative rounded-3xl overflow-hidden glass border border-white/5 aspect-[4/3] cursor-pointer"
                  onClick={() => {
                    if (project.customLink) {
                      navigate(project.customLink);
                    } else {
                      setSelectedProject(project);
                    }
                  }}
                >
                  <img 
                    src={project.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000&auto=format&fit=crop"} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-dark-surface via-dark-surface/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                    <div className="text-xs font-bold text-brand-pink uppercase tracking-widest mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-75 font-black flex items-center gap-2">
                      {project.category}
                      {project.customLink && <div className="w-1 h-1 bg-brand-pink rounded-full" />}
                      {project.customLink && <span className="text-[8px] opacity-60">Custom Story</span>}
                    </div>
                    <h4 className="font-display font-bold mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-100" style={{ fontSize: 'var(--item-title-size)', color: 'var(--item-title-color)' }}>
                      {project.title}
                    </h4>
                    <p className="transform translate-y-4 group-hover:translate-y-0 transition-transform delay-150 line-clamp-2" style={{ fontSize: 'var(--item-desc-size)', color: 'var(--item-desc-color)' }}>
                      {project.description}
                    </p>
                    <div className="flex gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-200">
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-brand-pink transition-colors">
                        {project.customLink ? <Layout size={14} /> : <ViewIcon size={14} />} 
                        {project.customLink ? 'Read Narrative' : 'Case Study'}
                      </button>
                      <div className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                        <ExternalLink size={14} />
                      </div>
                    </div>
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
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="group relative rounded-3xl overflow-hidden glass border border-white/5 aspect-[4/3] cursor-pointer"
                  onClick={() => {
                    if (project.customLink) {
                      navigate(project.customLink);
                    } else {
                      setSelectedProject(project);
                    }
                  }}
                >
                  <img 
                    src={project.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2000&auto=format&fit=crop"} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-dark-surface via-dark-surface/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                    <div className="text-xs font-bold text-brand-pink uppercase tracking-widest mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-75 font-black flex items-center gap-2">
                      {project.category}
                      {project.customLink && <div className="w-1 h-1 bg-brand-pink rounded-full" />}
                      {project.customLink && <span className="text-[8px] opacity-60">Custom Story</span>}
                    </div>
                    <h4 className="font-display font-bold mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-100" style={{ fontSize: 'var(--item-title-size)', color: 'var(--item-title-color)' }}>
                      {project.title}
                    </h4>
                    <p className="transform translate-y-4 group-hover:translate-y-0 transition-transform delay-150 line-clamp-2" style={{ fontSize: 'var(--item-desc-size)', color: 'var(--item-desc-color)' }}>
                      {project.description}
                    </p>
                    <div className="flex gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-200">
                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-brand-pink transition-colors">
                        {project.customLink ? <Layout size={14} /> : <ViewIcon size={14} />} 
                        {project.customLink ? 'Read Narrative' : 'Case Study'}
                      </button>
                      <div className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                        <ExternalLink size={14} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* View All Button */}
        <div className="mt-16 flex justify-center">
          <Link 
            to="/portfolio" 
            className="group relative px-12 py-5 bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-brand-pink/50"
          >
            <div className="absolute inset-0 bg-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
            <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] text-white">
              View All Projects
            </span>
          </Link>
        </div>
      </div>

      <ProjectModal 
        project={selectedProject} 
        isOpen={!!selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </section>
  );
}
