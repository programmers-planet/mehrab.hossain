import { motion } from 'motion/react';
import { Briefcase, GraduationCap, Code2, Cpu } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';

export default function About() {
  const [data, setData] = useState<any>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [facts, setFacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubAbout = onSnapshot(doc(db, 'config', 'about'), (doc) => {
      if (doc.exists()) setData(doc.data());
      setIsLoading(false);
    }, () => setIsLoading(false));

    const qEd = query(collection(db, 'education'), orderBy('createdAt', 'asc'));
    const unsubEducation = onSnapshot(qEd, (snapshot) => {
      setEducation(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qFacts = query(collection(db, 'aboutFacts'), orderBy('order', 'asc'));
    const unsubFacts = onSnapshot(qFacts, (snapshot) => {
      const allFacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setFacts(allFacts.filter(f => f.isPublished !== false));
    });

    return () => {
      unsubAbout();
      unsubEducation();
      unsubFacts();
    };
  }, []);

  if (isLoading || !data) {
    return (
      <section id="about" className="py-24 relative flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/30 font-display font-medium">Loading About...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 lg:p-20 overflow-hidden relative">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left: Bio and Stats */}
            <div className="w-full lg:w-1/2 space-y-10 relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.4em] text-brand-pink">
                  <span className="w-10 h-[1px] bg-brand-pink" /> 02 • About Me
                </div>
                <h3 className="font-display font-black leading-tight about-title">
                  {data.title}
                </h3>
                <p className="leading-relaxed about-bio">
                  {data.bio}
                </p>
              </motion.div>

              {facts.length > 0 && (
                <div className="grid grid-cols-2 gap-6">
                  {facts.map((fact, idx) => (
                    <div 
                      key={fact.id || idx}
                      className="bg-black/40 rounded-2xl p-6 border border-white/5 hover:border-brand-pink/10 transition-colors"
                    >
                      <div className="font-display font-black text-4xl mb-1" style={{ color: fact.color || (idx % 2 === 0 ? 'var(--color-brand-pink)' : 'var(--color-brand-red)') }}>
                        {fact.value}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                        {fact.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Dedicated Education Section */}
              {education.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-white/5">
                  <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <GraduationCap size={16} className="text-brand-pink" /> Educational Qualification
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {education.map((ed) => (
                      <motion.div 
                        key={ed.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="bg-black/40 rounded-2xl p-6 border border-white/5 hover:border-brand-pink/20 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-pink opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h4 className="text-brand-pink font-display font-black text-2xl mb-2 leading-tight uppercase tracking-tight">
                          {ed.title}
                        </h4>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                          {ed.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Image Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-full lg:w-1/2 relative group"
            >
              <div className="relative rounded-3xl overflow-hidden glass p-3 border border-white/10">
                <div className="aspect-square rounded-2xl overflow-hidden relative">
                  <img 
                    src={data.image || "https://images.unsplash.com/photo-1552061073-e630c93b6e82?q=80&w=2000&auto=format&fit=crop"} 
                    alt="About Me" 
                    className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-dark-surface/80 to-transparent" />
                  <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-brand-pink px-4 py-2 rounded-full shadow-xl">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest">Active Now</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
