import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, User, Shield, BarChart3, Users, Award, 
  MapPin, Calendar, Image, Video, FileText, Settings, 
  Plus, Edit3, Trash2, Download, Upload, LogOut, Check,
  Bell, Search, SlidersHorizontal, AlertCircle, FileSpreadsheet,
  Globe, MessageSquare, HelpCircle, Save, ToggleLeft, ToggleRight,
  Briefcase
} from 'lucide-react';
import { Campaign, PoliticalParty, Leader, Candidate, EventItem, GalleryItem, Blog, FAQ, ContactRequest, CorporateWork } from '../types';

interface AdminDashboardProps {
  onDataUpdated: () => void;
  fullData: {
    campaigns: Campaign[];
    parties: PoliticalParty[];
    leaders: Leader[];
    candidates: Candidate[];
    events: EventItem[];
    gallery: GalleryItem[];
    blogs: Blog[];
    team: any[];
    faqs: FAQ[];
    corporate?: CorporateWork[];
    contacts: ContactRequest[];
    seo: { title: string; description: string; metaTags: Record<string, string> };
  };
}

export default function AdminDashboard({ onDataUpdated, fullData }: AdminDashboardProps) {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('admin@riva.com');
  const [password, setPassword] = useState('riva2026');
  const [role, setRole] = useState<'Admin' | 'Editor' | 'Manager'>('Admin');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard Active Module
  const [activeModule, setActiveModule] = useState<'analytics' | 'campaigns' | 'leaders' | 'parties' | 'events' | 'gallery' | 'blogs' | 'contacts' | 'seo' | 'corporate'>('analytics');

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterParty, setFilterParty] = useState('all');

  // Interactive Form Dialog States
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalType, setModalType] = useState<'campaign' | 'leader' | 'candidate' | 'event' | 'blog' | 'faq' | 'gallery' | 'corporate' | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Notification center state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New campaign inquiry from Candidate Pradeep Deshmukh", read: false, time: "5 mins ago" },
    { id: 2, text: "Blog post 'How Micro-Targeting and AI Shaped...' published", read: true, time: "2 hours ago" },
    { id: 3, text: "System database backup completed successfully", read: true, time: "1 day ago" }
  ]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form Field States
  const [campaignForm, setCampaignForm] = useState({
    title: '', party: 'BJP', candidate: '', candidateRole: '', state: 'Uttar Pradesh',
    year: 2024, description: '', achievementsRaw: '', image: '', impressions: '5 Million', engagement: '1 Million'
  });

  const [blogForm, setBlogForm] = useState({
    title: '', content: '', excerpt: '', featuredImage: '', category: 'Election Strategy',
    tagsRaw: '', author: 'Raghavan Iyer', authorRole: 'CEO, RIVA', status: 'published',
    metaTitle: '', metaDescription: ''
  });

  const [eventForm, setEventForm] = useState({
    title: '', type: 'upcoming', category: 'Press Conference', date: '', time: '',
    location: '', description: ''
  });

  const [faqForm, setFaqForm] = useState({
    question: '', answer: '', category: 'General'
  });

  const [corporateForm, setCorporateForm] = useState({
    title: '', client: '', industry: '', year: 2026, description: '',
    achievementsRaw: '', impactMetricsRaw: '', image: '', servicesProvidedRaw: '',
    testimonialQuote: '', testimonialAuthor: '', testimonialRole: ''
  });

  const [seoForm, setSeoForm] = useState({
    title: fullData.seo.title,
    description: fullData.seo.description,
    ogTitle: fullData.seo.metaTags['og:title'] || '',
    ogDescription: fullData.seo.metaTags['og:description'] || ''
  });

  useEffect(() => {
    setSeoForm({
      title: fullData.seo.title,
      description: fullData.seo.description,
      ogTitle: fullData.seo.metaTags['og:title'] || '',
      ogDescription: fullData.seo.metaTags['og:description'] || ''
    });
  }, [fullData.seo]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@riva.com' && password === 'riva2026') {
      setRole('Admin');
      setIsLoggedIn(true);
      showToast('Welcome back, Raghavan! Logged in as Admin.', 'success');
    } else if (email === 'editor@riva.com' && password === 'riva2026') {
      setRole('Editor');
      setIsLoggedIn(true);
      showToast('Welcome, Editor. Data creation enabled.', 'success');
    } else if (email === 'manager@riva.com' && password === 'riva2026') {
      setRole('Manager');
      setIsLoggedIn(true);
      showToast('Logged in as Manager. Analytics enabled.', 'success');
    } else {
      setLoginError('Invalid political credential tokens. Please verify email/password.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast('Securely signed out of RIVA console.', 'info');
  };

  // Helper to handle API updates and refresh data
  const makeRequest = async (url: string, method: string, body: any) => {
    if (role === 'Manager' && method !== 'GET') {
      showToast('Manager role is restricted to read-only access.', 'error');
      return;
    }
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const resData = await response.json();
      if (resData.success) {
        onDataUpdated();
        showToast('Database written successfully!', 'success');
        setShowFormModal(false);
        setEditingItem(null);
      } else {
        showToast(resData.message || 'Operation failed', 'error');
      }
    } catch (err) {
      showToast('Network synchronization error.', 'error');
    }
  };

  // Delete handler
  const handleDelete = async (module: string, id: string) => {
    if (role === 'Manager') {
      showToast('Manager role is restricted to read-only.', 'error');
      return;
    }
    if (confirm(`Are you sure you want to delete this ${module} entry? This cannot be undone.`)) {
      try {
        const response = await fetch(`/api/${module}/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          onDataUpdated();
          showToast('Record deleted successfully.', 'success');
        } else {
          showToast('Failed to delete.', 'error');
        }
      } catch (err) {
        showToast('Error sending delete request.', 'error');
      }
    }
  };

  // Status Toggle for leads / Inquiries
  const handleToggleLeadStatus = async (lead: ContactRequest) => {
    const nextStatus = lead.status === 'pending' ? 'reviewed' : lead.status === 'reviewed' ? 'resolved' : 'pending';
    await makeRequest(`/api/contacts/${lead.id}`, 'PUT', { status: nextStatus });
  };

  // Save SEO Handler
  const handleSaveSEO = async (e: React.FormEvent) => {
    e.preventDefault();
    await makeRequest('/api/seo', 'PUT', {
      title: seoForm.title,
      description: seoForm.description,
      metaTags: {
        'og:title': seoForm.ogTitle,
        'og:description': seoForm.ogDescription,
        'twitter:card': 'summary_large_image'
      }
    });
  };

  // Export List Data to CSV
  const handleExportCSV = (type: 'campaigns' | 'contacts' | 'blogs' | 'corporate') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `${type}_export.csv`;

    if (type === 'campaigns') {
      headers = ['ID', 'Title', 'Party', 'Candidate', 'State', 'Year', 'Reach Impressions'];
      rows = fullData.campaigns.map(c => [
        c.id, c.title, c.party, c.candidate, c.state, String(c.year), c.socialReach?.impressions || ''
      ]);
    } else if (type === 'contacts') {
      headers = ['ID', 'Name', 'Email', 'Phone', 'Party', 'Service Needed', 'Status', 'Date'];
      rows = fullData.contacts.map(c => [
        c.id, c.name, c.email, c.phone, c.party || '', c.serviceType, c.status, c.createdAt
      ]);
    } else if (type === 'blogs') {
      headers = ['ID', 'Title', 'Category', 'Author', 'Status', 'Created At'];
      rows = fullData.blogs.map(b => [
        b.id, b.title, b.category, b.author, b.status, b.createdAt
      ]);
    } else if (type === 'corporate') {
      headers = ['ID', 'Title', 'Client', 'Industry', 'Year', 'Description'];
      rows = (fullData.corporate || []).map(c => [
        c.id, c.title, c.client, c.industry, String(c.year), c.description
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Successfully exported ${rows.length} records to ${filename}.`, 'success');
  };

  // Trigger forms modal
  const openAddModal = (type: 'campaign' | 'blog' | 'event' | 'faq' | 'corporate') => {
    setModalType(type);
    setEditingItem(null);
    if (type === 'campaign') {
      setCampaignForm({
        title: '', party: 'BJP', candidate: '', candidateRole: '', state: 'Uttar Pradesh',
        year: 2026, description: '', achievementsRaw: '', image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80',
        impressions: '10 Million', engagement: '1.5 Million'
      });
    } else if (type === 'blog') {
      setBlogForm({
        title: '', content: '', excerpt: '', featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
        category: 'Election Strategy', tagsRaw: '', author: 'Raghavan Iyer', authorRole: 'CEO, RIVA', status: 'published',
        metaTitle: '', metaDescription: ''
      });
    } else if (type === 'event') {
      setEventForm({
        title: '', type: 'upcoming', category: 'Press Conference', date: '', time: '', location: '', description: ''
      });
    } else if (type === 'faq') {
      setFaqForm({ question: '', answer: '', category: 'General' });
    } else if (type === 'corporate') {
      setCorporateForm({
        title: '', client: '', industry: '', year: 2026, description: '',
        achievementsRaw: '',
        impactMetricsRaw: 'Public Sentiment Gain: +30%\nLocal Support Registered: 500K+',
        image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
        servicesProvidedRaw: 'Local Sentiment Mapping, Video Ad Production',
        testimonialQuote: '', testimonialAuthor: '', testimonialRole: ''
      });
    }
    setShowFormModal(true);
  };

  const openEditModal = (type: 'campaign' | 'blog' | 'event' | 'faq' | 'corporate', item: any) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'campaign') {
      setCampaignForm({
        title: item.title, party: item.party, candidate: item.candidate, candidateRole: item.candidateRole || '',
        state: item.state, year: item.year, description: item.description,
        achievementsRaw: item.achievements ? item.achievements.join('\n') : '',
        image: item.image, impressions: item.socialReach?.impressions || '5M',
        engagement: item.socialReach?.engagement || '1M'
      });
    } else if (type === 'blog') {
      setBlogForm({
        title: item.title, content: item.content, excerpt: item.excerpt, featuredImage: item.featuredImage,
        category: item.category, tagsRaw: item.tags ? item.tags.join(', ') : '', author: item.author,
        authorRole: item.authorRole || 'Contributor', status: item.status,
        metaTitle: item.metaTitle || '', metaDescription: item.metaDescription || ''
      });
    } else if (type === 'event') {
      setEventForm({
        title: item.title, type: item.type, category: item.category, date: item.date, time: item.time,
        location: item.location, description: item.description
      });
    } else if (type === 'faq') {
      setFaqForm({ question: item.question, answer: item.answer, category: item.category });
    } else if (type === 'corporate') {
      setCorporateForm({
        title: item.title,
        client: item.client,
        industry: item.industry,
        year: item.year,
        description: item.description,
        achievementsRaw: item.achievements ? item.achievements.join('\n') : '',
        impactMetricsRaw: item.impactMetrics ? item.impactMetrics.map((im: any) => `${im.label}: ${im.value}`).join('\n') : '',
        image: item.image,
        servicesProvidedRaw: item.servicesProvided ? item.servicesProvided.join(', ') : '',
        testimonialQuote: item.testimonials?.[0]?.quote || '',
        testimonialAuthor: item.testimonials?.[0]?.author || '',
        testimonialRole: item.testimonials?.[0]?.role || ''
      });
    }
    setShowFormModal(true);
  };

  // Form Submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === 'campaign') {
      const payload = {
        title: campaignForm.title,
        party: campaignForm.party,
        candidate: campaignForm.candidate,
        candidateRole: campaignForm.candidateRole,
        state: campaignForm.state,
        year: Number(campaignForm.year),
        description: campaignForm.description,
        achievements: campaignForm.achievementsRaw.split('\n').filter(line => line.trim() !== ''),
        image: campaignForm.image,
        socialReach: {
          impressions: campaignForm.impressions,
          engagement: campaignForm.engagement,
          subscribers: '100K',
          views: '5 Million'
        }
      };
      if (editingItem) {
        await makeRequest(`/api/campaigns/${editingItem.id}`, 'PUT', payload);
      } else {
        await makeRequest('/api/campaigns', 'POST', payload);
      }
    } else if (modalType === 'blog') {
      const payload = {
        title: blogForm.title,
        content: blogForm.content,
        excerpt: blogForm.excerpt,
        featuredImage: blogForm.featuredImage,
        category: blogForm.category,
        tags: blogForm.tagsRaw.split(',').map(t => t.trim()).filter(t => t !== ''),
        author: blogForm.author,
        authorRole: blogForm.authorRole,
        status: blogForm.status,
        metaTitle: blogForm.metaTitle || blogForm.title,
        metaDescription: blogForm.metaDescription || blogForm.excerpt
      };
      if (editingItem) {
        await makeRequest(`/api/blogs/${editingItem.id}`, 'PUT', payload);
      } else {
        await makeRequest('/api/blogs', 'POST', payload);
      }
    } else if (modalType === 'event') {
      if (editingItem) {
        await makeRequest(`/api/events/${editingItem.id}`, 'PUT', eventForm);
      } else {
        await makeRequest('/api/events', 'POST', eventForm);
      }
    } else if (modalType === 'faq') {
      if (editingItem) {
        await makeRequest(`/api/faqs/${editingItem.id}`, 'PUT', faqForm);
      } else {
        await makeRequest('/api/faqs', 'POST', faqForm);
      }
    } else if (modalType === 'corporate') {
      const impactMetrics = corporateForm.impactMetricsRaw.split('\n')
        .filter(line => line.includes(':'))
        .map(line => {
          const parts = line.split(':');
          return { label: parts[0].trim(), value: parts[1].trim() };
        });

      const payload = {
        title: corporateForm.title,
        client: corporateForm.client,
        industry: corporateForm.industry,
        year: Number(corporateForm.year),
        description: corporateForm.description,
        achievements: corporateForm.achievementsRaw.split('\n').filter(line => line.trim() !== ''),
        impactMetrics,
        image: corporateForm.image,
        servicesProvided: corporateForm.servicesProvidedRaw.split(',').map(s => s.trim()).filter(s => s !== ''),
        testimonials: corporateForm.testimonialQuote ? [{
          quote: corporateForm.testimonialQuote,
          author: corporateForm.testimonialAuthor,
          role: corporateForm.testimonialRole
        }] : []
      };

      if (editingItem) {
        await makeRequest(`/api/corporate/${editingItem.id}`, 'PUT', payload);
      } else {
        await makeRequest('/api/corporate', 'POST', payload);
      }
    }
  };

  // Filter lists based on search
  const filteredCampaigns = fullData.campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesParty = filterParty === 'all' || c.party.toLowerCase() === filterParty.toLowerCase();
    return matchesSearch && matchesParty;
  });

  const filteredBlogs = fullData.blogs.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInquiries = fullData.contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 relative select-none font-sans flex flex-col justify-between" id="admin-panel-viewport">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border text-sm ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
              'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoggedIn ? (
        /* Secure Login Gateway */
        <div className="flex-1 flex items-center justify-center p-4 py-20 bg-gradient-to-br from-slate-900 via-slate-950 to-red-950">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-8 relative z-10"
          >
            <div className="text-center mb-8">
              <span className="inline-flex p-3 bg-red-50 text-red-600 rounded-xl mb-4 shadow-sm border border-red-100">
                <Lock className="w-6 h-6" />
              </span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                RIVA Command Crypt Center
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-1">
                SECURE AUTHORIZED STAFF LOG IN ONLY
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-xs mb-5 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                  Identity Email Token
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-600"
                    placeholder="e.g. admin@riva.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                  Staff Passkey
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-950 text-white font-sans font-bold text-sm rounded-xl transition-all duration-150 shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Authenticate Signature</span>
                  <Shield className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Helper Credentials */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-[11px] text-slate-500 text-left bg-slate-50 -mx-8 -mb-8 p-6 rounded-b-2xl">
              <span className="font-bold text-slate-700 block mb-1">Sandbox Credentials:</span>
              <ul className="space-y-1 font-mono">
                <li>• Admin Role: <span className="text-red-600 font-bold">admin@riva.com</span> / password: <span className="font-bold">riva2026</span></li>
                <li>• Editor Role: <span className="text-indigo-600 font-bold">editor@riva.com</span> / password: <span className="font-bold">riva2026</span></li>
                <li>• Manager: <span className="text-emerald-600 font-bold">manager@riva.com</span> / password: <span className="font-bold">riva2026</span></li>
              </ul>
            </div>
          </motion.div>
        </div>
      ) : (
        /* Authenticated Dashboard Workspace */
        <div className="flex-1 flex flex-col md:flex-row items-stretch">
          
          {/* Dashboard Sidebar Navigation */}
          <div className="w-full md:w-64 bg-slate-900 text-white border-r border-slate-800 flex flex-col justify-between py-6">
            <div>
              {/* Branding Header */}
              <div className="px-6 pb-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">RIVA Console</h2>
                  <p className="text-[10px] text-slate-400 font-mono tracking-widest mt-0.5 uppercase">ELECTION GATEWAY</p>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-mono tracking-widest font-bold rounded uppercase ${
                  role === 'Admin' ? 'bg-red-600 text-white' :
                  role === 'Editor' ? 'bg-indigo-600 text-white' :
                  'bg-emerald-600 text-white'
                }`}>
                  {role}
                </span>
              </div>

              {/* Sidebar Links */}
              <nav className="mt-6 px-3 space-y-1 text-left">
                {[
                  { id: 'analytics', label: 'Analytics Centre', icon: BarChart3 },
                  { id: 'campaigns', label: 'Manage Campaigns', icon: Award },
                  { id: 'corporate', label: 'Corporate Work', icon: Briefcase },
                  { id: 'leaders', label: 'Leaders & Candidates', icon: Users },
                  { id: 'parties', label: 'Political Parties', icon: Shield },
                  { id: 'events', label: 'Events & FAQs', icon: Calendar },
                  { id: 'blogs', label: 'Blog CMS', icon: FileText },
                  { id: 'contacts', label: 'Contact Inquiries', icon: MessageSquare, badge: fullData.contacts.filter(c => c.status === 'pending').length },
                  { id: 'seo', label: 'SEO Config', icon: Globe },
                ].map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id as any);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all ${
                        activeModule === item.id 
                          ? 'bg-red-600 text-white shadow-sm shadow-red-600/10' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span className="bg-red-950 text-red-400 text-[10px] px-1.5 py-0.5 rounded-full border border-red-900 font-mono font-bold">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Footer Profile */}
            <div className="px-6 pt-6 border-t border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-red-400">
                  RI
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Raghavan Iyer</p>
                  <p className="text-[10px] text-slate-400 font-mono">Advisor Grid</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 hover:border-red-900 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Secure Disconnect</span>
              </button>
            </div>
          </div>

          {/* Core Content Area (Right) */}
          <div className="flex-1 bg-slate-50 flex flex-col justify-between overflow-x-hidden">
            
            {/* Top Workspace Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between relative z-20">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight font-sans capitalize">
                  {activeModule === 'analytics' ? 'Election Control & Analytics' : `${activeModule} Workspace`}
                </h1>
              </div>

              {/* Header Right Interactions */}
              <div className="flex items-center gap-4 relative">
                
                {/* Notification Bell */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl relative transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-white" />
                  )}
                </button>

                {/* Notifications Center Panel Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 text-left z-50"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                        <span className="text-xs font-bold text-slate-900">Notifications</span>
                        <button 
                          onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
                          className="text-[10px] text-indigo-600 hover:underline"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id} className={`p-2.5 rounded-xl text-xs ${n.read ? 'bg-slate-50' : 'bg-red-50/50'}`}>
                            <p className="text-slate-700 font-medium">{n.text}</p>
                            <span className="text-[10px] text-slate-400 font-mono block mt-1">{n.time}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="h-6 w-[1px] bg-slate-200" />
                <span className="text-xs font-mono text-slate-400 font-bold uppercase">
                  SERVER STATUS: <span className="text-emerald-600">● SECURE</span>
                </span>
              </div>
            </header>

            {/* Main Content Workspace viewport */}
            <main className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)] select-text">

              {/* MODULE 1: ANALYTICS CENTRE */}
              {activeModule === 'analytics' && (
                <div className="space-y-6">
                  {/* Bento Grid Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Campaigns Complete', value: fullData.campaigns.length, trend: '+3 in progress', color: 'border-l-orange-500' },
                      { label: 'Political Parties Advisory', value: fullData.parties.length, trend: 'Major alliances', color: 'border-l-indigo-500' },
                      { label: 'Public Outreach Reach', value: '165M+', trend: '+14.5% YoY', color: 'border-l-red-500' },
                      { label: 'Unresolved Leads', value: fullData.contacts.filter(c => c.status === 'pending').length, trend: 'Awaiting call', color: 'border-l-emerald-500' },
                    ].map((m, i) => (
                      <div key={i} className={`bg-white p-5 border border-slate-200 rounded-2xl shadow-sm border-l-4 ${m.color} text-left`}>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-bold">{m.label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-2 font-sans">{m.value}</p>
                        <span className="text-[11px] text-slate-500 font-mono block mt-1">{m.trend}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Leads / Client Requests list */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                        <div>
                          <h3 className="font-bold text-slate-900">Urgent Campaign Inquiries</h3>
                          <p className="text-xs text-slate-400">Direct consultations from election states</p>
                        </div>
                        <button 
                          onClick={() => handleExportCSV('contacts')}
                          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          <span>Export Leads CSV</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {fullData.contacts.slice(0, 3).map((lead) => (
                          <div key={lead.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{lead.name}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  lead.status === 'pending' ? 'bg-red-100 text-red-800' :
                                  lead.status === 'reviewed' ? 'bg-amber-100 text-amber-800' :
                                  'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {lead.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-mono">{lead.party || 'Independent'} | {lead.phone}</p>
                              <p className="text-xs text-slate-700 leading-relaxed italic">"{lead.message}"</p>
                            </div>
                            <button
                              onClick={() => handleToggleLeadStatus(lead)}
                              className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold rounded-lg transition"
                            >
                              Toggle Status
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* System Activity Stream */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
                      <h3 className="font-bold text-slate-900 pb-4 border-b border-slate-100 mb-4">RIVA Console Log</h3>
                      <div className="space-y-4">
                        {[
                          { text: "Lead state modified to UP", desc: "User: Admin", time: "11 mins ago" },
                          { text: "Contact Request database sync", desc: "Express auto-save system active", time: "28 mins ago" },
                          { text: "Vite dev server bundle loaded", desc: "Port 3000 mapping initialized", time: "1 hour ago" },
                          { text: "Seed data compiled into data-store.json", desc: "Root initialization success", time: "Yesterday" }
                        ].map((log, i) => (
                          <div key={i} className="flex gap-3 text-xs leading-relaxed">
                            <span className="text-red-500 font-mono mt-0.5">▶</span>
                            <div>
                              <p className="text-slate-800 font-semibold">{log.text}</p>
                              <p className="text-slate-400 text-[10px] font-mono">{log.desc} | {log.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODULE 2: MANAGE CAMPAIGNS */}
              {activeModule === 'campaigns' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    {/* Search / Filters bar */}
                    <div className="w-full sm:w-auto flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search campaigns..."
                          className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs w-full sm:w-64 focus:outline-none focus:border-red-600"
                        />
                      </div>
                      <select
                        value={filterParty}
                        onChange={(e) => setFilterParty(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 focus:outline-none"
                      >
                        <option value="all">All Parties</option>
                        <option value="bjp">BJP</option>
                        <option value="inc">INC</option>
                        <option value="aap">AAP</option>
                        <option value="tmc">TMC</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleExportCSV('campaigns')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        onClick={() => openAddModal('campaign')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Campaign</span>
                      </button>
                    </div>
                  </div>

                  {/* Campaigns CRUD List */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono font-bold uppercase tracking-wider">
                          <th className="p-4">Campaign Title</th>
                          <th className="p-4">Party</th>
                          <th className="p-4">Candidate / Slate</th>
                          <th className="p-4">Target State</th>
                          <th className="p-4">Year</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredCampaigns.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 font-bold text-slate-900">{c.title}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono" style={{ backgroundColor: '#F8FAFC', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                                {c.party}
                              </span>
                            </td>
                            <td className="p-4 text-slate-600">{c.candidate}</td>
                            <td className="p-4 font-mono">{c.state}</td>
                            <td className="p-4 font-mono font-bold">{c.year}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditModal('campaign', c)}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete('campaigns', c.id)}
                                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE: CORPORATE WORK CMS */}
              {activeModule === 'corporate' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-full sm:w-auto flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search corporate client works..."
                          className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs w-full sm:w-64 focus:outline-none focus:border-red-600"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleExportCSV('corporate')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                      </button>
                      <button
                        onClick={() => openAddModal('corporate')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Corporate Work</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono font-bold uppercase tracking-wider">
                          <th className="p-4">Project Title</th>
                          <th className="p-4">Corporate Client</th>
                          <th className="p-4">Industry / Sector</th>
                          <th className="p-4">Services Count</th>
                          <th className="p-4">Year</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(fullData.corporate || []).filter(c => 
                          c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 font-bold text-slate-900">{c.title}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-50 text-indigo-800 border border-indigo-100">
                                {c.client}
                              </span>
                            </td>
                            <td className="p-4 text-slate-600">{c.industry}</td>
                            <td className="p-4 font-mono font-bold">{c.servicesProvided?.length || 0} services</td>
                            <td className="p-4 font-mono font-bold">{c.year}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditModal('corporate', c)}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete('corporate', c.id)}
                                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MODULE 6: BLOG CMS */}
              {activeModule === 'blogs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search articles..."
                        className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs w-64 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={() => openAddModal('blog')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Write Article</span>
                    </button>
                  </div>

                  {/* Blogs Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    {filteredBlogs.map((b) => (
                      <div key={b.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg font-mono">
                              {b.category}
                            </span>
                            <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full font-mono uppercase ${b.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                              {b.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 leading-snug line-clamp-2">{b.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-3">{b.excerpt}</p>
                        </div>
                        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">By {b.author}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditModal('blog', b)}
                              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete('blogs', b.id)}
                              className="p-1.5 bg-white border border-slate-200 rounded-lg text-red-500 hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 7: CONTACT REQUESTS (LEADS) */}
              {activeModule === 'contacts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-left">
                    <div>
                      <h3 className="font-bold text-slate-950">Constituency & Leader Consultations</h3>
                      <p className="text-xs text-slate-400">Total in-gate leads: {fullData.contacts.length}</p>
                    </div>
                    <button
                      onClick={() => handleExportCSV('contacts')}
                      className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export All Leads</span>
                    </button>
                  </div>

                  <div className="space-y-3 text-left">
                    {filteredInquiries.map((lead) => (
                      <div key={lead.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{lead.name}</h4>
                              <span className="text-slate-400 text-xs">•</span>
                              <p className="text-xs text-slate-500 font-mono">{lead.email} | {lead.phone}</p>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] rounded-lg font-mono">
                                Request: {lead.serviceType}
                              </span>
                              {lead.party && (
                                <span className="px-2 py-0.5 bg-red-50 border border-red-100 text-red-700 text-[10px] rounded-lg font-mono">
                                  Affiliation: {lead.party} ({lead.constituency || 'General'})
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full font-mono uppercase ${
                              lead.status === 'pending' ? 'bg-red-100 text-red-800' :
                              lead.status === 'reviewed' ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {lead.status}
                            </span>
                            <button
                              onClick={() => handleToggleLeadStatus(lead)}
                              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-[11px] font-bold"
                            >
                              Advance Status
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-xs text-slate-700 leading-relaxed italic">
                            "{lead.message}"
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Inquiry ID: {lead.id}</span>
                          <span>Received: {new Date(lead.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODULE 8: SEO CONFIG */}
              {activeModule === 'seo' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left max-w-2xl mx-auto space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900">RIVA SEO Matrix Manager</h3>
                    <p className="text-xs text-slate-400 mt-1">Configure global meta indexes, JSON graphs, and crawl configurations dynamically.</p>
                  </div>

                  <form onSubmit={handleSaveSEO} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                        Global Portal Title (meta title)
                      </label>
                      <input
                        type="text"
                        value={seoForm.title}
                        onChange={(e) => setSeoForm({ ...seoForm, title: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                        Global Portal Description (meta description)
                      </label>
                      <textarea
                        value={seoForm.description}
                        onChange={(e) => setSeoForm({ ...seoForm, description: e.target.value })}
                        required
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-xs font-bold text-slate-900 mb-3">Open Graph (Facebook / Social Previews)</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">og:title</label>
                          <input
                            type="text"
                            value={seoForm.ogTitle}
                            onChange={(e) => setSeoForm({ ...seoForm, ogTitle: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-red-600"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono mb-1">og:description</label>
                          <textarea
                            value={seoForm.ogDescription}
                            onChange={(e) => setSeoForm({ ...seoForm, ogDescription: e.target.value })}
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-red-600"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-sans font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Commit SEO Coordinates</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Default Empty tabs layout */}
              {['leaders', 'parties', 'events', 'gallery'].includes(activeModule) && (
                <div className="bg-white p-12 text-center border border-slate-200 rounded-2xl">
                  <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-800 font-sans">Full Grid Connected Successfully</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    The Express server's CRUD router is active. Add, edit and delete nodes dynamically via the modular JSON schemas.
                  </p>
                </div>
              )}

            </main>
          </div>
        </div>
      )}

      {/* Forms modal dialog */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl p-6 text-left max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              {editingItem ? 'Edit Database Entry' : 'New Database Entry'} ({modalType})
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {modalType === 'campaign' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Campaign Title</label>
                    <input
                      type="text"
                      value={campaignForm.title}
                      onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono font-bold">Party Line</label>
                      <select
                        value={campaignForm.party}
                        onChange={(e) => setCampaignForm({ ...campaignForm, party: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="BJP">BJP</option>
                        <option value="INC">INC</option>
                        <option value="AAP">AAP</option>
                        <option value="TMC">TMC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Candidate Name</label>
                      <input
                        type="text"
                        value={campaignForm.candidate}
                        onChange={(e) => setCampaignForm({ ...campaignForm, candidate: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Target State</label>
                      <input
                        type="text"
                        value={campaignForm.state}
                        onChange={(e) => setCampaignForm({ ...campaignForm, state: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Year</label>
                      <input
                        type="number"
                        value={campaignForm.year}
                        onChange={(e) => setCampaignForm({ ...campaignForm, year: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono font-bold">Impressions</label>
                      <input
                        type="text"
                        value={campaignForm.impressions}
                        onChange={(e) => setCampaignForm({ ...campaignForm, impressions: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Description Outline</label>
                    <textarea
                      value={campaignForm.description}
                      onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Key Milestones (one per line)</label>
                    <textarea
                      value={campaignForm.achievementsRaw}
                      onChange={(e) => setCampaignForm({ ...campaignForm, achievementsRaw: e.target.value })}
                      placeholder="e.g. Set up 15 war rooms&#10;Reached 50M on WhatsApp"
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </>
              )}

              {modalType === 'blog' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Article Title</label>
                    <input
                      type="text"
                      value={blogForm.title}
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Excerpt (teaser text)</label>
                    <input
                      type="text"
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Body Content (Markdown Supported)</label>
                    <textarea
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                      rows={6}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Category</label>
                      <input
                        type="text"
                        value={blogForm.category}
                        onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Publish Status</label>
                      <select
                        value={blogForm.status}
                        onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as any })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {modalType === 'corporate' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Project Title</label>
                    <input
                      type="text"
                      value={corporateForm.title}
                      onChange={(e) => setCorporateForm({ ...corporateForm, title: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Corporate Client</label>
                      <input
                        type="text"
                        value={corporateForm.client}
                        onChange={(e) => setCorporateForm({ ...corporateForm, client: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono font-bold">Industry / Sector</label>
                      <input
                        type="text"
                        value={corporateForm.industry}
                        onChange={(e) => setCorporateForm({ ...corporateForm, industry: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Year</label>
                      <input
                        type="number"
                        value={corporateForm.year}
                        onChange={(e) => setCorporateForm({ ...corporateForm, year: Number(e.target.value) })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Banner Image URL</label>
                      <input
                        type="text"
                        value={corporateForm.image}
                        onChange={(e) => setCorporateForm({ ...corporateForm, image: e.target.value })}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Services Provided (comma-separated)</label>
                    <input
                      type="text"
                      value={corporateForm.servicesProvidedRaw}
                      onChange={(e) => setCorporateForm({ ...corporateForm, servicesProvidedRaw: e.target.value })}
                      placeholder="e.g. PR Blitz, Crisis Control, Video Production"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Campaign Narrative Description</label>
                    <textarea
                      value={corporateForm.description}
                      onChange={(e) => setCorporateForm({ ...corporateForm, description: e.target.value })}
                      rows={3}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Milestones achieved (one per line)</label>
                    <textarea
                      value={corporateForm.achievementsRaw}
                      onChange={(e) => setCorporateForm({ ...corporateForm, achievementsRaw: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Impact Metrics (Format: "Metric Name: Metric Value", one per line)</label>
                    <textarea
                      value={corporateForm.impactMetricsRaw}
                      onChange={(e) => setCorporateForm({ ...corporateForm, impactMetricsRaw: e.target.value })}
                      placeholder="e.g. Media Reach: 10 Million&#10;Brand Lift: +45%"
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="border border-slate-100 p-3 rounded-xl space-y-3 bg-slate-50 text-left">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Client Testimonial (Optional)</span>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Quote Statement</label>
                      <input
                        type="text"
                        value={corporateForm.testimonialQuote}
                        onChange={(e) => setCorporateForm({ ...corporateForm, testimonialQuote: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Author</label>
                        <input
                          type="text"
                          value={corporateForm.testimonialAuthor}
                          onChange={(e) => setCorporateForm({ ...corporateForm, testimonialAuthor: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Author Role</label>
                        <input
                          type="text"
                          value={corporateForm.testimonialRole}
                          onChange={(e) => setCorporateForm({ ...corporateForm, testimonialRole: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-950"
                >
                  Commit Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
