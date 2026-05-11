import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, getDocs, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Search, Globe, ArrowLeft, Loader2, Calendar, User } from 'lucide-react';
import Markdown from 'react-markdown';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'dynamicPages'), where('slug', '==', slug), where('isPublished', '==', true));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setPage(data);
        
        // Update Title & Meta Tags
        document.title = data.seoTitle || data.title || 'Dynamic Page';
        
        // Custom CSS Injection
        if (data.customCss) {
          const styleId = `custom-css-${data.slug}`;
          let styleEl = document.getElementById(styleId);
          if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
          }
          styleEl.innerHTML = data.customCss;
          return () => { styleEl?.remove(); };
        }

        // Custom JS Injection
        if (data.customJs) {
          try {
            const script = document.createElement('script');
            script.innerHTML = data.customJs;
            document.body.appendChild(script);
            return () => { script.remove(); };
          } catch (e) {
            console.error('Custom JS execution error:', e);
          }
        }
      } else {
        setPage(null);
      }
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'dynamicPages');
      setLoading(false);
    });
    return unsub;
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen w-full bg-dark-surface flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-pink" size={48} />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="h-screen w-full bg-dark-surface flex flex-col items-center justify-center gap-6">
        <h1 className="text-4xl font-display font-black text-white">404 - Page Not Found</h1>
        <p className="text-gray-500 uppercase tracking-widest font-bold">The requested page does not exist or is unpublished.</p>
        <Link to="/" className="px-8 py-4 bg-gradient text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Back to Home</Link>
      </div>
    );
  }

  const getLayoutClasses = () => {
    switch (page.layout) {
      case 'narrow': return 'max-w-3xl';
      case 'full-width': return 'max-w-none px-12';
      default: return 'max-w-5xl';
    }
  };

  return (
    <div className="bg-dark-surface min-h-screen text-white selection:bg-brand-pink/30">
      <Navbar />

      {page.headerVisible !== false && (
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
          {page.headerImage ? (
            <img 
              src={page.headerImage} 
              className="absolute inset-0 w-full h-full object-cover" 
              alt={page.title}
              referrerPolicy="no-referrer"
            />
          ) : (
             <div className="absolute inset-0 bg-neutral-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-surface/60 via-dark-surface/40 to-dark-surface" />
          
          <div className={`relative z-10 mx-auto px-6 text-center space-y-6 ${getLayoutClasses()}`}>
             <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
             >
               <h1 className="text-4xl md:text-7xl font-display font-black italic tracking-tighter text-white drop-shadow-2xl">
                 {page.title}
               </h1>
               <div className="flex items-center justify-center gap-6 mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-charcoal-400">
                  <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5"><Calendar size={12} className="text-brand-pink" /> {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-brand-pink"><User size={12} /> {page.category || 'Portfolio'}</span>
               </div>
             </motion.div>
          </div>
        </section>
      )}

      <main className={`${getLayoutClasses()} mx-auto px-6 ${page.headerVisible === false ? 'pt-40' : 'pt-20'} pb-32`}>
        {page.showSearch && (
          <div className="mb-16 relative">
             <div className="absolute inset-y-0 left-6 flex items-center text-gray-500">
                <Search size={20} />
             </div>
             <input 
              type="text"
              placeholder="Search page content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 outline-none focus:border-brand-pink transition-all font-medium text-lg shadow-inner"
             />
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="prose prose-invert prose-brand max-w-none prose-headings:font-display prose-headings:italic prose-headings:font-black prose-p:text-gray-400 prose-p:leading-relaxed prose-lg prose-img:rounded-[2.5rem] prose-img:border prose-img:border-white/5"
        >
          <div className="markdown-body">
            <Markdown>{page.content}</Markdown>
          </div>
        </motion.div>

        {/* Dynamic Components: Buttons & Socials */}
        {( (page.buttons && page.buttons.length > 0) || (page.socialLinks && page.socialLinks.length > 0) ) && (
          <div className="mt-24 space-y-12">
            {page.buttons && page.buttons.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6">
                {page.buttons.map((btn: any, i: number) => (
                  <motion.a
                    key={i}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl ${
                      btn.variant === 'secondary' 
                        ? 'bg-white text-black hover:bg-white/90' 
                        : btn.variant === 'outline'
                        ? 'border-2 border-white/10 text-white hover:border-brand-pink'
                        : 'bg-gradient text-white'
                    }`}
                  >
                    {btn.label}
                  </motion.a>
                ))}
              </div>
            )}

            {page.socialLinks && page.socialLinks.length > 0 && (
              <div className="flex justify-center gap-4">
                {page.socialLinks.map((link: any, i: number) => (
                  <motion.a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.1, color: '#FF0080' }}
                    className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-gray-500 transition-all hover:border-brand-pink/30 hover:bg-brand-pink/5 text-xl"
                    dangerouslySetInnerHTML={{ __html: link.icon || '<i class="fas fa-link"></i>' }}
                  />
                ))}
              </div>
            )}

            {page.form && page.form.enabled && (
              <div className="mt-24 max-w-2xl mx-auto w-full">
                <DynamicForm form={page.form} pageId={page.id} pageTitle={page.title} />
              </div>
            )}
          </div>
        )}

        <div className="mt-32 pt-16 border-t border-white/5 flex flex-col items-center gap-8">
           <div className="w-12 h-1 bg-gradient rounded-full opacity-30" />
           <Link to="/" className="flex items-center gap-3 text-gray-500 hover:text-brand-pink transition-all group font-black uppercase tracking-widest text-[10px]">
             <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Take Me Back Home
           </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function DynamicForm({ form, pageId, pageTitle }: { form: any, pageId: string, pageTitle: string }) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(db, 'formSubmissions'), {
        pageId,
        pageTitle,
        formTitle: form.title,
        data: formData,
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submission Error:", err);
      setError("Failed to send submission. Please try again.");
      handleFirestoreError(err, OperationType.WRITE, 'formSubmissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-12 glass rounded-[3rem] border border-green-500/20 text-center space-y-6"
      >
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 text-3xl">
          <Globe size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-display font-black text-white italic uppercase tracking-tight">Transmission Complete</h3>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">{form.successMessage || 'Your message has been received successfully.'}</p>
        </div>
        <button 
          onClick={() => { setSubmitted(false); setFormData({}); }}
          className="h-12 px-8 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all"
        >
          Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <div className="p-10 glass rounded-[3.5rem] border border-white/5 space-y-10 shadow-2x">
      <div className="space-y-2">
        <h3 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter">{form.title || 'Get in Touch'}</h3>
        <p className="text-[10px] text-brand-pink font-black uppercase tracking-[0.3em]">Initialize Response Protocol</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {(form.fields || []).map((field: any) => (
            <div key={field.id} className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">
                {field.label} {field.required && <span className="text-brand-pink">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea 
                  required={field.required}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ''}
                  onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                  rows={5}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-brand-pink outline-none transition-all resize-none"
                />
              ) : field.type === 'select' ? (
                <select 
                  required={field.required}
                  value={formData[field.id] || ''}
                  onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                  className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none transition-all"
                >
                  <option value="">{field.placeholder || '-- Select Option --'}</option>
                  {(field.options || '').split(',').map((opt: string) => (
                    <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-xl hover:bg-white/5 transition-all">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      required={field.required}
                      checked={!!formData[field.id]}
                      onChange={e => setFormData({...formData, [field.id]: e.target.checked})}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 border-2 border-white/20 rounded-md peer-checked:bg-brand-pink peer-checked:border-brand-pink transition-all" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 text-white font-bold text-[10px]">L</div>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-all">{field.placeholder || field.label}</span>
                </label>
              ) : field.type === 'radio' ? (
                <div className="space-y-2 p-2">
                  {(field.options || '').split(',').map((opt: string) => (
                    <label key={opt.trim()} className="flex items-center gap-4 cursor-pointer group hover:bg-white/5 p-3 rounded-xl transition-all">
                      <div className="relative">
                        <input 
                          type="radio"
                          name={field.id}
                          required={field.required}
                          checked={formData[field.id] === opt.trim()}
                          onChange={() => setFormData({...formData, [field.id]: opt.trim()})}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 border-2 border-white/20 rounded-full peer-checked:bg-brand-pink peer-checked:border-brand-pink transition-all" />
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-white transition-all">{opt.trim()}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input 
                  type={field.type}
                  required={field.required}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ''}
                  onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                  className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none transition-all"
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
        )}

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full h-16 bg-gradient text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.01] transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : form.submitText || 'Submit Form'}
        </button>
      </form>
    </div>
  );
}
