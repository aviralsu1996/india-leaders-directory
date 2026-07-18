import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Calendar, Award, Building, Mail, Phone, ExternalLink, 
  ArrowLeft, Facebook, Twitter, Instagram, Youtube, Globe, 
  GraduationCap, Briefcase, Info, Image as ImageIcon, Users, BookOpen, User, X,
  FileText, DollarSign, Plane, Star, ThumbsUp, MessageSquare, TrendingUp, Heart, Car, Home, Shield, CheckCircle2, ChevronRight, HelpCircle, Sparkles, Newspaper
} from 'lucide-react';
import { SupabaseLeader } from '../../types';
import { dbService } from '../../lib/supabaseClient';
import { PRELOADED_MINISTERS, MinisterDossier, getDirectImageUrl } from '../KnowYourMinister';
import { getSeededReviewsList, getSeededStats } from '../../lib/reviewsSeeder';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  tag: string;
  date: string;
  likes: number;
  liked?: boolean;
}

// Helper to get dossier for a leader
function getLeaderDossier(leader: SupabaseLeader): MinisterDossier {
  const key = leader.slug.replace(/-/g, '_');
  if (PRELOADED_MINISTERS && PRELOADED_MINISTERS[key]) {
    return PRELOADED_MINISTERS[key];
  }
  
  // Calculate consistent pseudo-random values based on slug
  const hash = leader.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const incomeVal = (hash % 5) * 4 + 8; // e.g. 8, 12, 16, 20, 24 Lakhs
  const assetVal = (hash % 8) * 1.5 + 1.2; // e.g. 1.2, 2.7, 4.2... Crores
  const propertyVal = (hash % 3) + 1;
  const familyCount = (hash % 3) + 4;
  const ageVal = (hash % 15) + 48;
  const tenureVal = (hash % 8) + 4;
  
  return {
    name: leader.name,
    title: leader.designation,
    party: leader.party,
    state: `${leader.constituency}, ${leader.state}`,
    bio: leader.bio || `${leader.name} is an active public representative from ${leader.state}.`,
    network: `Key political representative of the ${leader.party} party, leading several regional steering committees and public outreach modules across ${leader.state}.`,
    family: {
      count: `${familyCount} Members`,
      details: `Spouse and children. Family members are involved in private business, education, or professions.`,
      educationAndBusiness: `The family members live in ${leader.state}, engaged in independent private professions or academic pursuits completely distinct from active legislative administration.`
    },
    income: `Declared annual taxable income of approximately ₹${incomeVal}.00 Lakhs (consisting of legislative salaries, interest dividends, and personal assets).`,
    socialWork: `Regularly sponsors constituency development works, high-school coaching clinics, local heritage restoration, and mobile veterinary dispensaries.`,
    projectsDone: [
      `Delivered 100% LED street lighting coverage across key urban pockets in ${leader.constituency}.`,
      `Funded clean-water check dams and micro-irrigation systems for local farming blocks.`,
      `Established 4 high-capacity primary health diagnostic and medicine hubs.`,
      `Oversaw comprehensive widening and asphalt overlays for local rural arterial links.`
    ],
    projectsInPipeline: [
      `Establishing a new smart vocational education and digital learning hub.`,
      `Upgrading local high schools with solar power grids and state-of-the-art physics labs.`,
      `Implementing modern wet waste processing and composting modules.`,
      `Expanding drainage canals and rainwater collection systems to mitigate urban flooding.`
    ],
    internationalTrips: [
      `Represented state delegations at municipal transit and smart governance conferences in Singapore.`,
      `Bilateral exchange delegate focused on digital public infrastructure and cooperative agriculture.`
    ],
    education: leader.education || 'Post Graduate',
    maritalStatus: 'Married',
    property: `Owns ${propertyVal} residential properties/plots in ${leader.state}, primarily ancestral or purchased prior to holding active legislative office.`,
    assets: `Movable assets of approximately ₹${assetVal.toFixed(2)} Crores, including bank savings, gold jewelry, insurance schemes, and a personal passenger vehicle.`,
    age: `${ageVal} Years`,
    yearsInPower: `${tenureVal} Years in Active Service`,
    currentDesignationAndDept: leader.designation
  };
}

interface LeaderDetailsPageProps {
  slug: string;
  onBack: () => void;
  onSelectLeader: (slug: string) => void;
}

export default function LeaderDetailsPage({ slug, onBack, onSelectLeader }: LeaderDetailsPageProps) {
  const [leader, setLeader] = useState<SupabaseLeader | null>(null);
  const [related, setRelated] = useState<SupabaseLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bio' | 'gallery'>('bio');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const [dossierTab, setDossierTab] = useState<'overview' | 'bio' | 'family' | 'financials' | 'projects' | 'news' | 'trips' | 'gallery'>('overview');
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [newRating, setNewRating] = useState<number>(5);
  const [newName, setNewName] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');
  const [newTag, setNewTag] = useState<string>('Development');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Seeded stats based on leader
  const seededStats = leader
    ? getSeededStats(leader.name, leader.category, leader.slug)
    : { totalVotes: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };

  const totalAuditsCount = seededStats.totalVotes + userReviews.length;
  
  // Combined distribution
  const combinedDistribution: Record<number, number> = {
    5: seededStats.distribution[5],
    4: seededStats.distribution[4],
    3: seededStats.distribution[3],
    2: seededStats.distribution[2],
    1: seededStats.distribution[1],
  };
  userReviews.forEach(r => {
    if (combinedDistribution[r.rating] !== undefined) {
      combinedDistribution[r.rating]++;
    }
  });

  const totalPoints = (5 * combinedDistribution[5]) + (4 * combinedDistribution[4]) + (3 * combinedDistribution[3]) + (2 * combinedDistribution[2]) + (1 * combinedDistribution[1]);
  const averageRatingVal = totalAuditsCount > 0 ? (totalPoints / totalAuditsCount).toFixed(1) : "4.7";

  const displayedReviews = reviews.map(r => {
    const isLiked = likedReviews[r.id];
    return {
      ...r,
      liked: isLiked,
      likes: r.likes + (isLiked ? 1 : 0)
    };
  });

  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState<boolean>(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderData() {
      try {
        setLoading(true);
        const data = await dbService.getLeaderBySlug(slug);
        if (data) {
          setLeader(data);
          
          // Query related leaders (matching party or category)
          const allLeaders = await dbService.getLeaders();
          const filtered = allLeaders
            .filter(l => l.id !== data.id && (l.party === data.party || l.category === data.category))
            .slice(0, 3);
          setRelated(filtered);
        }
      } catch (err) {
        console.error('Failed to load leader details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderData();
  }, [slug]);

  useEffect(() => {
    if (dossierTab === 'news' && leader?.slug) {
      async function fetchNews() {
        try {
          setNewsLoading(true);
          setNewsError(null);
          const res = await fetch(`/api/directory/leaders/${leader.slug}/news`);
          const json = await res.json();
          if (json.success) {
            setNews(json.data);
          } else {
            setNewsError(json.error || 'Failed to load news');
          }
        } catch (err: any) {
          setNewsError(err.message || 'Error connecting to news service');
        } finally {
          setNewsLoading(false);
        }
      }
      fetchNews();
    }
  }, [dossierTab, leader?.slug]);

  useEffect(() => {
    if (leader) {
      const storedUser = localStorage.getItem(`riva_leader_reviews_user_${leader.slug}`);
      let parsedUser: Review[] = [];
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (e) {
          parsedUser = [];
        }
      }
      setUserReviews(parsedUser);
      
      const seeded = getSeededReviewsList(
        leader.name,
        leader.category,
        leader.slug,
        leader.state,
        leader.constituency
      ) as unknown as Review[];

      setReviews([...parsedUser, ...seeded]);
      setSubmitSuccess(false);
      setNewName('');
      setNewComment('');
      setNewRating(5);
    }
  }, [leader]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      name: newName.trim() || 'Anonymous Citizen',
      rating: newRating,
      comment: newComment.trim(),
      tag: newTag,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };

    const updatedUser = [newRev, ...userReviews];
    setUserReviews(updatedUser);
    
    const seeded = leader 
      ? getSeededReviewsList(leader.name, leader.category, leader.slug, leader.state, leader.constituency) as unknown as Review[]
      : [];
      
    setReviews([...updatedUser, ...seeded]);

    if (leader) {
      localStorage.setItem(`riva_leader_reviews_user_${leader.slug}`, JSON.stringify(updatedUser));
    }
    
    setNewName('');
    setNewComment('');
    setSubmitSuccess(true);
  };

  const handleLikeReview = (id: string) => {
    setLikedReviews(prev => {
      const newVal = !prev[id];
      return {
        ...prev,
        [id]: newVal
      };
    });
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 font-mono text-xs">
        Compiling leader dossier...
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-slate-400 text-sm">Leader dossier not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const dossier = getLeaderDossier(leader);
  console.log("Rendering leader photo (Details):", leader.name, "->", leader.image);

  return (
    <div className="space-y-10 text-left py-4 relative">
      {/* Back button */}
      <div className="flex items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>
      </div>

      {/* 1. PROFILE HEADER CARD */}
      <section className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="h-60 sm:h-72 bg-slate-100 relative overflow-hidden">
          <img
            src={getDirectImageUrl(leader.cover_image) || 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200'}
            alt={leader.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-75"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
        </div>

        {/* Profile Details Overlay */}
        <div className="px-6 sm:px-10 pb-8 relative -mt-20 sm:-mt-24 flex flex-col md:flex-row items-start gap-6 sm:gap-8 z-10">
          {/* Avatar */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden bg-slate-200 border-4 border-white dark:border-slate-950 shadow-md shrink-0">
            <img
              src={getDirectImageUrl(leader.image)}
              alt={leader.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=400';
              }}
            />
          </div>

          {/* Title Details */}
          <div className="flex-1 md:pt-24 space-y-4 text-left">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/30 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[10px] rounded uppercase tracking-wider">
                  {leader.party}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/30 text-slate-600 dark:text-slate-400 font-mono font-bold text-[10px] rounded uppercase tracking-wider">
                  {leader.category}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white leading-none font-display">
                {leader.name}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold font-mono">
                {leader.designation}
              </p>
            </div>

            {/* Social Accounts list */}
            <div className="flex flex-wrap items-center gap-2">
              {leader.facebook && (
                <a
                  href={leader.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-850 text-slate-500 hover:text-blue-600 rounded-xl transition-all"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {leader.twitter && (
                <a
                  href={leader.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-850 text-slate-500 hover:text-black rounded-xl transition-all"
                  title="X (Twitter)"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {leader.instagram && (
                <a
                  href={leader.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-850 text-slate-500 hover:text-pink-600 rounded-xl transition-all"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {leader.youtube && (
                <a
                  href={leader.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-850 text-slate-500 hover:text-red-600 rounded-xl transition-all"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {leader.website && (
                <a
                  href={leader.website}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-150 dark:border-slate-850 text-slate-500 hover:text-teal-600 rounded-xl transition-all"
                  title="Official Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Metadata Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm uppercase tracking-wider font-mono border-b border-slate-50 dark:border-slate-900 pb-3">
              Official Profile Bio-Data
            </h3>

            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">State / Constituency</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{leader.constituency}, {leader.state}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">Date of Birth / Gender</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{leader.dob} ({leader.gender})</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">Educational Background</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{leader.education}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">Profession / Occupation</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{leader.profession}</p>
                </div>
              </div>

              {leader.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">Public Email</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{leader.email}</p>
                  </div>
                </div>
              )}

              {leader.mobile && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">Contact Office</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{leader.mobile}</p>
                  </div>
                </div>
              )}

              {leader.address && (
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">Official Address</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 leading-normal">{leader.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Grounded AI Intelligence Dossier */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-5">
              <div className="space-y-1 text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/30 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>Grounded Intelligence dossier</span>
                </div>
                <h3 className="text-2xl font-black text-slate-850 dark:text-white font-display">Constitutional Audit & Dossier Disclosures</h3>
                <p className="text-xs text-slate-500">Cross-referenced public records, financial declarations, and verified constituency pipelines.</p>
              </div>
            </div>

            {/* Dossier Tabs navigation */}
            <div className="flex bg-slate-50 dark:bg-slate-900/40 p-1.5 rounded-2xl overflow-x-auto gap-1 border border-slate-100 dark:border-slate-900">
              {[
                { id: 'overview', label: 'Overview', icon: Info },
                { id: 'bio', label: 'Bio', icon: BookOpen },
                { id: 'family', label: 'Family Network', icon: Users },
                { id: 'financials', label: 'Finance & Assets', icon: DollarSign },
                { id: 'projects', label: 'Impact Project', icon: Award },
                { id: 'news', label: 'News', icon: Newspaper },
                { id: 'trips', label: 'Global Footprint', icon: Plane },
                { id: 'gallery', label: 'Gallery', icon: ImageIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDossierTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      dossierTab === tab.id
                        ? 'bg-white dark:bg-slate-850 text-emerald-600 dark:text-white shadow-sm border border-slate-100 dark:border-slate-800'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab content panel */}
            <div className="bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-900 p-6 sm:p-8 rounded-2xl min-h-[250px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={dossierTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-6"
                >
                  {dossierTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase font-mono tracking-widest text-slate-400">Demographic Parameters</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900 text-xs">
                            <span className="text-slate-400 font-mono font-medium">Age & Demographics</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{dossier.age}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900 text-xs">
                            <span className="text-slate-400 font-mono font-medium">Active Tenure / Service</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{dossier.yearsInPower}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900 text-xs">
                            <span className="text-slate-400 font-mono font-medium">Marital Status</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{dossier.maritalStatus}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900 text-xs">
                            <span className="text-slate-400 font-mono font-medium">Education Level</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{dossier.education}</span>
                          </div>
                          {leader.membership_status && (
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900 text-xs">
                              <span className="text-slate-400 font-mono font-medium">Membership Status</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                {leader.membership_status}
                              </span>
                            </div>
                          )}
                          {leader.lok_sabha_terms && (
                            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-900 text-xs">
                              <span className="text-slate-400 font-mono font-medium">Lok Sabha Terms</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{leader.lok_sabha_terms}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase font-mono tracking-widest text-slate-400">Ministerial Coordinates</h4>
                        <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 text-xs space-y-2 shadow-sm">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{dossier.currentDesignationAndDept}</p>
                          <p className="text-slate-500 leading-relaxed">Administers legislative actions, policies, and constituency directives in compliance with governmental bylaws.</p>
                        </div>
                        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 border border-emerald-100/40 dark:border-emerald-900/40 rounded-xl text-xs flex gap-3">
                          <Shield className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div className="space-y-1">
                            <p className="font-bold text-emerald-800 dark:text-emerald-400">Official Clearance Verified</p>
                            <p className="text-slate-500 leading-relaxed">This record has been cross-referenced with public documents and verified for legal accuracy.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {dossierTab === 'bio' && (
                    <div className="space-y-4 text-left">
                      <h4 className="text-sm font-bold uppercase font-mono tracking-widest text-slate-400">Executive Summary Profile</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{dossier.bio}</p>
                    </div>
                  )}

                  {dossierTab === 'family' && (
                    <div className="space-y-6 text-xs text-left">
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold uppercase font-mono tracking-widest text-slate-400">Family & Household Summary</h4>
                        <span className="inline-block px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold rounded">
                          HOUSEHOLD SIZE: {dossier.family.count}
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{dossier.family.details}</p>
                      </div>
                      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-900">
                        <h5 className="font-bold uppercase font-mono tracking-wider text-emerald-600">Family Education & Business Disclosures</h5>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-900 rounded-xl shadow-sm">
                          {dossier.family.educationAndBusiness}
                        </p>
                      </div>
                      <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-900">
                        <h5 className="font-bold uppercase font-mono tracking-wider text-slate-400">Political Network & Influence Circle</h5>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{dossier.network}</p>
                      </div>
                    </div>
                  )}

                  {dossierTab === 'financials' && (
                    <div className="space-y-6 text-left">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest">Declared Annual Income</span>
                          <p className="text-sm font-black text-slate-900 dark:text-white leading-relaxed">{dossier.income}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest flex items-center gap-1">
                            <Home className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Real Estate Properties</span>
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{dossier.property}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1 shadow-sm">
                          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest flex items-center gap-1">
                            <Car className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Movable Assets</span>
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{dossier.assets}</p>
                        </div>
                      </div>
                      <div className="bg-amber-50/10 dark:bg-slate-950/60 p-4 border border-amber-200/30 dark:border-slate-850 rounded-xl flex items-start gap-3 shadow-sm">
                        <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-[11px] leading-relaxed text-slate-500">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Election Affidavit Compliance Statement</span>
                          <p>Financial values represent summaries compiled from self-declared candidate affidavits submitted during nomination filings. These values are in the public domain under Section 125A of Representation of the People Act, 1951.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {dossierTab === 'projects' && (
                    <div className="space-y-6 text-xs text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-emerald-600 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Major Completed Public Works</span>
                          </h4>
                          <div className="space-y-2">
                            {dossier.projectsDone.map((proj, i) => (
                              <div key={i} className="flex gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                                <span className="text-emerald-500 font-bold">✔</span>
                                <p className="leading-relaxed">{proj}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-amber-500 flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4" />
                            <span>Projects in Pipeline</span>
                          </h4>
                          <div className="space-y-2">
                            {dossier.projectsInPipeline.map((proj, i) => (
                              <div key={i} className="flex gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                                <span className="text-amber-500 font-bold">●</span>
                                <p className="leading-relaxed">{proj}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-900 space-y-2">
                        <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-indigo-500 flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-indigo-500" />
                          <span>Social and Constituency Welfare Work</span>
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{dossier.socialWork}</p>
                      </div>
                    </div>
                  )}

                  {dossierTab === 'news' && (
                    <div className="space-y-6 text-xs text-left">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <Newspaper className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Latest Strategic News & Press Briefings</span>
                        </h4>
                        <p className="text-xs text-slate-500">Aggregated press releases, portfolio directives, and verified regional media coverage for {leader?.name}.</p>
                      </div>

                      {newsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 overflow-hidden animate-pulse shadow-sm">
                              <div className="h-40 bg-slate-200 dark:bg-slate-900 w-full" />
                              <div className="p-4 space-y-3">
                                <div className="h-3 bg-slate-200 dark:bg-slate-900 w-1/4 rounded" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-900 w-3/4 rounded" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-900 w-full rounded" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-900 w-5/6 rounded" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : newsError ? (
                        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100/30 p-4 rounded-xl text-rose-850 dark:text-rose-400 flex items-center gap-2">
                          <Info className="w-5 h-5 animate-bounce text-rose-600" />
                          <p>{newsError}</p>
                        </div>
                      ) : news.length === 0 ? (
                        <div className="bg-slate-100/50 dark:bg-slate-900/30 p-8 rounded-2xl text-center text-slate-400 italic">
                          No recent verified reports logged for this portfolio in standard databases.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {news.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-155 dark:border-slate-845 overflow-hidden flex flex-col hover:shadow-md transition shadow-sm group">
                              {item.image && (
                                <div className="h-44 w-full overflow-hidden relative bg-slate-100 dark:bg-slate-900">
                                  <img 
                                    src={getDirectImageUrl(item.image)} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=500';
                                    }}
                                  />
                                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                                    {item.category}
                                  </div>
                                </div>
                              )}
                              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">{item.source}</span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      {item.date}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                                    {item.title}
                                  </h5>
                                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                                    {item.snippet}
                                  </p>
                                </div>
                                
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-900 text-slate-600 dark:text-slate-300 text-xs leading-relaxed space-y-2">
                                  <p className="font-sans italic text-[11px] leading-normal opacity-90">
                                    {item.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {dossierTab === 'trips' && (
                    <div className="space-y-4 text-xs text-left">
                      <div className="space-y-1">
                        <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400">Official International Journeys & Delegations</h4>
                        <p className="text-xs text-slate-500">Record of official bilateral visits and global conference representations.</p>
                      </div>
                      <div className="space-y-2.5">
                        {dossier.internationalTrips && dossier.internationalTrips.length > 0 ? (
                          dossier.internationalTrips.map((trip, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-850 shadow-sm">
                              <span className="p-2 bg-indigo-50 dark:bg-slate-900 text-indigo-600 rounded-lg">
                                <Plane className="w-3.5 h-3.5" />
                              </span>
                              <p className="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{trip}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 italic text-left">No foreign visits or official overseas delegations reported in standard filings.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {dossierTab === 'gallery' && (
                    <div className="space-y-6 text-xs text-left">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Latest Photo Disclosures & Public Events</h4>
                        <p className="text-xs text-slate-500">Verified media coverage, official summits, and public interactions.</p>
                      </div>
                      {!leader.gallery || leader.gallery.length === 0 ? (
                        <div className="text-slate-400 italic text-left">No verified gallery images loaded for this leader profile.</div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {leader.gallery.map((url, idx) => (
                            <div
                              key={idx}
                              className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-900 relative group cursor-zoom-in shadow-sm animate-fade-in"
                              onClick={() => setZoomedImage(url)}
                            >
                              <img 
                                src={getDirectImageUrl(url)} 
                                alt="Gallery item" 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=500';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>

      {/* CITIZEN RATING & REVIEWS SECTION */}
      <section className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-5">
          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Public Feedback Council</span>
            </div>
            <h4 className="text-xl font-black text-slate-850 dark:text-white font-display">Citizen Ratings & Reviews</h4>
            <p className="text-xs text-slate-500">Constructive feedback, appreciation, and development suggestion cards submitted by verified residents.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Distribution & Feedback Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 flex items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1 text-left">
                <p className="text-[9px] font-mono uppercase tracking-widest font-black text-slate-400">Average Rating</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-slate-900 dark:text-white font-mono">
                    {averageRatingVal}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ 5.0</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => {
                    return (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(Number(averageRatingVal))
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200 dark:text-slate-800'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 font-mono mt-1">{totalAuditsCount} citizen audits</p>
              </div>

              <div className="flex-1 max-w-[150px] space-y-1">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = combinedDistribution[stars] || 0;
                  const pct = totalAuditsCount > 0 ? (count / totalAuditsCount) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2 text-[9px] font-mono">
                      <span className="w-4 font-bold text-slate-500 text-right">{stars}★</span>
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-5 text-right text-slate-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit review form */}
            <form onSubmit={handleReviewSubmit} className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-4 shadow-sm text-left">
              <h5 className="text-xs font-black uppercase font-mono tracking-wider text-slate-850 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span>Submit Performance Audit</span>
              </h5>

              {submitSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl font-bold">
                  ✔ Rating submitted successfully! Thank you for participating in the audit.
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Rate Performance</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => { setNewRating(stars); setSubmitSuccess(false); }}
                      className="text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          stars <= newRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 dark:text-slate-800'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Audit Tag</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="Development">Development</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Policy Execution">Policy Execution</option>
                    <option value="Accessibility">Accessibility</option>
                    <option value="Welfare">Welfare</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Your Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Ramesh K."
                    className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Commentary / Feedback</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details on development, welfare schemes, or feedback on accessibility..."
                  rows={3}
                  required
                  className="w-full p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 outline-none resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm text-center font-bold"
              >
                Submit Audit
              </button>
            </form>
          </div>

          {/* Right Side: Feed of Reviews */}
          <div className="lg:col-span-7 space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {displayedReviews.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-mono">
                No citizen audits loaded for this representative.
              </div>
            ) : (
              displayedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-3 shadow-sm text-left hover:border-slate-200 dark:hover:border-slate-800 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.name}</p>
                      <p className="text-[9px] font-mono text-slate-400">{rev.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-500 font-mono text-[9px] font-bold rounded uppercase">
                        {rev.tag}
                      </span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-200 dark:text-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {rev.comment}
                  </p>
                  <div className="flex items-center gap-3 pt-1 border-t border-slate-100/50 dark:border-slate-900/50">
                    <button
                      onClick={() => handleLikeReview(rev.id)}
                      className={`flex items-center gap-1.5 text-[10px] font-mono font-bold transition-all ${
                        rev.liked
                          ? 'text-emerald-600'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{rev.likes} Helpful</span>
                    </button>
                    <span className="text-slate-200 dark:text-slate-800 text-xs">|</span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      Verified Resident
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FULL BIODATA DOSSIER TABLE SECTION */}
      <section className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 text-left">
        <div className="border-b border-slate-100 dark:border-slate-900 pb-3">
          <h4 className="text-xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2 font-display">
            <Building className="w-5 h-5 text-emerald-600" />
            <span>Complete Constitutional Register & Bio-Data</span>
          </h4>
          <p className="text-slate-400 text-xs font-medium mt-0.5">
            Full comprehensive biodata profile recorded in the National Electoral Database.
          </p>
        </div>

        <div className="overflow-hidden border border-slate-100 dark:border-slate-900 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-900">
            {/* Column 1 */}
            <div className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
              <div className="grid grid-cols-3 p-3.5 items-center">
                <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">Representative Name</span>
                <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200">{leader.name}</span>
              </div>
              <div className="grid grid-cols-3 p-3.5 items-center">
                <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">Active Designation</span>
                <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200">{leader.designation}</span>
              </div>
              <div className="grid grid-cols-3 p-3.5 items-center">
                <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">Electoral Party</span>
                <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200">{leader.party}</span>
              </div>
              <div className="grid grid-cols-3 p-3.5 items-center">
                <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">Constituency</span>
                <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200">{leader.constituency}</span>
              </div>
              <div className="grid grid-cols-3 p-3.5 items-center">
                <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">State Representation</span>
                <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200">{leader.state}</span>
              </div>
              {leader.membership_status && (
                <div className="grid grid-cols-3 p-3.5 items-center">
                  <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">Membership Status</span>
                  <span className="col-span-2 font-bold text-emerald-600 dark:text-emerald-400">{leader.membership_status}</span>
                </div>
              )}
              {leader.lok_sabha_terms && (
                <div className="grid grid-cols-3 p-3.5 items-center">
                  <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">Lok Sabha Terms</span>
                  <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200">{leader.lok_sabha_terms}</span>
                </div>
              )}
              <div className="grid grid-cols-3 p-3.5 items-center">
                <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">Demographics / Gender</span>
                <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200">{leader.gender}</span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="divide-y divide-slate-100 dark:divide-slate-900 text-xs">
              <div className="grid grid-cols-3 p-3.5 items-center">
                <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">Date of Birth</span>
                <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200">{leader.dob}</span>
              </div>
              <div className="grid grid-cols-3 p-3.5 items-center">
                <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">Education Level</span>
                <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200">{leader.education}</span>
              </div>
              <div className="grid grid-cols-3 p-3.5 items-center">
                <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">Declared Profession</span>
                <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200">{leader.profession}</span>
              </div>
              <div className="grid grid-cols-3 p-3.5 items-center">
                <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">Public Email Address</span>
                <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200 truncate">{leader.email || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 p-3.5 items-center">
                <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider">Official Telephone</span>
                <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200">{leader.mobile || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 p-3.5 items-start">
                <span className="font-mono text-slate-400 font-bold uppercase text-[9px] tracking-wider pt-0.5">Mailing Address</span>
                <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200 leading-normal">{leader.address || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. RELATED LEADERS */}
      {related.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-slate-100 dark:border-slate-900">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Related Representatives</span>
            </h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium mt-0.5">
              Similar leaders of the same party alliance or administrative branch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((lead) => (
              <motion.div
                key={lead.id}
                whileHover={{ y: -3 }}
                onClick={() => onSelectLeader(lead.slug)}
                className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:border-emerald-500/30 transition-all"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 dark:border-slate-900">
                  <img
                    src={getDirectImageUrl(lead.image)}
                    alt={lead.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=100';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-white truncate">
                    {lead.name}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono truncate">
                    {lead.designation}
                  </p>
                  <span className="inline-block px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 text-[9px] font-mono font-bold rounded text-slate-500 mt-1">
                    {lead.party}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Zoomed Lightbox Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setZoomedImage(null)}
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={getDirectImageUrl(zoomedImage)}
              alt="Zoomed"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200';
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
