import { motion, AnimatePresence } from 'motion/react';
import { X, Tag, Layers, Info, ExternalLink, Calendar, Globe, Cpu, User, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect } from 'react';

interface ProjectModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryView, setIsGalleryView] = useState(false);

  const galleryImages = project ? [project.image, ...(project.gallery || [])].filter(Boolean) : [];

  useEffect(() => {
    if (isOpen && project) {
      setCurrentImageIndex(0);
      setIsGalleryView(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen, project]);

  useEffect(() => {
    let interval: any;
    if (isOpen && galleryImages.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isOpen, galleryImages.length]);

  if (!project) return null;

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    } else if (url.includes('vimeo.com/')) {
      videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&badge=0&autopause=0`;
    }
    return url;
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 md:p-8 lg:p-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-7xl h-[90vh] md:h-[85vh] bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-3 bg-black/40 hover:bg-white/10 border border-white/10 rounded-full text-white/40 hover:text-white transition-all hover:rotate-90"
            >
              <X size={20} />
            </button>

            {/* Left Column: Media Showcase */}
            <div className="w-full md:w-[60%] h-[35vh] md:h-full bg-black relative overflow-hidden flex items-center justify-center border-r border-white/5">
              {!isGalleryView && project.videoUrl ? (
                <div className="w-full h-full relative">
                  {(project.videoUrl.includes('youtube.com') || project.videoUrl.includes('youtu.be') || project.videoUrl.includes('vimeo.com')) ? (
                    <iframe 
                      src={getEmbedUrl(project.videoUrl)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    />
                  ) : (
                    <video src={project.videoUrl} className="w-full h-full object-contain" controls autoPlay muted />
                  )}
                  {galleryImages.length > 0 && (
                    <button 
                      onClick={() => setIsGalleryView(true)}
                      className="absolute bottom-8 right-8 px-6 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                      View Image Gallery
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full h-full relative group">
                  <AnimatePresence initial={false}>
                    <motion.img 
                      key={currentImageIndex}
                      src={galleryImages[currentImageIndex]}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "linear" }}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {galleryImages.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-black/40 border border-white/10 rounded-full text-white hover:bg-brand-pink transition-all">
                        <ChevronLeft size={24} />
                      </button>
                      <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-black/40 border border-white/10 rounded-full text-white hover:bg-brand-pink transition-all">
                        <ChevronRight size={24} />
                      </button>
                      
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 pb-2">
                        {galleryImages.map((_, idx) => (
                          <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-6 bg-brand-pink' : 'bg-white/20'}`} />
                        ))}
                      </div>
                    </>
                  )}

                  {project.videoUrl && (
                    <button 
                      onClick={() => setIsGalleryView(false)}
                      className="absolute bottom-8 right-8 px-6 py-3 bg-brand-pink text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                      Watch Project Video
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Project Details */}
            <div className="w-full md:w-[40%] h-full flex flex-col bg-[#0A0A0A]">
              <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-12 md:px-10">
                <div className="space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-brand-pink/10 text-brand-pink text-[9px] font-black uppercase tracking-[0.2em] rounded-md border border-brand-pink/20">
                        {project.category}
                      </span>
                      {project.author && (
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-1.5">
                          <User size={12} className="text-brand-pink" /> {project.author}
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-display font-bold leading-tight">
                      {project.title}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-5 border-r border-white/5 space-y-1.5">
                       <p className="text-[8px] font-black uppercase tracking-[0.25em] text-gray-500">Tech Stack</p>
                       <p className="text-[11px] font-bold text-gray-300 uppercase leading-relaxed">{project.techStack || 'Custom Solution'}</p>
                    </div>
                    <div className="p-5 space-y-1.5">
                       <p className="text-[8px] font-black uppercase tracking-[0.25em] text-gray-500">Core Field</p>
                       <p className="text-[11px] font-bold text-gray-300 uppercase leading-relaxed">{project.category || 'Development'}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-white/5" />
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
                        <Info size={14} className="text-brand-pink" /> Project Intelligence
                      </p>
                      <div className="h-px flex-1 bg-white/5" />
                    </div>
                    
                    <div className="prose prose-invert prose-sm max-w-none text-gray-400 leading-relaxed markdown-content">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {project.content || project.description || "Intelligence data pending..."}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-white/5">
                {project.projectLink ? (
                  <a 
                    href={project.projectLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-4 h-16 bg-white text-black rounded-2xl font-black hover:bg-brand-pink hover:text-white transition-all text-[11px] uppercase tracking-[0.2em] group"
                  >
                    <Globe size={18} className="group-hover:rotate-12 transition-transform" /> 
                    View Project
                  </a>
                ) : (
                  <div className="w-full py-4 px-6 border border-white/5 rounded-2xl text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Project Link Unavailable</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

