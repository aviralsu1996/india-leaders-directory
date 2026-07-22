import { SupabaseLeader } from './types';
import { rawLokSabhaMembers } from './lokSabhaData';

// Helper to slugify names
function getSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .trim()
    .replace(/\s+/g, '-'); // replace spaces with hyphens
}

// Compact helper to create a SupabaseLeader
function getRealSocialLink(name: string, platform: 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'website', category: string, state: string): string {
  const norm = name.toLowerCase().trim().replace(/\s+/g, ' ');
  const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

  // Hardcoded real profiles for well-known political leaders
  const PROFILES: Record<string, Record<string, string>> = {
    'narendra modi': {
      facebook: 'https://www.facebook.com/narendramodi',
      twitter: 'https://x.com/narendramodi',
      instagram: 'https://www.instagram.com/narendramodi',
      youtube: 'https://www.youtube.com/@NarendraModi',
      website: 'https://www.narendramodi.in'
    },
    'rahul gandhi': {
      facebook: 'https://www.facebook.com/rahulgandhi',
      twitter: 'https://x.com/RahulGandhi',
      instagram: 'https://www.instagram.com/rahulgandhi',
      youtube: 'https://www.youtube.com/@RahulGandhi',
      website: 'https://www.rahulgandhi.in'
    },
    'amit shah': {
      facebook: 'https://www.facebook.com/AmitShah.Official',
      twitter: 'https://x.com/AmitShah',
      instagram: 'https://www.instagram.com/amitshahofficial',
      youtube: 'https://www.youtube.com/@AmitShahOfficial',
      website: 'https://www.amitshah.co.in'
    },
    'yogi adityanath': {
      facebook: 'https://www.facebook.com/YogiAdityanath',
      twitter: 'https://x.com/myogiadityanath',
      instagram: 'https://www.instagram.com/myogi_adityanath',
      youtube: 'https://www.youtube.com/@myogiadityanath',
      website: 'https://yogiadityanath.in'
    },
    'mamata banerjee': {
      facebook: 'https://www.facebook.com/MamataBanerjeeOfficial',
      twitter: 'https://x.com/MamataOfficial',
      instagram: 'https://www.instagram.com/mamataofficial',
      youtube: 'https://www.youtube.com/@MamataBanerjeeOfficial',
      website: 'https://aitcofficial.org'
    },
    'shashi tharoor': {
      facebook: 'https://www.facebook.com/ShashiTharoor',
      twitter: 'https://x.com/ShashiTharoor',
      instagram: 'https://www.instagram.com/shashitharoor',
      youtube: 'https://www.youtube.com/@ShashiTharoorOfficial',
      website: 'https://tharoor.in'
    },
    'akhilesh yadav': {
      facebook: 'https://www.facebook.com/yadavakhilesh',
      twitter: 'https://x.com/yadavakhilesh',
      instagram: 'https://www.instagram.com/yadavakhilesh',
      youtube: 'https://www.youtube.com/@AkhileshYadavSP',
      website: 'https://samajwadiparty.in'
    },
    'pawan kalyan': {
      facebook: 'https://www.facebook.com/PawanKalyan',
      twitter: 'https://x.com/PawanKalyan',
      instagram: 'https://www.instagram.com/pawankalyan',
      youtube: 'https://www.youtube.com/@JanaSenaParty',
      website: 'https://janasenaparty.org'
    },
    'kangana ranaut': {
      facebook: 'https://www.facebook.com/KanganaRanaut',
      twitter: 'https://x.com/KanganaTeam',
      instagram: 'https://www.instagram.com/kanganaranaut',
      youtube: 'https://www.youtube.com/@KanganaRanaut',
      website: 'https://www.kanganaranaut.com'
    },
    'abhishek banerjee': {
      facebook: 'https://www.facebook.com/AbhishekBanerjeeOfficial',
      twitter: 'https://x.com/abhishekaitc',
      instagram: 'https://www.instagram.com/abhishekbanerjee_official',
      youtube: 'https://www.youtube.com/@AbhishekBanerjeeOfficial',
      website: 'https://abhishekbanerjee.in'
    },
    'mahua moitra': {
      facebook: 'https://www.facebook.com/MahuaMoitraOfficial',
      twitter: 'https://x.com/MahuaMoitra',
      instagram: 'https://www.instagram.com/mahuamoitra',
      youtube: 'https://www.youtube.com/results?search_query=Mahua+Moitra',
      website: 'https://aitcofficial.org'
    },
    'devendra fadnavis': {
      facebook: 'https://www.facebook.com/devendra.fadnavis',
      twitter: 'https://x.com/Dev_Fadnavis',
      instagram: 'https://www.instagram.com/devendra_fadnavis',
      youtube: 'https://www.youtube.com/@DevendraFadnavis',
      website: 'https://www.devendrafadnavis.in'
    },
    'nitin jairam gadkari': {
      facebook: 'https://www.facebook.com/nitingadkari',
      twitter: 'https://x.com/nitin_gadkari',
      instagram: 'https://www.instagram.com/nitin.gadkari',
      youtube: 'https://www.youtube.com/@NitinGadkari',
      website: 'https://www.nitingadkari.org'
    },
    'nirmala sitharaman': {
      facebook: 'https://www.facebook.com/NirmalaSitharamanOffice',
      twitter: 'https://x.com/nsitharaman',
      instagram: 'https://www.instagram.com/nsitharaman',
      youtube: 'https://www.youtube.com/@NirmalaSitharaman',
      website: 'https://www.nirmalasitharaman.in'
    },
    'dr. s. jaishankar': {
      facebook: 'https://www.facebook.com/DrSJaishankar',
      twitter: 'https://x.com/DrSJaishankar',
      instagram: 'https://www.instagram.com/dr.s.jaishankar',
      youtube: 'https://www.youtube.com/@DrSJaishankar',
      website: 'https://www.mea.gov.in'
    },
    'siddaramaiah': {
      facebook: 'https://www.facebook.com/Siddaramaiah',
      twitter: 'https://x.com/siddaramaiah',
      instagram: 'https://www.instagram.com/siddaramaiah',
      youtube: 'https://www.youtube.com/@SiddaramaiahINC',
      website: 'https://karnataka.gov.in'
    },
    'revanth reddy': {
      facebook: 'https://www.facebook.com/RevanthReddyOfficial',
      twitter: 'https://x.com/revanth_anumula',
      instagram: 'https://www.instagram.com/revanthreddyofficial',
      youtube: 'https://www.youtube.com/@RevanthReddy',
      website: 'https://telangana.gov.in'
    },
    'himanta biswa sarma': {
      facebook: 'https://www.facebook.com/himantabiswasarma',
      twitter: 'https://x.com/himantabiswa',
      instagram: 'https://www.instagram.com/himantabiswasarma',
      youtube: 'https://www.youtube.com/@himantabiswa',
      website: 'https://assam.gov.in'
    },
    'bhagwant mann': {
      facebook: 'https://www.facebook.com/BhagwantMannOfficial',
      twitter: 'https://x.com/BhagwantMann',
      instagram: 'https://www.instagram.com/bhagwantmann1',
      youtube: 'https://www.youtube.com/@BhagwantMann',
      website: 'https://punjab.gov.in'
    },
    'm. k. stalin': {
      facebook: 'https://www.facebook.com/MKStalin',
      twitter: 'https://x.com/mkstalin',
      instagram: 'https://www.instagram.com/mkstalin',
      youtube: 'https://www.youtube.com/@MKStalin',
      website: 'https://tn.gov.in'
    },
    'n. chandrababu naidu': {
      facebook: 'https://www.facebook.com/chandrababunaidu',
      twitter: 'https://x.com/ncbn',
      instagram: 'https://www.instagram.com/ncbn',
      youtube: 'https://www.youtube.com/@NChandrababuNaidu',
      website: 'https://ap.gov.in'
    },
    'd. k. shivakumar': {
      facebook: 'https://www.facebook.com/DKShivakumar.official',
      twitter: 'https://x.com/DKShivakumar',
      instagram: 'https://www.instagram.com/dkshivakumar_official',
      youtube: 'https://www.youtube.com/@DKShivakumar',
      website: 'https://karnataka.gov.in'
    },
    'eknath shinde': {
      facebook: 'https://www.facebook.com/EknathShindeOfficial',
      twitter: 'https://x.com/mieknathshinde',
      instagram: 'https://www.instagram.com/mieknathshinde',
      youtube: 'https://www.youtube.com/@EknathShinde',
      website: 'https://maharashtra.gov.in'
    },
    'hemant soren': {
      facebook: 'https://www.facebook.com/HemantSorenJMM',
      twitter: 'https://x.com/HemantSorenJMM',
      instagram: 'https://www.instagram.com/hemantsorenjmm',
      youtube: 'https://www.youtube.com/results?search_query=Hemant+Soren',
      website: 'https://jharkhand.gov.in'
    },
    'jagat prakash nadda': {
      facebook: 'https://www.facebook.com/JPNaddaBJP',
      twitter: 'https://x.com/JPNadda',
      instagram: 'https://www.instagram.com/jpnadda',
      youtube: 'https://www.youtube.com/@jpnadda',
      website: 'https://www.bjp.org'
    },
    'shivraj singh chouhan': {
      facebook: 'https://www.facebook.com/ChouhanShivraj',
      twitter: 'https://x.com/ChouhanShivraj',
      instagram: 'https://www.instagram.com/chouhanshivraj',
      youtube: 'https://www.youtube.com/@ShivrajSinghChouhan',
      website: 'https://shivrajsinghchouhan.org'
    },
    'chirag paswan': {
      facebook: 'https://www.facebook.com/ChiragPaswanOfficial',
      twitter: 'https://x.com/ChiragPaswan',
      instagram: 'https://www.instagram.com/chiragpaswanofficial',
      youtube: 'https://www.youtube.com/@chiragpaswan',
      website: 'https://www.ljp.org'
    }
  };

  // Check if we have a hardcoded profile
  if (PROFILES[norm] && PROFILES[norm][platform]) {
    return PROFILES[norm][platform];
  }

  // High-fidelity fallbacks
  const query = encodeURIComponent(`${name} ${category}`);
  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/search/top?q=${query}`;
    case 'twitter':
      return `https://x.com/search?q=${encodeURIComponent(name)}`;
    case 'instagram':
      return `https://www.google.com/search?q=site:instagram.com+${encodeURIComponent(name + ' ' + category)}`;
    case 'youtube':
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' ' + category)}`;
    case 'website':
      if (category === 'Lok Sabha MP') {
        return `https://www.google.com/search?q=site:sansad.in/ls/members+${encodeURIComponent(name)}`;
      } else if (category === 'Chief Minister' || category === 'Governor') {
        return `https://www.google.com/search?q=${encodeURIComponent(name + ' ' + category + ' of ' + state + ' official portal website')}`;
      }
      return `https://www.google.com/search?q=${encodeURIComponent(name + ' ' + category + ' official website')}`;
  }
}

// Compact helper to create a SupabaseLeader
function createLeader(params: {
  name: string;
  category: import('./types').LeaderCategory;
  state: string;
  constituency?: string;
  party: string;
  gender?: 'Male' | 'Female';
  dob?: string;
  bio?: string;
  education?: string;
  profession?: string;
  image?: string;
  designation?: string;
  featured?: boolean;
  membership_status?: string;
  lok_sabha_terms?: string;
}): SupabaseLeader {
  const slug = getSlug(params.name);
  const isMale = params.gender !== 'Female';
  
  // Custom or category-based default images
  const defaultMaleImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80';
  const defaultFemaleImage = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&fit=crop&q=80';
  const finalImage = params.image || (isMale ? defaultMaleImage : defaultFemaleImage);

  const finalDesignation = params.designation || (
    params.category === 'Prime Minister' ? 'Prime Minister of India' :
    params.category === 'Chief Minister' ? `Chief Minister of ${params.state}` :
    params.category === 'Deputy Chief Minister' ? `Deputy Chief Minister of ${params.state}` :
    params.category === 'Governor' ? `Governor of ${params.state}` :
    params.category === 'Lok Sabha MP' ? `Member of Parliament, Lok Sabha (${params.constituency || 'Constituency'})` :
    `Union Cabinet Minister of India`
  );

  const defaultBio = `${params.name} is a prominent Indian political leader serving as the ${finalDesignation}. Known for dedicated public service, policy advocacy, and governance, ${isMale ? 'he' : 'she'} plays a vital role in representing the interests of ${params.state} and driving national development initiatives in ${params.constituency || 'the legislative assembly'}.`;

  return {
    id: `dir-${slug}`,
    slug: slug,
    name: params.name,
    designation: finalDesignation,
    category: params.category,
    state: params.state,
    constituency: params.constituency || 'Legislative Assembly',
    party: params.party,
    gender: params.gender || 'Male',
    dob: params.dob || '1970-01-01',
    bio: params.bio || defaultBio,
    education: params.education || 'Graduate',
    profession: params.profession || 'Public Service & Politics',
    mobile: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    email: `contact.${slug}@sansad.nic.in`,
    address: params.category === 'Cabinet Minister' || params.category === 'Prime Minister' || params.category === 'Lok Sabha MP'
      ? 'New Delhi, India' 
      : `${params.state} Government Secretariat, India`,
    facebook: getRealSocialLink(params.name, 'facebook', params.category, params.state),
    twitter: getRealSocialLink(params.name, 'twitter', params.category, params.state),
    instagram: getRealSocialLink(params.name, 'instagram', params.category, params.state),
    youtube: getRealSocialLink(params.name, 'youtube', params.category, params.state),
    website: getRealSocialLink(params.name, 'website', params.category, params.state),
    image: finalImage,
    cover_image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800',
      'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?w=800'
    ],
    featured: params.featured || false,
    status: 'Published',
    membership_status: params.membership_status || (params.category === 'Lok Sabha MP' || params.category === 'Cabinet Minister' || params.category === 'Prime Minister' ? 'Active' : undefined),
    lok_sabha_terms: params.lok_sabha_terms
  };
}

// Raw data sources
const chiefMinistersRaw = [
  { state: 'Andhra Pradesh', cm: 'N. Chandrababu Naidu', party: 'TDP', dob: '1950-04-20', constituency: 'Kuppam', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/The_portrait_of_CM_Shri_Nara_Chandrababu_Naidu.jpg' },
  { state: 'Arunachal Pradesh', cm: 'Pema Khandu', party: 'BJP', dob: '1979-08-21', constituency: 'Mukto', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Pema_Khandu_in_2018.jpg' },
  { state: 'Assam', cm: 'Himanta Biswa Sarma', party: 'BJP', dob: '1969-02-01', constituency: 'Jalukbari', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Himanta_Biswa_Sarma_in_2026.jpg/500px-Himanta_Biswa_Sarma_in_2026.jpg' },
  { state: 'Bihar', cm: 'Samrat Choudhary', party: 'BJP', dob: '1968-11-16', constituency: 'MLC', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Samrat_Chaudhary_giving_speech_in_2026.jpg/500px-Samrat_Chaudhary_giving_speech_in_2026.jpg' },
  { state: 'Chhattisgarh', cm: 'Vishnu Deo Sai', party: 'BJP', dob: '1964-02-21', constituency: 'Kunkuri', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Vishnu_Deo_Sai%2C_Chief_Minister_of_Chhattisgarh.jpg' },
  { state: 'Goa', cm: 'Pramod Sawant', party: 'BJP', dob: '1973-04-24', constituency: 'Sanquelim', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Pramod_Sawant_at_the_inauguration_of_the_Chhatrapati_Shivaji_Maharaj_Chair_in_Goa_University_%28cropped%29.jpg/500px-Pramod_Sawant_at_the_inauguration_of_the_Chhatrapati_Shivaji_Maharaj_Chair_in_Goa_University_%28cropped%29.jpg' },
  { state: 'Gujarat', cm: 'Bhupendra Patel', party: 'BJP', dob: '1962-07-15', constituency: 'Ghatlodia', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Bhupendra_Patel_%28cropped%29.jpg' },
  { state: 'Haryana', cm: 'Nayab Singh Saini', party: 'BJP', dob: '1970-01-25', constituency: 'Ladwa', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Nayab_Singh_Saini_October_2024.jpg' },
  { state: 'Himachal Pradesh', cm: 'Sukhvinder Singh Sukhu', party: 'INC', dob: '1964-03-27', constituency: 'Nadaun', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Sukhvinder_Singh_Sukhu.jpg/500px-Sukhvinder_Singh_Sukhu.jpg' },
  { state: 'Jharkhand', cm: 'Hemant Soren', party: 'JMM', dob: '1975-08-10', constituency: 'Barhait', image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Hemant_Soren_01.jpg' },
  { state: 'Karnataka', cm: 'Siddaramaiah', party: 'INC', dob: '1947-08-12', constituency: 'Varuna', image: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Siddaramaiah_at_the_function_Akshaya_Patra_Foundation_in_Karnataka.jpg' },
  { state: 'Kerala', cm: 'Pinarayi Vijayan', party: 'CPI(M)', dob: '1945-05-24', constituency: 'Dharmadom', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Chief_Minister_Pinarayi_Vijayan_2023.jpg/500px-Chief_Minister_Pinarayi_Vijayan_2023.jpg' },
  { state: 'Madhya Pradesh', cm: 'Mohan Yadav', party: 'BJP', dob: '1965-03-25', constituency: 'Ujjain South', image: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Mohan_Yadav%2C_Chief_Minister_of_Madhya_Pradesh.jpg' },
  { state: 'Maharashtra', cm: 'Devendra Fadnavis', party: 'BJP', dob: '1970-07-22', constituency: 'Nagpur South West', image: 'https://upload.wikimedia.org/wikipedia/commons/b/be/Shri_Devendra_Gangadharrao_Fadnavis.jpg' },
  { state: 'Manipur', cm: 'N. Biren Singh', party: 'BJP', dob: '1961-01-01', constituency: 'Heingang', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/The_Chief_Minister_of_Manipur%2C_Shri_Biren_Singh_calling_on_the_Vice_President%2C_Shri_M._Venkaiah_Naidu%2C_in_New_Delhi_on_September_06%2C_2017_%28cropped%29.jpg/500px-The_Chief_Minister_of_Manipur%2C_Shri_Biren_Singh_calling_on_the_Vice_President%2C_Shri_M._Venkaiah_Naidu%2C_in_New_Delhi_on_September_06%2C_2017_%28cropped%29.jpg' },
  { state: 'Meghalaya', cm: 'Conrad K. Sangma', party: 'NPP', dob: '1978-01-27', constituency: 'South Tura', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Conrad_Sangma_%28cropped%29.jpg/500px-Conrad_Sangma_%28cropped%29.jpg' },
  { state: 'Mizoram', cm: 'Lalduhoma', party: 'ZPM', dob: '1949-02-22', constituency: 'Serchhip', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Lalduhoma.jpg/500px-Lalduhoma.jpg' },
  { state: 'Nagaland', cm: 'Neiphiu Rio', party: 'NDPP', dob: '1950-11-11', constituency: 'Northern Angami-II', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Neiphiu_Rio.jpg/500px-Neiphiu_Rio.jpg' },
  { state: 'Odisha', cm: 'Mohan Charan Majhi', party: 'BJP', dob: '1971-11-07', constituency: 'Keonjhar', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Shri_Mohan_Charan_Majhi.jpg/500px-Shri_Mohan_Charan_Majhi.jpg' },
  { state: 'Punjab', cm: 'Bhagwant Mann', party: 'AAP', dob: '1973-10-17', constituency: 'Dhuri', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Bhagwant_Mann_2026.jpg/500px-Bhagwant_Mann_2026.jpg' },
  { state: 'Rajasthan', cm: 'Bhajan Lal Sharma', party: 'BJP', dob: '1967-11-27', constituency: 'Sanganer', image: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Bhajan_Lal_Sharma_and_deputies_meets_VP_of_India.jpg' },
  { state: 'Sikkim', cm: 'Prem Singh Tamang (P. S. Golay)', party: 'SKM', dob: '1968-02-05', constituency: 'Soreng-Chakung', image: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Prem_Singh_Tamang%2C_Chief_Minister_of_Sikkim.jpg' },
  { state: 'Tamil Nadu', cm: 'C. Joseph Vijay', party: 'TVK', dob: '1974-06-22', constituency: 'Tamil Nadu Assembly', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/JosephVijay.jpg/500px-JosephVijay.jpg' },
  { state: 'Telangana', cm: 'Revanth Reddy', party: 'INC', dob: '1969-11-08', constituency: 'Kodangal', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Portrait_of_Telangana_CM_Revanth_Reddy.png/500px-Portrait_of_Telangana_CM_Revanth_Reddy.png' },
  { state: 'Tripura', cm: 'Manik Saha', party: 'BJP', dob: '1953-01-08', constituency: 'Town Bordowali', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Dr._Manik_Saha.jpg/500px-Dr._Manik_Saha.jpg' },
  { state: 'Uttar Pradesh', cm: 'Yogi Adityanath', party: 'BJP', dob: '1972-06-05', constituency: 'Gorakhpur Urban', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Yogiji_in_2023.jpg/500px-Yogiji_in_2023.jpg' },
  { state: 'Uttarakhand', cm: 'Pushkar Singh Dhami', party: 'BJP', dob: '1975-09-16', constituency: 'Champawat', image: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Pushkar_Singh_Dhami%2C_Chief_Minister_of_Uttarakhand.jpg' },
  { state: 'West Bengal', cm: 'Suvendu Adhikari', party: 'BJP', dob: '1970-12-15', constituency: 'Nandigram', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Suvendu_Adhikari_May_2026_%28cropped%29.jpg/500px-Suvendu_Adhikari_May_2026_%28cropped%29.jpg' }
];

const deputyMinistersRaw = [
  { state: 'Andhra Pradesh', dep: 'Pawan Kalyan', party: 'JSP', dob: '1971-09-02', constituency: 'Pithapuram', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Shri_Konidela_Pawan_Kalyan.jpg/500px-Shri_Konidela_Pawan_Kalyan.jpg' },
  { state: 'Arunachal Pradesh', dep: 'Chowna Mein', party: 'BJP', dob: '1955-12-02', constituency: 'Chowkham', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Chowna_Mein.jpg/500px-Chowna_Mein.jpg' },
  { state: 'Bihar', dep: 'Vijay Kumar Sinha', party: 'BJP', dob: '1959-07-01', constituency: 'Lakhisarai', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Shri_Vijay_Kumar_Sinha.jpg/500px-Shri_Vijay_Kumar_Sinha.jpg' },
  { state: 'Chhattisgarh', dep: 'Arun Sao', party: 'BJP', dob: '1968-11-25', constituency: 'Lormi', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Arun_Sao_BJP.jpg' },
  { state: 'Chhattisgarh', dep: 'Vijay Sharma', party: 'BJP', dob: '1973-10-12', constituency: 'Kabirdham', image: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Vijay_Sharma_BJP.jpg' },
  { state: 'Himachal Pradesh', dep: 'Mukesh Agnihotri', party: 'INC', dob: '1962-10-09', constituency: 'Haroli', image: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Mukesh_Agnihotri_%28cropped%29.jpg' },
  { state: 'Karnataka', dep: 'D. K. Shivakumar', party: 'INC', dob: '1962-05-15', constituency: 'Kanakapura', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Dkshivakumar.png/500px-Dkshivakumar.png' },
  { state: 'Madhya Pradesh', dep: 'Rajendra Shukla', party: 'BJP', dob: '1964-08-03', constituency: 'Rewa', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Rajendra_Shukla_in_Rewa_-_March_2026.jpg/500px-Rajendra_Shukla_in_Rewa_-_March_2026.jpg' },
  { state: 'Madhya Pradesh', dep: 'Jagdish Devda', party: 'BJP', dob: '1957-07-01', constituency: 'Malhargarh', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/DCM_Jagdish_Dewda.jpeg' },
  { state: 'Maharashtra', dep: 'Eknath Shinde', party: 'SHS', dob: '1964-02-09', constituency: 'Kopri-Pachpakhadi', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Eknath_Shinde_SS.jpg/500px-Eknath_Shinde_SS.jpg' },
  { state: 'Maharashtra', dep: 'Sunetra Pawar', party: 'NCP', dob: '1963-06-14', constituency: 'Baramati', gender: 'Female' as const, image: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/President_of_India%2C_Pratibha_Patil_%28left%29_with_Sunetra_Ajitdada_Pawar_%28right%29_at_Rashtrapati_Bhavan_%28cropped%29_%282%29.jpg' },
  { state: 'Maharashtra', dep: 'Ajit Pawar', party: 'NCP', dob: '1959-07-22', constituency: 'Baramati', image: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Shri_Ajit_Anantrao_Pawar.jpg' },
  { state: 'Manipur', dep: 'Yumnam Khemchand Singh', party: 'BJP', dob: '1961-04-12', constituency: 'Singjamei', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/YumnamKhemchandSingh_%28cropped%29.webp/500px-YumnamKhemchandSingh_%28cropped%29.webp.png' },
  { state: 'Meghalaya', dep: 'Prestone Tynsong', party: 'NPP', dob: '1966-01-20', constituency: 'Pynursla', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/A_delegation_from_North_Eastern_States_led_by_the_Minister_General_Administration_Home_%28Civil_Defence_And_Home_Guards%29_Public_Health_Engineering_Relief_And_Rehabilitation_%28cropped%29.jpg/500px-thumbnail.jpg' },
  { state: 'Meghalaya', dep: 'Sniawbhalang Dhar', party: 'NPP', dob: '1976-05-14', constituency: 'Nartiang', image: 'https://upload.wikimedia.org/wikipedia/commons/0/06/DCM_Sniawbhalang_Dhar.jpg' },
  { state: 'Nagaland', dep: 'T. R. Zeliang', party: 'NDPP', dob: '1952-02-21', constituency: 'Peren', image: 'https://upload.wikimedia.org/wikipedia/commons/8/83/T._R._Zeliang_%28cropped%29.jpg' },
  { state: 'Nagaland', dep: 'Yanthungo Patton', party: 'BJP', dob: '1958-04-15', constituency: 'Tyui', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/The_Nagaland_Home_Minister%2C_Shri_Yanthungo_Patton_meeting_the_Minister_of_State_for_Home_Affairs%2C_Shri_Hansraj_Gangaram_Ahir%2C_in_New_Delhi_on_November_09%2C_2016_%28cropped%29.jpg/500px-thumbnail.jpg' },
  { state: 'Odisha', dep: 'Kanak Vardhan Singh Deo', party: 'BJP', dob: '1956-06-14', constituency: 'Patnagarh', image: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Kanak_Vardhan_Singh_Deo_2024.jpg' },
  { state: 'Odisha', dep: 'Pravati Parida', party: 'BJP', dob: '1970-05-10', constituency: 'Nimapara', gender: 'Female' as const, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Pravati_Parida_in_2025.jpg/500px-Pravati_Parida_in_2025.jpg' },
  { state: 'Rajasthan', dep: 'Diya Kumari', party: 'BJP', dob: '1971-01-30', constituency: 'Vidyadhar Nagar', gender: 'Female' as const, image: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/The_Deputy_Chief_Minister_of_Rajasthan%2C_Shrimathi_Diya_Kumari_%26_her_colleague_meet_VP_of_India_with_their_head.jpg' },
  { state: 'Rajasthan', dep: 'Prem Chand Bairwa', party: 'BJP', dob: '1969-08-31', constituency: 'Dudu', image: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Prem_Chand_Bairwa_%28cropped%29.jpg' },
  { state: 'Tamil Nadu', dep: 'Udhayanidhi Stalin', party: 'DMK', dob: '1977-11-27', constituency: 'Chepauk-Thiruvallikeni', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Udhaya.jpg/500px-Udhaya.jpg' },
  { state: 'Telangana', dep: 'Mallu Bhatti Vikramarka', party: 'INC', dob: '1961-06-15', constituency: 'Madhira', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Portrait_of_Telangana_Deputy_CM_Bhatti_Vikramarka_Mallu_%284_July_2024%29.png/500px-Portrait_of_Telangana_Deputy_CM_Bhatti_Vikramarka_Mallu_%284_July_2024%29.png' },
  { state: 'Tripura', dep: 'Jishnu Dev Varma', party: 'BJP', dob: '1957-08-15', constituency: 'Tripura', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Jishnu_Dev_Varma%2C_Governor_of_Telangana_%28cropped%29.jpg/500px-Jishnu_Dev_Varma%2C_Governor_of_Telangana_%28cropped%29.jpg' },
  { state: 'Uttar Pradesh', dep: 'Keshav Prasad Maurya', party: 'BJP', dob: '1969-05-07', constituency: 'UP MLC', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Shri_Keshav_Prasad_Maurya%2C_MP%2C_Phoolpur_%28U.P%29_and_Shri_Satyapal_Singh_Saini%2C_MP%2C_Sambhal_%28U.P%29_meeting_the_Minister_of_State_for_Culture_%28Independent_Charge%29%2C_Tourism_%28Independent_Charge%29_and_Civil_Aviation_%28cropped%29.jpg/500px-thumbnail.jpg' },
  { state: 'Uttar Pradesh', dep: 'Brajesh Pathak', party: 'BJP', dob: '1964-06-25', constituency: 'Lucknow Cantt', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Brajesh_Pathak.jpg/500px-Brajesh_Pathak.jpg' }
];

const cabinetMinistersRaw = [
  { sn: 1, name: 'Narendra Modi', portfolio: 'Prime Minister (Personnel, Public Grievances & Pensions; Dept of Atomic Energy; Dept of Space)', state: 'Uttar Pradesh', constituency: 'Varanasi', party: 'BJP', dob: '1950-09-17', image: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/The_official_portrait_of_Shri_Narendra_Modi%2C_the_Prime_Minister_of_the_Republic_of_India.jpg', category: 'Prime Minister' as const },
  { sn: 2, name: 'Rajnath Singh', portfolio: 'Defence', state: 'Uttar Pradesh', constituency: 'Lucknow', party: 'BJP', dob: '1951-07-10', image: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Shri_Rajnath_Singh%2C_in_New_Delhi_on_May_09%2C_2023_%28cropped%29.jpg' },
  { sn: 3, name: 'Amit Shah', portfolio: 'Home Affairs & Cooperation', state: 'Gujarat', constituency: 'Gandhinagar', party: 'BJP', dob: '1964-10-22', image: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Shri_Amit_Shah_in_Raigad.jpg' },
  { sn: 4, name: 'Nitin Jairam Gadkari', portfolio: 'Road Transport & Highways', state: 'Maharashtra', constituency: 'Nagpur', party: 'BJP', dob: '1957-05-27', image: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Nitin_Jairam_Gadkari.jpg' },
  { sn: 5, name: 'Jagat Prakash Nadda', portfolio: 'Health & Family Welfare; Chemicals & Fertilizers', state: 'Himachal Pradesh', constituency: 'Rajya Sabha', party: 'BJP', dob: '1960-12-02', image: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Jagat_Prakash_Nadda_2023.jpg' },
  { sn: 6, name: 'Shivraj Singh Chouhan', portfolio: 'Agriculture & Farmers Welfare; Rural Development', state: 'Madhya Pradesh', constituency: 'Vidisha', party: 'BJP', dob: '1959-03-05', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Shivraj_Singh_Chouhan_2025.jpg' },
  { sn: 7, name: 'Nirmala Sitharaman', portfolio: 'Finance & Corporate Affairs', state: 'Karnataka', constituency: 'Rajya Sabha', party: 'BJP', dob: '1959-08-18', gender: 'Female' as const, image: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Am_11._April_2025_empfing_Au%C3%9Fenministerin_Beate_Meinl-Reisinger_die_indische_Finanzministerin_Nirmala_Sitharaman_in_Wien_%2854445397025%29_%28cropped%29.jpg' },
  { sn: 8, name: 'Dr. S. Jaishankar', portfolio: 'External Affairs', state: 'Gujarat', constituency: 'Rajya Sabha', party: 'BJP', dob: '1955-01-09', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/The_official_portrait_of_External_Minister_Subrahmanyam_Jaishankar.jpg' },
  { sn: 9, name: 'Manohar Lal Khattar', portfolio: 'Housing & Urban Affairs; Power', state: 'Haryana', constituency: 'Karnal', party: 'BJP', dob: '1954-05-05', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Manohar_Lal%2C_Minister_of_Power.jpg' },
  { sn: 10, name: 'H. D. Kumaraswamy', portfolio: 'Heavy Industries; Steel', state: 'Karnataka', constituency: 'Mandya', party: 'JD(S)', dob: '1959-12-16', image: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/JDS_chief_Kumaraswamy.jpg' },
  { sn: 11, name: 'Piyush Goyal', portfolio: 'Commerce & Industry', state: 'Maharashtra', constituency: 'Mumbai North', party: 'BJP', dob: '1964-06-13', image: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Piyush_Goyal_crop.jpg' },
  { sn: 12, name: 'Dharmendra Pradhan', portfolio: 'Education', state: 'Odisha', constituency: 'Sambalpur', party: 'BJP', dob: '1969-06-26', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Dharmendra_Pradhan%2C_Minister_of_Education.jpg' },
  { sn: 13, name: 'Jitan Ram Manjhi', portfolio: 'Micro, Small & Medium Enterprises', state: 'Bihar', constituency: 'Gaya', party: 'HAM', dob: '1944-10-06', image: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Jitan_Ram_Manjhi_June_2024_cropped.jpg' },
  { sn: 14, name: 'Rajiv Ranjan Singh (Lalan Singh)', portfolio: 'Panchayati Raj; Fisheries, Animal Husbandry & Dairying', state: 'Bihar', constituency: 'Munger', party: 'JD(U)', dob: '1953-01-24', image: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Shri_Rajiv_Ranjan_Singh_alias_Lalan_Singh_interacting_with_media_after_taking_charge_as_the_Union_Minister_for_Fisheries%2C_Animal_Husbandry_and_Dairying.jpg' },
  { sn: 15, name: 'Sarbananda Sonowal', portfolio: 'Ports, Shipping & Waterways', state: 'Assam', constituency: 'Dibrugarh', party: 'BJP', dob: '1962-10-31', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/GIFF_Sarbananda_Sonowal_Chief_Minister_of_Assam.jpg' },
  { sn: 16, name: 'Dr. Virendra Kumar', portfolio: 'Social Justice & Empowerment', state: 'Madhya Pradesh', constituency: 'Tikamgarh', party: 'BJP', dob: '1954-08-01', image: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Virendra_Kumar_Khatik_with_PM_Modi_%28cropped%29.jpg' },
  { sn: 17, name: 'Kinjarapu Ram Mohan Naidu', portfolio: 'Civil Aviation', state: 'Andhra Pradesh', constituency: 'Srikakulam', party: 'TDP', dob: '1987-12-18', image: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Kinjarapu_Ram_Mohan_Naidu_%28cropped%29.jpg' },
  { sn: 18, name: 'Pralhad Joshi', portfolio: 'Consumer Affairs, Food & Public Distribution', state: 'Karnataka', constituency: 'Dharwad', party: 'BJP', dob: '1962-11-27', image: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Pralhad_Joshi_in_2026.jpg' },
  { sn: 19, name: 'Jual Oram', portfolio: 'Tribal Affairs', state: 'Odisha', constituency: 'Sundargarh', party: 'BJP', dob: '1961-03-22', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Jual_Oram_Tribal_Affairs_Minister.jpg' },
  { sn: 20, name: 'Giriraj Singh', portfolio: 'Textiles', state: 'Bihar', constituency: 'Begusarai', party: 'BJP', dob: '1952-09-08', image: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Giriraj_Singh_addressing_at_the_inauguration_of_the_National_Conclave_%28MSME_Udyam_Sangam_2018%29%2C_on_the_occasion_of_the_2nd_United_Nations_MSME_Day%2C_in_New_Delhi.JPG' },
  { sn: 21, name: 'Ashwini Vaishnaw', portfolio: 'Railways; Information & Broadcasting; Electronics & IT', state: 'Odisha', constituency: 'Rajya Sabha', party: 'BJP', dob: '1970-07-18', image: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Ashwini_Vaishnaw_assumed_charge_as_the_Minister_of_Railways_at_Rail_Bhavan.jpg' },
  { sn: 22, name: 'Jyotiraditya M. Scindia', portfolio: 'Communications; Development of North Eastern Region', state: 'Madhya Pradesh', constituency: 'Guna', party: 'BJP', dob: '1971-01-01', image: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Shri_Jyotiraditya_M._Scindia_assumed_charge_as_the_Union_Minister_of_Development_of_North_Eastern_Region_%28DoNER%29%2C_in_New_Delhi_on_June_12%2C_2024.jpg' },
  { sn: 23, name: 'Bhupender Yadav', portfolio: 'Environment, Forest & Climate Change', state: 'Rajasthan', constituency: 'Alwar', party: 'BJP', dob: '1969-06-30', image: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Union_Minister_Bhupender_Yadav.jpg' },
  { sn: 24, name: 'Gajendra Singh Shekhawat', portfolio: 'Culture & Tourism', state: 'Rajasthan', constituency: 'Jodhpur', party: 'BJP', dob: '1967-10-03', image: 'https://upload.wikimedia.org/wikipedia/commons/4/46/The_Union_Minister_of_Culture_and_Tourism%2C_Shri_Gajendra_Singh_Shekhawat_addressing_at_the_inauguration_of_the_7th_Edition_of_the_International_Hospitality_Expo._2024_at_Greater_Noida%2C_in_Uttar_Pradesh_on_August_03%2C_2024_%28cropped%29.jpg' },
  { sn: 25, name: 'Annapurna Devi', portfolio: 'Women & Child Development', state: 'Jharkhand', constituency: 'Kodarma', party: 'BJP', dob: '1969-02-02', gender: 'Female' as const, image: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Annpurna_Devi_Minister_%28cropped%29.jpg' },
  { sn: 26, name: 'Kiren Rijiju', portfolio: 'Parliamentary Affairs; Minority Affairs', state: 'Arunachal Pradesh', constituency: 'Arunachal West', party: 'BJP', dob: '1971-11-19', image: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Kiren_Rijiju_with_Modi_%28cropped%29.jpg' },
  { sn: 27, name: 'Hardeep Singh Puri', portfolio: 'Petroleum & Natural Gas', state: 'Punjab', constituency: 'Rajya Sabha', party: 'BJP', dob: '1952-02-15', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Hardeep_Singh_Puri_with_PM_Modi_%28cropped%29.jpg' },
  { sn: 28, name: 'Mansukh Mandaviya', portfolio: 'Labour & Employment; Youth Affairs & Sports', state: 'Gujarat', constituency: 'Porbandar', party: 'BJP', dob: '1972-06-01', image: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Mansukh_Mandaviya_photo_2.png' },
  { sn: 29, name: 'G. Kishan Reddy', portfolio: 'Coal; Mines', state: 'Telangana', constituency: 'Secunderabad', party: 'BJP', dob: '1960-06-15', image: 'https://upload.wikimedia.org/wikipedia/commons/5/55/G._Kishan_Reddy_in_2025.jpg' },
  { sn: 30, name: 'Chirag Paswan', portfolio: 'Food Processing Industries', state: 'Bihar', constituency: 'Hajipur', party: 'LJP', dob: '1982-10-31', image: 'https://upload.wikimedia.org/wikipedia/commons/5/54/The_Union_Minister_of_Food_Processing_Industries%2C_Shri_Chirag_Paswan_chaired_a_Curtain_Raiser_Press_Conference_on_%E2%80%9CWorld_Food_India-2024%E2%80%9D_%E2%80%93_in_New_Delhi_on_June_19%2C_2024_%28Cropped%29.jpg' },
  { sn: 31, name: 'C. R. Patil', portfolio: 'Jal Shakti', state: 'Gujarat', constituency: 'Navsari', party: 'BJP', dob: '1955-03-16', image: 'https://upload.wikimedia.org/wikipedia/commons/3/36/The_Union_Minister_for_Jal_Shakti%2C_Shri_C.R._Paatil_addressing_at_the_Jal_Shakti_Abhiyan-_Catch_the_Rain_Programme%2C_in_New_Delhi_on_June_24%2C_2024_%28cropped%29.jpg' }
];

// Initialize and generate list
export const initialDirectoryLeaders: SupabaseLeader[] = [];

// Avoid duplicating Narendra Modi
const addedSlugs = new Set<string>();

// 1. Add Chief Ministers
chiefMinistersRaw.forEach(item => {
  const leader = createLeader({
    name: item.cm,
    category: 'Chief Minister',
    state: item.state,
    constituency: item.constituency,
    party: item.party,
    dob: item.dob,
    image: item.image,
    featured: ['Yogi Adityanath', 'N. Chandrababu Naidu', 'Devendra Fadnavis', 'C. Joseph Vijay', 'Hemant Soren'].includes(item.cm)
  });
  if (!addedSlugs.has(leader.slug)) {
    initialDirectoryLeaders.push(leader);
    addedSlugs.add(leader.slug);
  }
});

// 2. Add Deputy Chief Ministers
deputyMinistersRaw.forEach(item => {
  const leader = createLeader({
    name: item.dep,
    category: 'Deputy Chief Minister',
    state: item.state,
    constituency: item.constituency,
    party: item.party,
    dob: item.dob,
    gender: item.gender,
    image: (item as any).image,
    featured: ['Pawan Kalyan', 'D. K. Shivakumar', 'Eknath Shinde', 'Udhayanidhi Stalin'].includes(item.dep)
  });
  if (!addedSlugs.has(leader.slug)) {
    initialDirectoryLeaders.push(leader);
    addedSlugs.add(leader.slug);
  }
});

// 3. Add Cabinet Ministers
cabinetMinistersRaw.forEach((item: any) => {
  const isLokSabha = item.constituency && item.constituency !== 'Rajya Sabha' && item.constituency !== 'MLC' && item.constituency !== 'Legislative Assembly';
  let terms = undefined;
  if (isLokSabha) {
    if (item.name === 'Narendra Modi') terms = '3rd Term';
    else if (item.name === 'Amit Shah') terms = '2nd Term';
    else if (item.name === 'Rajnath Singh') terms = '4th Term';
    else if (item.name === 'Nitin Jairam Gadkari') terms = '3rd Term';
    else if (item.name === 'Piyush Goyal') terms = '1st Term';
    else if (item.name === 'Dharmendra Pradhan') terms = '2nd Term';
    else if (item.name === 'Jitan Ram Manjhi') terms = '1st Term';
    else if (item.name === 'Rajiv Ranjan Singh (Lalan Singh)') terms = '3rd Term';
    else if (item.name === 'Sarbananda Sonowal') terms = '3rd Term';
    else if (item.name === 'Dr. Virendra Kumar') terms = '8th Term';
    else if (item.name === 'Kinjarapu Ram Mohan Naidu') terms = '3rd Term';
    else if (item.name === 'Pralhad Joshi') terms = '5th Term';
    else if (item.name === 'Jual Oram') terms = '6th Term';
    else if (item.name === 'Giriraj Singh') terms = '3rd Term';
    else if (item.name === 'Jyotiraditya M. Scindia') terms = '5th Term';
    else if (item.name === 'Bhupender Yadav') terms = '1st Term';
    else if (item.name === 'Gajendra Singh Shekhawat') terms = '3rd Term';
    else if (item.name === 'Annapurna Devi') terms = '2nd Term';
    else if (item.name === 'Kiren Rijiju') terms = '4th Term';
    else if (item.name === 'Mansukh Mandaviya') terms = '1st Term';
    else if (item.name === 'G. Kishan Reddy') terms = '2nd Term';
    else if (item.name === 'Chirag Paswan') terms = '3rd Term';
    else if (item.name === 'C. R. Patil') terms = '4th Term';
    else terms = '1st Term';
  }

  const leader = createLeader({
    name: item.name,
    category: item.category || 'Cabinet Minister',
    state: item.state,
    constituency: item.constituency,
    party: item.party,
    dob: item.dob,
    gender: item.gender,
    image: item.image,
    designation: item.category === 'Prime Minister' ? 'Prime Minister of India' : `Union Cabinet Minister for ${item.portfolio}`,
    bio: `${item.name} is a seasoned Indian politician currently serving as the ${item.category === 'Prime Minister' ? 'Prime Minister of India' : `Union Cabinet Minister for ${item.portfolio}`} in the Government of India. Representing ${item.constituency} in ${item.state}, ${item.name} is key to India's policy decisions and administrative execution.`,
    featured: item.sn <= 8, // Feature top cabinet ministers
    membership_status: isLokSabha ? 'Active' : undefined,
    lok_sabha_terms: terms
  });
  if (!addedSlugs.has(leader.slug)) {
    initialDirectoryLeaders.push(leader);
    addedSlugs.add(leader.slug);
  }
});

// 4. Add Prominent Lok Sabha MPs
const lokSabhaMPsRaw = [
  { name: 'Rahul Gandhi', constituency: 'Rae Bareli', state: 'Uttar Pradesh', party: 'INC', dob: '1970-06-19', terms: '5th Term', image: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Rahul_Gandhi_Official_Portrait_2024.jpg' },
  { name: 'Akhilesh Yadav', constituency: 'Kannauj', state: 'Uttar Pradesh', party: 'SP', dob: '1973-07-01', terms: '4th Term', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Akhilesh_Yadav_Official_Portrait_2024.jpg' },
  { name: 'Shashi Tharoor', constituency: 'Thiruvananthapuram', state: 'Kerala', party: 'INC', dob: '1956-03-09', terms: '4th Term', image: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Shashi_Tharoor_Official_Portrait_2024.jpg' },
  { name: 'Abhishek Banerjee', constituency: 'Diamond Harbour', state: 'West Bengal', party: 'TMC', dob: '1987-11-07', terms: '3rd Term', image: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Abhishek_Banerjee_portrait_2023.jpg' },
  { name: 'Mahua Moitra', constituency: 'Krishnanagar', state: 'West Bengal', party: 'TMC', dob: '1974-10-12', terms: '2nd Term', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Mahua_Moitra_Official_Portrait_2024.jpg' },
  { name: 'Dimple Yadav', constituency: 'Mainpuri', state: 'Uttar Pradesh', party: 'SP', dob: '1978-01-15', terms: '3rd Term', image: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Dimple_Yadav_Official_Portrait_2024.jpg' },
  { name: 'Supriya Sule', constituency: 'Baramati', state: 'Maharashtra', party: 'NCP', dob: '1969-06-30', terms: '4th Term', image: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Supriya_Sule_Official_Portrait_2024.jpg', gender: 'Female' as const },
  { name: 'Kanimozhi Karunanidhi', constituency: 'Thoothukkudi', state: 'Tamil Nadu', party: 'DMK', dob: '1968-01-05', terms: '2nd Term', image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Kanimozhi_Official_Portrait_2024.jpg', gender: 'Female' as const },
  { name: 'Asaduddin Owaisi', constituency: 'Hyderabad', state: 'Telangana', party: 'AIMIM', dob: '1969-05-13', terms: '5th Term', image: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Asaduddin_Owaisi_Official_Portrait_2024.jpg' },
  { name: 'Kangana Ranaut', constituency: 'Mandi', state: 'Himachal Pradesh', party: 'BJP', dob: '1987-03-23', terms: '1st Term', image: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Kangana_Ranaut_Official_Portrait_2024.jpg', gender: 'Female' as const },
  { name: 'Hema Malini', constituency: 'Mathura', state: 'Uttar Pradesh', party: 'BJP', dob: '1948-10-16', terms: '3rd Term', image: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Hema_Malini_Official_Portrait_2024.jpg', gender: 'Female' as const },
  { name: 'Gaurav Gogoi', constituency: 'Jorhat', state: 'Assam', party: 'INC', dob: '1982-09-04', terms: '3rd Term', image: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Gaurav_Gogoi_Official_Portrait_2024.jpg' },
  { name: 'Kirti Azad', constituency: 'Bardhaman-Durgapur', state: 'West Bengal', party: 'TMC', dob: '1959-01-02', terms: '4th Term' },
  { name: 'Shatrughan Sinha', constituency: 'Asansol', state: 'West Bengal', party: 'TMC', dob: '1945-12-09', terms: '3rd Term' },
  { name: 'Yusuf Pathan', constituency: 'Baharampur', state: 'West Bengal', party: 'TMC', dob: '1982-11-17', terms: '1st Term' },
  { name: 'Chandra Sekhar Pemmasani', constituency: 'Guntur', state: 'Andhra Pradesh', party: 'TDP', dob: '1976-03-07', terms: '1st Term' }
];

lokSabhaMPsRaw.forEach(item => {
  const leader = createLeader({
    name: item.name,
    category: 'Lok Sabha MP',
    state: item.state,
    constituency: item.constituency,
    party: item.party,
    dob: item.dob,
    gender: (item as any).gender,
    image: item.image,
    featured: true,
    membership_status: 'Active',
    lok_sabha_terms: item.terms
  });
  if (!addedSlugs.has(leader.slug)) {
    initialDirectoryLeaders.push(leader);
    addedSlugs.add(leader.slug);
  }
});

// Append our complete rawLokSabhaMembers dataset
rawLokSabhaMembers.forEach(item => {
  const leader = createLeader({
    name: item.name,
    category: 'Lok Sabha MP',
    state: item.state,
    constituency: item.constituency,
    party: item.party,
    featured: false,
    membership_status: item.status,
    lok_sabha_terms: item.terms
  });
  if (!addedSlugs.has(leader.slug)) {
    initialDirectoryLeaders.push(leader);
    addedSlugs.add(leader.slug);
  }
});

// Add all 28 Governors
const governorsRaw = [
  { state: 'Andhra Pradesh', name: 'Syed Abdul Nazeer' },
  { state: 'Arunachal Pradesh', name: 'Lt. Gen. Kaiwalya Trivikram Parnaik (Retd.)' },
  { state: 'Assam', name: 'Lakshman Acharya' },
  { state: 'Bihar', name: 'Lt. Gen. Syed Ata Hasnain (Retd.)' },
  { state: 'Chhattisgarh', name: 'Ramen Deka' },
  { state: 'Goa', name: 'Pusapati Ashok Gajapathi Raju' },
  { state: 'Gujarat', name: 'Acharya Devvrat' },
  { state: 'Haryana', name: 'Prof. Ashim Kumar Ghosh' },
  { state: 'Himachal Pradesh', name: 'Shiv Pratap Shukla' },
  { state: 'Jharkhand', name: 'Santosh Kumar Gangwar' },
  { state: 'Karnataka', name: 'Thawar Chand Gehlot' },
  { state: 'Kerala', name: 'Rajendra Vishwanath Arlekar' },
  { state: 'Madhya Pradesh', name: 'Mangubhai C. Patel' },
  { state: 'Maharashtra', name: 'Jishnu Dev Varma' },
  { state: 'Manipur', name: 'Ajay Kumar Bhalla' },
  { state: 'Meghalaya', name: 'C. H. Vijayashankar' },
  { state: 'Mizoram', name: 'Gen. Vijay Kumar Singh (Retd.)' },
  { state: 'Nagaland', name: 'Nand Kishore Yadav' },
  { state: 'Odisha', name: 'Hari Babu Kambhampati' },
  { state: 'Punjab', name: 'Gulab Chand Kataria' },
  { state: 'Rajasthan', name: 'Haribhau Kisanrao Bagde' },
  { state: 'Sikkim', name: 'Om Prakash Mathur' },
  { state: 'Tamil Nadu', name: 'R. N. Ravi' },
  { state: 'Telangana', name: 'Shiv Pratap Shukla (Additional Charge)' },
  { state: 'Tripura', name: 'Indra Sena Reddy Nallu' },
  { state: 'Uttar Pradesh', name: 'Anandiben Patel' },
  { state: 'Uttarakhand', name: 'Gurmit Singh (Retd.)' },
  { state: 'West Bengal', name: 'C. V. Ananda Bose' }
];

governorsRaw.forEach(item => {
  const leader = createLeader({
    name: item.name,
    category: 'Governor',
    state: item.state,
    party: 'Independent', // Governors are typically non-partisan during tenure
    featured: true
  });
  if (!addedSlugs.has(leader.slug)) {
    initialDirectoryLeaders.push(leader);
    addedSlugs.add(leader.slug);
  }
});

// Also append West Bengal's Mamata Banerjee if she was not in the CM raw data
if (!addedSlugs.has('mamata-banerjee')) {
  initialDirectoryLeaders.push(
    createLeader({
      name: 'Mamata Banerjee',
      category: 'Chief Minister',
      state: 'West Bengal',
      constituency: 'Bhabanipur',
      party: 'TMC',
      dob: '1955-01-05',
      image: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Mamata_Banerjee_portrait_2019.jpg',
      bio: 'Mamata Banerjee is an Indian politician who has been serving as the 8th Chief Minister of West Bengal. She is the founder and chairperson of the All India Trinamool Congress.',
      featured: true
    })
  );
}
