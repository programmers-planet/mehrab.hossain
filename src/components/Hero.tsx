import { motion, AnimatePresence } from 'motion/react';
import { MousePointer2, Award, Zap, Download, ChevronRight, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Hero() {
  const [textIndex, setTextIndex] = useState(0);
  const [data, setData] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch Hero Config
    const unsubHero = onSnapshot(doc(db, 'config', 'hero'), (snapshot) => {
      if (snapshot.exists()) {
        const heroData = snapshot.data();
        setData((prev: any) => ({
          ...prev,
          ...heroData,
          showSocials: heroData.showSocials !== false // Explicit check to ensure default true
        }));
      } else {
        // Even if config doesn't exist, we stop loading to avoid infinite loop
        // but user says "Initial State Clear" and "Strict Rendering".
        // If snapshot doesn't exist, we should probably set some minimal empty data
        // but let's assume it exists as per CMS structure.
      }
      setIsLoading(false);
    }, () => setIsLoading(false));

    // Fetch Site Config for Socials
    const unsubSite = onSnapshot(doc(db, 'config', 'pages'), (snapshot) => {
      if (snapshot.exists()) {
        const siteData = snapshot.data();
        if (siteData && siteData.site && siteData.site.socialLinks) {
          setSocialLinks(siteData.site.socialLinks);
        } else {
          setSocialLinks([]);
        }
      }
    });

    return () => {
      unsubHero();
      unsubSite();
    };
  }, []);

  useEffect(() => {
    if (!data?.phrases?.length) return;
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % (data.phrases?.length || 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [data?.phrases]);

  if (isLoading || !data) {
    return (
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/30 font-display font-bold animate-pulse">Loading...</p>
        </div>
      </section>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } as any
    },
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10"
        >
          {data.stats && data.stats.length > 0 && (
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 glass border-brand-pink/30 rounded-full text-brand-pink text-[10px] font-black tracking-widest uppercase">
              <span className="w-2 h-2 bg-brand-pink rounded-full animate-pulse" />
              {data.stats[0].value} {data.stats[0].label}
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="font-display font-black leading-[1.05] tracking-tight hero-title">
              {data.title || "Hi, I'm"} <br />
              <span className="text-gradient hero-name">{data.name || "Shahed Afridi"}</span>
            </h1>
            
            <div className="h-12 overflow-hidden flex items-center">
              <AnimatePresence mode="wait">
                <motion.span
                  key={textIndex}
                  initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                  animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
                  exit={{ clipPath: 'inset(0 0 0 100%)', opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="text-xl md:text-3xl font-display font-bold text-white/80 border-r-4 border-brand-pink pr-4 whitespace-nowrap"
                >
                  {data.phrases?.[textIndex % (data.phrases?.length || 1)]}
                </motion.span>
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="max-w-xl leading-relaxed hero-desc">
            {data.description}
          </motion.p>


          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-4">
            {data.buttons && data.buttons.length > 0 ? (
              data.buttons.map((btn: any, idx: number) => (
                <a 
                  key={idx} 
                  href={btn.url} 
                  className={`px-6 py-4 md:px-10 md:py-4 rounded-xl font-bold transition-all active:scale-98 text-center flex-1 sm:flex-none ${
                    btn.primary 
                    ? "bg-white text-black hover:bg-gray-200" 
                    : "glass text-white border border-white/20 hover:bg-white/10"
                  }`}
                >
                  {btn.label}
                </a>
              ))
            ) : (
              <>
                <a href="#portfolio" className="px-6 py-4 md:px-10 md:py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-98 text-center flex-1 sm:flex-none">
                  View Portfolio
                </a>
                <a href="#" className="px-6 py-4 md:px-10 md:py-4 glass text-white rounded-xl font-bold border border-white/20 hover:bg-white/10 transition-all active:scale-98 text-center flex-1 sm:flex-none">
                  Download CV
                </a>
              </>
            )}
          </motion.div>

          {data.showSocials && socialLinks.length > 0 && (
            <motion.div variants={itemVariants} className="pt-8 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Find me on:</p>
              <div className="flex gap-4">
                {socialLinks.map((social: any, idx: number) => (
                  <a 
                    key={idx} 
                    href={social.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-12 h-12 rounded-xl glass border border-white/5 flex items-center justify-center transition-all group overflow-hidden"
                    style={{ 
                      color: social.color || '#9ca3af',
                      borderColor: social.color ? `${social.color}20` : 'rgba(255,255,255,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      if (social.hoverColor) {
                        e.currentTarget.style.color = social.hoverColor;
                        e.currentTarget.style.borderColor = `${social.hoverColor}50`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = social.color || '#9ca3af';
                      e.currentTarget.style.borderColor = social.color ? `${social.color}20` : 'rgba(255,255,255,0.05)';
                    }}
                  >
                    {social.faIcon ? (
                      social.faIcon.includes('<') ? (
                        <span dangerouslySetInnerHTML={{ __html: social.faIcon }} className="text-xl flex items-center justify-center group-hover:scale-110 transition-transform" />
                      ) : (
                        <i className={`${social.faIcon} text-xl group-hover:scale-110 transition-transform`}></i>
                      )
                    ) : social.icon && typeof social.icon === 'string' ? (
                      <img src={social.icon} alt={social.platform} className="w-5 h-5 object-contain grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all" referrerPolicy="no-referrer" />
                    ) : (
                      <Globe size={20} className="group-hover:scale-110 transition-transform" />
                    )}
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {data.stats && data.stats.length > 0 && (
            <motion.div variants={itemVariants} className="flex flex-wrap gap-10 pt-8 opacity-60">
              {data.stats.slice(0, 3).map((stat: any, idx: number) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-3xl font-display font-bold">{stat.value}</span>
                  <span className="text-xs uppercase tracking-widest font-bold">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Right Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative perspective-1000 order-first lg:order-last"
        >
          <div className="relative z-10 rounded-3xl overflow-hidden border-2 border-white/10 aspect-square lg:aspect-auto lg:h-[600px] group">
            <img 
              src={data.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000&auto=format&fit=crop"} 
              alt={data.name || "Shahed Afridi"} 
              className="w-full h-full object-cover grayscale-0 md:grayscale md:group-hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-linear-to-t from-dark-surface via-transparent to-transparent opacity-60" />
            
            {/* Floating Badge */}
            {data.badge1 && (data.badge1.label || data.badge1.sublabel) && (
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 left-4 md:top-10 md:left-10 glass p-3 md:p-5 rounded-2xl flex items-center gap-3 md:gap-4 border-white/20 z-20"
              >
                <div className="w-8 h-8 md:w-12 md:h-12 bg-white/10 rounded-xl flex items-center justify-center text-brand-pink">
                  <Award size={20} className="md:w-7 md:h-7" />
                </div>
                <div>
                  <p className="text-[8px] md:text-xs text-white/50 font-bold uppercase tracking-widest">{data.badge1.label}</p>
                  <p className="text-xs md:text-sm font-bold">{data.badge1.sublabel}</p>
                </div>
              </motion.div>
            )}

            {data.badge2 && (data.badge2.label || data.badge2.sublabel) && (
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-4 right-4 md:bottom-10 md:right-10 glass p-3 md:p-5 rounded-2xl flex items-center gap-3 md:gap-4 border-white/20 z-20"
              >
                <div className="w-8 h-8 md:w-12 md:h-12 bg-white/10 rounded-xl flex items-center justify-center text-brand-red">
                  <MousePointer2 size={16} className="md:w-6 md:h-6" />
                </div>
                <div>
                  <p className="text-[8px] md:text-xs text-white/50 font-bold uppercase tracking-widest">{data.badge2.label}</p>
                  <p className="text-xs md:text-sm font-bold">{data.badge2.sublabel}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Decorative shapes */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-pink/30 rounded-full blur-[80px] -z-10" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-brand-pink/20 rounded-full blur-[60px] -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
