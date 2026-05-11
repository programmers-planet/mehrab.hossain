import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageSquare, Send, Globe, MapPin, CheckCircle2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'pages'), (snapshot) => {
      if (snapshot.exists()) {
        const site = snapshot.data().site;
        if (site?.contact) setContactInfo(site.contact);
      }
      setIsLoading(false);
    }, () => setIsLoading(false));
    return unsub;
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'messages'), data);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('idle');
      handleFirestoreError(err, OperationType.CREATE, 'messages');
    }
  };

  if (isLoading || !contactInfo) {
    return (
      <section id="contact" className="py-24 relative overflow-hidden flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-pink border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/30 font-display font-medium">Loading Contact Info...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-pink/10 blur-[150px] -z-10 rounded-full" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* Left: Contact Info */}
          <div className="w-full lg:w-1/3 space-y-12">
            <div className="space-y-4">
              <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-brand-pink">Get in touch</h2>
              <h3 className="font-display font-bold leading-tight section-title">Let’s Start a <span className="text-gradient">Project</span> Together</h3>
              <p className="text-white/40 leading-relaxed pt-4">
                Have a project idea or just want to say hi? Feel free to reach out. I'm always open to discussing new opportunities.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { icon: <Mail size={28} />, label: "Email Me", val: contactInfo.email, color: "text-brand-pink", href: `mailto:${contactInfo.email}` },
                { icon: <MapPin size={28} />, label: "Location", val: contactInfo.address, color: "text-brand-red" },
                { icon: <MessageSquare size={28} />, label: contactInfo.whatsapp ? "WhatsApp" : "Live Chat", val: contactInfo.whatsapp || "Available 24/7", color: "text-brand-pink", href: contactInfo.whatsapp ? `https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}` : undefined }
              ].map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-6 group">
                  <div className={`w-16 h-16 rounded-2xl glass flex items-center justify-center ${item.color} group-hover:bg-gradient group-hover:text-white transition-all duration-500`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noreferrer" className="text-lg font-bold group-hover:text-brand-pink transition-colors">
                        {item.val}
                      </a>
                    ) : (
                      <p className="text-lg font-bold group-hover:text-brand-pink transition-colors">{item.val}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-2/3"
          >
            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="bg-white/5 p-16 rounded-[3rem] border border-brand-pink/50 flex flex-col items-center text-center justify-center min-h-[500px] space-y-6 shadow-2xl glow-shadow"
                >
                  <div className="w-24 h-24 bg-brand-pink/20 rounded-full flex items-center justify-center text-brand-pink">
                    <CheckCircle2 size={48} />
                  </div>
                  <h4 className="text-3xl font-display font-bold">Message Sent Successfully!</h4>
                  <p className="text-white/60">Thank you for reaching out. I'll get back to you as soon as possible.</p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="px-8 py-3 glass rounded-xl font-bold hover:bg-white/10 transition-all"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 p-10 md:p-14 rounded-[3rem] border border-white/10 space-y-6 shadow-2xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Your Name</label>
                      <input 
                        required
                        name="name"
                        type="text" 
                        placeholder="Shahed Afridi" 
                        className="w-full h-14 bg-black/50 border border-white/10 rounded-xl px-6 text-sm focus:border-brand-pink focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Email Address</label>
                      <input 
                        required
                        name="email"
                        type="email" 
                        placeholder="shahed.dev@gmail.com" 
                        className="w-full h-14 bg-black/50 border border-white/10 rounded-xl px-6 text-sm focus:border-brand-pink focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Project Brief</label>
                    <textarea 
                      required
                      name="message"
                      placeholder="Tell me about your project..." 
                      rows={4}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-sm focus:border-brand-pink focus:outline-none transition-all resize-none"
                    />
                  </div>
                  
                  <button 
                    disabled={status === 'submitting'}
                    type="submit"
                    className="w-full h-16 bg-gradient text-white rounded-xl font-bold flex items-center justify-center gap-4 group shadow-lg shadow-brand-pink/20 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'submitting' ? 'Sending...' : (
                      <>Send Message <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
