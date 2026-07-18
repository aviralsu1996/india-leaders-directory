import { Campaign, PoliticalParty, Leader, Candidate, EventItem, GalleryItem, Blog, TeamMember, FAQ, CorporateWork } from './types';

export const initialParties: PoliticalParty[] = [
  {
    id: 'bjp',
    name: 'Bharatiya Janata Party',
    abbreviation: 'BJP',
    logo: 'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?w=120&auto=format&fit=crop&q=80', // Lotus/Orange themed
    color: '#F97316',
    description: 'One of the major political parties in India, focusing on nationalistic development, infrastructure growth, and digital governance.',
    campaigns: ['up-digital-blitz-2024', 'karnataka-voter-connect-2023'],
    leaders: ['narendra-modi', 'amit-shah'],
    achievements: [
      'Digital Booth Mapping across 150,000 polling stations in UP',
      'Unified Social Media Grid managing 25,000 WhatsApp groups',
      'Micro-targeting campaign reaching 40 million rural voters'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'inc',
    name: 'Indian National Congress',
    abbreviation: 'INC',
    logo: 'https://images.unsplash.com/photo-1584438784894-089d6a128f3e?w=120&auto=format&fit=crop&q=80', // Hand/Blue-Tricolor themed
    color: '#06B6D4',
    description: 'A major centrist political party in India, advocating social democracy, secularism, and inclusive economic progress.',
    campaigns: ['punjab-youth-connect-2022', 'hp-grassroot-movement-2022'],
    leaders: ['rahul-gandhi', 'priyanka-gandhi'],
    achievements: [
      'Bharat Jodo digital mobilization tracking system',
      'Rural outreach campaign focusing on agrarian issues',
      'Targeted anti-unemployment campaigns on social media'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'aap',
    name: 'Aam Aadmi Party',
    abbreviation: 'AAP',
    logo: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=120&auto=format&fit=crop&q=80', // Broom/Blue themed
    color: '#0284C7',
    description: 'Formed in 2012, AAP is known for its focus on primary education, healthcare, subsidized utilities, and transparent governance models.',
    campaigns: ['delhi-school-showcase-2025', 'goa-wavemakers-2022'],
    leaders: ['arvind-kejriwal', 'bhagwant-mann'],
    achievements: [
      'Education and Healthcare transformation video documentaries with 50M+ views',
      'Doorstep delivery of public services digital dashboard integration',
      'Town hall live-streaming campaigns across Punjab and Delhi'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'tmc',
    name: 'All India Trinamool Congress',
    abbreviation: 'TMC',
    logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80', // Grass/Green themed
    color: '#10B981',
    description: 'A major political party in West Bengal, focusing on sub-national identity, grassroots development, and welfare schemes.',
    campaigns: ['wb-sonar-bangla-2021'],
    leaders: ['mamata-banerjee', 'abhishek-banerjee'],
    achievements: [
      'Didi Ke Bolo hyper-local citizen grievance helpline strategy',
      'Kanyashree and Lakshmir Bhandar digital signups track engine',
      'Staging massive musical campaigns across West Bengal'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80'
    ]
  }
];

export const initialLeaders: Leader[] = [
  {
    id: 'narendra-modi',
    name: 'Narendra Modi',
    party: 'BJP',
    role: 'Prime Minister of India',
    photo: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400&auto=format&fit=crop&q=80', // Representational professional portrait
    biography: 'Serving as the 14th Prime Minister of India since 2014. Under his leadership, India has witnessed massive digitalization, infrastructure expansion, and geopolitical positioning.',
    achievements: [
      'Led BJP to absolute majorities in 2014, 2019, and form government in 2024',
      'Pioneered Digital India and Jan Dhan-Aadhaar-Mobile (JAM) trinity',
      'Highly active digital footprint with over 100 million social media followers'
    ],
    politicalJourney: [
      { year: '2001 - 2014', role: 'Chief Minister of Gujarat' },
      { year: '2014 - Present', role: 'Prime Minister of India' }
    ],
    speechGallery: [
      { title: 'Address on Digital India Conclave', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', date: '2024-03-12' },
      { title: 'Independence Day Address at Red Fort', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', date: '2025-08-15' }
    ],
    videos: ['https://www.youtube.com/embed/dQw4w9WgXcQ'],
    events: ['Mega Rally Varanasi', 'Digital Youth Townhall Bengaluru'],
    mediaCoverage: [
      { title: 'Modi’s Vision for India 2047', source: 'The Economic Times', date: '2026-01-05', link: '#' },
      { title: 'The Digital Campaign Masterclass', source: 'NDTV', date: '2025-11-20', link: '#' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'rahul-gandhi',
    name: 'Rahul Gandhi',
    party: 'INC',
    role: 'Leader of Opposition, Lok Sabha',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    biography: 'A prominent Indian politician and member of parliament who spearheaded the massive Bharat Jodo Yatra, connecting lakhs of citizens directly on foot.',
    achievements: [
      'Walked over 4,000 kilometers in the historic Bharat Jodo Yatra',
      'Rebuilt digital branding around public-centric dialogues, podcasts, and worker interactions',
      'Strong advocate for democratic ideals, social justice, and employment guarantees'
    ],
    politicalJourney: [
      { year: '2004 - Present', role: 'Member of Parliament' },
      { year: '2017 - 2019', role: 'President, Indian National Congress' },
      { year: '2024 - Present', role: 'Leader of Opposition' }
    ],
    speechGallery: [
      { title: 'Yatra Culmination Address in Srinagar', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', date: '2023-01-30' }
    ],
    videos: ['https://www.youtube.com/embed/dQw4w9WgXcQ'],
    events: ['Public Townhall in Punjab', 'Youth Dialogue Goa'],
    mediaCoverage: [
      { title: 'The Transformation of Rahul Gandhi', source: 'India Today', date: '2024-06-18', link: '#' }
    ],
    gallery: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80'
    ]
  }
];

export const initialCandidates: Candidate[] = [
  {
    id: 'amit-sharma',
    name: 'Amit Sharma',
    party: 'BJP',
    state: 'Uttar Pradesh',
    constituency: 'Lucknow East',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    biography: 'A dynamic grassroots leader with an engineering background. He is focused on urban renewal, digital grievance portals, and youth employment schemes in Lucknow.',
    achievements: [
      'Facilitated the installation of 50+ smart parks with public WiFi',
      'Addressed 10,000+ local grievances via custom Telegram bot'
    ],
    campaignTimeline: [
      { phase: 'Phase 1: Ground Surveys', date: 'Oct 2023', description: 'Mapped ward-level issues and local influencers.' },
      { phase: 'Phase 2: Digital Launch', date: 'Dec 2023', description: 'Launched localized WhatsApp war rooms.' },
      { phase: 'Phase 3: Roadshow Blitz', date: 'Feb 2024', description: 'Deployed drone capture and live streaming grids.' }
    ],
    speeches: ['Lucknow Development Vision 2024', 'Address to Youth Entrepreneurs'],
    gallery: [
      'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80'
    ],
    videos: ['https://www.youtube.com/embed/dQw4w9WgXcQ'],
    creativeDesigns: [
      'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=600&auto=format&fit=crop&q=80'
    ]
  }
];

export const initialCampaigns: Campaign[] = [
  {
    id: 'up-digital-blitz-2024',
    title: 'UP Digital Blitz 2024',
    party: 'BJP',
    partyLogo: 'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?w=120&auto=format&fit=crop&q=80',
    candidate: 'Amit Sharma (and state slate)',
    candidateRole: 'MLA Candidate & State Leaders',
    state: 'Uttar Pradesh',
    year: 2024,
    description: 'An aggressive, data-driven political social media and micro-targeting campaign in Uttar Pradesh, India’s most populous state. We utilized automated geo-fenced content delivery, hyper-local polling booth intelligence, and intensive leader branding.',
    achievements: [
      'Established 75 district war rooms with real-time feedback loops',
      'Over 40 million impressions on localized video campaigns',
      'Achieved a 12% boost in voter turnout in targeted urban pockets',
      'Integrated WhatsApp broadcasting reaching 5 million registered voters'
    ],
    socialReach: {
      impressions: '45 Million',
      engagement: '6.8 Million',
      subscribers: '1.2 Million',
      views: '18 Million'
    },
    image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80'
    ],
    videos: ['https://www.youtube.com/embed/dQw4w9WgXcQ'],
    creativeDesigns: [
      'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=600&auto=format&fit=crop&q=80'
    ],
    reels: ['Reel UP Campaign Day 1', 'Didi vs Bhaiji debate edit'],
    shorts: ['Short: Amit Sharma ground reaction', 'Short: UP highway milestone showcase'],
    advertisements: ['Ad: Double engine growth UP', 'Ad: Safe UP, prosperous UP'],
    beforeAfterAnalytics: [
      { label: 'Social Media Share of Voice', beforeMetric: '28%', afterMetric: '54%' },
      { label: 'Positive Narrative Sentiment', beforeMetric: '35%', afterMetric: '62%' },
      { label: 'Volunteer Sign-up Rate', beforeMetric: '500/week', afterMetric: '4,500/week' }
    ],
    timeline: [
      { date: 'Oct 2023', event: 'Deep sentiment analysis of 100 constituency centers', icon: 'Search' },
      { date: 'Dec 2023', event: 'Setup of 24/7 War Room in Lucknow and digital grid mobilization', icon: 'Laptop' },
      { date: 'Feb 2024', event: 'Leader Branding and Interactive Townhall live streams', icon: 'Video' },
      { date: 'Apr 2024', event: 'Sustained digital blitz & last-mile booth messaging system', icon: 'Zap' }
    ],
    testimonials: [
      {
        quote: "RIVA Strategies transformed our campaign from traditional banners to a high-speed digital operation. Their booth-level micro-targeting made the ultimate difference.",
        author: "Amit Sharma",
        role: "MLA Candidate, Lucknow East"
      },
      {
        quote: "The visual content and rapid-response war room created an unbeatable narrative advantage.",
        author: "S. K. Maurya",
        role: "State IT Cell Coordinator"
      }
    ],
    isFeatured: true
  },
  {
    id: 'wb-sonar-bangla-2021',
    title: 'Bengal Pride Campaign',
    party: 'TMC',
    partyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80',
    candidate: 'Mamata Banerjee (slate)',
    candidateRole: 'Chief Ministerial Campaign',
    state: 'West Bengal',
    year: 2021,
    description: 'A powerful sub-national pride campaign executed during the high-stakes West Bengal Assembly Elections. Centered around "Bengal\'s Daughter" brand positioning, countering national opposition, and scaling grassroots welfare beneficiary databases.',
    achievements: [
      'Designed the "Didi Ke Bolo" (Tell Didi) digital grievance engine',
      'Mobilized 10,000+ digital volunteers across West Bengal',
      'Created a viral theme song and digital flashmobs generating 100M+ views',
      'Successfully defended state narrative against major national push'
    ],
    socialReach: {
      impressions: '120 Million',
      engagement: '18.5 Million',
      subscribers: '3.4 Million',
      views: '65 Million'
    },
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80'
    ],
    videos: ['https://www.youtube.com/embed/dQw4w9WgXcQ'],
    creativeDesigns: [
      'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=600&auto=format&fit=crop&q=80'
    ],
    reels: [],
    shorts: [],
    advertisements: [],
    beforeAfterAnalytics: [
      { label: 'Sentiment Index in Rural Bengal', beforeMetric: '42%', afterMetric: '67%' },
      { label: 'Digital Grassroot Mobilization', beforeMetric: '15k members', afterMetric: '220k members' }
    ],
    timeline: [
      { date: 'Nov 2020', event: 'Initiated the Bengal Pride Narrative Study', icon: 'BookOpen' },
      { date: 'Jan 2021', event: 'Launched Didi Ke Bolo grievance portal campaign', icon: 'Phone' },
      { date: 'Mar 2021', event: 'Statewide audio/video broadcast blitz & virtual rallies', icon: 'Tv' }
    ],
    testimonials: [
      {
        quote: "RIVA Strategies helped frame our message in a language that touched every household of Bengal. Their technical expertise was unmatched.",
        author: "A. Banerjee",
        role: "National General Secretary"
      }
    ],
    isFeatured: true
  },
  {
    id: 'punjab-youth-connect-2022',
    title: 'Punjab Youth Connect',
    party: 'INC',
    partyLogo: 'https://images.unsplash.com/photo-1584438784894-089d6a128f3e?w=120&auto=format&fit=crop&q=80',
    candidate: 'State Committee Slate',
    candidateRole: 'Assembly Mobilization',
    state: 'Punjab',
    year: 2022,
    description: 'An interactive digital campaign designed specifically for Punjab’s youth voters, focusing on economic plans, start-up opportunities, and addressing drug-abuse awareness through impactful reels, sports tournaments, and virtual debates.',
    achievements: [
      'Reached 3 million youngsters through Instagram Reels & Shorts',
      'Conducted 12 massive virtual youth townhalls with live interaction'
    ],
    socialReach: {
      impressions: '18 Million',
      engagement: '2.5 Million',
      subscribers: '350K',
      views: '8 Million'
    },
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80'
    ],
    videos: ['https://www.youtube.com/embed/dQw4w9WgXcQ'],
    creativeDesigns: [],
    reels: [],
    shorts: [],
    advertisements: [],
    beforeAfterAnalytics: [
      { label: 'Youth Engagement Score', beforeMetric: '15%', afterMetric: '48%' }
    ],
    timeline: [],
    testimonials: [],
    isFeatured: false
  },
  {
    id: 'delhi-school-showcase-2025',
    title: 'Delhi School Showcase 2025',
    party: 'AAP',
    partyLogo: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=120&auto=format&fit=crop&q=80',
    candidate: 'Arvind Kejriwal & Cabinet',
    candidateRole: 'Delhi State Election',
    state: 'Delhi',
    year: 2025,
    description: 'A visual-heavy educational development showcase campaign. Our team filmed high-production drone videos, interactive walkthroughs of Delhi Government schools, and featured direct testimonials of parents and children to build a "Development-first" narrative.',
    achievements: [
      'Documentary walkthroughs of 100 model schools',
      'Interactive QR codes in newspaper ads leading to digital video tours',
      'Massive viral reach on YouTube with parental testimonial loops'
    ],
    socialReach: {
      impressions: '32 Million',
      engagement: '5.4 Million',
      subscribers: '800K',
      views: '15 Million'
    },
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80'
    ],
    videos: ['https://www.youtube.com/embed/dQw4w9WgXcQ'],
    creativeDesigns: [],
    reels: [],
    shorts: [],
    advertisements: [],
    beforeAfterAnalytics: [
      { label: 'Parental Trust Metric', beforeMetric: '48%', afterMetric: '83%' }
    ],
    timeline: [],
    testimonials: [],
    isFeatured: true
  },
  {
    id: 'goa-wavemakers-2022',
    title: 'Goa Green Wave Campaign',
    party: 'AAP',
    partyLogo: 'https://images.unsplash.com/photo-1621252179027-94459d278660?w=120&auto=format&fit=crop&q=80',
    candidate: 'Constituency Candidates',
    candidateRole: 'Assembly Campaign',
    state: 'Goa',
    year: 2022,
    description: 'A beautiful local outreach campaign focused on environmental preservation, sustainable tourism, and clean water. Ground surveys were digitized into localized citizen pledges.',
    achievements: [
      'Signed up 80,000 digital environment pledges',
      'Created micro-influencer content network across 40 constituencies'
    ],
    socialReach: {
      impressions: '6 Million',
      engagement: '900K',
      subscribers: '120K',
      views: '2.4 Million'
    },
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
    ],
    videos: ['https://www.youtube.com/embed/dQw4w9WgXcQ'],
    creativeDesigns: [],
    reels: [],
    shorts: [],
    advertisements: [],
    beforeAfterAnalytics: [],
    timeline: [],
    testimonials: [],
    isFeatured: false
  },
  {
    id: 'ap-navaratnalu-tracker-2024',
    title: 'Andhra Pradesh Voter Trust',
    party: 'YSRCP',
    partyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80',
    candidate: 'Jagan Mohan Reddy',
    candidateRole: 'State Campaign',
    state: 'Andhra Pradesh',
    year: 2024,
    description: 'Deploying a digital benefit calculator and interactive tracking portal for the Navaratnalu welfare schemes, allowing families to see their direct fiscal impact under the leadership.',
    achievements: [
      '12 million families checked their direct benefits on our web engine',
      'Integrated IVR automated call system resolving 2M+ welfare questions'
    ],
    socialReach: {
      impressions: '38 Million',
      engagement: '6.2 Million',
      subscribers: '950K',
      views: '14 Million'
    },
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    gallery: [],
    videos: [],
    creativeDesigns: [],
    reels: [],
    shorts: [],
    advertisements: [],
    beforeAfterAnalytics: [],
    timeline: [],
    testimonials: [],
    isFeatured: false
  },
  {
    id: 'tn-rising-sun-2021',
    title: 'Tamil Nadu Digital Grid',
    party: 'DMK',
    partyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80',
    candidate: 'M. K. Stalin',
    candidateRole: 'Assembly Campaign',
    state: 'Tamil Nadu',
    year: 2021,
    description: 'A comprehensive federal autonomy and Tamil identity campaign. Built interactive historical timelines of Dravidian welfare and managed micro-grid WhatsApp communities down to street level.',
    achievements: [
      'Secured massive engagement through digital autonomy essays and debates',
      'Coordinated last-mile booth worker instructions via bespoke Android app'
    ],
    socialReach: {
      impressions: '50 Million',
      engagement: '8.4 Million',
      subscribers: '1.6 Million',
      views: '22 Million'
    },
    image: 'https://images.unsplash.com/photo-1566847438217-76e82d383f84?w=800&auto=format&fit=crop&q=80',
    gallery: [],
    videos: [],
    creativeDesigns: [],
    reels: [],
    shorts: [],
    advertisements: [],
    beforeAfterAnalytics: [],
    timeline: [],
    testimonials: [],
    isFeatured: false
  }
];

export const initialEvents: EventItem[] = [
  {
    id: 'press-conf-1',
    title: 'RIVA Strategies National Election Press Meet',
    type: 'upcoming',
    category: 'Press Conference',
    date: '2026-07-28',
    time: '11:00 AM IST',
    location: 'Taj Palace, New Delhi',
    description: 'Unveiling our high-tech AI election analysis platform and deep sentiment tracking modules for the upcoming state assembly polls.',
    gallery: [],
    videos: []
  },
  {
    id: 'road-show-up',
    title: 'Varanasi Mega Digital Roadshow Coverage',
    type: 'past',
    category: 'Road Show',
    date: '2024-04-10',
    time: '04:00 PM IST',
    location: 'Ghats and Main Market, Varanasi',
    description: 'Coordinated real-time drone capture, multi-angle livestreaming, and geofenced Twitter trending campaign during the high-impact roadshow.',
    gallery: [
      'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80'
    ],
    videos: ['https://www.youtube.com/embed/dQw4w9WgXcQ']
  },
  {
    id: 'ground-meeting-bangalore',
    title: 'Karnataka Digital Volunteer Meetup',
    type: 'past',
    category: 'Ground Meeting',
    date: '2023-05-02',
    time: '02:00 PM IST',
    location: 'NIMHANS Convention Centre, Bengaluru',
    description: 'Brought together over 2,500 physical and digital volunteers to train on booth-level mapping systems and narrative deployment routers.',
    gallery: [
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80'
    ],
    videos: []
  }
];

export const initialGallery: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Varanasi Mega Livestream Setup',
    category: 'images',
    url: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80',
    party: 'BJP',
    tags: ['Varanasi', 'Livestream', 'BJP']
  },
  {
    id: 'gal-2',
    title: 'Lucknow Digital War Room Operations',
    category: 'images',
    url: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=800&auto=format&fit=crop&q=80',
    party: 'BJP',
    tags: ['Lucknow', 'WarRoom']
  },
  {
    id: 'gal-3',
    title: 'Goa Wavemakers Rally Drone Feed',
    category: 'drone',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    party: 'AAP',
    tags: ['Goa', 'Drone', 'AAP']
  },
  {
    id: 'gal-4',
    title: 'Didi Ke Bolo Campaign Launch Kolkata',
    category: 'images',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    party: 'TMC',
    tags: ['Kolkata', 'TMC']
  },
  {
    id: 'gal-video-1',
    title: 'UP Campaign Digital Highlights Reel',
    category: 'videos',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    party: 'BJP',
    tags: ['UP', 'Highlights']
  },
  {
    id: 'gal-reel-1',
    title: 'Amit Sharma Lucknow Roadshow Reels',
    category: 'reels',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80', // Styled nicely in UI
    party: 'BJP',
    tags: ['Lucknow', 'Reel']
  }
];

export const initialBlogs: Blog[] = [
  {
    id: 'blog-1',
    title: 'How Micro-Targeting and AI Shaped the 2024 Indian Elections',
    slug: 'micro-targeting-ai-indian-elections-2024',
    content: `
# The Rise of Micro-Targeting in Indian Politics

Indian elections are some of the most complex human events on earth. Managing narrative consistency across 28 states, dozens of languages, and hundreds of socio-economic groupings is a mammoth challenge. In 2024, **RIVA Strategies** pioneered advanced booth-level micro-targeting and AI sentiment mapping to bridge the divide.

## 1. What is Booth-Level Targeting?
Rather than broadcasting a single statewide narrative, our systems analyzed voter demographics down to individual polling stations (which typically house 1,000–1,500 voters).
- We localized campaign flyers according to hyper-local needs (e.g., specific sewer issues in Ward 4 vs drainage issues in Ward 12).
- Automated translation engines translated speech outlines into localized dialects instantly.

## 2. The Role of Generative AI
By utilizing secure server-side LLMs like Gemini, we analyzed public narrative feedback from over 50,000 local news forums and social grids daily. This allowed leaders to draft responsive speeches addressing active rumors or newly voiced concerns in less than 2 hours.

### Key Takeaway
The era of generalized political pamphlets is over. To win, campaigns must speak directly to the voter’s local reality.
    `,
    excerpt: 'Explore how deep demographic mapping, WhatsApp grids, and secure AI speech systems revolutionized public outreach in UP and Karnataka elections.',
    featuredImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    category: 'Election Strategy',
    tags: ['AI', 'MicroTargeting', 'Elections2024'],
    author: 'Raghavan Iyer',
    authorRole: 'Chief Political Strategist, RIVA',
    status: 'published',
    metaTitle: 'Micro-Targeting and AI in 2024 Indian Elections | RIVA Strategies',
    metaDescription: 'Read how RIVA Strategies pioneered advanced booth-level data targeting, WhatsApp coordinate systems, and AI-enabled speech analysis to win state elections.',
    createdAt: '2026-05-14'
  },
  {
    id: 'blog-2',
    title: 'Designing Political Brand Identities That Win Hearts',
    slug: 'designing-winning-political-brands',
    content: `
# Brand Identity in Modern Politics

A political campaign is more than just promises; it is a visual and emotional brand. In this article, we outline RIVA’s standard process for crafting brand guidelines for prominent MLAs, MPs, and Chief Ministerial candidates.

## The Pillars of Leader Branding
1. **The Core Anchor Theme**: Every leader needs a clear, relatable visual anchor (such as a hand gesture, a symbolic clothing item, or a distinct color grid).
2. **Accessible Typographic Grids**: High-contrast, clean sans-serif typography ensuring legible slogans on billboard banners as well as tiny mobile screens.
3. **The Sentiment Harmony**: Using warm, high-contrast, professional colors (rich slates, vibrant oranges, ocean blues) to spark progress, trust, and resolve.

RIVA strategies has created and deployed visual brand grids for over 45 politicians in India with standard brand-manual packages.
    `,
    excerpt: 'A deep-dive into color psychology, typographic hierarchy, and symbolic narrative design used to frame successful leaders.',
    featuredImage: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800&auto=format&fit=crop&q=80',
    category: 'Creative Design',
    tags: ['Branding', 'Typography', 'Psychology'],
    author: 'Nisha Varma',
    authorRole: 'Creative Director, RIVA',
    status: 'published',
    metaTitle: 'Designing Political Brand Identities That Win Hearts | RIVA',
    metaDescription: 'A comprehensive review of color palettes, typographic guidelines, and visual storytelling implemented by RIVA strategies.',
    createdAt: '2026-06-20'
  }
];

export const initialTeam: TeamMember[] = [
  {
    id: 'team-ceo',
    name: 'Raghavan Iyer',
    role: 'CEO & Founder',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    experience: '18 Years in Political Advisory & Campaign Management',
    biography: 'Advising major political leaders across 12 Indian states. Raghavan pioneered data-driven booth mapping in India and was formerly a senior strategist at leading international consultancies.',
    campaignExperience: [
      'BJP UP Assembly Election 2022/2024 (Digital Strategy Lead)',
      'TMC West Bengal Assembly Campaign 2021 (Citizens Grid Strategist)',
      'DMK Tamil Nadu Campaign 2021 (War Room Operations Advisor)'
    ],
    linkedin: '#'
  },
  {
    id: 'team-creative',
    name: 'Nisha Varma',
    role: 'Creative Director & Co-Founder',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    experience: '12 Years in Brand Strategy & Mass Media Production',
    biography: 'Nisha leads our media production division, overseeing photography, drone shoots, high-production campaign video ads, and leader branding manuals.',
    campaignExperience: [
      'AAP Delhi School Walkthrough Showcase 2025 (Director)',
      'INC Bharat Jodo Yatra Digital Branding (Media Coordinator)',
      'Goa Green Wave Campaign 2022 (Visual Identity Designer)'
    ],
    linkedin: '#'
  },
  {
    id: 'team-tech',
    name: 'Siddharth Nair',
    role: 'Chief Technology Officer',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    experience: '10 Years in Software Engineering & Big Data Analytics',
    biography: 'Siddharth oversees the development of RIVA’s proprietary booth intelligence platform, survey applications, and real-time narrative sentiment trackers.',
    campaignExperience: [
      'AP Welfare Scheme Benefit Calculator 2024 (Architect)',
      'UP Booth-Level Volunteer Coordination System 2024 (Lead Dev)',
      'National Sentiment Index Tracking engine (Product Owner)'
    ],
    linkedin: '#'
  }
];

export const initialFAQs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'What states in India does RIVA Strategies operate in?',
    answer: 'RIVA Strategies has active physical operations and digital grids across Uttar Pradesh, West Bengal, Punjab, Andhra Pradesh, Tamil Nadu, Goa, Delhi, Karnataka, Himachal Pradesh, and Uttarakhand.',
    category: 'General'
  },
  {
    id: 'faq-2',
    question: 'How do you ensure data confidentiality and campaign security?',
    answer: 'We sign strict non-disclosure agreements (NDAs) with our clients. We construct independent, isolated project teams and secure, isolated servers to prevent any leak of campaign intelligence, survey outcomes, or strategy documents.',
    category: 'Security'
  },
  {
    id: 'faq-3',
    question: 'Do you offer real-time sentiment tracking and analysis?',
    answer: 'Yes, our proprietary software monitors over 1,500 digital channels, localized WhatsApp groups (opt-in lists), local media grids, and news publications. We produce a comprehensive daily Sentiment Index & Narrative Drift report for campaign heads.',
    category: 'Technology'
  }
];

export const initialServices = [
  {
    id: 'social-media',
    title: 'Political Social Media Management',
    category: 'Digital Reach',
    description: 'Establish absolute narrative authority. We manage your entire visual digital presence across Instagram, Facebook, YouTube, X, and WhatsApp, building hyper-active, highly connected citizen networks.',
    subServices: ['Instagram Reels & Shorts', 'Facebook Community Grids', 'YouTube Video Production', 'X Narrative Broadcasting', 'Opt-in WhatsApp War Rooms'],
    icon: 'Share2',
    popularity: 'Most Popular'
  },
  {
    id: 'branding',
    title: 'Leader Branding & Creative Design',
    category: 'Branding',
    description: 'Turn a political leader into a highly trusted household brand. We design complete leader portfolios, manifesto graphics, roadshow assets, print media layouts, and high-impact slogans.',
    subServices: ['Logo & Brand Manuals', 'Manifesto Graphic Outlines', 'Campaign Posters & Billboards', 'Print & Digital Layouts'],
    icon: 'Award',
    popularity: 'Premium'
  },
  {
    id: 'media-prod',
    title: 'High-Impact Media Production',
    category: 'Media Production',
    description: 'We capture the emotion, energy, and mass support of your campaigns. Our full-scale production team handles roadshow coverage, drone filming, professional photography, and live webcasts.',
    subServices: ['Drone Aerial Filming', 'Professional Photography & Portraiture', 'Live Speech Webcasting', 'High-Production Advertisements'],
    icon: 'Video',
    popularity: 'Highly Requested'
  },
  {
    id: 'research',
    title: 'Ground Survey & Political Research',
    category: 'Intelligence',
    description: 'Actionable intelligence to win. We conduct extensive demographic research, exit polls, localized grievance mapping, and candidate selection studies using proprietary mobile survey systems.',
    subServices: ['Constituency Grievance Mapping', 'Candidate Viability Studies', 'Voter Sentiment Surveys', 'Anti-Incumbency Appraisals'],
    icon: 'TrendingUp',
    popularity: 'Essential'
  },
  {
    id: 'war-room',
    title: 'Election War Rooms & Booth Management',
    category: 'Campaign Operations',
    description: 'Our physical-digital election war rooms act as the central nervous system. We map and train booth-level volunteers, coordinate roadshow timelines, and run micro-targeted voter turnout operations.',
    subServices: ['24/7 Digital Crisis War Rooms', 'Booth-Level Volunteer Tracking', 'Real-Time Grievance Routing', 'Voter Turnout Maximization'],
    icon: 'Shield',
    popularity: 'Campaign Critical'
  },
  {
    id: 'tech-dev',
    title: 'Political Websites & App Development',
    category: 'Technology',
    description: 'State-of-the-art interactive digital tools. We build high-speed campaign portals, custom volunteer mobile applications, real-time survey dashboards, and interactive benefit calculators.',
    subServices: ['High-Speed Campaign Websites', 'Volunteer Mobile Apps (iOS/Android)', 'Welfare Scheme Calculators', 'Real-Time Voter CRM Databases'],
    icon: 'Code',
    popularity: 'Advanced'
  }
];

export const initialCorporateWorks: CorporateWork[] = [
  {
    id: 'corp-1',
    title: 'Global Public Relations & Strategic Narrative Alignment',
    client: 'Indus Renewable Power Corp',
    industry: 'Clean Energy & Infrastructure',
    year: 2025,
    description: 'RIVA designed and executed an extensive public advocacy, local sentiment analysis, and regulatory PR blitz for Indus’s high-impact green hydrogen corridor across Rajasthan and Gujarat. We established localized support grids, created beautiful 4K documentary showcases of local benefits, and neutralized competitive narrative drift.',
    achievements: [
      'Mapped and analyzed demographic support across 1,200 local villages',
      'Developed bilingual public information portals visited by 4 million citizens',
      'Boosted positive corporate sentiment index by 38% in local language news'
    ],
    impactMetrics: [
      { label: 'Public Sentiment Gain', value: '+38%' },
      { label: 'Local Support Registered', value: '850K+' }
    ],
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
    servicesProvided: ['Local Sentiment Mapping', 'Bilingual Portal Dev', 'Video Ad Production', 'Crisis Advisory'],
    testimonials: [
      {
        quote: "RIVA Strategies applied their supreme campaign war-room infrastructure to our corporate rollout. The speed and depth of their grassroots PR was remarkable.",
        author: "V. K. Goenka",
        role: "Director of Corporate Affairs"
      }
    ],
    isFeatured: true
  },
  {
    id: 'corp-2',
    title: 'Rural Micro-Fintech Financial Literacy Blitz',
    client: 'BharatPay Finance',
    industry: 'Fintech & Digital Banking',
    year: 2024,
    description: 'A massive educational digital-awareness and user-acquisition campaign targeting tier-2 and tier-3 rural households across Maharashtra and Bihar. RIVA coordinated ground-level agent training apps, interactive WhatsApp literacy loops, and localized testimonial video shoots.',
    achievements: [
      'Created custom WhatsApp bot guiding 2.5 million users through interactive loans info',
      'Filmed 50+ local merchant success shorts generating 35 million views',
      'Onboarded 1.2 million active merchant nodes in targeted rural zones'
    ],
    impactMetrics: [
      { label: 'Active Merchant Nodes', value: '1.2M+' },
      { label: 'Video Campaign Views', value: '35M+' }
    ],
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    servicesProvided: ['Interactive WhatsApp Bot', 'Merchant Walkthrough Videos', 'Rural Ground Training Ads', 'Micro-Targeted Campaigns'],
    testimonials: [
      {
        quote: "Their hyper-local marketing expertise, refined in high-stakes political contests, gave us an unbeatable edge in acquiring rural users.",
        author: "Sanjay Mehta",
        role: "Chief Marketing Officer"
      }
    ],
    isFeatured: true
  },
  {
    id: 'corp-3',
    title: 'Crisis Narrative Mitigation & Public Trust Recovery',
    client: 'Vanguard Steel Conglomerate',
    industry: 'Manufacturing & Heavy Industries',
    year: 2024,
    description: 'Following environmental regulatory hurdles and minor labor dispute incidents, Vanguard engaged RIVA to deploy our 24/7 Digital Crisis War Room. We tracked narrative drift across 2,000 channels, generated response blueprints, and managed press relationship grids.',
    achievements: [
      'Mitigated adverse digital news cycle drift within 48 hours',
      'Established 24/7 narrative tracker detecting negative trends early',
      'Restored public trust metric to pre-crisis levels (65% positive)'
    ],
    impactMetrics: [
      { label: 'Response Deployment Time', value: '< 2 Hours' },
      { label: 'Negative Narrative Shift', value: '-82%' }
    ],
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    servicesProvided: ['24/7 Digital Crisis War Room', 'Narrative Tracking Blueprints', 'Media Liaison Framework', 'Public Opinion Restoring'],
    testimonials: [
      {
        quote: "RIVA’s crisis management team works with the urgency of an election polling day. Absolutely brilliant under pressure.",
        author: "Aditya Singhal",
        role: "VP of Communication"
      }
    ],
    isFeatured: false
  }
];

export interface RecentDesign {
  id: string;
  title: string;
  party: string;
  partyColor: string;
  author: string;
  likes: string;
  views: string;
  image: string;
  category: string;
  details: {
    heading: string;
    description: string;
    hoardingImage: string;
    hoardingCaption: string;
    digitalImage: string;
    digitalCaption: string;
  }
}

export const recentDesigns: RecentDesign[] = [
  {
    id: "design-1",
    title: "Shiv Sena Top 10 Manifestow Backdrop Design",
    party: "Shiv Sena",
    partyColor: "bg-red-600",
    author: "Aviral Shukla",
    likes: "14.8K",
    views: "90K",
    image: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80",
    category: "Backdrop Design",
    details: {
      heading: "Shiv Sena Top 10 Manifestow Backdrop Design",
      description: "A premium backdrop layout featuring custom Marathi typography, a comfortable balance of negative space, and integrated QR codes for the digital manifesto rollout.",
      hoardingImage: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80",
      hoardingCaption: "My design hoarding started at Mumbai's Andheri railway station and across Maharashtra",
      digitalImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
      digitalCaption: "My design on digital screens inside public terminals"
    }
  },
  {
    id: "design-2",
    title: "हीच ती वेळ नव्या महाराष्ट्राची (Shiv Sena Farmer Support)",
    party: "Shiv Sena",
    partyColor: "bg-red-600",
    author: "Aviral Shukla",
    likes: "12.4K",
    views: "34.0K",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    category: "Campaign Banner",
    details: {
      heading: "हीच ती वेळ नव्या महाराष्ट्राची (Shiv Sena Farmer Support Banner)",
      description: "An official farmer support banner focused on agricultural relief schemes. Designed with a vibrant orange theme, clean portraits, and highly readable Devnagari typeface.",
      hoardingImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
      hoardingCaption: "Large-format highway hoarding installed along the Mumbai-Pune Expressway",
      digitalImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
      digitalCaption: "Digital social asset optimized for high-engagement WhatsApp shares and local groups"
    }
  },
  {
    id: "design-3",
    title: "Aditya Yuva Sena - About Aditya Samvad",
    party: "Yuva Sena",
    partyColor: "bg-slate-900",
    author: "Aviral Shukla",
    likes: "8.1K",
    views: "12.0K",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    category: "Youth Campaign",
    details: {
      heading: "Aditya Yuva Sena - About Aditya Samvad Backdrop",
      description: "A clean, modern typographic poster tailored for youth dialogue events. Centers on elegant monochrome portraits, crisp brand standards, and an organic layout that appeals to college students.",
      hoardingImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80",
      hoardingCaption: "Standee banners and backdrops installed inside university town halls for interactive summits",
      digitalImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
      digitalCaption: "Interactive campaign schedules shared directly on regional student networks"
    }
  },
  {
    id: "design-4",
    title: "Shiv Sena Vachannama Promises Poster",
    party: "Shiv Sena",
    partyColor: "bg-red-600",
    author: "Aviral Shukla",
    likes: "24.5K",
    views: "51.0K",
    image: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80",
    category: "Electoral Manifesto",
    details: {
      heading: "Shiv Sena Vachannama 10 Promises Manifesto Layout",
      description: "A detailed breakdown of the 10 major promises, combining clean symbolic vector icons with precise, high-readability bullet points. Free of layout clutter.",
      hoardingImage: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=800&auto=format&fit=crop&q=80",
      hoardingCaption: "Wall wrap designs and localized community pamphlets distributed to over 5 lakh homes",
      digitalImage: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800&auto=format&fit=crop&q=80",
      digitalCaption: "High-contrast carousel graphic formatted for Instagram grid storytelling"
    }
  },
  {
    id: "design-5",
    title: "लगे रहो... केजरीवाल (AAP Delhi Campaign)",
    party: "AAP",
    partyColor: "bg-blue-600",
    author: "Aviral Shukla",
    likes: "18.9K",
    views: "42.0K",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80",
    category: "Campaign Poster",
    details: {
      heading: "लगे रहो... केजरीवाल Minimalist Poster",
      description: "A minimalist electoral poster focusing on a cheerful, authentic portrait of the candidate. Integrates the broom logo and a simple typographic slogan with maximum contrast.",
      hoardingImage: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80",
      hoardingCaption: "High-visibility hoarding displayed at Delhi Metro terminals and bus shelters",
      digitalImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
      digitalCaption: "Viral social banner distributed across local constituency WhatsApp clusters"
    }
  },
  {
    id: "design-6",
    title: "Punjab Election 2017 (Captain Amarinder)",
    party: "INC",
    partyColor: "bg-cyan-600",
    author: "Aviral Shukla",
    likes: "32.0K",
    views: "78.0K",
    image: "https://images.unsplash.com/photo-1584438784894-089d6a128f3e?w=800&auto=format&fit=crop&q=80",
    category: "Electoral Poster",
    details: {
      heading: "Punjab Election 2017 (Captain Amarinder Singh)",
      description: "A bold, patriotic typographic layout for the Punjab Election. Uses high-contrast portraits, clear regional slogans, and clean grid alignments.",
      hoardingImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
      hoardingCaption: "Large-format hoarding displayed across prominent cities in Punjab",
      digitalImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80",
      digitalCaption: "Dynamic digital card optimized for localized campaign networks"
    }
  }
];


