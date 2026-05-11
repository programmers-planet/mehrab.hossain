import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Mail, Github, Linkedin, Facebook, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoText, setLogoText] = useState('');
  const [logoImage, setLogoImage] = useState('');
  const [navLinks, setNavLinks] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const unsubLogo = onSnapshot(doc(db, 'config', 'pages'), (snapshot) => {
      if (snapshot.exists()) {
        const site = snapshot.data().site;
        if (site?.logoText) setLogoText(site.logoText);
        if (site?.logoImage) setLogoImage(site.logoImage);
        if (site?.socialLinks) setSocialLinks(site.socialLinks);
      }
      setIsLoading(false);
    }, () => setIsLoading(false));

    const unsubNav = onSnapshot(doc(db, 'config', 'navigation'), (doc) => {
      if (doc.exists()) {
        setNavLinks(doc.data().links || []);
      } else {
        setNavLinks([
          { name: 'Home', href: '/' },
          { name: 'About', href: '#about' },
          { name: 'Services', href: '#services' },
          { name: 'Portfolio', href: '/portfolio' },
          { name: 'Blog', href: '/blog' },
          { name: 'Contact', href: '#contact' },
        ]);
      }
    });

    return () => {
      unsubLogo();
      unsubNav();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll Lock Fix
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  if (isLoading) return null;

  const NavItem = ({ link, idx, isMobile = false }: { link: any, idx: number, isMobile?: boolean }) => {
    const commonClass = isMobile 
      ? "text-xl font-display font-medium text-white/90 hover:text-brand-pink transition-colors uppercase tracking-[0.2em]"
      : "text-[13px] font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-[0.2em]";

    const isAnchor = link.href.startsWith('#');
    const finalHref = isHomePage ? link.href : (isAnchor ? `/${link.href}` : link.href);

    if (finalHref.startsWith('/') && !finalHref.includes('#')) {
      return (
        <Link 
          to={finalHref}
          className={commonClass}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
        >
          {link.name}
        </Link>
      );
    }

    return (
      <a
        href={finalHref}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
        className={commonClass}
      >
        {link.name}
      </a>
    );
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isMobileMenuOpen 
          ? 'py-6 bg-transparent' 
          : (isScrolled ? 'py-4 glass-dark shadow-2xl' : 'py-6 bg-transparent border-b border-white/5')
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center"
        >
          <Link to="/" className="text-2xl font-logo font-black italic tracking-tighter">
            {logoImage ? (
              <img 
                src={logoImage} 
                alt={logoText} 
                className="h-8 md:h-10 w-auto object-contain" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-gradient underline-offset-8 transition-all hover:underline decoration-brand-pink/30 uppercase">
                {logoText}
              </span>
            )}
          </Link>
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link, idx) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <NavItem link={link} idx={idx} />
            </motion.div>
          ))}
          <motion.a
            href={isHomePage ? "#contact" : "/#contact"}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-2.5 bg-gradient text-white rounded-full text-sm font-bold glow-shadow active:scale-95 transition-all text-center"
          >
            Hire Me
          </motion.a>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white/70 hover:text-white"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 h-screen w-full bg-dark-surface/30 backdrop-blur-3xl z-[60] flex flex-col p-6"
          >
            {/* Header in mobile menu */}
            <div className="flex justify-between items-center w-full max-w-7xl mx-auto py-2">
              <div className="text-2xl font-logo font-black italic tracking-tighter text-white uppercase">
                {logoText}
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 text-white/70 hover:text-white glass rounded-full"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center gap-6 w-full max-w-sm mx-auto">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.1 + idx * 0.08,
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }}
                  className="w-full text-center"
                >
                  <NavItem link={link} idx={idx} isMobile={true} />
                  <div className="h-[1px] w-12 bg-white/5 mx-auto mt-6" />
                </motion.div>
              ))}
              
              <motion.a
                href={isHomePage ? "#contact" : "/#contact"}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-5 bg-gradient text-white rounded-3xl font-bold text-xl glow-shadow mt-6"
              >
                Hire Me
              </motion.a>
            </div>

            {/* Socials in mobile menu */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-auto pb-12 flex flex-col items-center gap-6"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Connect with me</p>
              <div className="flex gap-8">
                {socialLinks.length > 0 ? (
                  socialLinks.map((social: any, idx: number) => (
                    <a 
                      key={idx} 
                      href={social.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="h-10 w-10 flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                      style={{ color: social.color || '#9ca3af' }}
                    >
                      {social.faIcon ? (
                        social.faIcon.includes('<') ? (
                          <span dangerouslySetInnerHTML={{ __html: social.faIcon }} className="text-2xl flex items-center justify-center h-full w-full" />
                        ) : (
                          <i className={`${social.faIcon} text-2xl`}></i>
                        )
                      ) : social.icon ? (
                        <img src={social.icon} alt={social.platform} className="w-8 h-8 object-contain opacity-70" referrerPolicy="no-referrer" />
                      ) : (
                        <Globe size={28}/>
                      )}
                    </a>
                  ))
                ) : (
                  <>
                    <div className="text-white/40 hover:text-brand-pink transition-colors cursor-pointer"><Github size={28}/></div>
                    <div className="text-white/40 hover:text-brand-pink transition-colors cursor-pointer"><Linkedin size={28}/></div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
