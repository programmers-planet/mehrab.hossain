import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Calendar, Clock, ArrowLeft, Share2, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;

    const unsub = onSnapshot(doc(db, 'blog', id), (snapshot) => {
      if (snapshot.exists()) {
        setPost({ id: snapshot.id, ...snapshot.data() });
      }
      setLoading(false);
    });

    return unsub;
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-pink"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-dark-surface text-white flex flex-col items-center justify-center p-8">
        <h2 className="text-4xl font-display font-bold mb-4">Post Not Found</h2>
        <Link to="/blog" className="text-brand-pink hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-surface text-white">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors mb-12 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Tech Insights
          </Link>

          {/* Hero Header */}
          <div className="space-y-8 mb-16">
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-brand-pink font-black">
              <span className="px-3 py-1 bg-brand-pink/10 border border-brand-pink/20 rounded-full">{post.category}</span>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-1.5 text-gray-400"><Calendar size={12} /> {post.date || 'Recently Published'}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center justify-between py-8 border-y border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient flex items-center justify-center font-bold text-black">
                  S
                </div>
                <div>
                  <p className="text-sm font-bold">Shahed Afridi</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">AI Automation Expert</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div className="aspect-video w-full rounded-[3rem] overflow-hidden mb-16 border border-white/5">
            <img 
              src={post.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop"} 
              alt={post.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Article Content */}
          <article className="prose prose-invert prose-brand max-w-none">
            <div className="markdown-content text-gray-300 leading-[1.8] text-lg font-medium space-y-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content || post.excerpt || "No content available for this post yet."}
              </ReactMarkdown>
            </div>
          </article>
          
          {/* Footer of the post */}
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <Tag size={18} className="text-brand-pink" />
              <div className="flex flex-wrap gap-2">
                {(post.blogTags || post.category || "").split(',').map((tag: string) => (
                  <span key={tag} className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-gray-400">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
            
            <Link to="/blog" className="px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-gray-200 transition-all text-xs uppercase tracking-widest text-center">
              Back to more articles
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
