import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink, Calendar, Tag } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ElementPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      const docSnap = await getDoc(doc(db, 'customItems', id));
      if (docSnap.exists()) {
        setItem({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    fetchItem();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">
        Item not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-brand-pink transition-colors mb-12 uppercase text-[10px] font-black tracking-widest"
        >
          <ArrowLeft size={16} /> Back to Exploration
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-brand-pink font-black uppercase tracking-[0.3em] text-[10px] block mb-4"
              >
                {item.subtitle || 'DEDICATED FEATURE'}
              </motion.span>
              <h1 className="text-5xl md:text-7xl font-display font-black text-white italic uppercase tracking-tighter leading-none">
                {item.title}
              </h1>
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] space-y-6">
              <p className="text-gray-300 text-lg leading-relaxed italic">
                {item.description}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <Calendar size={14} className="text-brand-pink" />
                  {item.createdAt?.toDate().toLocaleDateString() || 'Recently Added'}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <Tag size={14} className="text-brand-pink" />
                  Identity System
                </div>
              </div>
            </div>

            {item.link && (
              <a 
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-16 px-10 bg-white text-black rounded-2xl items-center gap-4 font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                {item.buttonLabel || 'Launch Interaction'} <ExternalLink size={18} />
              </a>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={item.image || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80'} 
                className="w-full h-full object-cover"
                alt={item.title}
              />
            </div>
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-brand-pink/20 blur-[100px] -z-10 rounded-full" />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 pt-20 border-t border-white/5"
        >
          <div className="max-w-3xl prose prose-invert prose-pink">
             <div 
              className="text-gray-300 leading-relaxed text-xl space-y-8"
              dangerouslySetInnerHTML={{ __html: item.content || '' }}
            />
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ElementPage;
