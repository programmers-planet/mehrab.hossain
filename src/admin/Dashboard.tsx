import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Settings, 
  Briefcase, 
  GraduationCap,
  MessageSquare, 
  FileText, 
  LogOut, 
  Home,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Upload,
  Loader2,
  Tag,
  Layout,
  Menu,
  Eye,
  EyeOff,
  Globe,
  Palette,
  Type,
  User,
  Award,
  BarChart3,
  Image,
  ShieldCheck,
  Lock,
  Layers,
  Box,
  PlusCircle,
  Columns,
  Presentation,
  Search,
  FilePlus,
  PlusSquare,
  Copy
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc, deleteDoc, addDoc, onSnapshot, query, orderBy, serverTimestamp, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

// Image Upload Helper using ImgBB
function ImageUpload({ 
  onUploadSuccess, 
  currentImage, 
  label = "Upload Image",
  aspectRatio = "aspect-square"
}: { 
  onUploadSuccess: (url: string) => void, 
  currentImage?: string,
  label?: string,
  aspectRatio?: string
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const IMGBB_API_KEY = (import.meta as any).env.VITE_IMGBB_API_KEY;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!IMGBB_API_KEY) {
      alert('ImgBB API Key is missing. Please add VITE_IMGBB_API_KEY to your environment variables.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        onUploadSuccess(result.data.url);
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image. Please check your API key or connection.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">{label}</label>
      <div 
        className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-white/10 hover:border-brand-pink/50 transition-all ${aspectRatio} flex flex-col items-center justify-center bg-black/40`}
        onClick={() => fileInputRef.current?.click()}
      >
        {currentImage ? (
          <>
            <img src={currentImage} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
              <Upload className="text-white" size={32} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-500">
            {uploading ? <Loader2 className="animate-spin text-brand-pink" size={32} /> : <Upload size={32} />}
            <span className="text-xs font-bold uppercase tracking-widest">{uploading ? 'Uploading...' : 'Choose File'}</span>
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleUpload}
          disabled={uploading}
        />
      </div>
    </div>
  );
}

// Multiple Image Upload Helper for Gallery
function GalleryUpload({ 
  onUploadSuccess, 
  currentImages = [], 
  label = "Project Gallery (Multiple Photos)"
}: { 
  onUploadSuccess: (urls: string[]) => void, 
  currentImages?: string[],
  label?: string
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const IMGBB_API_KEY = (import.meta as any).env.VITE_IMGBB_API_KEY;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!IMGBB_API_KEY) {
      alert('ImgBB API Key is missing. Please add VITE_IMGBB_API_KEY to your environment variables.');
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [...(currentImages || [])];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          uploadedUrls.push(result.data.url);
        }
      }
      onUploadSuccess(uploadedUrls);
    } catch (err) {
      console.error('Gallery Upload error:', err);
      alert('Failed to upload some images. Please check your connection.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updated = currentImages.filter((_, i) => i !== index);
    onUploadSuccess(updated);
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {currentImages && currentImages.map((img, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-white/5">
            <img src={img} className="w-full h-full object-cover" />
            <button 
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 p-1.5 bg-brand-red text-white rounded-full opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100 shadow-xl"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-brand-pink/50 transition-all flex flex-col items-center justify-center bg-black/40 gap-2 group"
        >
          {uploading ? (
            <Loader2 className="animate-spin text-brand-pink" size={24} />
          ) : (
            <>
              <Plus className="text-gray-500 group-hover:text-brand-pink transition-colors" size={24} />
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 text-center px-2">Add Photos</span>
            </>
          )}
        </button>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        multiple 
        onChange={handleUpload}
      />
    </div>
  );
}

// Video Upload Helper using Cloudinary (or suggested service)
function VideoUpload({ 
  onUploadSuccess, 
  currentVideo, 
  label = "Upload Project Video"
}: { 
  onUploadSuccess: (url: string) => void, 
  currentVideo?: string,
  label?: string
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // These should be set in .env or Settings
  const CLOUD_NAME = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to e.g. 50MB for free tiers)
    if (file.size > 50 * 1024 * 1024) {
      alert('File is too large. Please keep videos under 50MB or use a YouTube link.');
      return;
    }

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      alert('Cloudinary configuration is missing. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your environment variables for direct file uploads. Alternatively, you can paste a video URL below.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.secure_url) {
        onUploadSuccess(result.secure_url);
      } else {
        throw new Error(result.error?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload video. Please check your Cloudinary settings or try a smaller file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">{label}</label>
      <div className="flex flex-col gap-4">
        <div 
          className="relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-white/10 hover:border-brand-pink/50 transition-all aspect-video flex flex-col items-center justify-center bg-black/40"
          onClick={() => fileInputRef.current?.click()}
        >
          {currentVideo ? (
            <video 
              src={currentVideo} 
              className="w-full h-full object-cover"
              onMouseOver={e => (e.target as HTMLVideoElement).play()}
              onMouseOut={e => (e.target as HTMLVideoElement).pause()}
              muted
              loop
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-500">
              {uploading ? <Loader2 className="animate-spin text-brand-pink" size={32} /> : <Upload size={32} />}
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-widest block">{uploading ? 'Processing Video...' : 'Select Video File'}</span>
                <span className="text-[10px] opacity-40 mt-1 block">MP4, WebM up to 50MB</span>
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="video/*" 
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
        
        <div className="relative">
          <input 
            type="text"
            placeholder="Or paste YouTube / Vimeo / MP4 URL here..."
            value={currentVideo || ''}
            onChange={(e) => onUploadSuccess(e.target.value)}
            className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs outline-none focus:border-brand-pink transition-all"
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminConfig, setAdminConfig] = useState<any>({
    primaryColor: '#ec4899',
    secondaryColor: '#dc2626',
    adminEmail: 'mehrabhossain211@gmail.com'
  });
  const [customSections, setCustomSections] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubAdmin = onSnapshot(doc(db, 'config', 'admin'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAdminConfig(data);
        
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--color-brand-pink', data.primaryColor);
        }
        if (data.secondaryColor) {
          document.documentElement.style.setProperty('--color-brand-red', data.secondaryColor);
        }
      }
    });

    const q = query(collection(db, 'customSections'), orderBy('order', 'asc'));
    const unsubSections = onSnapshot(q, (snapshot) => {
      setCustomSections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubAdmin();
      unsubSections();
    };
  }, []);

  const menuItems = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { id: 'site', icon: <Settings size={20} />, label: 'Site Config' },
    { id: 'hero', icon: <Home size={20} />, label: 'Hero Section' },
    { id: 'about', icon: <FileText size={20} />, label: 'About Me' },
    { id: 'section-builder', icon: <Layers size={20} />, label: 'Section Builder' },
    // Custom Sections Added Dynamically
    ...customSections.map(s => ({
      id: `section-item-${s.id}`,
      label: s.title,
      icon: s.layout === 'slider' ? <Presentation size={20} /> : <Columns size={20} />,
      isCustom: true
    })),
    { id: 'services', icon: <Settings size={20} />, label: 'Services' },
    { id: 'portfolio', icon: <Briefcase size={20} />, label: 'Projects' },
    { id: 'education', icon: <GraduationCap size={20} />, label: 'Education' },
    { id: 'dynamic-pages', icon: <FileText size={20} />, label: 'Page Management' },
    { id: 'pages', icon: <Layout size={20} />, label: 'Page Content' },
    { id: 'navigation', icon: <Menu size={20} />, label: 'Navigation' },
    { id: 'categories', icon: <Tag size={20} />, label: 'Categories' },
    { id: 'testimonials', icon: <MessageSquare size={20} />, label: 'Reviews' },
    { id: 'blog', icon: <FileText size={20} />, label: 'Blog Posts' },
    { id: 'design', icon: <Palette size={20} />, label: 'Design & Fonts' },
    { id: 'messages', icon: <MessageSquare size={20} />, label: 'Messages' },
    { id: 'inquiries', icon: <FilePlus size={20} />, label: 'Form Inquiries' },
    { id: 'admin-settings', icon: <ShieldCheck size={20} />, label: 'Credentials & Security' },
  ];

  return (
    <div className="min-h-screen bg-dark-surface text-white flex flex-col lg:flex-row">
      {/* Mobile Header Toggle */}
      <div className="lg:hidden flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-dark-surface z-[100]">
        <div className="text-xl font-logo font-black italic text-gradient tracking-tight uppercase">
          {adminConfig.cmsTitle || 'SHAED.DEV CMS'}
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 glass rounded-xl text-white"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 border-r border-white/5 p-8 flex flex-col gap-10 bg-dark-surface z-[90] transition-transform duration-300 lg:sticky lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="hidden lg:block text-xl font-logo font-black italic text-gradient tracking-tight text-center uppercase">
          {adminConfig.cmsTitle || 'SHAED.DEV CMS'}
        </div>

        <nav className="flex flex-col gap-1 flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center gap-4 px-6 py-3.5 rounded-xl font-bold transition-all ${
                activeTab === item.id 
                ? 'bg-brand-pink text-white shadow-lg glow-shadow' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon} <span className="text-sm truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-white/5">
          <button 
            onClick={() => auth.signOut().then(() => navigate('/'))}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-xl font-bold text-brand-red hover:bg-brand-red/10 transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-grow p-4 md:p-12 overflow-y-auto w-full">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8 md:mb-12">
          <div>
            <h2 className="text-xl md:text-4xl font-display font-bold capitalize">
              {activeTab.startsWith('section-item-') 
                ? customSections.find(s => `section-item-${s.id}` === activeTab)?.title || 'Custom Section'
                : activeTab.replace('-', ' ')}
            </h2>
            <p className="text-gray-400 text-xs md:text-sm mt-1">Manage your website {activeTab} content</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-3 pr-6 rounded-2xl border border-white/10 w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient flex items-center justify-center font-bold shrink-0">
              {auth.currentUser?.email?.[0].toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate max-w-[150px]">{auth.currentUser?.email}</span>
              <span className="text-[10px] uppercase tracking-widest text-brand-pink font-black">Super Admin</span>
            </div>
          </div>
        </header>

        <div className="max-w-6xl pb-20 mx-auto w-full">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'site' && <SiteTab />}
          {activeTab === 'hero' && <HeroTab />}
          {activeTab === 'about' && <AboutTab />}
          {activeTab === 'section-builder' && <SectionBuilderTab />}
          
          {/* Handle Dynamic Custom Section Content */}
          {activeTab.startsWith('section-item-') && (
            <CustomSectionItemManager sectionId={activeTab.replace('section-item-', '')} />
          )}

          {activeTab === 'services' && <ListManager collectionName="services" title="Service" />}
          {activeTab === 'portfolio' && <ListManager collectionName="projects" title="Project" categoryDefault="Web Development" useDynamicCategories={true} />}
          {activeTab === 'education' && <ListManager collectionName="education" title="Education Qualification" />}
          {activeTab === 'dynamic-pages' && <DynamicPagesTab />}
          {activeTab === 'pages' && <PagesTab />}
          {activeTab === 'navigation' && <NavigationTab />}
          {activeTab === 'categories' && <ListManager collectionName="categories" title="Category" />}
          {activeTab === 'testimonials' && <ListManager collectionName="testimonials" title="Review" />}
          {activeTab === 'blog' && <ListManager collectionName="blog" title="Blog Post" useDynamicCategories={true} />}
          {activeTab === 'design' && <DesignTab />}
          {activeTab === 'messages' && <MessagesTab />}
          {activeTab === 'inquiries' && <InquiriesTab />}
          {activeTab === 'admin-settings' && <AdminSettingsTab />}
        </div>
      </main>
    </div>
  );
}

function PagesTab() {
  const [data, setData] = useState<any>({
    site: {
      logoText: "SHAHED.DEV",
      logoImage: "",
      tagline: "Building the future with AI & Code",
      contact: {
        email: "shahed.dev@gmail.com",
        phone: "+880 1234 567 890",
        whatsapp: "+880 1234 567 890",
        address: "Dhaka, Bangladesh"
      },
      socialLinks: []
    },
    portfolio: {
      title: "Full",
      highlight: "Portfolio",
      description: "Explore my complete collection of projects..."
    },
    blog: {
      title: "Tech",
      highlight: "Insights",
      description: "Diving deep into AI, automation, and the future of technology."
    }
  });
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('site');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'pages'), (snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.data();
        setData((prev: any) => ({
          ...prev,
          ...remoteData
        }));
      }
    });
    return unsub;
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'config', 'pages'), data);
      alert('Professional site configuration updated successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/pages');
    } finally {
      setLoading(false);
    }
  };

  const SectionButton = ({ id, label, icon }: { id: string, label: string, icon: any }) => (
    <button
      type="button"
      onClick={() => setActiveSection(id)}
      className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all border ${
        activeSection === id 
        ? 'bg-gradient text-white border-transparent glow-shadow' 
        : 'bg-black/20 border-white/5 text-gray-500 hover:border-white/20'
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 mb-8">
        <SectionButton id="site" label="Identity" icon={<Settings size={18} />} />
        <SectionButton id="portfolio" label="Portfolio Page" icon={<Briefcase size={18} />} />
        <SectionButton id="blog" label="Blog Page" icon={<FileText size={18} />} />
      </div>

      <form onSubmit={handleSave} className="space-y-12">
        {/* Site Identity Section */}
        {activeSection === 'site' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 space-y-8 md:space-y-12">
            <div className="space-y-8">
              <h3 className="text-xl md:text-2xl font-display font-bold mb-4">Site Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Logo Text / Name</label>
                  <input 
                    value={data.site.logoText} 
                    onChange={e => setData({...data, site: {...data.site, logoText: e.target.value}})}
                    className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all font-bold"
                  />
                </div>
                <div className="space-y-4">
                  <ImageUpload 
                    label="Site Logo Image (Optional)"
                    currentImage={data.site.logoImage}
                    onUploadSuccess={(url) => setData({...data, site: {...data.site, logoImage: url}})}
                    aspectRatio="aspect-video"
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Main Tagline</label>
                  <input 
                    value={data.site.tagline} 
                    onChange={e => setData({...data, site: {...data.site, tagline: e.target.value}})}
                    className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-8 border-t border-white/5">
              <h3 className="text-2xl font-display font-bold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Email Address</label>
                  <input 
                    value={data.site.contact?.email || ''} 
                    onChange={e => setData({...data, site: {...data.site, contact: {...data.site.contact, email: e.target.value}}})}
                    className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Phone Number</label>
                  <input 
                    value={data.site.contact?.phone || ''} 
                    onChange={e => setData({...data, site: {...data.site, contact: {...data.site.contact, phone: e.target.value}}})}
                    className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">WhatsApp Number</label>
                  <input 
                    value={data.site.contact?.whatsapp || ''} 
                    onChange={e => setData({...data, site: {...data.site, contact: {...data.site.contact, whatsapp: e.target.value}}})}
                    className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Location / Address</label>
                  <input 
                    value={data.site.contact?.address || ''} 
                    onChange={e => setData({...data, site: {...data.site, contact: {...data.site.contact, address: e.target.value}}})}
                    className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-8 border-t border-white/5">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display font-bold mb-4">Social Links</h3>
                <button 
                  type="button"
                  onClick={() => {
                    const newSocials = [...(data.site.socialLinks || [])];
                    newSocials.push({ platform: '', url: '', icon: '' });
                    setData({...data, site: {...data.site, socialLinks: newSocials}});
                  }}
                  className="px-6 py-2 bg-brand-pink/20 hover:bg-brand-pink/30 text-brand-pink rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Add Social Link
                </button>
              </div>
              
              <div className="space-y-6">
                {(data.site.socialLinks || []).map((social: any, idx: number) => (
                  <div key={idx} className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 relative group">
                    <button 
                      type="button"
                      onClick={() => {
                        const newSocials = data.site.socialLinks.filter((_: any, i: number) => i !== idx);
                        setData({...data, site: {...data.site, socialLinks: newSocials}});
                      }}
                      className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Platform Name</label>
                        <input 
                          value={social.platform} 
                          onChange={e => {
                            const newSocials = [...data.site.socialLinks];
                            newSocials[idx].platform = e.target.value;
                            setData({...data, site: {...data.site, socialLinks: newSocials}});
                          }}
                          placeholder="e.g. Github"
                          className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Profile URL</label>
                        <input 
                          value={social.url} 
                          onChange={e => {
                            const newSocials = [...data.site.socialLinks];
                            newSocials[idx].url = e.target.value;
                            setData({...data, site: {...data.site, socialLinks: newSocials}});
                          }}
                          placeholder="https://..."
                          className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Icon (FontAwesome Class)</label>
                        <input 
                          value={social.faIcon || ''} 
                          onChange={e => {
                            const newSocials = [...data.site.socialLinks];
                            newSocials[idx].faIcon = e.target.value;
                            setData({...data, site: {...data.site, socialLinks: newSocials}});
                          }}
                          placeholder="e.g. fa-brands fa-github"
                          className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Icon Base Color (Hex)</label>
                        <div className="flex gap-4">
                          <input 
                            type="color"
                            value={social.color || '#9ca3af'}
                            onChange={e => {
                              const newSocials = [...data.site.socialLinks];
                              newSocials[idx].color = e.target.value;
                              setData({...data, site: {...data.site, socialLinks: newSocials}});
                            }}
                            className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 p-1 cursor-pointer"
                          />
                          <input 
                            value={social.color || '#9ca3af'}
                            onChange={e => {
                              const newSocials = [...data.site.socialLinks];
                              newSocials[idx].color = e.target.value;
                              setData({...data, site: {...data.site, socialLinks: newSocials}});
                            }}
                            className="flex-1 h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Icon Hover Color (Hex)</label>
                        <div className="flex gap-4">
                          <input 
                            type="color"
                            value={social.hoverColor || '#ff0080'}
                            onChange={e => {
                              const newSocials = [...data.site.socialLinks];
                              newSocials[idx].hoverColor = e.target.value;
                              setData({...data, site: {...data.site, socialLinks: newSocials}});
                            }}
                            className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 p-1 cursor-pointer"
                          />
                          <input 
                            value={social.hoverColor || '#ff0080'}
                            onChange={e => {
                              const newSocials = [...data.site.socialLinks];
                              newSocials[idx].hoverColor = e.target.value;
                              setData({...data, site: {...data.site, socialLinks: newSocials}});
                            }}
                            className="flex-1 h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PNG Upload removed as per request */}
                  </div>
                ))}
                {(!data.site.socialLinks || data.site.socialLinks.length === 0) && (
                  <div className="py-12 text-center border-2 border-dashed border-white/10 rounded-[2rem]">
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">No social links added yet</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Portfolio Page Config */}
        {activeSection === 'portfolio' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-12 rounded-[3.5rem] border border-white/5 space-y-8">
            <h3 className="text-2xl font-display font-bold mb-4">Portfolio Page Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Prefix Title</label>
                <input 
                  value={data.portfolio.title} 
                  onChange={e => setData({...data, portfolio: {...data.portfolio, title: e.target.value}})}
                  className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Highlighted Text</label>
                <input 
                  value={data.portfolio.highlight} 
                  onChange={e => setData({...data, portfolio: {...data.portfolio, highlight: e.target.value}})}
                  className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all text-brand-pink"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Hero Description</label>
              <textarea 
                rows={3}
                value={data.portfolio.description} 
                onChange={e => setData({...data, portfolio: {...data.portfolio, description: e.target.value}})}
                className="w-full bg-black/40 border border-white/10 rounded-3xl p-8 outline-none focus:border-brand-pink transition-all resize-none leading-relaxed"
              />
            </div>
          </motion.div>
        )}

        {/* Blog Page Config */}
        {activeSection === 'blog' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-12 rounded-[3.5rem] border border-white/5 space-y-8">
            <h3 className="text-2xl font-display font-bold mb-4">Blog Page Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Prefix Title</label>
                <input 
                  value={data.blog.title} 
                  onChange={e => setData({...data, blog: {...data.blog, title: e.target.value}})}
                  className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-red transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Highlighted Text</label>
                <input 
                  value={data.blog.highlight} 
                  onChange={e => setData({...data, blog: {...data.blog, highlight: e.target.value}})}
                  className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-red transition-all text-brand-red"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Hero Description</label>
              <textarea 
                rows={3}
                value={data.blog.description} 
                onChange={e => setData({...data, blog: {...data.blog, description: e.target.value}})}
                className="w-full bg-black/40 border border-white/10 rounded-3xl p-8 outline-none focus:border-brand-red transition-all resize-none leading-relaxed"
              />
            </div>
          </motion.div>
        )}

        <button 
          type="submit" disabled={loading}
          className="w-full h-16 bg-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.01] transition-all glow-shadow sticky bottom-4 z-10"
        >
          <Save size={22} /> {loading ? 'Updating Page Config...' : 'Apply Content Changes'}
        </button>
      </form>
    </div>
  );
}

function NavigationTab() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'navigation'), (snapshot) => {
      if (snapshot.exists()) setLinks(snapshot.data().links || []);
      else {
        // Seed default links if none exist
        const defaults = [
          { name: 'Home', href: '/' },
          { name: 'About', href: '#about' },
          { name: 'Services', href: '#services' },
          { name: 'Portfolio', href: '/portfolio' },
          { name: 'Blog', href: '/blog' },
          { name: 'Contact', href: '#contact' },
        ];
        setLinks(defaults);
      }
    });
    return unsub;
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'config', 'navigation'), { links });
      alert('Navigation updated successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/navigation');
    } finally {
      setLoading(false);
    }
  };

  const addLink = () => {
    setLinks([...links, { name: 'New Link', href: '#' }]);
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
  };

  const updateLink = (index: number, field: string, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold">Navigation Menu</h2>
          <p className="text-gray-500">Manage your site's header navigation links</p>
        </div>
        <button 
          onClick={addLink}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold flex items-center gap-2 transition-all"
        >
          <Plus size={18} /> Add Menu Item
        </button>
      </div>

      <div className="space-y-4">
        {links.map((link, idx) => (
          <div key={idx} className="glass p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Label Name</label>
                <input 
                  value={link.name} 
                  onChange={e => updateLink(idx, 'name', e.target.value)}
                  className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 outline-none focus:border-brand-pink transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Href / URL (use # for anchors)</label>
                <input 
                  value={link.href} 
                  onChange={e => updateLink(idx, 'href', e.target.value)}
                  className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 outline-none focus:border-brand-pink transition-all"
                />
              </div>
            </div>
            <button 
              onClick={() => removeLink(idx)}
              className="w-full md:w-12 h-12 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSave}
        disabled={loading}
        className="w-full h-16 bg-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.01] transition-all glow-shadow sticky bottom-4 z-10"
      >
        <Save size={22} /> {loading ? 'Saving Menu...' : 'Apply Navigation Changes'}
      </button>
    </div>
  );
}

function OverviewTab() {
  const [counts, setCounts] = useState({ services: 0, projects: 0, messages: 0 });
  const [dbStatus, setDbStatus] = useState<'checking' | 'active' | 'error'>('checking');
  const IMGBB_API_KEY = (import.meta as any).env.VITE_IMGBB_API_KEY;
  const CLOUD_NAME = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const paths = ['services', 'projects', 'messages'];
        const newCounts: any = {};
        for (const p of paths) {
          const s = await getDocs(collection(db, p));
          newCounts[p] = s.size;
        }
        setCounts(newCounts);
        setDbStatus('active');
      } catch (err) {
        console.error("DB Status Error:", err);
        setDbStatus('error');
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Active Services', val: counts.services, color: 'text-brand-pink' },
          { label: 'Live Projects', val: counts.projects, color: 'text-brand-red' },
          { label: 'Inquiries', val: counts.messages, color: 'text-brand-pink' },
        ].map((stat, idx) => (
          <div key={idx} className="glass p-8 rounded-[2rem] border border-white/5 space-y-4 hover:border-white/10 transition-all">
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest leading-none">{stat.label}</p>
            <p className={`text-6xl font-display font-bold ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* System Status */}
        <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-6">
          <div>
            <h4 className="text-2xl font-bold">System Status</h4>
            <p className="text-gray-500 text-sm">Real-time configuration check</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-sm font-bold">ImgBB API Config</span>
              {IMGBB_API_KEY ? (
                <span className="text-[10px] px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-black uppercase tracking-widest">Active</span>
              ) : (
                <span className="text-[10px] px-3 py-1 bg-brand-red/20 text-brand-red rounded-full font-black uppercase tracking-widest">Not Found</span>
              )}
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-sm font-bold">Cloudinary Video API</span>
              {CLOUD_NAME && UPLOAD_PRESET ? (
                <span className="text-[10px] px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-black uppercase tracking-widest">Active</span>
              ) : (
                <span className="text-[10px] px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full font-black uppercase tracking-widest">Link Only</span>
              )}
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-sm font-bold">Database Connection</span>
              {dbStatus === 'active' ? (
                <span className="text-[10px] px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-black uppercase tracking-widest">Connected</span>
              ) : dbStatus === 'checking' ? (
                <span className="text-[10px] px-3 py-1 bg-white/10 text-white rounded-full font-black uppercase tracking-widest animate-pulse">Checking...</span>
              ) : (
                <span className="text-[10px] px-3 py-1 bg-brand-red/20 text-brand-red rounded-full font-black uppercase tracking-widest">Error</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass p-10 rounded-[3rem] border border-white/5 flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h4 className="text-2xl font-bold">Quick Actions</h4>
            <p className="text-gray-500 text-sm">Common management shortcuts</p>
          </div>
          <div className="flex gap-4">
            <button className="flex-grow px-6 py-4 glass rounded-xl text-sm font-bold hover:bg-white/5 transition-all">Export JSON</button>
            <button 
              onClick={() => window.open('/', '_blank')}
              className="flex-grow px-6 py-4 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
            >
              Live Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SiteTab() {
  const [data, setData] = useState<any>({
    logoText: "SHAED.DEV",
    email: "shahed@example.com",
    github: "",
    linkedin: "",
    facebook: "",
    location: "Dhaka, Bangladesh"
  });
  const [sectionConfig, setSectionConfig] = useState<any>({
    about: true,
    services: true,
    portfolio: true,
    testimonials: true,
    blog: true,
    contact: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubSite = onSnapshot(doc(db, 'config', 'site'), (snapshot) => {
      if (snapshot.exists()) setData(snapshot.data());
    });
    
    const unsubSections = onSnapshot(doc(db, 'config', 'sections'), (snapshot) => {
      if (snapshot.exists()) setSectionConfig(prev => ({ ...prev, ...snapshot.data() }));
    });

    return () => {
      unsubSite();
      unsubSections();
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Promise.all([
        setDoc(doc(db, 'config', 'site'), data),
        setDoc(doc(db, 'config', 'sections'), sectionConfig)
      ]);
      alert('Settings updated successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setSectionConfig((prev: any) => ({
      ...prev,
      [section]: prev[section] === false ? true : false
    }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-10">
      <div className="glass p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 space-y-8 md:space-y-10">
        <div>
          <h3 className="text-lg md:text-xl font-display font-black uppercase tracking-tight text-white italic mb-6 md:mb-8">Base Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Logo Text / Name</label>
              <input 
                value={data.logoText} onChange={e => setData({...data, logoText: e.target.value})}
                className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all font-bold"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Contact Email</label>
              <input 
                value={data.email} onChange={e => setData({...data, email: e.target.value})}
                className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all font-bold"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Location / Address</label>
              <input 
                value={data.location} onChange={e => setData({...data, location: e.target.value})}
                className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all font-bold"
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Primary GitHub Profile</label>
              <input 
                value={data.github} onChange={e => setData({...data, github: e.target.value})}
                className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-8">
        <div>
          <h3 className="text-xl font-display font-black uppercase tracking-tight text-white italic mb-2">Section Orchestration</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Enable or disable standard layout modules on the homepage.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 'about', label: 'About Me', icon: <User size={20} /> },
            { id: 'services', label: 'Services', icon: <Settings size={20} /> },
            { id: 'portfolio', label: 'Portfolio', icon: <Briefcase size={20} /> },
            { id: 'testimonials', label: 'Reviews', icon: <MessageSquare size={20} /> },
            { id: 'blog', label: 'Blog Feed', icon: <FileText size={20} /> },
            { id: 'contact', label: 'Contact Hub', icon: <Home size={20} /> },
            { id: 'featuredPages', label: 'Page Highlighter', icon: <Layout size={20} /> }
          ].map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => toggleSection(sec.id)}
              className={`p-6 rounded-[2rem] border transition-all flex flex-col gap-4 items-start ${
                sectionConfig[sec.id] !== false 
                ? 'bg-brand-pink/10 border-brand-pink/30 text-white' 
                : 'bg-white/5 border-white/5 text-gray-500 opacity-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sectionConfig[sec.id] !== false ? 'bg-brand-pink text-white' : 'bg-white/5 text-gray-500'}`}>
                {sec.icon}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">{sec.label}</p>
                <p className="text-[10px] font-bold mt-1 uppercase opacity-60">
                  {sectionConfig[sec.id] !== false ? 'Visible on Home' : 'Hidden from site'}
                </p>
              </div>
              <div className={`mt-2 h-1.5 w-full rounded-full overflow-hidden bg-black/40`}>
                <motion.div 
                  initial={false}
                  animate={{ width: sectionConfig[sec.id] !== false ? '100%' : '0%' }}
                  className="h-full bg-brand-pink"
                />
              </div>
            </button>
          ))}
        </div>

        {/* Dynamic Position Control for Page Highlighter */}
        {sectionConfig.featuredPages !== false && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-pink/20 text-brand-pink rounded-xl">
                <Layout size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest leading-none">Highlighter Position</h4>
                <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Select where this section appears on the homepage</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: 'after-hero', label: 'After Hero' },
                { id: 'after-about', label: 'After About' },
                { id: 'after-services', label: 'After Services' },
                { id: 'after-portfolio', label: 'After Projects' },
                { id: 'after-testimonials', label: 'After Reviews' },
                { id: 'after-blog', label: 'After Blog Feed' }
              ].map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setSectionConfig({...sectionConfig, featuredPagesPosition: pos.id})}
                  className={`px-6 py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    (sectionConfig.featuredPagesPosition === pos.id || (!sectionConfig.featuredPagesPosition && pos.id === 'after-hero'))
                    ? 'bg-brand-pink border-brand-pink text-white shadow-lg'
                    : 'bg-black/40 border-white/10 text-gray-500 hover:border-white/20'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <button 
        type="submit" disabled={loading}
        className="w-full h-16 bg-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.01] transition-all glow-shadow sticky bottom-4 z-10"
      >
        <Save size={22} /> {loading ? 'Updating Identity...' : 'Apply Global Changes'}
      </button>
    </form>
  );
}

function HeroTab() {
  const [data, setData] = useState<any>({
    title: "Hi, I'm",
    name: "Shahed Afridi",
    description: "I create powerful automation systems...",
    image: "",
    buttons: [
      { label: 'View Portfolio', url: '#portfolio', primary: true },
      { label: 'Download CV', url: '#', primary: false }
    ],
    showSocials: true,
    phrases: [],
    stats: [],
    badge1: { label: 'Industry Expert', sublabel: 'AI Strategist' },
    badge2: { label: 'Full Stack', sublabel: 'Web Developer' }
  });
  const [newPhrase, setNewPhrase] = useState('');
  const [newStat, setNewStat] = useState({ label: '', value: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'hero'), (snapshot) => {
      if (snapshot.exists()) setData(snapshot.data());
    });
    return unsub;
  }, []);

  const addPhrase = () => {
    if (!newPhrase.trim()) return;
    setData({ ...data, phrases: [...(data.phrases || []), newPhrase.trim()] });
    setNewPhrase('');
  };

  const removePhrase = (idx: number) => {
    const updated = data.phrases.filter((_: any, i: number) => i !== idx);
    setData({ ...data, phrases: updated });
  };

  const addStat = () => {
    if (!newStat.label.trim() || !newStat.value.trim()) return;
    setData({ ...data, stats: [...(data.stats || []), { ...newStat }] });
    setNewStat({ label: '', value: '' });
  };

  const removeStat = (idx: number) => {
    const updated = (data.stats || []).filter((_: any, i: number) => i !== idx);
    setData({ ...data, stats: updated });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'config', 'hero'), data);
      alert('Hero content saved!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/hero');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4">
      {/* Visual Identity Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">Hero <span className="text-gradient">Experience</span></h2>
          <p className="text-gray-500 mt-1 font-medium">Control the narrative of your landing page's primary section.</p>
        </div>
        <button 
          onClick={handleSave} disabled={loading}
          className="px-8 h-14 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.03] transition-all active:scale-95 shadow-2xl group"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover:rotate-12 transition-transform" />}
          {loading ? 'Publishing...' : 'Publish Portolio'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Profile & Identity Card */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink">
              <Image size={24} />
            </div>
            <h3 className="text-lg font-display font-black tracking-tight uppercase">Identity & Portrait</h3>
          </div>
          
          <div className="space-y-8">
            <ImageUpload 
              label="Portrait Image"
              currentImage={data.image}
              onUploadSuccess={(url) => setData({...data, image: url})}
              aspectRatio="aspect-square"
            />
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Greeting Headline</label>
                <input 
                  value={data.title} onChange={e => setData({...data, title: e.target.value})}
                  placeholder="e.g. Hi, I'm"
                  className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 outline-none focus:border-brand-pink transition-all font-display font-bold"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Your Full Name</label>
                <input 
                  value={data.name} onChange={e => setData({...data, name: e.target.value})}
                  placeholder="Shahed Afridi"
                  className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all font-display font-black text-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Effects Card */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink">
              <Type size={24} />
            </div>
            <div>
              <h3 className="text-lg font-display font-black tracking-tight uppercase">Dynamic Phrases</h3>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Animated wiping text sequence</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-2">
              <input 
                value={newPhrase} 
                onChange={e => setNewPhrase(e.target.value)}
                placeholder="e.g. AI Prompt Engineer"
                className="flex-1 h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs outline-none focus:border-brand-pink transition-all"
                onKeyDown={e => e.key === 'Enter' && addPhrase()}
              />
              <button 
                type="button"
                onClick={addPhrase} 
                className="px-5 bg-white text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {(data.phrases || []).map((phrase: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 group animate-in fade-in zoom-in duration-300">
                  <span className="text-[10px] font-bold text-gray-300">{phrase}</span>
                  <button onClick={() => removePhrase(idx)} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Statistics Card */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-display font-black tracking-tight uppercase">Hero Statistics</h3>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Display metrics below bio</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-2">
              <input 
                value={newStat.value} 
                onChange={e => setNewStat({...newStat, value: e.target.value})}
                placeholder="Value (e.g. 50+)"
                className="h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs outline-none focus:border-brand-pink transition-all font-black text-brand-pink"
              />
              <div className="flex gap-2">
                <input 
                  value={newStat.label} 
                  onChange={e => setNewStat({...newStat, label: e.target.value})}
                  placeholder="Label (Projects)"
                  className="flex-1 h-11 bg-black/40 border border-white/10 rounded-xl px-4 text-xs outline-none focus:border-brand-pink transition-all"
                  onKeyDown={e => e.key === 'Enter' && addStat()}
                />
                <button 
                  type="button"
                  onClick={addStat} 
                  className="p-3 bg-white text-black rounded-xl transition-all hover:scale-110 active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(data.stats || []).map((stat: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group transition-all hover:border-brand-pink/30 shadow-lg">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-brand-pink leading-none">{stat.value}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-1">{stat.label}</span>
                  </div>
                  <button onClick={() => removeStat(idx)} className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bio & Buttons Card */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8 flex flex-col h-full">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink">
              <Layout size={24} />
            </div>
            <h3 className="text-lg font-display font-black tracking-tight uppercase">Bio & Actions</h3>
          </div>

          <div className="space-y-6 flex-grow">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Hero Description</label>
              <textarea 
                rows={4}
                value={data.description} onChange={e => setData({...data, description: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-brand-pink transition-all resize-none leading-relaxed text-gray-300"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Call to Action Buttons</label>
                <button 
                  type="button"
                  onClick={() => setData({...data, buttons: [...(data.buttons || []), { label: '', url: '', primary: false }]})}
                  className="text-brand-pink font-black text-[9px] uppercase tracking-[0.2em] hover:opacity-70 transition-all font-mono"
                >
                  [ Add Button ]
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {(data.buttons || []).map((btn: any, idx: number) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-3 relative group">
                    <button 
                      type="button"
                      onClick={() => setData({...data, buttons: data.buttons.filter((_: any, i: number) => i !== idx)})}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-75"
                    >
                      <Trash2 size={10} />
                    </button>
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-600 block">Label</label>
                        <input 
                          value={btn.label} onChange={e => {
                            const newBtns = [...data.buttons];
                            newBtns[idx].label = e.target.value;
                            setData({...data, buttons: newBtns});
                          }}
                          className="w-full h-9 bg-black/40 border border-white/10 rounded-lg px-3 text-[10px] font-bold outline-none focus:border-brand-pink"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-600 block">URL Path</label>
                        <input 
                          value={btn.url} onChange={e => {
                            const newBtns = [...data.buttons];
                            newBtns[idx].url = e.target.value;
                            setData({...data, buttons: newBtns});
                          }}
                          className="w-full h-9 bg-black/40 border border-white/10 rounded-lg px-3 text-[10px] font-mono outline-none focus:border-brand-pink"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Social Links Visibility Toggle */}
          <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 mt-2 group hover:border-brand-pink/30 transition-all">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl transition-all ${data.showSocials ? 'bg-brand-pink/10 text-brand-pink' : 'bg-gray-800 text-gray-500'}`}>
                <Globe size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white">Social Links Visibility</p>
                <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Show "Find me on" in Hero</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setData({...data, showSocials: !data.showSocials})}
              className={`w-12 h-7 rounded-full relative transition-all duration-300 ${data.showSocials ? 'bg-brand-pink shadow-[0_0_15px_rgba(255,54,124,0.4)]' : 'bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${data.showSocials ? 'left-6' : 'left-1'} shadow-sm`} />
            </button>
          </div>
        </div>

        {/* Floating Identity Fragments */}
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink">
              <Award size={24} />
            </div>
            <div>
              <h3 className="text-lg font-display font-black tracking-tight uppercase">Floating Identity Fragments</h3>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Status indicators around portrait</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-black/20 rounded-2xl border border-white/10 space-y-4 relative group">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-pink animate-pulse" />
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Badge 01 (Top-Left)</label>
              </div>
              <div className="space-y-3">
                <input 
                  value={data.badge1?.label || ''} 
                  onChange={e => setData({...data, badge1: {...data.badge1, label: e.target.value}})}
                  placeholder="e.g. Industry Expert"
                  className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-4 text-xs outline-none focus:border-brand-pink transition-all font-bold"
                />
                <input 
                  value={data.badge1?.sublabel || ''} 
                  onChange={e => setData({...data, badge1: {...data.badge1, sublabel: e.target.value}})}
                  placeholder="e.g. AI Strategist"
                  className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-4 text-[10px] outline-none focus:border-brand-pink transition-all text-gray-500"
                />
              </div>
            </div>

            <div className="p-6 bg-black/20 rounded-2xl border border-white/10 space-y-4 relative group">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Badge 02 (Bottom-Right)</label>
              </div>
              <div className="space-y-3">
                <input 
                  value={data.badge2?.label || ''} 
                  onChange={e => setData({...data, badge2: {...data.badge2, label: e.target.value}})}
                  placeholder="e.g. Full Stack"
                  className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-4 text-xs outline-none focus:border-brand-red/50 transition-all font-bold"
                />
                <input 
                  value={data.badge2?.sublabel || ''} 
                  onChange={e => setData({...data, badge2: {...data.badge2, sublabel: e.target.value}})}
                  placeholder="e.g. Web Developer"
                  className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-4 text-[10px] outline-none focus:border-brand-red/50 transition-all text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutTab() {
  const [data, setData] = useState<any>({
    title: "Passionate developer based in Bangladesh",
    bio: "I bridge the gap between complex tech and user-centric design...",
    image: "",
    experience: "2+",
    projectsCount: "50+"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'about'), (snapshot) => {
      if (snapshot.exists()) setData(snapshot.data());
    });
    return unsub;
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'config', 'about'), data);
      alert('About section updated!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/about');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="glass p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 space-y-8 md:space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Header Title</label>
            <input 
              value={data.title} onChange={e => setData({...data, title: e.target.value})}
              className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all font-bold"
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Full Bio</label>
            <textarea 
              rows={8}
              value={data.bio} onChange={e => setData({...data, bio: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-3xl p-8 outline-none focus:border-brand-pink transition-all resize-none leading-relaxed"
            />
          </div>
        </div>
        
        <div className="space-y-8">
          <ImageUpload 
            label="Profile Picture"
            currentImage={data.image}
            onUploadSuccess={(url) => setData({...data, image: url})}
            aspectRatio="aspect-square"
          />
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-pink ml-2">Dynamic Stats / Facts</label>
            <AboutFactsManager />
          </div>
        </div>
      </div>
      <button 
        type="submit" disabled={loading}
        className="w-full h-16 bg-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.01] transition-all glow-shadow"
      >
        <Save size={22} /> {loading ? 'Saving...' : 'Update About Content'}
      </button>
    </form>
  );
}

function AboutFactsManager() {
  const [facts, setFacts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'aboutFacts'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setFacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const handleAdd = async () => {
    try {
      await addDoc(collection(db, 'aboutFacts'), {
        label: 'New Stat',
        value: '0',
        order: facts.length,
        isPublished: true,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'aboutFacts');
    }
  };

  const handleUpdate = async (id: string, field: string, val: any) => {
    try {
      await updateDoc(doc(db, 'aboutFacts', id), { [field]: val });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `aboutFacts/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fact?')) return;
    try {
      await deleteDoc(doc(db, 'aboutFacts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `aboutFacts/${id}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {facts.map((fact) => (
          <div key={fact.id} className="flex flex-col gap-4 p-5 bg-black/40 border border-white/10 rounded-2xl group hover:border-brand-pink/30 transition-all">
            <div className="flex items-center gap-4">
              <input 
                value={fact.value} 
                onChange={e => handleUpdate(fact.id, 'value', e.target.value)}
                placeholder="Value (e.g. 10+)" 
                className="w-24 h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-sm font-black text-brand-pink focus:border-brand-pink outline-none"
              />
              <input 
                value={fact.label} 
                onChange={e => handleUpdate(fact.id, 'label', e.target.value)}
                placeholder="Label (e.g. Projects)" 
                className="flex-1 h-10 bg-black/40 border border-white/10 rounded-xl px-3 text-xs uppercase tracking-widest font-bold text-gray-400 focus:border-brand-pink outline-none"
              />
              <button 
                onClick={() => handleUpdate(fact.id, 'isPublished', !fact.isPublished)}
                className={`p-2 rounded-lg transition-all ${fact.isPublished ? 'text-brand-pink bg-brand-pink/10' : 'text-gray-600 bg-white/5'}`}
                title={fact.isPublished ? 'Published' : 'Hidden'}
              >
                {fact.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button onClick={() => handleDelete(fact.id)} className="p-2 text-gray-600 hover:text-brand-red transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-[8px] font-black uppercase tracking-widest text-gray-600">Color</label>
                <input 
                  type="color"
                  value={fact.color || '#ec4899'}
                  onChange={e => handleUpdate(fact.id, 'color', e.target.value)}
                  className="w-6 h-6 rounded-md bg-transparent cursor-pointer border-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[8px] font-black uppercase tracking-widest text-gray-600">Order</label>
                <input 
                  type="number"
                  value={fact.order || 0}
                  onChange={e => handleUpdate(fact.id, 'order', parseInt(e.target.value))}
                  className="w-12 h-8 bg-black/40 border border-white/10 rounded-lg px-2 text-[10px] outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        type="button"
        onClick={handleAdd}
        className="w-full h-12 bg-white/5 border border-dashed border-white/20 rounded-2xl flex items-center justify-center gap-3 text-gray-500 hover:text-white hover:border-brand-pink/50 hover:bg-brand-pink/5 transition-all text-[10px] font-black uppercase tracking-[0.2em]"
      >
        <Plus size={16} /> Add New Fact
      </button>
    </div>
  );
}

function ListManager({ 
  collectionName, 
  title, 
  categoryDefault = '',
  useDynamicCategories = false
}: { 
  collectionName: string, 
  title: string, 
  categoryDefault?: string,
  useDynamicCategories?: boolean
}) {
  const [items, setItems] = useState<any[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      // If ordering fails (e.g. index missing), fallback to simple query
      onSnapshot(collection(db, collectionName), (snapshot) => {
        setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    });
    return unsub;
  }, [collectionName]);

  useEffect(() => {
    if (useDynamicCategories) {
      const unsub = onSnapshot(collection(db, 'categories'), (snapshot) => {
        setDynamicCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return unsub;
    }
  }, [useDynamicCategories]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item? This action is permanent.')) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
    }
  }

  const togglePublish = async (item: any) => {
    try {
      await updateDoc(doc(db, collectionName, item.id), {
        isPublished: !item.isPublished
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${collectionName}/${item.id}`);
    }
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data: any = Object.fromEntries(formData);
    
    // Add non-form data from state
    if (isEditing.image) data.image = isEditing.image;
    if (isEditing.videoUrl) data.videoUrl = isEditing.videoUrl;
    if (isEditing.gallery) data.gallery = isEditing.gallery;
    data.isPublished = isEditing.isPublished !== undefined ? isEditing.isPublished : true;
    data.showInHome = isEditing.showInHome !== undefined ? isEditing.showInHome : true;
    if (data.order) data.order = Number(data.order);
    
    try {
      if (isEditing.id) {
        await updateDoc(doc(db, collectionName, isEditing.id), data);
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, collectionName), data);
      }
      setIsEditing(null);
      alert(`${title} saved successfully!`);
    } catch (err) {
      console.error(`Error saving ${collectionName}:`, err);
      // Try to give a more readable error if it's a rule violation
      if (err instanceof Error && err.message.includes('permission-denied')) {
        alert(`Access Denied: You don't have permission to save this. Check if all required fields are provided.`);
      } else {
        alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      handleFirestoreError(err, OperationType.WRITE, collectionName);
    } finally {
      setLoading(false);
    }
  };

  const defaultCategories = ["Web Development", "AI", "IoT", "Automation", "Mobile Apps", "UI/UX Design"];
  const displayCategories = useDynamicCategories && dynamicCategories.length > 0 
    ? dynamicCategories.map(c => c.title || c.name).filter(Boolean)
    : defaultCategories;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5">
        <div>
          <h4 className="text-xl font-bold">{title} Management</h4>
          <p className="text-gray-500 text-sm">Organize your {collectionName} here</p>
        </div>
        <button 
          onClick={() => setIsEditing({ 
            category: categoryDefault
          })}
          className="px-6 py-3 bg-white text-black rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-all shadow-xl"
        >
          <Plus size={20} /> New {title}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col justify-between group hover:border-brand-pink/30 transition-all overflow-hidden relative">
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                   {item.image ? (
                     <img src={item.image} className="w-full h-full object-cover" />
                   ) : (
                     <Briefcase size={24} className="text-gray-600"/>
                   )}
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => togglePublish(item)} 
                    title={item.isPublished === false ? "Publish" : "Unpublish"}
                    className={`p-2 transition-colors rounded-lg ${item.isPublished === false ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20' : 'text-green-500 bg-green-500/10 hover:bg-green-500/20'}`}
                  >
                    {item.isPublished === false ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        await updateDoc(doc(db, collectionName, item.id), {
                          showInHome: item.showInHome === false ? true : false
                        });
                      } catch (err) {
                        handleFirestoreError(err, OperationType.UPDATE, `${collectionName}/${item.id}`);
                      }
                    }} 
                    title={item.showInHome === false ? "Show in Home" : "Hide from Home"}
                    className={`p-2 transition-colors rounded-lg ${item.showInHome === false ? 'text-gray-500 bg-white/5 hover:bg-white/10' : 'text-brand-pink bg-brand-pink/10 hover:bg-brand-pink/20'}`}
                  >
                    <Home size={16}/>
                  </button>
                  <button onClick={() => setIsEditing(item)} className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-lg"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-brand-red transition-colors bg-white/5 rounded-lg"><Trash2 size={16}/></button>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-lg leading-tight group-hover:text-brand-pink transition-colors">{item.title || item.name}</h4>
                  {item.isPublished === false && (
                    <span className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-500 rounded font-black uppercase tracking-widest border border-white/5">Draft</span>
                  )}
                </div>
                <div className="inline-block px-3 py-1 bg-brand-pink/10 text-brand-pink text-[9px] font-black uppercase tracking-widest mt-2 rounded-full border border-brand-pink/20">
                  {item.category || item.role}
                </div>
              </div>
              <p className="text-gray-500 text-xs line-clamp-3 leading-relaxed">
                {item.description || item.content || item.excerpt}
              </p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-xl"
              onClick={() => setIsEditing(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl glass p-10 md:p-14 rounded-[3.5rem] border border-white/20 shadow-2xl my-auto"
            >
              <h3 className="text-3xl font-display font-bold mb-10 text-gradient">{isEditing.id ? 'Modify' : 'Add New'} {title}</h3>
              <form onSubmit={handleSave} className="space-y-8">
                {collectionName === 'projects' ? (
                  <div className="space-y-10">
                    {/* Basic Info Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-px bg-white/10" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink">Basic Information</h4>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Project Title</label>
                          <input 
                            name="title" 
                            defaultValue={isEditing.title} 
                            required 
                            className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink font-bold transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Live Project URL (Optional)</label>
                          <input 
                            name="projectLink" 
                            defaultValue={isEditing.projectLink} 
                            placeholder="https://example.com"
                            className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink font-bold transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Project Details Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-px bg-white/10" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink">Project Details</h4>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Author</label>
                          <input 
                            name="author" 
                            defaultValue={isEditing.author || 'Shahed Afridi'} 
                            className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink font-bold transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Category</label>
                          <select 
                            name="category"
                            value={isEditing.category || displayCategories[0]}
                            onChange={(e) => setIsEditing({...isEditing, category: e.target.value})}
                            className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink appearance-none cursor-pointer font-bold"
                          >
                            {displayCategories.map(cat => (
                              <option key={cat} value={cat} className="bg-dark-surface">{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Tech Stack</label>
                          <input 
                            name="techStack" 
                            defaultValue={isEditing.techStack} 
                            placeholder="React, Firebase, Tailwind CSS..."
                            className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink font-bold transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Override Link Path</label>
                          <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-xs">/page/</span>
                            <input 
                              name="customLink" 
                              defaultValue={isEditing.customLink?.replace('/page/', '')} 
                              placeholder="slug"
                              className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl pl-16 pr-6 outline-none focus:border-brand-pink font-bold transition-all text-brand-pink font-mono"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Display Weight / Order</label>
                          <input 
                            name="order" 
                            type="number"
                            defaultValue={isEditing.order || 0} 
                            className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink font-bold transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Media Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-px bg-white/10" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink">Media Showcase</h4>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <ImageUpload 
                          label="Main Cover Image"
                          currentImage={isEditing.image}
                          onUploadSuccess={(url) => setIsEditing({...isEditing, image: url})}
                          aspectRatio="aspect-video"
                        />
                        <VideoUpload 
                          label="Project Demo Video"
                          currentVideo={isEditing.videoUrl}
                          onUploadSuccess={(url) => setIsEditing({...isEditing, videoUrl: url})}
                        />
                      </div>
                      <GalleryUpload 
                        currentImages={isEditing.gallery}
                        onUploadSuccess={(urls) => setIsEditing({...isEditing, gallery: urls})}
                      />
                    </div>

                    {/* Content Section */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-px bg-white/10" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-pink">Content & Description</h4>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Brief Summary</label>
                        <textarea 
                          name="description" 
                          defaultValue={isEditing.description} 
                          required 
                          rows={3} 
                          className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 outline-none focus:border-brand-pink resize-none leading-relaxed text-sm"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Detailed Content (Markdown Supported)</label>
                        <textarea 
                          name="content" 
                          defaultValue={isEditing.content} 
                          placeholder="Describe your project development process, features, etc..."
                          rows={10} 
                          className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 outline-none focus:border-brand-pink resize-y leading-relaxed text-sm font-mono"
                        />
                      </div>
                    </div>

                    {/* Visibility Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${isEditing.isPublished !== false ? 'text-green-500 bg-green-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                            {isEditing.isPublished !== false ? <Eye size={24} /> : <EyeOff size={24} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold uppercase tracking-widest">Public Visibility</p>
                            <p className="text-xs text-gray-500">Toggle to publish or draft this project</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditing({...isEditing, isPublished: isEditing.isPublished !== false ? false : true})}
                          className={`w-16 h-9 rounded-full relative transition-all duration-300 ${isEditing.isPublished !== false ? 'bg-green-500' : 'bg-gray-700'}`}
                        >
                          <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all duration-300 ${isEditing.isPublished !== false ? 'left-8.5' : 'left-1.5'}`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${isEditing.showInHome !== false ? 'text-brand-pink bg-brand-pink/10' : 'text-gray-500 bg-white/5'}`}>
                            <Home size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-bold uppercase tracking-widest">Show on Home</p>
                            <p className="text-xs text-gray-500">Toggle to display on landing page</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditing({...isEditing, showInHome: isEditing.showInHome !== false ? false : true})}
                          className={`w-16 h-9 rounded-full relative transition-all duration-300 ${isEditing.showInHome !== false ? 'bg-brand-pink' : 'bg-gray-700'}`}
                        >
                          <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all duration-300 ${isEditing.showInHome !== false ? 'left-8.5' : 'left-1.5'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`${(collectionName === 'categories' || collectionName === 'education') ? 'block' : 'grid grid-cols-1 md:grid-cols-2'} gap-10`}>
                      {(collectionName !== 'categories' && collectionName !== 'education') && (
                        <ImageUpload 
                          label="Item Preview Image"
                          currentImage={isEditing.image}
                          onUploadSuccess={(url) => setIsEditing({...isEditing, image: url})}
                          aspectRatio={collectionName === 'portfolio' ? 'aspect-video' : 'aspect-square'}
                        />
                      )}

                      <div className="space-y-6 flex-grow">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">
                            {collectionName === 'testimonials' ? 'Client Name' : 
                             collectionName === 'categories' ? 'Category Name' :
                             collectionName === 'education' ? 'Degree/Exam Title' :
                             (collectionName === 'blog' ? 'Article Title' : 'Project Title')}
                          </label>
                          <input 
                            name={collectionName === 'testimonials' ? 'name' : 'title'} 
                            defaultValue={isEditing.name || isEditing.title} 
                            required 
                            className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink font-bold transition-all text-white placeholder-gray-700"
                            placeholder="Enter display title..."
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 group hover:border-green-500/30 transition-all">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl transition-colors ${isEditing.isPublished !== false ? 'text-green-500 bg-green-500/10' : 'text-gray-500 bg-white/5'}`}>
                                {isEditing.isPublished !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white">Public</p>
                                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Visibility</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsEditing({...isEditing, isPublished: isEditing.isPublished !== false ? false : true})}
                              className={`w-12 h-6 rounded-full relative transition-all duration-500 ${isEditing.isPublished !== false ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-gray-700'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${isEditing.isPublished !== false ? 'left-7' : 'left-1'}`} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 group hover:border-brand-pink/30 transition-all">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl transition-colors ${isEditing.showInHome !== false ? 'text-brand-pink bg-brand-pink/10' : 'text-gray-500 bg-white/5'}`}>
                                <Home size={18} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white">Home</p>
                                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Featured</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsEditing({...isEditing, showInHome: isEditing.showInHome !== false ? false : true})}
                              className={`w-12 h-6 rounded-full relative transition-all duration-500 ${isEditing.showInHome !== false ? 'bg-brand-pink shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'bg-gray-700'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${isEditing.showInHome !== false ? 'left-7' : 'left-1'}`} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 p-6 bg-black/20 rounded-3xl border border-white/5">
                          <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 ml-1">Sequence Order</label>
                              <input 
                                name="order" 
                                type="number"
                                defaultValue={isEditing.order || 0} 
                                className="w-full h-10 bg-black/40 border border-white/10 rounded-xl px-4 outline-none focus:border-brand-pink font-bold transition-all text-xs"
                              />
                          </div>
                          <div className="flex items-end text-[8px] text-gray-600 font-bold uppercase tracking-widest pb-3">
                            Smaller numbers appear first
                          </div>
                        </div>

                        {(collectionName === 'blog' && useDynamicCategories) ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Category</label>
                              <select 
                                name="category"
                                value={isEditing.category || displayCategories[0]}
                                onChange={(e) => setIsEditing({...isEditing, category: e.target.value})}
                                className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink appearance-none cursor-pointer font-bold"
                              >
                                {displayCategories.map(cat => (
                                  <option key={cat} value={cat} className="bg-dark-surface">{cat}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ) : (
                          <>
                            {(collectionName === 'blog' && !useDynamicCategories) && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Category</label>
                                <input name="category" defaultValue={isEditing.category} required className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink"/>
                              </div>
                            )}
                            {collectionName === 'blog' && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Publish Date</label>
                                  <input name="date" defaultValue={isEditing.date} required className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink"/>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Tags (comma separated)</label>
                                  <input name="blogTags" defaultValue={isEditing.blogTags || isEditing.tags} placeholder="AI, Automation, Tech" className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink"/>
                                </div>
                              </div>
                            )}
                            {collectionName === 'testimonials' && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Client Role</label>
                                <input name="role" defaultValue={isEditing.role} required className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink"/>
                              </div>
                            )}
                            {collectionName === 'services' && (
                              <div className="space-y-6">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Icon Identifier (Lucide/FA)</label>
                                  <input name="icon" defaultValue={isEditing.icon} required className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink font-bold"/>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Override Link (e.g. /page/my-page)</label>
                                  <input name="customLink" defaultValue={isEditing.customLink} placeholder="/page/slug" className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink font-bold text-brand-pink"/>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {collectionName !== 'blog' && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">
                          {collectionName === 'testimonials' ? 'Testimonial Text' : 
                           collectionName === 'education' ? 'Institution & Result' : 'General Description'}
                        </label>
                        <textarea 
                          name={collectionName === 'testimonials' ? 'content' : 'description'} 
                          defaultValue={isEditing.content || isEditing.description} 
                          required 
                          rows={4} 
                          className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 outline-none focus:border-brand-pink resize-none leading-relaxed text-sm"
                        />
                      </div>
                    )}

                    {collectionName === 'blog' && (
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">
                          Full Article Content (Markdown Content)
                        </label>
                        <textarea 
                          name="content" 
                          defaultValue={isEditing.content} 
                          placeholder="Write your article here using markdown..."
                          rows={12} 
                          className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 outline-none focus:border-brand-pink resize-y leading-relaxed text-sm font-mono"
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="flex gap-4 pt-6">
                  <button type="submit" disabled={loading} className="flex-grow h-16 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl hover:bg-gray-200">
                    <Save size={20} /> {loading ? 'Saving to Cloud...' : 'Publish Item'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(null)} className="h-16 px-10 glass text-white rounded-2xl font-bold hover:bg-white/5 transition-all">
                    Discard
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DesignTab() {
  const [data, setData] = useState<any>({
    googleFonts: "Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;500;700",
    primaryFont: "'Space Grotesk', sans-serif",
    secondaryFont: "'Inter', sans-serif",
    sections: {
      hero: {
        titleSize: "clamp(2.5rem, 8vw, 5rem)",
        titleColor: "#ffffff",
        nameSize: "clamp(3rem, 10vw, 6rem)",
        nameColor: "#ff0080",
        descSize: "1.25rem",
        descColor: "#9ca3af"
      },
      about: {
        titleSize: "3.5rem",
        titleColor: "#ffffff",
        bioSize: "1.1rem",
        bioColor: "#9ca3af"
      },
      portfolio: {
        titleSize: "3.5rem",
        titleColor: "#ffffff",
        itemTitleSize: "1.5rem",
        itemTitleColor: "#ffffff",
        itemDescSize: "0.9rem",
        itemDescColor: "#9ca3af"
      },
      global: {
        bodySize: "1rem",
        bodyColor: "#9ca3af",
        accentColor: "#ff0080"
      }
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'design'), (snapshot) => {
      if (snapshot.exists()) {
        const remoteData = snapshot.data();
        setData((prev: any) => ({
          ...prev,
          ...remoteData,
          sections: {
            ...prev.sections,
            ...remoteData.sections
          }
        }));
      }
    });
    return unsub;
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'config', 'design'), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/design');
    } finally {
      setLoading(false);
    }
  };

  const DesignInput = ({ label, value, onChange, type = "text", placeholder, hint }: any) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
        {hint && <span className="text-[9px] text-gray-600 italic">{hint}</span>}
      </div>
      <div className="flex gap-2 group">
        {type === 'color' ? (
          <div className="relative flex items-center gap-3 w-full">
            <div className="relative w-12 h-12 shrink-0 group">
              <input 
                type="color" 
                value={value || '#ffffff'} 
                onChange={e => onChange(e.target.value)}
                className="w-full h-full rounded-xl bg-black/40 border border-white/10 p-1 cursor-pointer absolute inset-0 opacity-0 z-10"
              />
              <div 
                className="w-full h-full rounded-xl border border-white/20 shadow-inner group-hover:border-brand-pink/50 transition-all transform group-hover:scale-105" 
                style={{ backgroundColor: value || '#ffffff' }}
              />
            </div>
            <input 
              value={value || ''} 
              onChange={e => onChange(e.target.value)}
              className="flex-1 h-12 bg-black/40 border border-white/10 rounded-xl px-4 outline-none focus:border-brand-pink transition-all text-sm font-mono uppercase focus:ring-1 focus:ring-brand-pink/30"
              placeholder="#HEXCODE"
            />
          </div>
        ) : (
          <div className="flex-1 relative">
            <input 
              value={value || ''} 
              onChange={e => onChange(e.target.value)}
              className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 outline-none focus:border-brand-pink transition-all text-sm font-medium focus:ring-1 focus:ring-brand-pink/30"
              placeholder={placeholder || 'e.g. 1.2rem'}
            />
            {!value && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-700 pointer-events-none">Default</div>}
          </div>
        )}
      </div>
    </div>
  );

  const DesignCard = ({ title, icon, description, children, fullWidth = false }: any) => (
    <div className={`glass p-8 md:p-10 rounded-[3rem] border border-white/5 space-y-8 relative overflow-hidden group shadow-2xl transition-all hover:border-white/10 ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-pink/5 blur-[70px] -mr-24 -mt-24 pointer-events-none group-hover:bg-brand-pink/10 transition-colors duration-700" />
      <div className="flex items-start gap-5 border-b border-white/5 pb-8">
        <div className="w-14 h-14 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink shrink-0 shadow-inner">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-display font-black tracking-tight text-white">{title}</h3>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest font-black mt-1 opacity-80">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-32 max-w-7xl mx-auto px-4">
      {/* Header with Save Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-14 bg-white/5 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-brand-pink/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-5xl font-display font-black text-white leading-tight">Visual <span className="text-gradient">Style Guide</span></h2>
          <p className="text-gray-400 mt-2 font-medium max-w-md">Fine-tune your website's typography, colors, and layout scale with professional defaults.</p>
        </div>
        <button 
          onClick={handleSave} disabled={loading}
          className="px-12 h-20 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:scale-[1.03] transition-all active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)] group relative overflow-hidden z-10"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} className="group-hover:rotate-12 transition-transform" />}
          <span className="text-sm">{loading ? 'Publishing Changes...' : 'Save & Publish Styles'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Step 1: Typography */}
        <DesignCard 
          title="Master Typography" 
          icon={<Type size={28} />} 
          description="Global Font Collections & Aliases"
          fullWidth
        >
          <div className="col-span-full space-y-4 bg-black/40 p-8 rounded-[2.5rem] border border-white/5 relative group">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-pink flex items-center gap-2">
                <Globe size={14} /> Google Fonts Collection
              </label>
              <span className="text-[9px] text-gray-600 bg-white/5 px-3 py-1 rounded-full border border-white/5 font-bold">Recommended: Use standard variable fonts</span>
            </div>
            <input 
              value={data.googleFonts}
              onChange={e => setData({...data, googleFonts: e.target.value})}
              className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl px-6 outline-none focus:border-brand-pink transition-all font-mono text-xs text-brand-pink placeholder-gray-800"
              placeholder="e.g. Inter:wght@400;700&family=Space+Grotesk:wght@300;700"
            />
            <p className="text-[10px] text-gray-500 italic mt-3 leading-relaxed flex items-start gap-2">
              <span className="shrink-0 w-4 h-4 bg-white/5 rounded flex items-center justify-center text-[8px] font-black not-italic border border-white/10">i</span>
              <span>Go to fonts.google.com &rarr; Select fonts &rarr; Copy the 'family' string from the provided URL.</span>
            </p>
          </div>
          
          <DesignInput 
            label="Heading Font Index" 
            value={data.primaryFont} 
            placeholder="'Space Grotesk', sans-serif"
            hint="Used for Large Titles"
            onChange={(v: string) => setData({...data, primaryFont: v})}
          />
          <DesignInput 
            label="Base Body Font" 
            value={data.secondaryFont} 
            placeholder="'Inter', sans-serif"
            hint="Used for Bio & Content"
            onChange={(v: string) => setData({...data, secondaryFont: v})}
          />
          <DesignInput 
            label="Theme Accent Color" 
            type="color"
            value={data.sections.global.accentColor} 
            hint="Primary Brand Color"
            onChange={(v: string) => setData({...data, sections: {...data.sections, global: {...data.sections.global, accentColor: v}}})}
          />
        </DesignCard>

        {/* Step 2: Hero Layout */}
        <DesignCard title="Hero Experience" icon={<Layout size={28} />} description="Landing Page Introduction Scale">
          <DesignInput 
            label="Greeting Size" 
            value={data.sections.hero.titleSize} 
            placeholder="clamp(2.5rem, 8vw, 5rem)"
            hint="e.g. 5rem or 64px"
            onChange={(v: string) => setData({...data, sections: {...data.sections, hero: {...data.sections.hero, titleSize: v}}})} 
          />
          <DesignInput label="Greeting Color" type="color" value={data.sections.hero.titleColor} onChange={(v: string) => setData({...data, sections: {...data.sections, hero: {...data.sections.hero, titleColor: v}}})} />
          <div className="hidden lg:block"></div>
          <DesignInput 
            label="Name Text Size" 
            value={data.sections.hero.nameSize} 
            placeholder="clamp(3rem, 10vw, 6rem)"
            hint="e.g. 6rem or 80px"
            onChange={(v: string) => setData({...data, sections: {...data.sections, hero: {...data.sections.hero, nameSize: v}}})} 
          />
          <DesignInput label="Name Text Color" type="color" value={data.sections.hero.nameColor} onChange={(v: string) => setData({...data, sections: {...data.sections, hero: {...data.sections.hero, nameColor: v}}})} />
          <div className="hidden lg:block"></div>
          <DesignInput 
            label="Bio Description Size" 
            value={data.sections.hero.descSize} 
            placeholder="1.25rem"
            hint="Default: 1.25rem"
            onChange={(v: string) => setData({...data, sections: {...data.sections, hero: {...data.sections.hero, descSize: v}}})} 
          />
          <DesignInput label="Bio Text Color" type="color" value={data.sections.hero.descColor} onChange={(v: string) => setData({...data, sections: {...data.sections, hero: {...data.sections.hero, descColor: v}}})} />
        </DesignCard>

        {/* Step 3: About Section */}
        <DesignCard title="About Me Scale" icon={<User size={28} />} description="Personal Bio & About Heading Scale">
          <DesignInput 
            label="Section Title Size" 
            value={data.sections.about.titleSize} 
            placeholder="2.5rem"
            hint="About Heading"
            onChange={(v: string) => setData({...data, sections: {...data.sections, about: {...data.sections.about, titleSize: v}}})} 
          />
          <DesignInput label="Title Color" type="color" value={data.sections.about.titleColor} onChange={(v: string) => setData({...data, sections: {...data.sections, about: {...data.sections.about, titleColor: v}}})} />
          <div className="hidden lg:block"></div>
          <DesignInput 
            label="Bio Font Size" 
            value={data.sections.about.bioSize} 
            placeholder="1.125rem"
            hint="Personal Bio Text"
            onChange={(v: string) => setData({...data, sections: {...data.sections, about: {...data.sections.about, bioSize: v}}})} 
          />
          <DesignInput label="Bio Text Color" type="color" value={data.sections.about.bioColor} onChange={(v: string) => setData({...data, sections: {...data.sections, about: {...data.sections.about, bioColor: v}}})} />
        </DesignCard>

        {/* Step 4: Content Scale */}
        <DesignCard title="Content & Global" icon={<Palette size={28} />} description="Section Headings & Card Typography">
          <DesignInput 
            label="Section Title Size" 
            value={data.sections.portfolio.titleSize} 
            placeholder="3.5rem"
            hint="About, Works, Services"
            onChange={(v: string) => setData({...data, sections: {...data.sections, portfolio: {...data.sections.portfolio, titleSize: v}}})} 
          />
          <DesignInput label="Section Title Color" type="color" value={data.sections.portfolio.titleColor} onChange={(v: string) => setData({...data, sections: {...data.sections, portfolio: {...data.sections.portfolio, titleColor: v}}})} />
          <div className="hidden lg:block"></div>
          <DesignInput 
            label="Card Heading Size" 
            value={data.sections.portfolio.itemTitleSize} 
            placeholder="1.5rem"
            hint="Project & Blog Titles"
            onChange={(v: string) => setData({...data, sections: {...data.sections, portfolio: {...data.sections.portfolio, itemTitleSize: v}}})} 
          />
          <DesignInput label="Card Heading Color" type="color" value={data.sections.portfolio.itemTitleColor} onChange={(v: string) => setData({...data, sections: {...data.sections, portfolio: {...data.sections.portfolio, itemTitleColor: v}}})} />
          <div className="hidden lg:block"></div>
          <DesignInput 
            label="Global Body Size" 
            value={data.sections.global.bodySize} 
            placeholder="1rem"
            hint="Standard text size"
            onChange={(v: string) => setData({...data, sections: {...data.sections, global: {...data.sections.global, bodySize: v}}})} 
          />
          <DesignInput label="Global Body Color" type="color" value={data.sections.global.bodyColor} onChange={(v: string) => setData({...data, sections: {...data.sections, global: {...data.sections.global, bodyColor: v}}})} />
        </DesignCard>

        {/* Step 5: Advanced Sections */}
        <DesignCard title="Services & Testimonials" icon={<Settings size={28} />} description="Specialized Section Typography">
          <DesignInput 
            label="Service Title Size" 
            value={data.sections.services?.titleSize} 
            placeholder="3rem"
            onChange={(v: string) => setData({...data, sections: {...data.sections, services: {...data.sections.services, titleSize: v}}})} 
          />
          <DesignInput 
            label="Service Desc Size" 
            value={data.sections.services?.descSize} 
            placeholder="1rem"
            onChange={(v: string) => setData({...data, sections: {...data.sections, services: {...data.sections.services, descSize: v}}})} 
          />
          <div className="hidden lg:block"></div>
          <DesignInput 
            label="Review Large Title" 
            value={data.sections.testimonials?.titleSize} 
            placeholder="4rem"
            onChange={(v: string) => setData({...data, sections: {...data.sections, testimonials: {...data.sections.testimonials, titleSize: v}}})} 
          />
          <DesignInput 
            label="Review Text Size" 
            value={data.sections.testimonials?.textSize} 
            placeholder="1.25rem"
            onChange={(v: string) => setData({...data, sections: {...data.sections, testimonials: {...data.sections.testimonials, textSize: v}}})} 
          />
        </DesignCard>

        <DesignCard title="Editorial & Blog" icon={<FileText size={28} />} description="Publication List Typography">
          <DesignInput 
            label="Feed Title Size" 
            value={data.sections.blog?.titleSize} 
            placeholder="3.5rem"
            onChange={(v: string) => setData({...data, sections: {...data.sections, blog: {...data.sections.blog, titleSize: v}}})} 
          />
          <DesignInput 
            label="Post Title Size" 
            value={data.sections.blog?.postTitleSize} 
            placeholder="1.50rem"
            onChange={(v: string) => setData({...data, sections: {...data.sections, blog: {...data.sections.blog, postTitleSize: v}}})} 
          />
        </DesignCard>
      </div>

      {/* Persistence Note */}
      <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-[3rem] mt-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">Design settings are stored in real-time. Hit Publish to reflect across all connected apps.</p>
      </div>
    </div>
  );
}

function MessagesTab() {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const clearMessages = async () => {
    if (!confirm('Clear all message history? This cannot be undone.')) return;
    for (const m of messages) {
       await deleteDoc(doc(db, 'messages', m.id));
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center px-4">
        <div>
          <h4 className="text-xl font-bold">Client Inquiries</h4>
          <p className="text-gray-500 text-sm">Real-time messages from your contact form</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearMessages} className="text-brand-red text-xs font-black uppercase tracking-widest hover:underline">
            Clear All History
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {messages.length === 0 ? (
          <div className="glass p-20 text-center rounded-[3rem] border border-white/5 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-gray-700">
              <MessageSquare size={40} />
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No active inquiries</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div 
              layout
              key={msg.id} 
              className="glass p-10 rounded-[2.5rem] border border-white/5 hover:border-brand-pink/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <h4 className="text-2xl font-bold tracking-tight">{msg.name}</h4>
                  <p className="text-brand-pink font-bold">{msg.email}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    {msg.timestamp?.toDate().toLocaleString() || 'Recent'}
                  </span>
                </div>
              </div>
              <div className="mt-8 p-8 bg-black/40 rounded-3xl border border-white/5 text-gray-300 leading-relaxed relative z-10">
                {msg.message}
              </div>
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 blur-[80px] -z-10 group-hover:bg-brand-pink/10 transition-all" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function InquiriesTab() {
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'formSubmissions'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const deleteInquiry = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return;
    try {
      await deleteDoc(doc(db, 'formSubmissions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'formSubmissions');
    }
  };

  return (
    <div className="space-y-12 pb-24">
      <div className="flex justify-between items-center px-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tight">Form <span className="text-gradient">Intelligence</span></h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Inbound signals from custom application pages</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-6 py-2 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-pink">
             {inquiries.length} Total Submissions
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {inquiries.length === 0 ? (
          <div className="glass p-24 text-center rounded-[3.5rem] border border-white/5 flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-gray-700 animate-pulse">
              <FilePlus size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tight">No Signal Detected</h3>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">System is active and monitoring for inbound form transmissions.</p>
            </div>
          </div>
        ) : (
          inquiries.map((inq) => (
            <motion.div 
              layout
              key={inq.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-12 rounded-[3.5rem] border border-white/5 hover:border-brand-pink/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="px-4 py-1.5 bg-brand-pink/10 text-brand-pink border border-brand-pink/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {inq.pageTitle}
                    </span>
                    <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {inq.formTitle || 'Contact Form'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                    {Object.entries(inq.data || {}).map(([key, val]: [string, any]) => (
                      <div key={key} className="space-y-1">
                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Logic Node ID: {key}</p>
                        <p className="text-sm font-bold text-white break-words">{String(val)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">Transmission Date</p>
                    <p className="text-xs font-bold text-white bg-white/5 px-4 py-2 rounded-xl border border-white/5 inline-block">
                      {inq.createdAt?.toDate().toLocaleString() || 'Live'}
                    </p>
                  </div>
                  <button 
                    onClick={() => deleteInquiry(inq.id)}
                    className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/5 blur-[100px] -z-10 group-hover:bg-brand-pink/10 transition-all" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function AdminSettingsTab() {
  const [data, setData] = useState({
    adminEmail: '',
    primaryColor: '#ec4899',
    secondaryColor: '#dc2626',
    cmsTitle: 'SHAED.DEV CMS'
  });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passData, setPassData] = useState({ new: '', confirm: '' });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'admin'), (snapshot) => {
      if (snapshot.exists()) setData(prev => ({ ...prev, ...snapshot.data() }));
    });
    return unsub;
  }, []);

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'config', 'admin'), data, { merge: true });
      alert('Admin settings updated successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/admin');
    } finally {
      setLoading(false);
    }
  };

  const handlePassUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return alert("Passwords don't match");
    
    setPassLoading(true);
    try {
      const { updatePassword } = await import('firebase/auth');
      const user = auth.currentUser;
      if (!user) return;

      if (user.providerData.some(p => p.providerId === 'password')) {
        await updatePassword(user, passData.new);
        alert('Password updated successfully!');
        setPassData({ new: '', confirm: '' });
      } else {
        alert('Your account uses Google Login. You manage your password through Google Account settings OR you can setup a password account.');
      }
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        alert('Please logout and login again to change your security settings.');
      } else {
        alert('Error: ' + err.message);
      }
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 bg-white/5 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight">System <span className="text-gradient">Control</span></h2>
          <p className="text-gray-500 mt-1 font-medium italic">Configure core administrator credentials and dashboard appearance.</p>
        </div>
        <button 
          onClick={handleSaveConfig} disabled={loading}
          className="px-8 h-14 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.03] transition-all active:scale-95 shadow-2xl group"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover:rotate-12 transition-transform" />}
          {loading ? 'Publishing...' : 'Save Configuration'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Visual Identity Card */}
        <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink">
              <Palette size={24} />
            </div>
            <h3 className="text-lg font-display font-black tracking-tight uppercase">Dashboard Branding</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">CMS Panel Title</label>
              <input 
                value={data.cmsTitle} 
                onChange={e => setData({...data, cmsTitle: e.target.value})}
                className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 outline-none focus:border-brand-pink transition-all font-display font-bold italic"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Primary Color</label>
                <div className="flex gap-3">
                  <input 
                    type="color"
                    value={data.primaryColor}
                    onChange={e => setData({...data, primaryColor: e.target.value})}
                    className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 p-1 cursor-pointer"
                  />
                  <input 
                    value={data.primaryColor}
                    onChange={e => setData({...data, primaryColor: e.target.value})}
                    className="flex-1 h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Secondary Color</label>
                <div className="flex gap-3">
                  <input 
                    type="color"
                    value={data.secondaryColor}
                    onChange={e => setData({...data, secondaryColor: e.target.value})}
                    className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 p-1 cursor-pointer"
                  />
                  <input 
                    value={data.secondaryColor}
                    onChange={e => setData({...data, secondaryColor: e.target.value})}
                    className="flex-1 h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#dc2626'].map(c => (
                <button 
                  key={c}
                  onClick={() => setData({...data, primaryColor: c})}
                  className="w-6 h-6 rounded-full border border-white/10 hover:scale-125 transition-all"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* SECURITY SETTINGS & ACCESS CONTROL */}
        <div className="flex-1 p-10 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-10">
          <div className="flex items-center gap-4 border-b border-white/5 pb-8">
            <div className="w-14 h-14 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red">
              <ShieldCheck size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-black tracking-tight uppercase italic">Access Control</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Secure Administrative Privileges</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Authorized Admin Email</label>
              <div className="relative group">
                <input 
                  value={data.adminEmail} 
                  onChange={e => setData({...data, adminEmail: e.target.value})}
                  className="w-full h-14 bg-black/60 border border-white/10 rounded-2xl pl-14 pr-6 outline-none focus:border-brand-pink transition-all font-bold text-sm tracking-wide focus:ring-1 focus:ring-brand-pink/30"
                  placeholder="e.g. admin@gmail.com"
                />
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-pink transition-colors" size={22} />
              </div>
              <p className="text-[9px] text-red-500/60 uppercase tracking-widest font-black ml-2 animate-pulse">* WARNING: REQUIRRES GOOGLE AUTH MATCH</p>
            </div>

            <div className="pt-8 border-t border-white/5">
              <form onSubmit={handlePassUpdate} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Internal Security Key</label>
                  <p className="text-[9px] text-gray-600 uppercase tracking-widest ml-2 mb-4">Update local password for non-google login sessions</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative group">
                    <input 
                      type="password"
                      placeholder="New Security Key"
                      value={passData.new}
                      onChange={e => setPassData({...passData, new: e.target.value})}
                      className="w-full h-12 bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 outline-none focus:border-brand-red transition-all font-mono text-sm"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-red transition-colors" size={18} />
                  </div>
                  <div className="relative group">
                    <input 
                      type="password"
                      placeholder="Confirm Key"
                      value={passData.confirm}
                      onChange={e => setPassData({...passData, confirm: e.target.value})}
                      className="w-full h-12 bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 outline-none focus:border-brand-red transition-all font-mono text-sm"
                    />
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-red transition-colors" size={18} />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={passLoading}
                  className="w-full h-14 bg-brand-red/10 border border-brand-red/30 text-brand-red rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-red hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {passLoading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  Synchronize Security Keys
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-brand-pink/5 border border-brand-pink/10 rounded-[2rem] flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-pink/10 flex items-center justify-center text-brand-pink flex-shrink-0">
          <Globe size={32} />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-white">Full Identity Control</h4>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed mb-4">
            To use a custom **Email & Password** instead of Google Login:
          </p>
          <ol className="text-xs text-gray-500 space-y-2 list-decimal ml-4">
            <li>Go to <a href="https://console.firebase.google.com/project/gen-lang-client-0157099592/authentication/providers" target="_blank" className="text-brand-pink hover:underline">Firebase Console</a></li>
            <li>In **Authentication {' > '} Sign-in method**, click **Add new provider** and select **Email/Password**.</li>
            <li>Enable it and save.</li>
            <li>Go to the **Users** tab and click **Add user** to create your custom login.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function SectionBuilderTab() {
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'customSections'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setSections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, []);

  const handleAddSection = async () => {
    try {
      await addDoc(collection(db, 'customSections'), {
        title: 'New Section',
        subtitle: '',
        slug: 'new-section-' + Date.now(),
        layout: 'grid',
        cardType: 'popup',
        position: 'after-portfolio', // Default position
        showInHome: true,
        showViewMore: false,
        viewMoreLabel: 'Explore Collection',
        order: sections.length,
        isPublished: true,
        customStyles: {
          titleSize: '',
          titleColor: '',
          subtitleSize: '',
          subtitleColor: ''
        },
        pageSettings: {
          theme: 'dark',
          headerVisible: true,
          customCss: ''
        },
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'customSections');
    }
  };

  const handleUpdateSection = async (id: string, updates: any) => {
    try {
      await updateDoc(doc(db, 'customSections', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `customSections/${id}`);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Are you sure? This will delete the section definition.')) return;
    try {
      await deleteDoc(doc(db, 'customSections', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `customSections/${id}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white/5 p-8 rounded-[2rem] border border-white/10">
        <div>
          <h3 className="text-xl font-display font-black uppercase tracking-tight text-white italic">Section Architecture</h3>
          <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest leading-relaxed">
            BUILD CUSTOM LAYOUTS, DEDICATED PAGES, AND INTERACTIVE CONTENT MODULES.
          </p>
        </div>
        <button 
          onClick={handleAddSection}
          className="h-14 px-8 bg-gradient text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
        >
          <PlusCircle size={18} /> New Architecture
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sections.map((section) => (
          <div key={section.id} className="glass p-8 rounded-[2.5rem] border border-white/10 space-y-8">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Section Title</label>
                    <input 
                      value={section.title}
                      onChange={e => handleUpdateSection(section.id, { title: e.target.value })}
                      className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm font-bold focus:border-brand-pink outline-none transition-all text-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Slug (URL)</label>
                    <input 
                      value={section.slug}
                      onChange={e => handleUpdateSection(section.id, { slug: e.target.value })}
                      className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm font-mono focus:border-brand-pink outline-none transition-all text-white"
                    />
                    {section.slug && (
                      <p className="text-[10px] text-brand-pink font-bold mt-2 ml-2">
                         PREVIEW URL: {window.location.origin}/section/{section.slug}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-pink ml-2">Anchor ID (#)</label>
                    <input 
                      value={section.elementId || ''}
                      onChange={e => handleUpdateSection(section.id, { elementId: e.target.value })}
                      placeholder="e.g. custom-section"
                      className="w-full h-14 bg-black/60 border border-brand-pink/30 rounded-2xl px-6 text-sm text-brand-pink placeholder:text-gray-700 focus:border-brand-pink outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                   <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Title Font Size</label>
                    <input 
                      value={section.customStyles?.titleSize || ''}
                      onChange={e => handleUpdateSection(section.id, { customStyles: { ...section.customStyles, titleSize: e.target.value } })}
                      placeholder="e.g. 4rem"
                      className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs text-white focus:border-brand-pink outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Title Color</label>
                    <input 
                      type="color"
                      value={section.customStyles?.titleColor || '#ffffff'}
                      onChange={e => handleUpdateSection(section.id, { customStyles: { ...section.customStyles, titleColor: e.target.value } })}
                      className="w-full h-12 bg-black border border-white/10 rounded-xl px-2 outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Subtitle Font Size</label>
                    <input 
                      value={section.customStyles?.subtitleSize || ''}
                      onChange={e => handleUpdateSection(section.id, { customStyles: { ...section.customStyles, subtitleSize: e.target.value } })}
                      placeholder="e.g. 1.2rem"
                      className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs text-white focus:border-brand-pink outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Subtitle Color</label>
                    <input 
                      type="color"
                      value={section.customStyles?.subtitleColor || '#9ca3af'}
                      onChange={e => handleUpdateSection(section.id, { customStyles: { ...section.customStyles, subtitleColor: e.target.value } })}
                      className="w-full h-12 bg-black border border-white/10 rounded-xl px-2 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Layout</label>
                    <select 
                      value={section.layout}
                      onChange={e => handleUpdateSection(section.id, { layout: e.target.value })}
                      className="w-full h-14 bg-black border border-white/10 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-pink text-white"
                    >
                      <option value="grid">Bento Grid</option>
                      <option value="slider">Premium Slider</option>
                      <option value="list">Editorial List</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Interaction</label>
                    <select 
                      value={section.cardType}
                      onChange={e => handleUpdateSection(section.id, { cardType: e.target.value })}
                      className="w-full h-14 bg-black border border-white/10 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-pink text-white"
                    >
                      <option value="popup">Modal View</option>
                      <option value="page">Inner Page</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Position (Home)</label>
                    <select 
                      value={section.position || 'after-portfolio'}
                      onChange={e => handleUpdateSection(section.id, { position: e.target.value })}
                      className="w-full h-14 bg-black border border-white/10 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-pink text-white"
                    >
                      <option value="after-hero">After Hero</option>
                      <option value="after-about">After About</option>
                      <option value="after-services">After Services</option>
                      <option value="after-portfolio">After Portfolio</option>
                      <option value="after-testimonials">After Testimonials</option>
                      <option value="after-blog">After Blog</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-3 pb-2">
                    <button 
                      onClick={() => handleUpdateSection(section.id, { showInHome: !section.showInHome })}
                      className={`h-14 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${section.showInHome ? 'bg-brand-pink/20 text-brand-pink border border-brand-pink/20' : 'bg-white/5 text-gray-500 border border-white/5'}`}
                    >
                      {section.showInHome ? <Eye size={16} /> : <EyeOff size={16} />} 
                      Home
                    </button>
                    <button 
                      onClick={() => handleUpdateSection(section.id, { isPublished: !section.isPublished })}
                      className={`h-14 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${section.isPublished ? 'bg-green-500/20 text-green-500 border border-green-500/20' : 'bg-white/5 text-gray-500 border border-white/5'}`}
                    >
                      {section.isPublished ? 'Live' : 'Draft'}
                    </button>
                  </div>
                </div>

                {/* Page Specialization */}
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2 text-brand-pink text-[10px] font-black uppercase tracking-widest">
                    <Settings size={14} /> Page Specialization Settings
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Header Visibility</span>
                      <button 
                        onClick={() => handleUpdateSection(section.id, { pageSettings: { ...section.pageSettings, headerVisible: !section.pageSettings?.headerVisible } })}
                        className={`w-12 h-6 rounded-full relative transition-all ${section.pageSettings?.headerVisible ? 'bg-brand-pink' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${section.pageSettings?.headerVisible ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <select 
                        value={section.pageSettings?.theme || 'dark'}
                        onChange={e => handleUpdateSection(section.id, { pageSettings: { ...section.pageSettings, theme: e.target.value } })}
                        className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-white"
                      >
                        <option value="dark">Cinematic Dark</option>
                        <option value="light">Studio Light</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="space-y-3 flex-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Show "View More" Button</label>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleUpdateSection(section.id, { showViewMore: !section.showViewMore })}
                            className={`w-12 h-6 rounded-full relative transition-all ${section.showViewMore ? 'bg-brand-pink' : 'bg-gray-700'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${section.showViewMore ? 'right-1' : 'left-1'}`} />
                          </button>
                          <span className="text-[10px] font-bold text-gray-500 uppercase">{section.showViewMore ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Button Label</label>
                      <input 
                        value={section.viewMoreLabel || ''}
                        onChange={e => handleUpdateSection(section.id, { viewMoreLabel: e.target.value })}
                        placeholder="e.g. View All Projects"
                        className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:border-brand-pink outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-3 justify-center">
                 <button onClick={() => handleDeleteSection(section.id)} className="p-4 bg-brand-red/10 text-brand-red rounded-2xl hover:bg-brand-red transition-all hover:text-white">
                  <Trash2 size={24} />
                 </button>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <CustomSectionItemManager sectionId={section.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomSectionItemManager({ sectionId }: { sectionId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItemData, setNewItemData] = useState<any>({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    content: '',
    link: '',
    buttonLabel: ''
  });

  useEffect(() => {
    const q = query(
      collection(db, 'customItems'), 
      where('sectionId', '==', sectionId),
      orderBy('order', 'asc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [sectionId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'customItems'), {
        ...newItemData,
        sectionId,
        order: items.length,
        isPublished: true,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setNewItemData({ title: '', subtitle: '', description: '', image: '', content: '', link: '', buttonLabel: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'customItems');
    }
  };

  const handleUpdateItem = async (itemId: string, updates: any) => {
    try {
      await updateDoc(doc(db, 'customItems', itemId), updates);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `customItems/${itemId}`);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'customItems', itemId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `customItems/${itemId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-pink flex items-center gap-2">
          <Box size={14} /> Elements / Cards
        </h4>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-2 transition-colors"
        >
          {showAdd ? 'Cancel' : <><PlusCircle size={14} /> Add Content</>}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddItem} className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Element Title</label>
                <input 
                  value={newItemData.title}
                  onChange={e => setNewItemData({...newItemData, title: e.target.value})}
                  required 
                  className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-sm text-white focus:border-brand-pink outline-none transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Subtitle / Label</label>
                <input 
                  value={newItemData.subtitle}
                  onChange={e => setNewItemData({...newItemData, subtitle: e.target.value})}
                  className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-sm text-white focus:border-brand-pink outline-none transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Quick Description</label>
                <textarea 
                  value={newItemData.description}
                  onChange={e => setNewItemData({...newItemData, description: e.target.value})}
                  rows={3} 
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm resize-none text-white font-medium focus:border-brand-pink outline-none transition-all" 
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                <button 
                  type="button"
                  onClick={() => setNewItemData({...newItemData, showInHome: newItemData.showInHome === false ? true : false})}
                  className={`w-12 h-6 rounded-full relative transition-all ${newItemData.showInHome !== false ? 'bg-brand-pink' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${newItemData.showInHome !== false ? 'right-1' : 'left-1'}`} />
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Show on Home Page</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <ImageUpload 
                onUploadSuccess={(url) => setNewItemData({...newItemData, image: url})} 
                currentImage={newItemData.image}
                label="Cover Image"
                aspectRatio="aspect-video"
              />
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Action Link / URL</label>
                <input 
                  value={newItemData.link}
                  onChange={e => setNewItemData({...newItemData, link: e.target.value})}
                  placeholder="https://..."
                  className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs text-white focus:border-brand-pink outline-none transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Button Label</label>
                <input 
                  value={newItemData.buttonLabel}
                  onChange={e => setNewItemData({...newItemData, buttonLabel: e.target.value})}
                  placeholder="e.g. Learn More"
                  className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-sm text-white focus:border-brand-pink outline-none transition-all" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Deep Details (Markdown/HTML)</label>
            <textarea 
              value={newItemData.content}
              onChange={e => setNewItemData({...newItemData, content: e.target.value})}
              rows={6} 
              className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm font-mono text-white focus:border-brand-pink outline-none transition-all" 
              placeholder="Detailed content for popup or inner page..." 
            />
          </div>

          <button type="submit" className="w-full h-14 bg-gradient text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
            Register Element
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-black/20 border border-white/5 rounded-2xl p-4 group relative overflow-hidden transition-all hover:border-brand-pink/20">
            {item.image && (
              <img src={item.image} className="w-full h-32 object-cover rounded-xl mb-4 opacity-50 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all" />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-white truncate">{item.title}</h5>
                {!item.isPublished && <span className="text-[8px] bg-brand-red/20 text-brand-red px-1.5 rounded uppercase">Hidden</span>}
              </div>
              <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">{item.subtitle || 'NO LABEL'}</p>
            </div>
            
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                type="button"
                onClick={() => handleUpdateItem(item.id, { isPublished: !item.isPublished })}
                className={`p-2 rounded-lg transition-all ${item.isPublished ? 'bg-brand-pink/20 text-brand-pink' : 'bg-white/10 text-gray-400'}`}
                title={item.isPublished ? 'Published' : 'Hidden'}
              >
                {item.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button 
                type="button"
                onClick={() => handleUpdateItem(item.id, { showInHome: item.showInHome === false ? true : false })}
                className={`p-2 rounded-lg transition-all ${item.showInHome !== false ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-gray-400'}`}
                title={item.showInHome !== false ? 'Shown on Home' : 'Hidden from Home'}
              >
                <Home size={14} />
              </button>
              <button 
                type="button"
                onClick={() => setEditingItem(item)} 
                className="p-2 bg-black/80 rounded-lg text-white hover:text-brand-pink transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button 
                type="button"
                onClick={() => handleDeleteItem(item.id)} 
                className="p-2 bg-black/80 rounded-lg text-white hover:text-brand-red transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="max-w-2xl w-full glass p-10 rounded-[3rem] border border-white/10 space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-display font-black italic text-gradient uppercase">Edit Content Element</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[60vh] pr-4 custom-scrollbar">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Title</label>
                  <input 
                    value={editingItem.title} 
                    onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                    className="w-full h-14 bg-black border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none transition-all" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Subtitle</label>
                  <input 
                    value={editingItem.subtitle} 
                    onChange={e => setEditingItem({...editingItem, subtitle: e.target.value})}
                    className="w-full h-14 bg-black border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none transition-all" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Deep Content (Markdown/HTML)</label>
                  <textarea 
                    value={editingItem.content} 
                    onChange={e => setEditingItem({...editingItem, content: e.target.value})}
                    rows={8}
                    className="w-full bg-black border border-white/10 rounded-3xl p-6 text-sm font-mono text-white focus:border-brand-pink outline-none transition-all" 
                  />
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <button 
                    type="button"
                    onClick={() => setEditingItem({...editingItem, showInHome: editingItem.showInHome === false ? false : true})}
                    className={`w-12 h-6 rounded-full relative transition-all ${editingItem.showInHome !== false ? 'bg-brand-pink' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editingItem.showInHome !== false ? 'right-1' : 'left-1'}`} />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Visible on Homepage</span>
                </div>
              </div>

              <div className="space-y-6">
                <ImageUpload 
                  onUploadSuccess={(url) => setEditingItem({...editingItem, image: url})} 
                  currentImage={editingItem.image}
                  label="Featured Image"
                  aspectRatio="aspect-square"
                />
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Action Link</label>
                  <input 
                    value={editingItem.link || ''} 
                    onChange={e => setEditingItem({...editingItem, link: e.target.value})}
                    className="w-full h-14 bg-black border border-white/10 rounded-2xl px-6 text-xs text-white focus:border-brand-pink outline-none transition-all" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Button Text</label>
                  <input 
                    value={editingItem.buttonLabel || ''} 
                    onChange={e => setEditingItem({...editingItem, buttonLabel: e.target.value})}
                    className="w-full h-14 bg-black border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none transition-all" 
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 pt-6 border-t border-white/5">
                <button 
                  onClick={() => handleUpdateItem(editingItem.id, editingItem)}
                  className="flex-1 h-14 bg-brand-pink text-white rounded-2xl font-black uppercase"
                >Save Changes</button>
                <button 
                  onClick={() => setEditingItem(null)}
                  className="px-8 h-14 border border-white/10 text-gray-500 rounded-2xl"
                >Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

function DynamicPagesTab() {
  const [pages, setPages] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'components' | 'forms' | 'seo' | 'appearance' | 'advanced'>('content');
  const [newPage, setNewPage] = useState<any>({
    title: '',
    slug: '',
    headerImage: '',
    showSearch: true,
    headerVisible: true,
    content: '',
    isPublished: true,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    layout: 'standard',
    customCss: '',
    customJs: '',
    category: 'General',
    buttons: [],
    socialLinks: [],
    form: { enabled: false, title: '', submitText: 'Submit', successMessage: 'Success!', fields: [] },
    isFeatured: false
  });

  useEffect(() => {
    const q = query(collection(db, 'dynamicPages'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setPages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Dynamic Pages Sync Error:", err);
      handleFirestoreError(err, OperationType.LIST, 'dynamicPages');
    });
    return unsub;
  }, []);

  const handleAddPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const pageData = {
        title: String(newPage.title || 'Untitled Page').trim(),
        slug: String(newPage.slug || `page-${Date.now()}`).trim(),
        headerImage: String(newPage.headerImage || ''),
        content: String(newPage.content || ''),
        category: String(newPage.category || 'General'),
        layout: String(newPage.layout || 'standard'),
        isPublished: Boolean(newPage.isPublished ?? true),
        showSearch: Boolean(newPage.showSearch ?? true),
        headerVisible: Boolean(newPage.headerVisible ?? true),
        seoTitle: String(newPage.seoTitle || ''),
        seoDescription: String(newPage.seoDescription || ''),
        seoKeywords: String(newPage.seoKeywords || ''),
        customCss: String(newPage.customCss || ''),
        customJs: String(newPage.customJs || ''),
        buttons: newPage.buttons || [],
        socialLinks: newPage.socialLinks || [],
        form: newPage.form || { enabled: false, title: '', submitText: 'Submit', successMessage: 'Success!', fields: [] },
        isFeatured: newPage.isFeatured || false,
        order: Number(pages.length),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log("Attempting to create page with data:", pageData);
      console.log("Current Auth User:", auth.currentUser?.email, auth.currentUser?.uid);
      
      const docRef = await addDoc(collection(db, 'dynamicPages'), pageData);
      console.log("Page created successfully with ID:", docRef.id);
      
      setShowAdd(false);
      setNewPage({ 
        title: '', 
        slug: '', 
        headerImage: '', 
        showSearch: true, 
        headerVisible: true, 
        content: '', 
        isPublished: true, 
        seoTitle: '', 
        seoDescription: '', 
        seoKeywords: '', 
        layout: 'standard', 
        customCss: '', 
        customJs: '', 
        category: 'General',
        buttons: [],
        socialLinks: [],
        form: { enabled: false, title: '', submitText: 'Submit', successMessage: 'Success!', fields: [] },
        isFeatured: false
      });
      alert('Success: New page has been published!');
    } catch (err) {
      console.error("Page Creation Error:", err);
      alert("Page Creation Failed: " + (err instanceof Error ? err.message : String(err)));
      handleFirestoreError(err, OperationType.WRITE, 'dynamicPages');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePage = async (id: string, updates: any) => {
    try {
      await updateDoc(doc(db, 'dynamicPages', id), { ...updates, updatedAt: serverTimestamp() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `dynamicPages/${id}`);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Delete this page? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'dynamicPages', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `dynamicPages/${id}`);
    }
  };

  const handleDuplicate = async (page: any) => {
    try {
      const { id, createdAt, updatedAt, ...rest } = page;
      await addDoc(collection(db, 'dynamicPages'), {
        ...rest,
        title: `${page.title} (Copy)`,
        slug: `${page.slug}-copy`,
        order: pages.length,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'dynamicPages');
    }
  };

  const EditorTabs = ({ current, onChange }: { current: string, onChange: (t: any) => void }) => (
    <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 mb-8">
      {[
        { id: 'content', icon: <FileText size={14} />, label: 'Content' },
        { id: 'components', icon: <PlusSquare size={14} />, label: 'Components' },
        { id: 'forms', icon: <FilePlus size={14} />, label: 'Forms' },
        { id: 'seo', icon: <Globe size={14} />, label: 'SEO' },
        { id: 'appearance', icon: <Layout size={14} />, label: 'Appearance' },
        { id: 'advanced', icon: <Settings size={14} />, label: 'Advanced' }
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${current === tab.id ? 'bg-white text-black shadow-xl' : 'text-gray-500 hover:text-white'}`}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-white/5 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-black text-white italic tracking-tight uppercase">Page <span className="text-gradient">Management</span></h2>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Manage, build, and deploy custom landing pages & narratives.</p>
        </div>
        <button 
          onClick={() => {
            setShowAdd(!showAdd);
            setActiveTab('content');
          }}
          className="h-16 px-10 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl flex items-center gap-3 relative z-10 active:scale-95"
        >
          {showAdd ? <X size={20} /> : <><FilePlus size={20} /> Build Page</>}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddPage} className="glass p-12 rounded-[3.5rem] border border-white/10 space-y-8 relative overflow-hidden">
          <EditorTabs current={activeTab} onChange={setActiveTab} />
          
          {activeTab === 'content' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Page Title</label>
                    <input 
                      value={newPage.title}
                      onChange={e => setNewPage({...newPage, title: e.target.value})}
                      className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm font-bold text-white focus:border-brand-pink outline-none transition-all"
                      placeholder="e.g. Terms of Service (Optional)"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">URL Slug</label>
                    <input 
                      value={newPage.slug}
                      onChange={e => setNewPage({...newPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                      className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm font-mono text-brand-pink focus:border-brand-pink outline-none transition-all"
                      placeholder="terms-of-service (Optional)"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <ImageUpload 
                    onUploadSuccess={(url) => setNewPage({...newPage, headerImage: url})}
                    currentImage={newPage.headerImage}
                    label="Featured Image"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Main Content (Markdown / HTML)</label>
                <textarea 
                  value={newPage.content}
                  onChange={e => setNewPage({...newPage, content: e.target.value})}
                  rows={12}
                  className="w-full bg-black/40 border border-white/10 rounded-3xl p-8 text-sm font-mono text-white focus:border-brand-pink outline-none transition-all leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'components' && (
            <div className="space-y-12">
               {/* Buttons Management */}
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Call to Action Buttons</label>
                     <button 
                        type="button" 
                        onClick={() => setNewPage({...newPage, buttons: [...(newPage.buttons || []), { label: 'New Button', url: '#', variant: 'primary' }]})}
                        className="p-3 bg-white/5 rounded-xl text-brand-pink hover:bg-brand-pink hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                     >
                        <Plus size={14} /> Add Button
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {(newPage.buttons || []).map((btn: any, idx: number) => (
                        <div key={idx} className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-4">
                           <div className="flex justify-between">
                              <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Button #{idx + 1}</span>
                              <button 
                                 type="button" 
                                 onClick={() => setNewPage({...newPage, buttons: newPage.buttons.filter((_: any, i: number) => i !== idx)})}
                                 className="text-red-500 hover:text-red-400 p-1"
                              >
                                 <X size={14} />
                              </button>
                           </div>
                           <input 
                              placeholder="Label"
                              value={btn.label}
                              onChange={e => {
                                 const next = [...newPage.buttons];
                                 next[idx].label = e.target.value;
                                 setNewPage({...newPage, buttons: next});
                              }}
                              className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs text-white outline-none"
                           />
                           <input 
                              placeholder="URL"
                              value={btn.url}
                              onChange={e => {
                                 const next = [...newPage.buttons];
                                 next[idx].url = e.target.value;
                                 setNewPage({...newPage, buttons: next});
                              }}
                              className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs text-brand-pink outline-none"
                           />
                           <select 
                              value={btn.variant}
                              onChange={e => {
                                 const next = [...newPage.buttons];
                                 next[idx].variant = e.target.value;
                                 setNewPage({...newPage, buttons: next});
                              }}
                              className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs text-white outline-none"
                           >
                              <option value="primary">Primary (Gradient)</option>
                              <option value="secondary">Secondary (White)</option>
                              <option value="outline">Outline</option>
                           </select>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Social Links Management */}
               <div className="space-y-6 pt-10 border-t border-white/5">
                  <div className="flex justify-between items-center">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Social & External Links</label>
                     <button 
                        type="button" 
                        onClick={() => setNewPage({...newPage, socialLinks: [...(newPage.socialLinks || []), { icon: '<i class="fab fa-github"></i>', url: '' }]})}
                        className="p-3 bg-white/5 rounded-xl text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                     >
                        <Plus size={14} /> Add Social Link
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {(newPage.socialLinks || []).map((link: any, idx: number) => (
                        <div key={idx} className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-4 font-sans">
                           <div className="flex justify-between">
                              <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Social Link #{idx + 1}</span>
                              <button 
                                 type="button" 
                                 onClick={() => setNewPage({...newPage, socialLinks: newPage.socialLinks.filter((_: any, i: number) => i !== idx)})}
                                 className="text-red-500 hover:text-red-400 p-1"
                              >
                                 <X size={14} />
                              </button>
                           </div>
                           <input 
                              placeholder='Icon HTML (e.g. <i class="fab fa-github"></i>)'
                              value={link.icon}
                              onChange={e => {
                                 const next = [...newPage.socialLinks];
                                 next[idx].icon = e.target.value;
                                 setNewPage({...newPage, socialLinks: next});
                              }}
                              className="w-full h-10 bg-black border border-white/10 rounded-xl px-4 text-[10px] text-white outline-none font-mono"
                           />
                           <input 
                              placeholder="URL"
                              value={link.url}
                              onChange={e => {
                                 const next = [...newPage.socialLinks];
                                 next[idx].url = e.target.value;
                                 setNewPage({...newPage, socialLinks: next});
                              }}
                              className="w-full h-10 bg-black border border-white/10 rounded-xl px-4 text-[10px] text-brand-pink outline-none"
                           />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'forms' && (
            <div className="space-y-12">
               <div className="flex items-center gap-4 bg-brand-pink/5 p-6 rounded-3xl border border-brand-pink/10">
                  <div className="w-12 h-12 bg-brand-pink/10 rounded-2xl flex items-center justify-center text-brand-pink">
                     <FilePlus size={24} />
                  </div>
                  <div>
                     <div className="flex items-center gap-3">
                        <h4 className="text-sm font-bold text-white">Dynamic Form Builder</h4>
                        <button 
                           type="button"
                           onClick={() => setNewPage({...newPage, form: {...newPage.form, enabled: !newPage.form.enabled}})}
                           className={`h-6 px-3 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${newPage.form.enabled ? 'bg-green-500 text-white' : 'bg-gray-500/20 text-gray-500'}`}
                        >
                           {newPage.form.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                     </div>
                     <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Add a custom contact or inquiry form to this page</p>
                  </div>
               </div>

               {newPage.form.enabled && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Form Title</label>
                           <input 
                              value={newPage.form.title}
                              onChange={e => setNewPage({...newPage, form: {...newPage.form, title: e.target.value}})}
                              className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs text-white outline-none"
                              placeholder="e.g. Contact Us"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Submit Button Text</label>
                           <input 
                              value={newPage.form.submitText}
                              onChange={e => setNewPage({...newPage, form: {...newPage.form, submitText: e.target.value}})}
                              className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs text-white outline-none"
                              placeholder="e.g. Send Message"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Success Message</label>
                           <input 
                              value={newPage.form.successMessage}
                              onChange={e => setNewPage({...newPage, form: {...newPage.form, successMessage: e.target.value}})}
                              className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs text-white outline-none"
                              placeholder="e.g. Message sent successfully!"
                           />
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="flex justify-between items-center">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Form Fields</label>
                           <button 
                              type="button" 
                              onClick={() => setNewPage({...newPage, form: {...newPage.form, fields: [...newPage.form.fields, { id: Date.now().toString(), type: 'text', label: 'New Field', placeholder: '', required: false, options: '' }]}})}
                              className="h-10 px-6 bg-white/5 rounded-xl text-brand-pink hover:bg-brand-pink hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                           >
                              <Plus size={14} /> Add Field
                           </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                           {newPage.form.fields.map((field: any, idx: number) => (
                              <div key={field.id} className="p-6 bg-black/40 border border-white/5 rounded-3xl space-y-4">
                                 <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                       <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Field #{idx + 1}</span>
                                       <select 
                                          value={field.type}
                                          onChange={e => {
                                             const next = [...newPage.form.fields];
                                             next[idx].type = e.target.value;
                                             setNewPage({...newPage, form: {...newPage.form, fields: next}});
                                          }}
                                          className="bg-transparent text-[10px] font-black uppercase tracking-widest text-brand-pink outline-none cursor-pointer"
                                       >
                                          <option value="text">Text Input</option>
                                          <option value="email">Email Input</option>
                                          <option value="tel">Phone Input</option>
                                          <option value="textarea">Textarea</option>
                                          <option value="select">Select Dropdown</option>
                                          <option value="checkbox">Checkbox</option>
                                          <option value="radio">Radio Buttons</option>
                                       </select>
                                    </div>
                                    <div className="flex items-center gap-4">
                                       <button 
                                          type="button" 
                                          onClick={() => {
                                             const next = [...newPage.form.fields];
                                             next[idx].required = !next[idx].required;
                                             setNewPage({...newPage, form: {...newPage.form, fields: next}});
                                          }}
                                          className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border transition-all ${field.required ? 'bg-brand-pink text-white border-brand-pink' : 'text-gray-500 border-white/10'}`}
                                       >
                                          Required
                                       </button>
                                       <button 
                                          type="button" 
                                          onClick={() => {
                                             const next = newPage.form.fields.filter((_: any, i: number) => i !== idx);
                                             setNewPage({...newPage, form: {...newPage.form, fields: next}});
                                          }}
                                          className="text-red-500 hover:text-red-400"
                                       >
                                          <Trash2 size={16} />
                                       </button>
                                    </div>
                                 </div>
                                 
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input 
                                       placeholder="Field Label (e.g. Your Name)"
                                       value={field.label}
                                       onChange={e => {
                                          const next = [...newPage.form.fields];
                                          next[idx].label = e.target.value;
                                          setNewPage({...newPage, form: {...newPage.form, fields: next}});
                                       }}
                                       className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs text-white outline-none"
                                    />
                                    <input 
                                       placeholder="Placeholder (Optional)"
                                       value={field.placeholder}
                                       onChange={e => {
                                          const next = [...newPage.form.fields];
                                          next[idx].placeholder = e.target.value;
                                          setNewPage({...newPage, form: {...newPage.form, fields: next}});
                                       }}
                                       className="w-full h-12 bg-black border border-white/10 rounded-xl px-4 text-xs text-white outline-none"
                                    />
                                 </div>

                                 {(field.type === 'select' || field.type === 'radio') && (
                                    <div className="space-y-2 p-4 bg-white/5 rounded-2xl">
                                       <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Options (Comma separated)</label>
                                       <input 
                                          placeholder="Option 1, Option 2, Option 3"
                                          value={field.options}
                                          onChange={e => {
                                             const next = [...newPage.form.fields];
                                             next[idx].options = e.target.value;
                                             setNewPage({...newPage, form: {...newPage.form, fields: next}});
                                          }}
                                          className="w-full h-10 bg-black border border-white/10 rounded-xl px-4 text-xs text-white outline-none"
                                       />
                                    </div>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Meta Title</label>
                    <input 
                      value={newPage.seoTitle}
                      onChange={e => setNewPage({...newPage, seoTitle: e.target.value})}
                      className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Meta Description</label>
                    <textarea 
                      value={newPage.seoDescription}
                      onChange={e => setNewPage({...newPage, seoDescription: e.target.value})}
                      rows={4}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-brand-pink outline-none transition-all"
                    />
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Keywords (Comma separated)</label>
                    <input 
                      value={newPage.seoKeywords}
                      onChange={e => setNewPage({...newPage, seoKeywords: e.target.value})}
                      className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none transition-all"
                    />
                  </div>
                  <div className="p-8 bg-blue-500/5 rounded-3xl border border-blue-500/10 space-y-4">
                     <div className="flex items-center gap-3 text-blue-400">
                        <Search size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Search Preview</span>
                     </div>
                     <div className="space-y-1">
                        <p className="text-blue-500 font-medium text-lg leading-tight">{newPage.seoTitle || newPage.title || 'Untitled Page'}</p>
                        <p className="text-green-600 text-xs">yoursite.com/page/{newPage.slug || '...'}</p>
                        <p className="text-gray-500 text-sm line-clamp-2">{newPage.seoDescription || 'Add a meta description to see how it reflects in search results.'}</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Page Layout</label>
                  <select 
                    value={newPage.layout}
                    onChange={e => setNewPage({...newPage, layout: e.target.value})}
                    className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none"
                  >
                    <option value="standard">Standard (Boxed)</option>
                    <option value="narrow">Narrow (Editorial)</option>
                    <option value="full-width">Full Width</option>
                  </select>
               </div>
               <div className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Header Hero</p>
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Show page header image</p>
                  </div>
                  <button type="button" onClick={() => setNewPage({...newPage, headerVisible: !newPage.headerVisible})} className={`w-14 h-7 rounded-full relative transition-all ${newPage.headerVisible ? 'bg-brand-pink' : 'bg-gray-700'}`}>
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${newPage.headerVisible ? 'right-1' : 'left-1'}`} />
                  </button>
               </div>
               <div className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Search Bar</p>
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Allow page content search</p>
                  </div>
                  <button type="button" onClick={() => setNewPage({...newPage, showSearch: !newPage.showSearch})} className={`w-14 h-7 rounded-full relative transition-all ${newPage.showSearch ? 'bg-blue-500' : 'bg-gray-700'}`}>
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${newPage.showSearch ? 'right-1' : 'left-1'}`} />
                  </button>
               </div>
               <div className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Status</p>
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Live/Draft</p>
                  </div>
                  <button type="button" onClick={() => setNewPage({...newPage, isPublished: !newPage.isPublished})} className={`w-14 h-7 rounded-full relative transition-all ${newPage.isPublished ? 'bg-green-500' : 'bg-gray-700'}`}>
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${newPage.isPublished ? 'right-1' : 'left-1'}`} />
                  </button>
               </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-12">
               <div className="flex items-center gap-6 bg-brand-pink/5 p-8 rounded-[2.5rem] border border-brand-pink/10 shadow-inner">
                  <div className="w-16 h-16 bg-brand-pink/10 rounded-3xl flex items-center justify-center text-brand-pink shadow-xl">
                     <Globe size={32} />
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center justify-between">
                        <div>
                           <h4 className="text-xl font-display font-black text-white italic uppercase tracking-tight">Highlight Content</h4>
                           <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Feature this page on your home page feed</p>
                        </div>
                        <button 
                           type="button"
                           onClick={() => setNewPage({...newPage, isFeatured: !newPage.isFeatured})}
                           className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newPage.isFeatured ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                        >
                           {newPage.isFeatured ? 'Featured Active' : 'Highlight Inactive'}
                        </button>
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Custom CSS (Scoped to this page)</label>
                  <textarea 
                    value={newPage.customCss}
                    onChange={e => setNewPage({...newPage, customCss: e.target.value})}
                    placeholder=".header { color: red; }"
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm font-mono text-white focus:border-brand-pink outline-none"
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Custom JavaScript / Scripts</label>
                  <textarea 
                    value={newPage.customJs}
                    onChange={e => setNewPage({...newPage, customJs: e.target.value})}
                    placeholder="console.log('Page loaded!');"
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-6 text-sm font-mono text-white focus:border-brand-pink outline-none"
                  />
               </div>
            </div>
          </div>
       )}

          <button 
            type="submit" 
            disabled={saving}
            className="w-full h-16 bg-gradient text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.01] transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <><Loader2 size={18} className="animate-spin" /> Deploying Page...</> : 'Save & Publish Application Page'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pages.map((page) => (
          <div key={page.id} className="glass p-8 rounded-[2.5rem] border border-white/5 group relative overflow-hidden transition-all hover:border-brand-pink/30 hover:bg-white/[0.04]">
             <div className="relative h-40 mb-6 rounded-[2rem] overflow-hidden border border-white/5 bg-black">
                {page.headerImage ? (
                  <img src={page.headerImage} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-60" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-800">
                    <Layout size={48} opacity={0.1} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-6">
                   <h3 className="text-lg font-display font-black text-white italic tracking-tight">{page.title}</h3>
                   <div className="flex items-center gap-3">
                      <p className="text-[8px] text-brand-pink font-bold uppercase tracking-widest">/${page.slug}</p>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{page.layout || 'standard'}</p>
                   </div>
                </div>
             </div>

             <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                   <button 
                     onClick={() => handleUpdatePage(page.id, { isPublished: !page.isPublished })}
                     className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${page.isPublished ? 'bg-green-500/10 text-green-500 border-green-500/10 hover:bg-green-500 hover:text-white' : 'bg-gray-500/10 text-gray-500 border-gray-500/10 hover:bg-white hover:text-black'}`}
                   >
                     {page.isPublished ? 'Live' : 'Draft'}
                   </button>
                   {page.seoTitle && <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/10">SEO Active</span>}
                </div>
                <div className="flex gap-2">
                   <button onClick={() => handleDuplicate(page)} className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all shadow-lg" title="Duplicate Page">
                     <Copy size={16} />
                   </button>
                   <button onClick={() => { setEditingPage(page); setActiveTab('content'); }} className="p-3 bg-white/5 rounded-xl text-white hover:text-brand-pink transition-all shadow-lg">
                     <Edit2 size={16} />
                   </button>
                   <button onClick={() => handleDeletePage(page.id)} className="p-3 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl">
                     <Trash2 size={16} />
                   </button>
                </div>
             </div>

             <a href={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer" className="w-full h-14 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-black/60 transition-all">
               Launch Public View <Globe size={14} />
             </a>
          </div>
        ))}

        {pages.length === 0 && !showAdd && (
           <div className="col-span-full py-24 text-center glass rounded-[3.5rem] border-2 border-dashed border-white/5">
              <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                <FilePlus size={40} className="text-gray-600" />
              </div>
              <h3 className="text-2xl font-display font-black text-white italic tracking-tighter uppercase">No Custom Pages Found</h3>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.4em] mt-4 max-w-sm mx-auto leading-loose">The individual pages module allows you to build landing pages outside of the standard scroll flow.</p>
           </div>
        )}
      </div>

      {editingPage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
           <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-5xl w-full glass p-12 rounded-[3.5rem] border border-white/10 space-y-8 max-h-[95vh] overflow-y-auto custom-scrollbar shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
           >
             <div className="flex justify-between items-center bg-white/5 -mx-12 -mt-12 p-10 border-b border-white/5 mb-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-black text-gradient italic uppercase tracking-tight">Full Page Editor</h3>
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest italic">{editingPage.title} / {editingPage.slug}</p>
                </div>
                <button onClick={() => setEditingPage(null)} className="p-4 bg-white/5 rounded-2xl hover:bg-red-500/20 hover:text-red-500 transition-all font-black flex items-center gap-3 text-[10px] uppercase tracking-widest">
                  Close Editor <X size={20} />
                </button>
             </div>

             <EditorTabs current={activeTab} onChange={setActiveTab} />

             {activeTab === 'content' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Page Title</label>
                        <input 
                          value={editingPage.title}
                          onChange={e => setEditingPage({...editingPage, title: e.target.value})}
                          className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm font-bold text-white focus:border-brand-pink outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">URL Slug</label>
                        <input 
                          value={editingPage.slug}
                          onChange={e => setEditingPage({...editingPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                          className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm font-mono text-brand-pink focus:border-brand-pink outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Category</label>
                        <input 
                          value={editingPage.category || ''}
                          onChange={e => setEditingPage({...editingPage, category: e.target.value})}
                          className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <ImageUpload 
                        onUploadSuccess={(url) => setEditingPage({...editingPage, headerImage: url})}
                        currentImage={editingPage.headerImage}
                        label="Cover Header"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Content Builder (Markdown Supported)</label>
                    <textarea 
                      value={editingPage.content}
                      onChange={e => setEditingPage({...editingPage, content: e.target.value})}
                      rows={15}
                      className="w-full bg-black/60 border border-white/10 rounded-[2.5rem] p-10 text-sm font-mono text-white focus:border-brand-pink outline-none transition-all leading-relaxed custom-scrollbar"
                    />
                  </div>
                </div>
             )}

             {activeTab === 'components' && (
                <div className="space-y-12 pb-10">
                   {/* Buttons Editor */}
                   <div className="space-y-6">
                      <div className="flex justify-between items-center">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Interaction Buttons</label>
                         <button 
                            onClick={() => setEditingPage({...editingPage, buttons: [...(editingPage.buttons || []), { label: 'Click Me', url: '#', variant: 'primary' }]})}
                            className="h-10 px-6 bg-brand-pink/10 text-brand-pink rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink hover:text-white transition-all flex items-center gap-2"
                         >
                            <Plus size={14} /> Add Button
                         </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {(editingPage.buttons || []).map((btn: any, idx: number) => (
                            <div key={idx} className="p-6 bg-black border border-white/10 rounded-3xl space-y-4 shadow-xl">
                               <div className="flex justify-between">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Config: {btn.label}</span>
                                  <button 
                                     onClick={() => setEditingPage({...editingPage, buttons: editingPage.buttons.filter((_: any, i: number) => i !== idx)})}
                                     className="text-red-500 hover:text-red-400"
                                  >
                                     <Trash2 size={14} />
                                  </button>
                               </div>
                               <div className="grid grid-cols-2 gap-3">
                                  <input 
                                     placeholder="Label"
                                     value={btn.label}
                                     onChange={e => {
                                        const next = [...editingPage.buttons];
                                        next[idx].label = e.target.value;
                                        setEditingPage({...editingPage, buttons: next});
                                     }}
                                     className="h-12 bg-white/5 rounded-xl px-4 text-xs text-white outline-none border border-white/5"
                                  />
                                  <select 
                                     value={btn.variant}
                                     onChange={e => {
                                        const next = [...editingPage.buttons];
                                        next[idx].variant = e.target.value;
                                        setEditingPage({...editingPage, buttons: next});
                                     }}
                                     className="h-12 bg-white/5 rounded-xl px-4 text-xs text-white outline-none border border-white/5"
                                  >
                                     <option value="primary">Primary</option>
                                     <option value="secondary">Secondary</option>
                                     <option value="outline">Outline</option>
                                  </select>
                               </div>
                               <input 
                                  placeholder="URL link"
                                  value={btn.url}
                                  onChange={e => {
                                     const next = [...editingPage.buttons];
                                     next[idx].url = e.target.value;
                                     setEditingPage({...editingPage, buttons: next});
                                  }}
                                  className="w-full h-12 bg-white/5 rounded-xl px-4 text-xs text-brand-pink outline-none border border-white/5"
                               />
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Social Links Editor */}
                   <div className="space-y-6 pt-10 border-t border-white/5">
                      <div className="flex justify-between items-center">
                         <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Social Connections</label>
                         <button 
                            onClick={() => setEditingPage({...editingPage, socialLinks: [...(editingPage.socialLinks || []), { icon: '<i class="fab fa-github"></i>', url: '' }]})}
                            className="h-10 px-6 bg-blue-500/10 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center gap-2"
                         >
                            <Plus size={14} /> Add Social Link
                         </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {(editingPage.socialLinks || []).map((link: any, idx: number) => (
                            <div key={idx} className="p-6 bg-black border border-white/10 rounded-3xl space-y-4 shadow-xl">
                               <div className="flex justify-between">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Social Link #{idx + 1}</span>
                                  <button 
                                     onClick={() => setEditingPage({...editingPage, socialLinks: editingPage.socialLinks.filter((_: any, i: number) => i !== idx)})}
                                     className="text-red-500 hover:text-red-400"
                                  >
                                     <Trash2 size={14} />
                                  </button>
                               </div>
                               <input 
                                  placeholder='Icon HTML (e.g. <i class="fab fa-github"></i>)'
                                  value={link.icon}
                                  onChange={e => {
                                     const next = [...editingPage.socialLinks];
                                     next[idx].icon = e.target.value;
                                     setEditingPage({...editingPage, socialLinks: next});
                                  }}
                                  className="w-full h-10 bg-white/5 rounded-xl px-4 text-[10px] text-white outline-none border border-white/5 font-mono"
                               />
                               <input 
                                  placeholder="Link"
                                  value={link.url}
                                  onChange={e => {
                                     const next = [...editingPage.socialLinks];
                                     next[idx].url = e.target.value;
                                     setEditingPage({...editingPage, socialLinks: next});
                                  }}
                                  className="w-full h-10 bg-white/5 rounded-xl px-4 text-[10px] text-brand-pink outline-none border border-white/5"
                               />
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'forms' && (
                <div className="space-y-12 pb-12">
                   <div className="flex items-center gap-6 bg-brand-pink/5 p-8 rounded-[2.5rem] border border-brand-pink/10 shadow-inner">
                      <div className="w-16 h-16 bg-brand-pink/10 rounded-3xl flex items-center justify-center text-brand-pink shadow-xl">
                         <FilePlus size={32} />
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center justify-between">
                            <div>
                               <h4 className="text-xl font-display font-black text-white italic uppercase tracking-tight">Form Configuration</h4>
                               <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Design logical flows for user interactions</p>
                            </div>
                            <button 
                               onClick={() => setEditingPage({...editingPage, form: {...(editingPage.form || { enabled: false, title: '', submitText: 'Submit', successMessage: 'Success!', fields: [] }), enabled: !editingPage.form?.enabled}})}
                               className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editingPage.form?.enabled ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                            >
                               {editingPage.form?.enabled ? 'Systems Online' : 'Systems Offline'}
                            </button>
                         </div>
                      </div>
                   </div>

                   {editingPage.form?.enabled && (
                      <div className="space-y-12 animate-in fade-in slide-in-from-top-6 duration-700">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Header Title</label>
                               <input 
                                  value={editingPage.form.title}
                                  onChange={e => setEditingPage({...editingPage, form: {...editingPage.form, title: e.target.value}})}
                                  className="w-full h-14 bg-black border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none transition-all"
                                  placeholder="e.g. Project Inquiry"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Submission Label</label>
                               <input 
                                  value={editingPage.form.submitText}
                                  onChange={e => setEditingPage({...editingPage, form: {...editingPage.form, submitText: e.target.value}})}
                                  className="w-full h-14 bg-black border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none transition-all"
                                  placeholder="e.g. Launch Inquiry"
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Success Event Message</label>
                               <input 
                                  value={editingPage.form.successMessage}
                                  onChange={e => setEditingPage({...editingPage, form: {...editingPage.form, successMessage: e.target.value}})}
                                  className="w-full h-14 bg-black border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none transition-all"
                                  placeholder="e.g. Our team will mobilize shortly."
                               />
                            </div>
                         </div>

                         <div className="space-y-6">
                            <div className="flex justify-between items-center">
                               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Logic Architecture (Fields)</label>
                               <button 
                                  onClick={() => setEditingPage({...editingPage, form: {...editingPage.form, fields: [...(editingPage.form.fields || []), { id: Date.now().toString(), type: 'text', label: 'New Logic Node', placeholder: '', required: false, options: '' }]}})}
                                  className="h-12 px-8 bg-brand-pink text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center gap-3"
                               >
                                  <Plus size={18} /> Integrate Node
                               </button>
                            </div>

                            <div className="space-y-4">
                               {(editingPage.form.fields || []).map((field: any, idx: number) => (
                                  <div key={field.id} className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] space-y-6 shadow-2xl group hover:border-white/10 transition-all">
                                     <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-6">
                                           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500 border border-white/5">
                                              {idx + 1}
                                           </div>
                                           <select 
                                              value={field.type}
                                              onChange={e => {
                                                 const next = [...editingPage.form.fields];
                                                 next[idx].type = e.target.value;
                                                 setEditingPage({...editingPage, form: {...editingPage.form, fields: next}});
                                              }}
                                              className="bg-transparent text-xs font-black uppercase tracking-widest text-brand-pink outline-none cursor-pointer border-b border-brand-pink/20 pb-1"
                                           >
                                              <option value="text">Character Input</option>
                                              <option value="email">Network Bridge (Email)</option>
                                              <option value="tel">Telecom (Phone)</option>
                                              <option value="textarea">Massive Input (TextArea)</option>
                                              <option value="select">Logic Select (Dropdown)</option>
                                              <option value="checkbox">Toggle Logic (Checkbox)</option>
                                              <option value="radio">Unary Choice (Radio)</option>
                                           </select>
                                        </div>
                                        <div className="flex items-center gap-6">
                                           <button 
                                              onClick={() => {
                                                 const next = [...editingPage.form.fields];
                                                 next[idx].required = !next[idx].required;
                                                 setEditingPage({...editingPage, form: {...editingPage.form, fields: next}});
                                              }}
                                              className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border transition-all ${field.required ? 'bg-brand-pink text-white border-brand-pink shadow-lg shadow-brand-pink/20' : 'text-gray-500 border-white/10 hover:border-white/20'}`}
                                           >
                                              Mandatory
                                           </button>
                                           <button 
                                              onClick={() => {
                                                 const next = editingPage.form.fields.filter((_: any, i: number) => i !== idx);
                                                 setEditingPage({...editingPage, form: {...editingPage.form, fields: next}});
                                              }}
                                              className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                           >
                                              <Trash2 size={16} />
                                           </button>
                                        </div>
                                     </div>
                                     
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                           <label className="text-[8px] font-black uppercase tracking-widest text-gray-500 ml-2">Display Label</label>
                                           <input 
                                              placeholder="Node Title"
                                              value={field.label}
                                              onChange={e => {
                                                 const next = [...editingPage.form.fields];
                                                 next[idx].label = e.target.value;
                                                 setEditingPage({...editingPage, form: {...editingPage.form, fields: next}});
                                              }}
                                              className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-xs text-white focus:border-brand-pink outline-none transition-all"
                                           />
                                        </div>
                                        <div className="space-y-2">
                                           <label className="text-[8px] font-black uppercase tracking-widest text-gray-500 ml-2">Shadow Placeholder</label>
                                           <input 
                                              placeholder="Ghost Text"
                                              value={field.placeholder}
                                              onChange={e => {
                                                 const next = [...editingPage.form.fields];
                                                 next[idx].placeholder = e.target.value;
                                                 setEditingPage({...editingPage, form: {...editingPage.form, fields: next}});
                                              }}
                                              className="w-full h-12 bg-white/5 border border-white/5 rounded-xl px-4 text-xs text-white focus:border-brand-pink outline-none transition-all"
                                           />
                                        </div>
                                     </div>

                                     {(field.type === 'select' || field.type === 'radio') && (
                                        <div className="space-y-3 p-6 bg-white/5 rounded-[1.5rem] border border-white/5">
                                           <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Choice Arrays (Divide by commas)</label>
                                           <input 
                                              placeholder="Component A, Component B, Component C"
                                              value={field.options}
                                              onChange={e => {
                                                 const next = [...editingPage.form.fields];
                                                 next[idx].options = e.target.value;
                                                 setEditingPage({...editingPage, form: {...editingPage.form, fields: next}});
                                              }}
                                              className="w-full h-12 bg-black border border-white/10 rounded-xl px-6 text-xs text-white focus:border-brand-pink outline-none transition-all"
                                           />
                                        </div>
                                     )}
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   )}
                </div>
             )}

             {activeTab === 'seo' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-10">
                   <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">SEO Meta Title</label>
                        <input 
                          value={editingPage.seoTitle || ''}
                          onChange={e => setEditingPage({...editingPage, seoTitle: e.target.value})}
                          className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">SEO Description</label>
                        <textarea 
                          value={editingPage.seoDescription || ''}
                          onChange={e => setEditingPage({...editingPage, seoDescription: e.target.value})}
                          rows={6}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white focus:border-brand-pink outline-none transition-all"
                        />
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">SEO Keywords</label>
                        <input 
                          value={editingPage.seoKeywords || ''}
                          onChange={e => setEditingPage({...editingPage, seoKeywords: e.target.value})}
                          className="w-full h-14 bg-black/40 border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none transition-all"
                        />
                      </div>
                      <div className="p-10 bg-blue-500/5 rounded-[2.5rem] border border-blue-500/10 space-y-6 shadow-inner">
                        <div className="flex items-center gap-3 text-blue-400">
                           <Globe size={24} />
                           <span className="text-xs font-black uppercase tracking-widest">Search Result Preview</span>
                        </div>
                        <div className="space-y-2">
                           <p className="text-blue-500 font-bold text-2xl leading-tight hover:underline cursor-pointer">{editingPage.seoTitle || editingPage.title || 'Untitled Page'}</p>
                           <p className="text-green-700 text-sm italic">https://shahed.design/page/{editingPage.slug}</p>
                           <p className="text-gray-500 text-base leading-relaxed line-clamp-3">{editingPage.seoDescription || 'Build authority and trust by adding meta descriptions that entice clicks from search engines.'}</p>
                        </div>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'appearance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Display Layout</label>
                      <select 
                        value={editingPage.layout || 'standard'}
                        onChange={e => setEditingPage({...editingPage, layout: e.target.value})}
                        className="w-full h-14 bg-black border border-white/10 rounded-2xl px-6 text-sm text-white focus:border-brand-pink outline-none"
                      >
                        <option value="standard">Standard Boxed</option>
                        <option value="narrow">Narrow / Editorial</option>
                        <option value="full-width">Edge-to-Edge</option>
                      </select>
                   </div>
                   <div className="flex items-center justify-between p-7 bg-black/40 rounded-3xl border border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">Header Visibility</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Show page hero</p>
                      </div>
                      <button type="button" onClick={() => setEditingPage({...editingPage, headerVisible: !editingPage.headerVisible})} className={`w-14 h-7 rounded-full relative transition-all ${editingPage.headerVisible ? 'bg-brand-pink' : 'bg-gray-700'}`}>
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${editingPage.headerVisible ? 'right-1' : 'left-1'}`} />
                      </button>
                   </div>
                   <div className="flex items-center justify-between p-7 bg-black/40 rounded-3xl border border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">Search Interface</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">On-page discovery</p>
                      </div>
                      <button type="button" onClick={() => setEditingPage({...editingPage, showSearch: !editingPage.showSearch})} className={`w-14 h-7 rounded-full relative transition-all ${editingPage.showSearch ? 'bg-blue-500' : 'bg-gray-700'}`}>
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${editingPage.showSearch ? 'right-1' : 'left-1'}`} />
                      </button>
                   </div>
                   <div className="flex items-center justify-between p-7 bg-black/40 rounded-3xl border border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">Publish Status</p>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Visibile to public</p>
                      </div>
                      <button type="button" onClick={() => setEditingPage({...editingPage, isPublished: !editingPage.isPublished})} className={`w-14 h-7 rounded-full relative transition-all ${editingPage.isPublished ? 'bg-green-500' : 'bg-gray-700'}`}>
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${editingPage.isPublished ? 'right-1' : 'left-1'}`} />
                      </button>
                   </div>
                </div>
             )}

             {activeTab === 'advanced' && (
                <div className="space-y-12 pb-12 text-left">
                   <div className="flex items-center gap-6 bg-brand-pink/5 p-8 rounded-[2.5rem] border border-brand-pink/10 shadow-inner">
                      <div className="w-16 h-16 bg-brand-pink/10 rounded-3xl flex items-center justify-center text-brand-pink shadow-xl">
                         <Globe size={32} />
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center justify-between">
                            <div>
                               <h4 className="text-xl font-display font-black text-white italic uppercase tracking-tight">Highlight Content</h4>
                               <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Feature this page on your home page feed</p>
                            </div>
                            <button 
                               onClick={() => setEditingPage({...editingPage, isFeatured: !editingPage.isFeatured})}
                               className={`h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editingPage.isFeatured ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/20' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                            >
                               {editingPage.isFeatured ? 'Featured Active' : 'Highlight Inactive'}
                            </button>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-12">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Inject Custom CSS</label>
                      <textarea 
                        value={editingPage.customCss || ''}
                        onChange={e => setEditingPage({...editingPage, customCss: e.target.value})}
                        className="w-full h-[400px] bg-black border border-white/10 rounded-[2rem] p-10 text-sm font-mono text-brand-pink focus:border-brand-pink outline-none shadow-inner"
                        placeholder="/* Page specific styles */"
                      />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Inject Custom Scripts (JS)</label>
                      <textarea 
                        value={editingPage.customJs || ''}
                        onChange={e => setEditingPage({...editingPage, customJs: e.target.value})}
                        className="w-full h-[400px] bg-black border border-white/10 rounded-[2rem] p-10 text-sm font-mono text-blue-400 focus:border-blue-500 outline-none shadow-inner"
                        placeholder="// Page specific interactions"
                      />
                   </div>
                </div>
             </div>
          )}

          <div className="flex gap-4 pt-10 border-t border-white/10 relative z-10">
                <button 
                  onClick={() => {
                    handleUpdatePage(editingPage.id, editingPage);
                    setEditingPage(null);
                  }}
                  className="flex-1 h-20 bg-gradient text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs hover:scale-[1.01] active:scale-95 transition-all shadow-[0_20px_60px_rgba(255,0,128,0.4)]"
                >Update Page Deployment</button>
                <button 
                  onClick={() => setEditingPage(null)}
                  className="px-12 h-20 bg-white/5 border border-white/10 text-gray-400 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:text-white transition-all shadow-xl active:scale-95"
                >Dismiss Changes</button>
             </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
