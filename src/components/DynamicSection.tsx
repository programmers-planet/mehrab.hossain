import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, X, ChevronRight, ChevronLeft, Box, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  content?: string;
  link?: string;
  buttonLabel?: string;
}

interface CustomSectionProps {
  section: {
    id: string;
    title: string;
    subtitle?: string;
    layout: 'grid' | 'slider' | 'list';
    cardType: 'popup' | 'page';
    elementId?: string;
    slug?: string;
    showViewMore?: boolean;
    viewMoreLabel?: string;
    customStyles?: {
      titleSize?: string;
      titleColor?: string;
      subtitleSize?: string;
      subtitleColor?: string;
    };
  };
  isHomePage?: boolean;
}

const DynamicSection: React.FC<CustomSectionProps> = ({ section, isHomePage = true }) => {
  const [items, setItems] = useState<CustomItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CustomItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(
      collection(db, 'customItems'),
      where('sectionId', '==', section.id),
      orderBy('order', 'asc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const allItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomItem));
      let filtered = allItems.filter((item: any) => item.isPublished !== false);
      
      if (isHomePage) {
        filtered = filtered.filter((item: any) => item.showInHome !== false);
      }
      
      setItems(filtered);
      setIsLoading(false);
    }, () => setIsLoading(false));

    return unsub;
  }, [section.id, isHomePage]);

  // Auto-slide effect
  useEffect(() => {
    if (items.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const slidesVisible = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
        const maxIndex = Math.max(0, items.length - slidesVisible);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) return null;

  const effectiveLayout = (isHomePage && items.length > 3) ? 'slider' : section.layout;
  
  const slidesVisible = typeof window !== 'undefined' ? (window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1) : 1;
  const maxIndex = Math.max(0, items.length - slidesVisible);
  const displayDots = items.slice(0, maxIndex + 1);

  return (
    <section id={section.elementId} className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <div className="h-[1px] w-8 bg-brand-pink/30" />
            <span 
              className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-pink"
              style={{ 
                fontSize: section.customStyles?.subtitleSize || '10px',
                color: section.customStyles?.subtitleColor || 'var(--color-brand-pink)'
              }}
            >
              {section.subtitle || 'EXCLUSIVE COLLECTION'}
            </span>
            <div className="h-[1px] w-8 bg-brand-pink/30" />
          </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-display font-black text-white italic tracking-tighter uppercase"
          style={{ 
            fontSize: section.customStyles?.titleSize || 'clamp(3rem, 10vw, 5rem)',
            color: section.customStyles?.titleColor || '#ffffff'
          }}
        >
          {section.title}
        </motion.h2>
      </div>

        {effectiveLayout === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, idx) => (
              <Card 
                key={item.id} 
                item={item} 
                idx={idx} 
                type={section.cardType} 
                onClick={() => section.cardType === 'popup' && setSelectedItem(item)} 
              />
            ))}
          </div>
        )}

        {effectiveLayout === 'slider' && (
          <div className="relative group/slider overflow-hidden">
            <motion.div 
              className="flex gap-8 cursor-grab active:cursor-grabbing"
              animate={{ x: `calc(-${currentIndex * (100 / slidesVisible)}%)` }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              {items.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="min-w-[100%] md:min-w-[calc(50%-1.5rem)] lg:min-w-[calc(33.333%-2rem)]"
                >
                  <Card 
                    item={item} 
                    idx={idx} 
                    type={section.cardType} 
                    onClick={() => section.cardType === 'popup' && setSelectedItem(item)} 
                  />
                </div>
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
        )}

        {effectiveLayout === 'list' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                onClick={() => section.cardType === 'popup' && setSelectedItem(item)}
                className="group flex items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-brand-pink/5 hover:border-brand-pink/30 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-8">
                  <span className="text-4xl font-display font-black text-white/10 group-hover:text-brand-pink/20 transition-colors">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-pink transition-colors uppercase tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-500 group-hover:border-brand-pink group-hover:text-brand-pink transition-all">
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View More Button */}
        {isHomePage && section.showViewMore && section.slug && (
          <div className="mt-20 flex justify-center">
            <button 
              onClick={() => navigate(`/section/${section.slug}`)}
              className="group relative px-12 py-5 bg-white/5 border border-white/10 rounded-full overflow-hidden transition-all hover:border-brand-pink/50 hover:bg-brand-pink/5"
            >
              <div className="absolute inset-0 bg-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-3">
                {section.viewMoreLabel || 'Discover More'}
                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Modal Popup */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="max-w-4xl w-full h-[80vh] bg-dark-surface rounded-[3rem] border border-white/10 overflow-hidden flex flex-col md:flex-row relative"
            >
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 z-20 p-4 bg-black/50 text-white rounded-full hover:bg-brand-pink transition-colors"
              >
                <X size={24} />
              </button>

              <div className="w-full md:w-1/2 h-64 md:h-full relative overflow-hidden">
                <img 
                  src={selectedItem.image || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80'} 
                  className="w-full h-full object-cover"
                  alt={selectedItem.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-transparent" />
              </div>

              <div className="flex-1 p-12 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="mb-8">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink block mb-4">
                    {selectedItem.subtitle || 'Overview'}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-display font-black text-white italic uppercase tracking-tighter leading-none mb-4">
                    {selectedItem.title}
                  </h2>
                  <p className="text-gray-400 font-medium leading-relaxed italic border-l-2 border-brand-pink/30 pl-6">
                    {selectedItem.description}
                  </p>
                </div>

                <div 
                  className="text-gray-300 leading-relaxed space-y-6 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedItem.content || '' }}
                />

                {selectedItem.link && (
                  <a 
                    href={selectedItem.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-auto pt-10 flex items-center gap-4 text-brand-pink font-black uppercase tracking-widest text-xs hover:gap-6 transition-all"
                  >
                    {selectedItem.buttonLabel || 'Launch Interaction'} <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Card = ({ item, idx, type, onClick, sectionSlug }: { item: CustomItem, idx: number, type: string, onClick: () => void, sectionSlug?: string }) => {
  const navigate = useNavigate();

  const handleInteraction = () => {
    if (type === 'page') {
      navigate(`/element/${item.id}`);
    } else {
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      viewport={{ once: true }}
      onClick={handleInteraction}
      className="group relative rounded-3xl overflow-hidden glass border border-white/5 aspect-[4/3] cursor-pointer"
    >
      <img 
        src={item.image || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80'} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
        alt={item.title}
        referrerPolicy="no-referrer"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-dark-surface via-dark-surface/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
        <div className="text-[10px] font-black text-brand-pink uppercase tracking-widest mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-75">
          {item.subtitle || 'EXPLORE'}
        </div>
        <h4 className="font-display font-bold mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-100 italic uppercase" style={{ fontSize: 'var(--item-title-size)', color: 'var(--item-title-color)' }}>
          {item.title}
        </h4>
        <p className="transform translate-y-4 group-hover:translate-y-0 transition-transform delay-150 line-clamp-2 mb-6" style={{ fontSize: 'var(--item-desc-size)', color: 'var(--item-desc-color)' }}>
          {item.description}
        </p>
        
        <div className="flex gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform delay-200">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:text-brand-pink transition-colors">
            <div className="h-[2px] w-8 bg-brand-pink" />
            {item.buttonLabel || (type === 'page' ? 'View Details' : 'Open Popup')}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DynamicSection;
