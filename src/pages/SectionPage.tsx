import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DynamicSection from '../components/DynamicSection';

const SectionPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSection = async () => {
      if (!slug) return;
      
      const q = query(
        collection(db, 'customSections'), 
        where('slug', '==', slug),
        where('isPublished', '==', true)
      );
      
      const unsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          setSection({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        }
        setLoading(false);
      });

      return unsub;
    };
    
    fetchSection();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-pink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">
        Section not found
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${section.pageSettings?.theme === 'light' ? 'bg-white text-dark-bg' : 'bg-dark-bg text-white'}`}>
      {section.pageSettings?.headerVisible !== false && <Navbar />}
      
      <main className={`${section.pageSettings?.headerVisible !== false ? 'pt-32' : 'pt-16'} pb-20`}>
        <div className="max-w-7xl mx-auto px-6 mb-12">
           <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 transition-colors uppercase text-[10px] font-black tracking-widest ${section.pageSettings?.theme === 'light' ? 'text-gray-400 hover:text-brand-pink' : 'text-gray-500 hover:text-brand-pink'}`}
          >
            <ArrowLeft size={16} /> Return Home
          </motion.button>
        </div>

        <DynamicSection section={section} isHomePage={false} />
      </main>

      <Footer />
    </div>
  );
};

export default SectionPage;
