import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(docs);
      setIsLoading(false);
    }, () => {
      // Fallback if index not ready
      onSnapshot(collection(db, 'services'), (snap) => {
         setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
         setIsLoading(false);
      });
    });
    return unsub;
  }, []);

  if (isLoading) {
    return (
      <section id="services" className="py-24 bg-black/30 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/30 font-display font-medium">Loading Services...</p>
        </div>
      </section>
    );
  }

  const getIcon = (iconData: string) => {
    if (iconData?.trim().startsWith('<i')) {
      return <div className="text-3xl" dangerouslySetInnerHTML={{ __html: iconData }} />;
    }
    const Icon = (LucideIcons as any)[iconData] || LucideIcons.Zap;
    return <Icon size={32} />;
  };

  return (
    <section id="services" className="py-24 bg-black/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black tracking-[0.5em] uppercase text-brand-pink"
          >
            03 • Services
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-display font-black leading-tight services-title"
          >
            I provide <span className="text-gradient">high-impact</span> solutions
          </motion.h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <motion.div
              key={service.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ 
                y: -15, 
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderColor: "rgba(236, 72, 153, 0.4)",
                transition: { duration: 0.3 } 
              }}
              onClick={() => service.customLink && navigate(service.customLink)}
              className={`bg-white/[0.03] border border-white/10 p-12 rounded-[2.5rem] group transition-all relative overflow-hidden ${service.customLink ? 'cursor-pointer active:scale-95' : ''}`}
            >
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-brand-pink mb-8 group-hover:scale-110 group-hover:bg-brand-pink group-hover:text-white transition-all duration-500 shadow-xl group-hover:glow-shadow">
                {getIcon(service.icon)}
              </div>
              
              <h4 className="text-2xl font-display font-bold mb-4 group-hover:text-brand-pink transition-colors">
                {service.title}
              </h4>
              <p className="text-white/50 leading-relaxed group-hover:text-white/80 transition-colors services-desc">
                {service.description}
              </p>

              {service.customLink && (
                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-pink">Explore Service</span>
                  <LucideIcons.ArrowRight size={14} className="text-brand-pink group-hover:translate-x-1 transition-transform" />
                </div>
              )}
              
              {/* Subtle glass accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/5 blur-[40px] -z-10 group-hover:bg-brand-pink/10 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
