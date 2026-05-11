import { Github, Linkedin, Twitter, ArrowUp, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Footer() {
  const [siteConfig, setSiteConfig] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'pages'), (doc) => {
      if (doc.exists() && doc.data().site) {
        setSiteConfig(doc.data().site);
      }
    });
    return unsub;
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!siteConfig) return null;

  const socials = siteConfig.socialLinks && siteConfig.socialLinks.length > 0 
    ? siteConfig.socialLinks 
    : [];

  return (
    <footer className="py-14 bg-black border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="text-2xl font-display font-bold italic text-gradient tracking-tighter">
              {siteConfig.logoText}
            </div>
            <div className="space-y-1">
              <p className="text-gray-600 max-w-xs uppercase text-[10px] tracking-widest font-black">
                Built with Precision.
              </p>
              {siteConfig.contact?.email && (
                <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold">
                  {siteConfig.contact.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-8 uppercase text-xs font-bold tracking-[0.2em] text-white/50">
            <a href="#about" className="hover:text-brand-pink transition-colors">About</a>
            <a href="#services" className="hover:text-brand-pink transition-colors">Services</a>
            <a href="#portfolio" className="hover:text-brand-pink transition-colors">Portfolio</a>
            <a href="#blog" className="hover:text-brand-pink transition-colors">Blog</a>
          </div>

          <div className="flex gap-4">
            {socials.map((social: any, idx: number) => (
              <a 
                key={idx} 
                href={social.url || social.href}
                target="_blank"
                rel="no-referrer"
                className="w-12 h-12 rounded-2xl glass flex items-center justify-center transition-all border border-white/5 overflow-hidden"
                style={{ 
                  color: social.color || '#9ca3af',
                  borderColor: social.color ? `${social.color}20` : 'rgba(255,255,255,0.05)'
                }}
                onMouseEnter={(e) => {
                  if (social.hoverColor) {
                    e.currentTarget.style.color = social.hoverColor;
                    e.currentTarget.style.borderColor = `${social.hoverColor}50`;
                    e.currentTarget.style.background = `linear-gradient(to bottom right, ${social.hoverColor}20, transparent)`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = social.color || '#9ca3af';
                  e.currentTarget.style.borderColor = social.color ? `${social.color}20` : 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.background = '';
                }}
              >
                {social.faIcon ? (
                  social.faIcon.includes('<') ? (
                    <span dangerouslySetInnerHTML={{ __html: social.faIcon }} className="text-xl flex items-center justify-center" />
                  ) : (
                    <i className={`${social.faIcon} text-xl`}></i>
                  )
                ) : social.icon && typeof social.icon === 'string' ? (
                  <img src={social.icon} alt={social.platform} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                ) : (
                  social.icon || <Globe size={20} />
                )}
              </a>
            ))}
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/20 text-xs font-medium uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {siteConfig.logoText.split('.')[0]}. All Rights Reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="/admin/login" className="text-[10px] font-black uppercase tracking-widest text-white/10 hover:text-white transition-colors">Admin Access</a>
            <button 
              onClick={scrollToTop}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-brand-pink transition-colors"
            >
              Back to Top <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
