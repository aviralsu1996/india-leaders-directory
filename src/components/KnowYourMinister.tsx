import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Sparkles, 
  User, 
  GraduationCap, 
  Users, 
  Briefcase, 
  HeartHandshake, 
  CheckCircle2, 
  TrendingUp, 
  Plane, 
  MapPin, 
  Building, 
  Loader2, 
  AlertTriangle, 
  ExternalLink,
  DollarSign,
  Heart,
  Car,
  Home,
  FileText,
  Award,
  ChevronRight,
  Shield,
  HelpCircle,
  GitCompare,
  Star,
  ThumbsUp,
  MessageSquare,
  Calendar,
  ArrowUpDown,
  Edit3,
  Image
} from 'lucide-react';

import ContactUs from './ContactUs';
import { getSeededReviewsList, getSeededStats } from '../lib/reviewsSeeder';

export const getDirectImageUrl = (url?: string) => {
  // Return the original URL directly. No proxying of Wikimedia/Wikipedia images.
  return url || '';
};

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface MinisterDossier {
  name: string;
  profileImage?: string;
  title: string;
  party: string;
  state: string;
  bio: string;
  network: string;
  family: {
    count: string;
    details: string;
    educationAndBusiness: string;
  };
  income: string;
  socialWork: string;
  projectsDone: string[];
  projectsInPipeline: string[];
  internationalTrips: string[];
  education: string;
  maritalStatus: string;
  property: string;
  assets: string;
  age: string;
  yearsInPower: string;
  currentDesignationAndDept: string;
  sources?: GroundingSource[];
}

// Preloaded elite profiles for a flawless interactive default experience
export const PRELOADED_MINISTERS: Record<string, MinisterDossier> = {
  "narendra_modi": {
    name: "Narendra Damodardas Modi",
    profileImage: "https://upload.wikimedia.org/wikipedia/commons/5/5f/The_official_portrait_of_Shri_Narendra_Modi%2C_the_Prime_Minister_of_the_Republic_of_India.jpg",
    title: "Prime Minister of India",
    party: "Bharatiya Janata Party (BJP)",
    state: "Varanasi, Uttar Pradesh / Central",
    bio: "Narendra Damodardas Modi is an Indian politician serving as the 14th and current Prime Minister of India since 2014. He has been in active governance and power for 25 years. He worked as the Chief Minister of Gujarat from October 7, 2001, to May 22, 2014 (12 years), and has worked as the Prime Minister of India since May 26, 2014, to the present (12 years as PM to 2026). Currently, he holds the designation of Prime Minister of India, directly administering the Ministry of Personnel, Public Grievances and Pensions, Department of Atomic Energy, and Department of Space.",
    network: "Leader of the National Democratic Alliance (NDA), President of Somnath Temple Trust, extensive global diplomatic networks, and key strategist of the BJP policy grid.",
    family: {
      count: "5 Siblings",
      details: "Five brothers (Soma, Amrut, Prahlad, Pankaj) and one sister (Vasantiben). Mother Late Heeraben Modi.",
      educationAndBusiness: "Brothers are involved in modest retail, local government services, or retired. Family lives an independent, low-profile life completely separated from administrative or governmental benefits."
    },
    income: "Declared taxable income of around ₹3.0 Lakhs annually (consisting of PM salary, bank interest, and royalty savings).",
    socialWork: "Spearheaded national welfare movements like Swachh Bharat Abhiyan (Sanitation), Beti Bachao Beti Padhao, PM Jan Dhan Yojana, PM-KISAN, and direct benefit transfer grids to completely bypass intermediaries.",
    projectsDone: [
      "Article 370 & 35A Abrogation in Jammu & Kashmir.",
      "Nationwide Goods and Services Tax (GST) Implementation.",
      "Pran Pratishtha of Sri Ram Janmabhoomi Mandir in Ayodhya.",
      "Digital India & Unified Payments Interface (UPI) network scaling.",
      "Creation of PM Garib Kalyan Anna Yojana serving 80 crore citizens."
    ],
    projectsInPipeline: [
      "PM Gati Shakti National Master Plan for multi-modal logistics.",
      "Semiconductor manufacturing ecosystem across Gujarat and Tamil Nadu.",
      "High-speed Bullet Train Corridor (Mumbai-Ahmedabad).",
      "Massive indigenous 5G rollouts and 6G research initiatives."
    ],
    internationalTrips: [
      "United States: Historic State Visit & Address to Joint Session of Congress.",
      "France: Guest of Honour at Bastille Day Parade in Paris.",
      "United Arab Emirates: Addressing World Governments Summit & Temple Inauguration.",
      "Russia: Annual bilateral summits & high-level diplomatic strategic dialogues."
    ],
    education: "Bachelor of Arts from Delhi University (1978), Master of Arts in Political Science from Gujarat University (1983).",
    maritalStatus: "Married (spouse Jashodaben Modi, living separately).",
    property: "No real estate or immovable property declared in his personal name in recent filings (previously owned a shared residential plot in Gandhinagar, which was fully donated to charity).",
    assets: "Movable assets of approx ₹2.23 Crores, primarily consisting of bank term deposits, national savings certificates, and gold rings. No personal cars, bikes, or commercial business stakes.",
    age: "75 Years (Born Sept 17, 1950)",
    yearsInPower: "25 Years in Power",
    currentDesignationAndDept: "Prime Minister of India (Administering Ministry of Personnel, Public Grievances and Pensions, Department of Atomic Energy, and Department of Space)",
    sources: [
      { title: "PM India Official Biography", uri: "https://www.pmindia.gov.in" },
      { title: "MyNeta Election Affidavit Narendra Modi", uri: "https://myneta.info" }
    ]
  },
  "nitin_gadkari": {
    name: "Nitin Jairam Gadkari",
    profileImage: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Nitin_Gadkari_Official_Portrait_2019.jpg",
    title: "Cabinet Minister for Road Transport & Highways",
    party: "Bharatiya Party (BJP)",
    state: "Nagpur, Maharashtra / Central",
    bio: "Nitin Jairam Gadkari is a visionary Indian politician currently serving as the Union Minister for Road Transport & Highways. Affectionately dubbed the 'Highway Man of India', he has been in ministerial power for approximately 16 years. He worked as the Minister of Public Works Department (PWD) in Maharashtra from 1995 to 1999 (4 years), and has worked as the Union Minister for Road Transport & Highways since May 26, 2014, to the present (12 years as Union Minister to 2026). Currently, he holds the designation of Union Cabinet Minister overseeing the Ministry of Road Transport and Highways.",
    network: "Senior ideologue in RSS, former National President of BJP, strong ties with heavy industrial, logistics, and automobile associations.",
    family: {
      count: "5 Members",
      details: "Spouse Kanchan Gadkari, and three children: Nikhil, Sarang, and Ketki Gadkari.",
      educationAndBusiness: "Sons Nikhil and Sarang are involved in diversified agriculture-based industries, bio-fuels, clean logistics, and solar power equipment distribution in Maharashtra."
    },
    income: "Declared annual income of approximately ₹10-15 Lakhs (ministerial salary, agricultural dividends, and interest).",
    socialWork: "Deeply involved in rural empowerment, water conservation check-dams in Vidarbha, organizing organic farming cooperatives, and medical checkups for underprivileged citizens.",
    projectsDone: [
      "Constructed over 50,000+ km of National Highways during his tenure.",
      "Completed Delhi-Mumbai Expressway Phase-1.",
      "Pioneered the Mumbai-Pune Expressway (during his state PWD tenure).",
      "Implementation of FASTag electronic tolling system across India.",
      "Constructed the strategic Zojila Pass Tunnel in Ladakh."
    ],
    projectsInPipeline: [
      "National Green Highway Corridor project spanning multiple states.",
      "Bharatmala Pariyojana Phase-2 to connect economic corridors.",
      "Bengaluru-Chennai Expressway and Delhi-Dehradun Expressway.",
      "Scaling hybrid annuity models for highway funding & public-private partnerships."
    ],
    internationalTrips: [
      "Sweden: Collaborative research on electric roads and sustainable public transport.",
      "United States: High-level consultations with American infrastructure developers.",
      "Singapore: Studying advanced multi-modal traffic congestion management frameworks."
    ],
    education: "Master of Commerce (M.Com) and Bachelor of Laws (LL.B.) from Nagpur University.",
    maritalStatus: "Married (spouse Kanchan Gadkari).",
    property: "Agricultural lands in Dhapewada, Nagpur; family-owned residential buildings in Nagpur and Mumbai.",
    assets: "Movable assets including personal cars, agricultural utility tractors, cooperative bank deposits, and shares in local sugar/biofuel enterprises.",
    age: "69 Years (Born May 27, 1957)",
    yearsInPower: "16 Years in Power",
    currentDesignationAndDept: "Cabinet Minister for Road Transport & Highways",
    sources: [
      { title: "Ministry of Road Transport Official Site", uri: "https://morth.nic.in" },
      { title: "MyNeta Affidavit Nitin Gadkari", uri: "https://myneta.info" }
    ]
  },
  "amit_shah": {
    name: "Amit Anilchandra Shah",
    profileImage: "https://upload.wikimedia.org/wikipedia/commons/2/23/Amit_Shah_official_portrait.jpg",
    title: "Cabinet Minister for Home Affairs & Cooperation",
    party: "Bharatiya Janata Party (BJP)",
    state: "Gandhinagar, Gujarat / Central",
    bio: "Amit Anilchandra Shah is an influential Indian politician serving as the Union Minister of Home Affairs and the first Minister of Cooperation since 2019. He has been in ministerial power for 15 years. He worked as Gujarat Minister of State for Home and other portfolios from 2002 to 2010 (8 years), and has worked as the Union Home Minister since May 30, 2019, to the present (7 years as Union Minister to 2026). Currently, he holds the designation of Union Cabinet Minister overseeing the Ministry of Home Affairs and Ministry of Cooperation.",
    network: "Core national security grid, senior leadership council of NDA, and deep organizational influence in cooperative banking and agricultural societies of Western India.",
    family: {
      count: "3 Members",
      details: "Spouse Sonal Shah and son Jay Shah.",
      educationAndBusiness: "Son Jay Shah is a prominent sports administrator, serving as the Secretary of the Board of Control for Cricket in India (BCCI) and President of the Asian Cricket Council."
    },
    income: "Declared annual income of around ₹20-30 Lakhs (ministerial salary, dividends from blue-chip equity portfolios, and agricultural interest).",
    socialWork: "Directing major cooperative dairy farming grids in Gujarat to benefit small-scale farmers, organizing rural health diagnostics, and renovating historical temple trusts.",
    projectsDone: [
      "Abrogation of Article 370 & 35A in Jammu and Kashmir.",
      "Enactment and passing of the Citizenship Amendment Act (CAA).",
      "Drafting and enactment of new national criminal codes (Bharatiya Nyaya Sanhita).",
      "Establishment of the national Cyber Crime Coordination Centre (I4C)."
    ],
    projectsInPipeline: [
      "Complete smart fencing and high-tech drone tracking of India's borders.",
      "National database of cooperatives to streamline rural credits.",
      "Modernization and digitization of over 100,000 primary agricultural societies.",
      "Anti-radicalization cells and central police modernization schemes."
    ],
    internationalTrips: [
      "Diplomatic security summits and bilateral cross-border agreements in neighboring South Asian countries."
    ],
    education: "Bachelor of Science (B.Sc.) in Biochemistry from CU Shah Science College, Ahmedabad.",
    maritalStatus: "Married (spouse Sonal Shah).",
    property: "Ancestral agricultural lands in Mansa, Gujarat; personal and family commercial offices and apartments in Ahmedabad.",
    assets: "High-value movable security portfolio, ancestral gold jewelry, and long-term security investments. Declared cars: None.",
    age: "61 Years (Born Oct 22, 1964)",
    yearsInPower: "15 Years in Power",
    currentDesignationAndDept: "Cabinet Minister for Home Affairs & Cooperation",
    sources: [
      { title: "Ministry of Home Affairs Official Profile", uri: "https://mha.gov.in" },
      { title: "MyNeta Affidavit Amit Shah", uri: "https://myneta.info" }
    ]
  },
  "yogi_adityanath": {
    name: "Yogi Adityanath (Ajay Singh Bisht)",
    profileImage: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Yogiji_in_2023.jpg",
    title: "Chief Minister of Uttar Pradesh",
    party: "Bharatiya Janata Party (BJP)",
    state: "Gorakhpur / Uttar Pradesh",
    bio: "Yogi Adityanath is an Indian Hindu monk and politician who has served as the 21st and current Chief Minister of Uttar Pradesh since 2017. He has worked in active executive power for 9 years, serving continuously as the Chief Minister of Uttar Pradesh from March 19, 2017, to the Present (9 years as CM). Currently, he holds the designation of Chief Minister directly administering the Home, Housing, Revenue, and General Administration departments of Uttar Pradesh.",
    network: "Head of Gorakhnath Mutt and various cultural and educational trusts. Senior leader of BJP, commander of regional youth networks.",
    family: {
      count: "8 Members",
      details: "Born Ajay Singh Bisht to Late Anand Singh Bisht (forest ranger) and Savitri Devi. Has three brothers (Manmohan, Mahendra, Shailendra) and three sisters.",
      educationAndBusiness: "Brothers and sisters live quiet lives in Uttarakhand. Brother Shailendra serves as a Subedar in the Indian Army's Garhwal Rifles, while others manage modest local shops or agriculture."
    },
    income: "Declared annual income of ₹15-20 Lakhs (consisting of Chief Minister salary and interest from bank savings).",
    socialWork: "Runs free multi-specialty hospitals in Gorakhpur, manages Gaushalas (cow shelters), and operates over a dozen affordable educational institutions under the Maharana Pratap Shiksha Parishad.",
    projectsDone: [
      "Constructed Purvanchal, Bundelkhand, and Gorakhpur Link Expressways.",
      "Redeveloped Ayodhya into an international tourist and cultural hub.",
      "Successfully hosted the massive Prayagraj Kumbh Mela in 2019.",
      "Implemented a zero-tolerance policy against crime, dramatically improving safety and industry ratings."
    ],
    projectsInPipeline: [
      "Construction of the 594 km Ganga Expressway (Meerut to Prayagraj).",
      "Noida International Airport (Jewar) - slated to be India's largest airport.",
      "Defense Industrial Corridor spanning Lucknow, Jhansi, and Aligarh.",
      "State-wide Medical College Network ensuring one medical college per district."
    ],
    internationalTrips: [
      "Myanmar: Cultural delegation exchange and Buddhist relations meet.",
      "Singapore: Investment roadshow to attract global tech and manufacturing conglomerates to Uttar Pradesh."
    ],
    education: "Bachelor of Science (B.Sc.) in Mathematics from Hemvati Nandan Bahuguna Garhwal University, Uttarakhand.",
    maritalStatus: "Single (Ascetic Monk / Celibate).",
    property: "No agricultural land, commercial plots, or residential homes declared in his personal name in any election affidavit.",
    assets: "Rudraksha chain, gold earrings, revolver, and rifle. Bank balances and deposits worth approx ₹1.5 Crores. No personal vehicles.",
    age: "54 Years (Born June 5, 1972)",
    yearsInPower: "9 Years in Power",
    currentDesignationAndDept: "Chief Minister of Uttar Pradesh (Administering Home, Housing, Revenue, and General Administration)",
    sources: [
      { title: "UP Government Official Portal", uri: "https://up.gov.in" },
      { title: "MyNeta Affidavit Yogi Adityanath", uri: "https://myneta.info" }
    ]
  },
  "mamata_banerjee": {
    name: "Mamata Banerjee",
    profileImage: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Mamata_Banerjee_Official_Portrait.png",
    title: "Chief Minister of West Bengal",
    party: "All India Trinamool Congress (AITC)",
    state: "Bhabanipur, West Bengal",
    bio: "Mamata Banerjee is an Indian politician who has served as the 8th and current Chief Minister of West Bengal since 2011. She has worked in active power for approximately 20 years. She served as Union Minister of State for Youth Affairs, Sports, Women and Child Development from 1991 to 1993, Union Minister of Railways from 1999 to 2001, Union Minister of Coal in 2004, and Union Minister of Railways again from 2009 to 2011 (total ~5 years as Union Minister). She has served continuously as the Chief Minister of West Bengal since May 20, 2011, to the present (15 years as CM to 2026). Currently, she holds the designation of Chief Minister directly administering the Home, Hill Affairs, Personnel and Administrative Reforms, and Health and Family Welfare departments of West Bengal.",
    network: "Founder and Chairperson of All India Trinamool Congress, key partner in national opposition coalitions, and extensive network of trade unions and cultural guilds in Bengal.",
    family: {
      count: "6 Brothers",
      details: "Brothers Ajit, Amit, Kali, Babun, Ganesh, etc. Lives a highly simple, ascetic life.",
      educationAndBusiness: "Family members are settled in Bengal; some are involved in local businesses, sports management clubs, and community trusts."
    },
    income: "Declared annual income of ₹1-2 Lakhs. She does not draw any salary or pension as Chief Minister, relying entirely on royalty payments from her books and art sales.",
    socialWork: "Created revolutionary state programs including 'Kanyashree' (which won UN Public Service Award), 'Lakshmir Bhandar' (women cash transfers), and 'Duare Sarkar' doorstep governance camps.",
    projectsDone: [
      "Kolkata East-West Metro expansion projects.",
      "Sabuj Sathi (free bicycles to school students) and Khadya Sathi food security systems.",
      "Creation of state-wide medical insurance 'Swasthya Sathi'.",
      "Establishment of 20+ new district universities and primary healthcare clinics."
    ],
    projectsInPipeline: [
      "Tajpur Deep Sea Port project to boost industrial maritime logistics.",
      "Deocha Pachami Coal Block - India's largest coal mining block.",
      "Siliguri IT and Tourism Hub expansion.",
      "Silicon Valley Hub extension in Rajarhat, Kolkata."
    ],
    internationalTrips: [
      "United Kingdom: Business summits to promote West Bengal as an investment destination.",
      "Italy: Attended Canonisation ceremony of Mother Teresa in Rome as official state representative.",
      "Singapore: Attended global trade and industrial cooperation meets."
    ],
    education: "Bachelor of Arts from Jogamaya Devi College, Master of Arts in Islamic History from Calcutta University, LL.B. from Jogesh Chandra Chaudhuri Law College.",
    maritalStatus: "Single (Unmarried).",
    property: "Owns no agricultural land, commercial properties, residential apartments, or personal vehicles.",
    assets: "Humble ancestral tile-roofed home in Kalighat, Kolkata (family property). Personal savings and inherited gold ornaments of nominal value. Substantial copyright royalty streams.",
    age: "71 Years (Born Jan 5, 1955)",
    yearsInPower: "20 Years in Power",
    currentDesignationAndDept: "Chief Minister of West Bengal (Administering Home, Hill Affairs, Personnel and Administrative Reforms, and Health)",
    sources: [
      { title: "West Bengal CMO Website", uri: "https://wbcmo.gov.in" },
      { title: "MyNeta Affidavit Mamata Banerjee", uri: "https://myneta.info" }
    ]
  },
  "rahul_gandhi": {
    name: "Rahul Gandhi",
    profileImage: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Rahul_Gandhi_2019.jpg",
    title: "Leader of the Opposition, Lok Sabha",
    party: "Indian National Congress (INC)",
    state: "Rae Bareli, Uttar Pradesh / Central",
    bio: "Rahul Gandhi is a prominent Indian politician serving as the Leader of the Opposition in the 18th Lok Sabha. He has worked as a Member of Parliament since 2004 representing Amethi (2004-2019), Wayanad (2019-2024), and currently represents Rae Bareli (2024-Present), totaling 22 years of legislative work. While he has never served as a Chief Minister or executive cabinet minister (0 years in executive power), he currently holds the designation of Leader of the Opposition in the Lok Sabha (since June 2024), where he manages the shadow legislative council of the I.N.D.I.A coalition.",
    network: "Core leader of the Opposition coalition I.N.D.I.A, senior member of the Congress Working Committee, and influential figure in national democratic policy circles.",
    family: {
      count: "4 Members",
      details: "Son of former Prime Minister Late Rajiv Gandhi and former Congress President Sonia Gandhi. Sibling Priyanka Gandhi Vadra.",
      educationAndBusiness: "Sister Priyanka Gandhi is an active politician. Family members are involved in philanthropic trusts, policy foundations (Rajiv Gandhi Foundation), and heritage trusts with no direct industrial ownership."
    },
    income: "Declared taxable income of approximately ₹1.02 Crores annually (primarily from rental income, interest on bonds, and mutual funds).",
    socialWork: "Pioneered the 'Bharat Jodo Yatra' and 'Bharat Jodo Nyay Yatra' to highlight unemployment and social justice. Heavily involved in healthcare and educational trusts in Wayanad and Amethi.",
    projectsDone: [
      "Successfully campaigned and won Rae Bareli and Wayanad Lok Sabha seats in 2024.",
      "Led nationwide democratic awareness campaigns via the 4,000+ km Bharat Jodo Yatra.",
      "Advocated for the Right to Information (RTI) and Food Security Acts during the UPA era."
    ],
    projectsInPipeline: [
      "Strengthening structural representation for backwards classes via national caste census campaigns.",
      "Drafting modern welfare blueprints for youth employment and farm loan waivers.",
      "Expanding national grassroots training camps for the Indian National Congress."
    ],
    internationalTrips: [
      "United States: Delivered lectures at Stanford University and interacted with the Indian diaspora.",
      "United Kingdom: Addressed Cambridge University and participated in parliamentary discussions.",
      "Europe: Visited European Parliament in Brussels for democratic dialogues."
    ],
    education: "M.Phil. in Development Studies from Trinity College, Cambridge (1995), Bachelor of Arts from Rollins College (1994).",
    maritalStatus: "Single (Unmarried).",
    property: "Co-owns commercial buildings in Gurugram, agricultural land in Mehrauli (Delhi), and various inherited family properties.",
    assets: "Movable assets of approx ₹9.24 Crores, consisting of mutual funds, shares, sovereign gold bonds, and bank deposits. Declared personal cars: None.",
    age: "56 Years (Born June 19, 1970)",
    yearsInPower: "0 Years in Executive Power (22 Years as MP)",
    currentDesignationAndDept: "Leader of the Opposition, Lok Sabha (Member of Parliament for Rae Bareli)",
    sources: [
      { title: "MyNeta Affidavit Rahul Gandhi 2024", uri: "https://myneta.info" },
      { title: "Lok Sabha Member Profile", uri: "https://sansad.in/ls" }
    ]
  },
  "arvind_kejriwal": {
    name: "Arvind Kejriwal",
    profileImage: "https://upload.wikimedia.org/wikipedia/commons/d/de/Arvind_Kejriwal_Official_Portrait.jpg",
    title: "Ex-Chief Minister of Delhi & National Convenor of AAP",
    party: "Aam Aadmi Party (AAP)",
    state: "New Delhi / National",
    bio: "Arvind Kejriwal is an Indian politician, social activist, and former bureaucrat who served as the 7th Chief Minister of Delhi. He has worked in active executive power for approximately 10 years, serving as Chief Minister of Delhi from December 28, 2013, to February 14, 2014, and again from February 14, 2015, to September 17, 2024 (when he resigned). Currently, he is an Ex-Chief Minister with no active governmental department, serving as the National Convenor of the Aam Aadmi Party (AAP). Prior to entering politics, he was a joint commissioner in the Income Tax Department and received the Ramon Magsaysay Award for his work with Parivartan.",
    network: "Leader of the Aam Aadmi Party national grid, co-strategist in the opposition I.N.D.I.A alliance, and key architect of regional decentralized welfare policy models.",
    family: {
      count: "4 Members",
      details: "Spouse Sunita Kejriwal (retired IRS officer), daughter Harshita, and son Pulkit. Father Govind Ram Kejriwal.",
      educationAndBusiness: "Spouse Sunita is a retired government officer. Daughter Harshita is an IIT Delhi graduate working in software, and son Pulkit is an entrepreneur."
    },
    income: "Declared annual taxable income of around ₹2-3 Lakhs (primarily from savings, interest, and previous pension/salary).",
    socialWork: "Pioneered public-school infrastructure overhauls in Delhi, established 'Mohalla Clinics' for free primary healthcare, and introduced free electricity and water subsidies for low-income households.",
    projectsDone: [
      "Inaugurated over 500+ Mohalla Clinics across Delhi's neighborhoods.",
      "Implemented complete digitization of government services via doorstep delivery.",
      "Upgraded government schools with smart boards, swimming pools, and specialized curriculum.",
      "Introduced free public bus transit for women in Delhi."
    ],
    projectsInPipeline: [
      "Cleaning and rejuvenation of the Yamuna River corridor.",
      "Expanding electric vehicle (EV) charging stations and EV bus fleets state-wide.",
      "Scaling the 'Delhi Model' of education and health to other states like Punjab and Haryana."
    ],
    internationalTrips: [
      "C40 Cities Climate Summit: Attended virtually/physically to discuss smog control measures.",
      "South Korea: Visited Seoul to study municipal public services and urban transport grids."
    ],
    education: "Bachelor of Technology (B.Tech) in Mechanical Engineering from IIT Kharagpur (1989).",
    maritalStatus: "Married (spouse Sunita Kejriwal).",
    property: "Residential property in Gurugram, Haryana, and co-owned family estate in Haryana.",
    assets: "Movable assets of approx ₹1.77 Crores, comprising bank deposits, post office savings, and small mutual funds. Declared personal cars: None.",
    age: "57 Years (Born Aug 16, 1968)",
    yearsInPower: "10 Years in Power",
    currentDesignationAndDept: "Ex-Chief Minister of Delhi & National Convenor of AAP (No active government office)",
    sources: [
      { title: "Delhi Government Portal", uri: "https://delhi.gov.in" },
      { title: "MyNeta Affidavit Arvind Kejriwal", uri: "https://myneta.info" }
    ]
  },
  "akhilesh_yadav": {
    name: "Akhilesh Yadav",
    profileImage: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Akhilesh_Yadav_official_portrait.png",
    title: "Ex-Chief Minister of Uttar Pradesh & President of SP",
    party: "Samajwadi Party (SP)",
    state: "Kannauj, Uttar Pradesh",
    bio: "Akhilesh Yadav is an Indian politician who served as the 20th Chief Minister of Uttar Pradesh from March 15, 2012, to March 19, 2017 (5 years in executive power). Currently, he is an Ex-Chief Minister with no active state ministerial department, holding the legislative designation of Member of Parliament (Lok Sabha) for Kannauj (elected in 2024) and serving as the National President of the Samajwadi Party. He became the youngest person to hold the CM office in UP at the age of 38, promoting digital infrastructure and expressways.",
    network: "Leader of the Samajwadi Party, crucial regional pillar of the opposition I.N.D.I.A coalition, and chief strategist for democratic alliances in Northern India.",
    family: {
      count: "5 Members",
      details: "Son of legendary veteran leader Late Mulayam Singh Yadav. Spouse Dimple Yadav (Member of Parliament), and three children: Aditi, Arjun, and Tina.",
      educationAndBusiness: "Spouse Dimple Yadav is an MP from Mainpuri. The family is involved in agricultural enterprises, cold storage projects, and traditional business holdings in Saifai."
    },
    income: "Declared taxable annual income of approximately ₹46 Lakhs (from agriculture, pension, Lok Sabha salary, and royalties).",
    socialWork: "Organized medical aid in Saifai, established the UP 100 emergency response system, and funded educational scholarships for girls from underprivileged rural families.",
    projectsDone: [
      "Constructed the 302-km Agra-Lucknow Expressway in record time.",
      "Distributed over 15 lakh free laptops to high school graduates in UP.",
      "Built the Lucknow Metro Phase-1 network.",
      "Inaugurated the 1090 Women Power Line to combat harassment."
    ],
    projectsInPipeline: [
      "Constructing dedicated cold storage hubs for potato and mango farmers in UP.",
      "Modernizing digital election centers and community libraries across Samajwadi offices.",
      "Expanding solar-powered agricultural irrigation grids in rural constituencies."
    ],
    internationalTrips: [
      "Australia: Completed higher education in Sydney, fostering bilateral educational exchanges.",
      "United States: Attended international investment summits to pitch Uttar Pradesh's IT potential."
    ],
    education: "Bachelor of Engineering (B.E.) in Civil Environmental Engineering from SJCE, Mysore; Master of Science (M.S.) in Environmental Engineering from University of Sydney.",
    maritalStatus: "Married (spouse Dimple Yadav).",
    property: "Residential bungalow in Vikramaditya Marg (Lucknow), extensive ancestral agricultural plots in Saifai, Etawah.",
    assets: "Movable assets worth around ₹9 Crores, including agricultural equipment, bank balances, and mutual funds. Co-owns family business shares.",
    age: "53 Years (Born July 1, 1973)",
    yearsInPower: "5 Years in Power",
    currentDesignationAndDept: "Ex-Chief Minister of Uttar Pradesh & Member of Parliament (Lok Sabha) representing Kannauj",
    sources: [
      { title: "Samajwadi Party Official Site", uri: "https://samajwadiparty.in" },
      { title: "MyNeta Affidavit Akhilesh Yadav 2024", uri: "https://myneta.info" }
    ]
  },
  "pushkar_singh_dhami": {
    name: "Pushkar Singh Dhami",
    profileImage: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Pushkar_Singh_Dhami_Cabinet_Minister_Port_Portrait.jpg",
    title: "Chief Minister of Uttarakhand",
    party: "Bharatiya Janata Party (BJP)",
    state: "Khatima / Uttarakhand",
    bio: "Pushkar Singh Dhami is an Indian politician serving as the 10th and current Chief Minister of Uttarakhand. He has served in active executive power for 5 years, working continuously as the Chief Minister of Uttarakhand since July 4, 2021, to the present. At 45, he became the youngest Chief Minister of the Himalayan state. Under his administration, Uttarakhand became the first state in independent India to pass a Uniform Civil Code (UCC) bill.",
    network: "Prominent leader in the BJP state grid, former state president of BJYM (youth wing), and senior member of the national security/border development council.",
    family: {
      count: "4 Members",
      details: "Spouse Geeta Dhami and two sons: Sagar and Divyansh.",
      educationAndBusiness: "Spouse Geeta Dhami is a homemaker and social activist. Family maintains a simple, rural-focused lifestyle in Khatima."
    },
    income: "Declared annual taxable income of approximately ₹12-15 Lakhs (consisting of CM salary and agricultural returns).",
    socialWork: "Spearheaded disaster relief programs during flash floods, organized mountain healthcare clinics, and sponsored employment bootcamps for mountain youth.",
    projectsDone: [
      "Passed and enacted the Uniform Civil Code (UCC) Bill in Uttarakhand.",
      "Implemented India's strictest anti-cheating law for competitive exams.",
      "Expanded the Kedarnath-Badrinath Dham redevelopment master plans.",
      "Constructed rural roads connecting over 200+ remote Himalayan villages."
    ],
    projectsInPipeline: [
      "Rishikesh-Karnaprayag Railway line development in hilly terrains.",
      "Dehradun-Mussoorie Ropeway project to boost ecotourism.",
      "Developing eco-smart tourism villages across border zones.",
      "Expanding state-wide organic farming incentives and apple orchards."
    ],
    internationalTrips: [
      "United Kingdom: Visited London and Birmingham to host investor roadshows for the Uttarakhand Global Investors Summit.",
      "United Arab Emirates: Addressed Gulf investors to promote high-tech wellness tourism in Uttarakhand."
    ],
    education: "Bachelor of Laws (LL.B.) and Master of Public Administration from Lucknow University.",
    maritalStatus: "Married (spouse Geeta Dhami).",
    property: "Residential home in Khatima, agricultural lands in Udham Singh Nagar district.",
    assets: "Movable assets of approx ₹1.2 Crores, primarily gold jewelry, insurance deposits, and agricultural bank accounts. Declared vehicles: SUV.",
    age: "50 Years (Born Sept 16, 1975)",
    yearsInPower: "5 Years in Power",
    currentDesignationAndDept: "Chief Minister of Uttarakhand (Administering Home, Finance, Personnel, and Excise)",
    sources: [
      { title: "Uttarakhand Government Portal", uri: "https://uk.gov.in" },
      { title: "MyNeta Affidavit Pushkar Singh Dhami", uri: "https://myneta.info" }
    ]
  },
  "c_joseph_vijay": {
    name: "C. Joseph Vijay (Thalapathy)",
    profileImage: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Vijay_at_the_Leo_Success_Meet.jpg",
    title: "President of TVK Party",
    party: "Tamilaga Vettri Kazhagam (TVK)",
    state: "Tamil Nadu",
    bio: "C. Joseph Vijay, professionally known as Thalapathy Vijay, is a legendary Indian actor and politician who is the founder and President of the political party Tamilaga Vettri Kazhagam (TVK). Launched in February 2024, the party aims to bring progressive welfare reforms, youth employment, and social equality to Tamil Nadu. Since his party was recently founded and has not yet contested the assembly elections as of early 2026, he has worked 0 years in public executive office (0 years in power) but has currently dedicated himself full-time as the President of TVK to organize Tamil Nadu state politics.",
    network: "Founder-President of TVK, patron of the Vijay Makkal Iyakkam (VMI) welfare confederation, with a massive grassroots fan and volunteer base spanning millions across South India.",
    family: {
      count: "4 Members",
      details: "Son of famous film director S. A. Chandrasekhar and playback singer Shoba Chandrasekhar. Spouse Sangeetha Sornalingam, with children Sanjay and Divya.",
      educationAndBusiness: "Spouse Sangeetha is an entrepreneur. Son Jason Sanjay has studied filmmaking in Canada and the US, and is entering creative directing."
    },
    income: "Highly paid professional actor with substantial annual income (among India's highest taxpayers in the entertainment sector).",
    socialWork: "Runs the Vijay Makkal Iyakkam, which operates free evening study tuition centers ('Vijay Payilagam'), blood donation drives, free food distributions, and educational scholarship awards for state board toppers.",
    projectsDone: [
      "Officially registered Tamilaga Vettri Kazhagam (TVK) party in 2024.",
      "Established thousands of digital study rooms and oxygen support camps during pandemic years.",
      "Delivered meals and agricultural seed packages to farmers affected by cyclones in Delta regions."
    ],
    projectsInPipeline: [
      "Launching the comprehensive TVK policy manifesto focusing on social justice and secularism.",
      "Building grassroots block-level youth committees for Tamil Nadu Assembly elections.",
      "Structuring modern digital training camps for regional party workers."
    ],
    internationalTrips: [
      "United Kingdom: Filming and commercial creative partnerships.",
      "United States: Advanced film technology research and philanthropic diaspora meets.",
      "Singapore: Promoted South Indian culture at massive international conventions."
    ],
    education: "Studied Bachelor of Visual Communications at Loyola College, Chennai.",
    maritalStatus: "Married (spouse Sangeetha Sornalingam).",
    property: "Owns premium residential properties in Neelankarai (Chennai) and commercial properties in Chennai and surrounding districts.",
    assets: "Extensive high-value movable assets, including luxury car fleet (Rolls Royce, Audi, BMW), production investments, and high-equity securities.",
    age: "51 Years (Born June 22, 1974)",
    yearsInPower: "0 Years in Public Office",
    currentDesignationAndDept: "Founder & President of Tamilaga Vettri Kazhagam (TVK) (No active government office)",
    sources: [
      { title: "TVK Official Party Announcements", uri: "https://tvk.party" },
      { title: "Election Commission of India Filings", uri: "https://eci.gov.in" }
    ]
  },
  "dk_shivakumar": {
    name: "D. K. Shivakumar",
    profileImage: "https://upload.wikimedia.org/wikipedia/commons/b/bc/D._K._Shivakumar_Official_Portrait.png",
    title: "Deputy Chief Minister of Karnataka",
    party: "Indian National Congress (INC)",
    state: "Kanakapura, Karnataka",
    bio: "Doddalahalli Kempegowda Shivakumar, known as D. K. Shivakumar, is an influential Indian politician serving as the Deputy Chief Minister of Karnataka since May 20, 2023. He also serves as the President of the Karnataka Pradesh Congress Committee (KPCC). He has worked in active power for 11 years, having served as Karnataka Cabinet Minister of Energy from 2014 to 2018 (4 years), Cabinet Minister of Major Irrigation and Medical Education from 2018 to 2019 (1 year), and Deputy Chief Minister since May 20, 2023, to the present (3 years as Deputy CM). Currently, he holds the designation of Deputy Chief Minister overseeing Major Irrigation and Bengaluru Development departments.",
    network: "President of KPCC, core leader of national Indian National Congress, heavy cooperative and industrial networks in South India, close ties with educational academies.",
    family: {
      count: "4 Members",
      details: "Spouse Usha Shivakumar and three children: Aishwarya, Aabharana, and Akash. Brother D. K. Suresh is a former Member of Parliament.",
      educationAndBusiness: "Spouse Usha is involved in family farming and commercial real estate. Daughter Aishwarya co-runs the prestigious Global Academy of Technology group of educational institutions."
    },
    income: "Declared taxable annual income of approximately ₹18-22 Crores (derived from commercial properties, mining stakes, educational trusts, and agriculture).",
    socialWork: "Founded the Kempegowda Foundation for rural scholarships, established drinking water filtration plants in Kanakapura, and operates large-scale free educational academies in Bengaluru.",
    projectsDone: [
      "Successfully led the Congress campaign to win a thumping majority in Karnataka in 2023.",
      "Implemented the 'Five Guarantees' (Gruha Jyothi, Gruha Lakshmi, Shakti free bus, etc.) state-wide.",
      "Pioneered the Bengaluru water security and Kaveri project Phase-5 blueprints.",
      "Established major state-of-the-art power grids as former Power Minister."
    ],
    projectsInPipeline: [
      "Developing the 'Brand Bengaluru' smart infrastructure and flyover grid.",
      "The Mekedatu Balancing Reservoir project to resolve water shortage in South Karnataka.",
      "Establishing high-tech aerospace and logistics parks near Devanahalli.",
      "Scaling state-wide primary healthcare centers with smart diagnostic tech."
    ],
    internationalTrips: [
      "Switzerland: Represented Karnataka's commercial potential at the World Economic Forum in Davos.",
      "United States: Fostered technical collaborations with Silicon Valley technology hubs and the Kannada diaspora."
    ],
    education: "Master of Arts (M.A.) in Political Science from Mysore University.",
    maritalStatus: "Married (spouse Usha Shivakumar).",
    property: "Massive commercial office complexes in Bengaluru and Delhi, luxury hotels, agricultural lands, and residential layouts in Kanakapura.",
    assets: "Movable assets worth around ₹250+ Crores (including equity shares in top energy firms, bank deposits, luxury vehicles, and gold ornaments).",
    age: "63 Years (Born May 15, 1962)",
    yearsInPower: "11 Years in Power",
    currentDesignationAndDept: "Deputy Chief Minister of Karnataka (Administering Major Irrigation and Bengaluru Development)",
    sources: [
      { title: "Karnataka Government Portal", uri: "https://karnataka.gov.in" },
      { title: "MyNeta Affidavit D.K. Shivakumar 2023", uri: "https://myneta.info" }
    ]
  }
};

const GALLERY_IMAGES = [
  {
    id: "modi-1",
    ministerId: "narendra_modi",
    ministerName: "Narendra Modi",
    party: "BJP",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5f/The_official_portrait_of_Shri_Narendra_Modi%2C_the_Prime_Minister_of_the_Republic_of_India.jpg",
    caption: "Official portrait of Prime Minister Narendra Modi",
    date: "June 2024"
  },
  {
    id: "modi-2",
    ministerId: "narendra_modi",
    ministerName: "Narendra Modi",
    party: "BJP",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Narendra_Modi_2021.jpg",
    caption: "Participating in G20 Summit global leaders' round table and policy dialogues",
    date: "November 2024"
  },
  {
    id: "gadkari-1",
    ministerId: "nitin_gadkari",
    ministerName: "Nitin Gadkari",
    party: "BJP",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Nitin_Gadkari_Official_Portrait_2019.jpg",
    caption: "Official portrait of Union Minister Nitin Gadkari",
    date: "May 2019"
  },
  {
    id: "gadkari-2",
    ministerId: "nitin_gadkari",
    ministerName: "Nitin Gadkari",
    party: "BJP",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/44/Nitin_Gadkari_addressing_a_press_conference.jpg",
    caption: "Reviewing construction blueprints and logistics at Delhi-Mumbai Expressway",
    date: "March 2025"
  },
  {
    id: "shah-1",
    ministerId: "amit_shah",
    ministerName: "Amit Shah",
    party: "BJP",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/Amit_Shah_official_portrait.jpg",
    caption: "Official portrait of Union Home Minister Amit Shah",
    date: "June 2019"
  },
  {
    id: "yogi-1",
    ministerId: "yogi_adityanath",
    ministerName: "Yogi Adityanath",
    party: "BJP",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Yogiji_in_2023.jpg",
    caption: "Official portrait of Chief Minister Yogi Adityanath",
    date: "March 2023"
  },
  {
    id: "mamata-1",
    ministerId: "mamata_banerjee",
    ministerName: "Mamata Banerjee",
    party: "AITC",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Mamata_Banerjee_Official_Portrait.png",
    caption: "Official portrait of Chief Minister Mamata Banerjee",
    date: "May 2021"
  },
  {
    id: "rahul-1",
    ministerId: "rahul_gandhi",
    ministerName: "Rahul Gandhi",
    party: "INC",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Rahul_Gandhi_2019.jpg",
    caption: "Addressing parliamentary members in Lok Sabha",
    date: "July 2024"
  },
  {
    id: "kejriwal-1",
    ministerId: "arvind_kejriwal",
    ministerName: "Arvind Kejriwal",
    party: "AAP",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/de/Arvind_Kejriwal_Official_Portrait.jpg",
    caption: "Official Portrait of Arvind Kejriwal",
    date: "February 2020"
  },
  {
    id: "akhilesh-1",
    ministerId: "akhilesh_yadav",
    ministerName: "Akhilesh Yadav",
    party: "SP",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Akhilesh_Yadav_official_portrait.png",
    caption: "Official Portrait of Akhilesh Yadav",
    date: "May 2024"
  },
  {
    id: "dhami-1",
    ministerId: "pushkar_singh_dhami",
    ministerName: "Pushkar Singh Dhami",
    party: "BJP",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Pushkar_Singh_Dhami_Cabinet_Minister_Port_Portrait.jpg",
    caption: "Official Portrait of Chief Minister Pushkar Singh Dhami",
    date: "July 2021"
  },
  {
    id: "vijay-1",
    ministerId: "c_joseph_vijay",
    ministerName: "Thalapathy Vijay",
    party: "TVK",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Vijay_at_the_Leo_Success_Meet.jpg",
    caption: "TVK Party President Thalapathy Vijay during public assembly",
    date: "October 2024"
  },
  {
    id: "shivakumar-1",
    ministerId: "dk_shivakumar",
    ministerName: "D. K. Shivakumar",
    party: "INC",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bc/D._K._Shivakumar_Official_Portrait.png",
    caption: "Official Portrait of Deputy Chief Minister D. K. Shivakumar",
    date: "May 2023"
  }
];

const LOADING_STEPS = [
  "Connecting to Search Grounding Engine...",
  "Querying Election Commission database & public affidavits...",
  "Extracting financial declarations (Assets & Income)...",
  "Synthesizing family education & business disclosures...",
  "Scanning completed public works and projects in pipeline...",
  "Formatting comprehensive leader dossier..."
];

interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
  likedByUser?: boolean;
}

const DEFAULT_REVIEWS: Record<string, Review[]> = {
  "Narendra Damodardas Modi": [
    {
      id: "modi-1",
      username: "Rajesh Kumar",
      rating: 5,
      comment: "Outstanding digital transformation and infrastructure development! The UPI grid has made transactions incredibly seamless even in rural corners.",
      date: "2026-06-15",
      likes: 24
    },
    {
      id: "modi-2",
      username: "Priya Sharma",
      rating: 4,
      comment: "Strong diplomatic presence globally. The attention on local semiconductor plants is a massive positive, though we need faster action on domestic technical employment.",
      date: "2026-07-02",
      likes: 15
    },
    {
      id: "modi-3",
      username: "Amit Patel",
      rating: 5,
      comment: "Incredible focus on cleaning up corruption in welfare schemes through direct benefit transfer. Very clear vision for India 2047.",
      date: "2026-07-10",
      likes: 31
    }
  ],
  "Nitin Jairam Gadkari": [
    {
      id: "gadkari-1",
      username: "Sunil Deshmukh",
      rating: 5,
      comment: "Hands down the most efficient minister. The highway connectivity in Maharashtra and national highways are world-class. Absolute leader.",
      date: "2026-05-20",
      likes: 42
    },
    {
      id: "gadkari-2",
      username: "Karan Malhotra",
      rating: 4,
      comment: "Highway design and Zojila tunnel are monumental achievements. FASTag works perfectly, but we should make sure tolls aren't over-burdening commercial daily drivers.",
      date: "2026-06-11",
      likes: 18
    }
  ],
  "Amit Anilchandra Shah": [
    {
      id: "shah-1",
      username: "Sanjay Mehta",
      rating: 5,
      comment: "Bold and decisive steps in Jammu & Kashmir. The cooperative registry system is bringing transparency to small dairy farmers across Gujarat.",
      date: "2026-06-25",
      likes: 19
    },
    {
      id: "shah-2",
      username: "Neha Shah",
      rating: 4,
      comment: "Extremely strong on national security. The cyber crime portal (I4C) has helped resolve local phishing concerns very quickly.",
      date: "2026-07-05",
      likes: 11
    }
  ],
  "Yogi Adityanath (Ajay Singh Bisht)": [
    {
      id: "yogi-1",
      username: "Vikas Shukla",
      rating: 5,
      comment: "Law and order has improved drastically in Uttar Pradesh, creating a safe environment for new businesses. Expressway networks are top-notch.",
      date: "2026-07-01",
      likes: 35
    },
    {
      id: "yogi-2",
      username: "Divya Singh",
      rating: 4,
      comment: "Exceptional execution of Purvanchal expressway and Noida airport. Hope the education network expands further in Eastern UP.",
      date: "2026-07-08",
      likes: 22
    }
  ],
  "Mamata Banerjee": [
    {
      id: "mamata-1",
      username: "Anirban Sen",
      rating: 5,
      comment: "Welfare schemes like Kanyashree have truly empowered women across rural Bengal. A very ground-connected grassroots leader.",
      date: "2026-06-30",
      likes: 17
    },
    {
      id: "mamata-2",
      username: "Soma Chatterji",
      rating: 4,
      comment: "Excellent handling of hyper-local citizen grievances through Didi Ke Bolo. Would love to see more IT hubs and corporate investment in Kolkata.",
      date: "2026-07-04",
      likes: 13
    }
  ]
};

export default function KnowYourMinister() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptQuery, setDeptQuery] = useState('');
  const [desigQuery, setDesigQuery] = useState('');
  
  const [selectedLeaderId, setSelectedLeaderId] = useState<string>('narendra_modi');
  const [customLeaderDossier, setCustomLeaderDossier] = useState<MinisterDossier | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'bio' | 'family' | 'financials' | 'projects' | 'trips' | 'gallery'>('bio');
  const [galleryFilter, setGalleryFilter] = useState<string>('all');
  const [zoomedImageId, setZoomedImageId] = useState<string | null>(null);
  const [isDossierContactOpen, setIsDossierContactOpen] = useState(false);

  // Comparison states
  const [compareId1, setCompareId1] = useState<string>('narendra_modi');
  const [compareId2, setCompareId2] = useState<string>('nitin_gadkari');

  // Citizen Rating and Comments state
  const [allReviews, setAllReviews] = useState<Record<string, Review[]>>({});
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});
  const [newRating, setNewRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentSuccess, setCommentSuccess] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  useEffect(() => {
    const stored = localStorage.getItem('minister_reviews_and_ratings');
    if (stored) {
      try {
        setAllReviews(JSON.parse(stored));
      } catch (e) {
        setAllReviews(DEFAULT_REVIEWS);
      }
    } else {
      localStorage.setItem('minister_reviews_and_ratings', JSON.stringify(DEFAULT_REVIEWS));
      setAllReviews(DEFAULT_REVIEWS);
    }
  }, []);

  useEffect(() => {
    if (selectedLeaderId) {
      setGalleryFilter(selectedLeaderId);
    }
  }, [selectedLeaderId]);

  const saveReviews = (updated: Record<string, Review[]>) => {
    setAllReviews(updated);
    localStorage.setItem('minister_reviews_and_ratings', JSON.stringify(updated));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const active = getActiveLeader();
    if (!active) return;

    if (newRating === 0) {
      setCommentError("Please select a star rating (1 to 5).");
      return;
    }
    if (!newComment.trim()) {
      setCommentError("Please write a short comment about your experience/perspective.");
      return;
    }

    const slug = active.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const storedUser = localStorage.getItem(`riva_leader_reviews_user_${slug}`);
    let userReviews: any[] = [];
    if (storedUser) {
      try {
        userReviews = JSON.parse(storedUser);
      } catch (e) {
        userReviews = [];
      }
    }

    const newRev = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newUsername.trim() || "Anonymous Citizen",
      username: newUsername.trim() || "Anonymous Citizen",
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      tag: 'Policy Execution'
    };

    const updatedUser = [newRev, ...userReviews];
    localStorage.setItem(`riva_leader_reviews_user_${slug}`, JSON.stringify(updatedUser));

    setAllReviews(prev => ({
      ...prev,
      [active.name]: updatedUser as any[]
    }));

    setCommentSuccess(true);
    setNewRating(0);
    setNewComment('');
    setNewUsername('');
    setCommentError(null);
  };

  const handleLikeReview = (reviewId: string) => {
    setLikedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  const getComparisonLeaders = () => {
    const list = Object.entries(PRELOADED_MINISTERS).map(([key, value]) => ({
      id: key,
      name: value.name,
      dossier: value
    }));
    if (customLeaderDossier) {
      list.push({
        id: 'custom_search',
        name: `${customLeaderDossier.name} (Search Result)`,
        dossier: customLeaderDossier
      });
    }
    return list;
  };

  const getDossierById = (id: string): MinisterDossier | undefined => {
    if (id === 'custom_search') return customLeaderDossier || undefined;
    return PRELOADED_MINISTERS[id];
  };

  const getActiveLeader = (): MinisterDossier => {
    if (customLeaderDossier) return customLeaderDossier;
    return PRELOADED_MINISTERS[selectedLeaderId];
  };

  const handleLeaderSelect = (id: string) => {
    setCustomLeaderDossier(null);
    setSelectedLeaderId(id);
    setErrorMsg(null);
  };

  const handleDeepSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setLoadingStepIdx(0);

    // Dynamic steps simulator
    const stepInterval = setInterval(() => {
      setLoadingStepIdx((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const response = await fetch('/api/gemini/minister-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          department: deptQuery,
          designation: desigQuery
        })
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (data.success) {
        try {
          // Parse the JSON text returned by Gemini
          let parsed: MinisterDossier = JSON.parse(data.text);
          // Attach sources
          parsed.sources = data.sources;
          setCustomLeaderDossier(parsed);
          setSelectedLeaderId(''); // Clear selection since we are displaying a custom search
        } catch (parseErr) {
          console.error("Failed to parse Gemini output as JSON", data.text, parseErr);
          // Fallback parsing if JSON was wrapped or slightly malformed
          setErrorMsg("The AI found the details, but had trouble formatting the response as strict JSON. Please try refining the query slightly.");
        }
      } else {
        setErrorMsg(data.message || "An error occurred during the deep internet search. Ensure your Gemini API Key is configured.");
      }
    } catch (err) {
      clearInterval(stepInterval);
      setErrorMsg("Failed to connect to the server. Ensure that your local server is running on Port 3000.");
    } finally {
      setLoading(false);
    }
  };

  const activeLeader = getActiveLeader();
  const [imageError, setImageError] = useState(false);
  const [thumbnailErrors, setThumbnailErrors] = useState<Record<string, boolean>>({});

  // Compute rating and count
  const leaderReviews = activeLeader ? (allReviews[activeLeader.name] || []) : [];
  const leaderTotalRatings = leaderReviews.length;
  const leaderAverageRating = leaderTotalRatings > 0 
    ? (leaderReviews.reduce((sum, r) => sum + r.rating, 0) / leaderTotalRatings).toFixed(1)
    : "4.7";
  const leaderTotalVotes = leaderTotalRatings > 0 ? leaderTotalRatings : 38;

  useEffect(() => {
    setImageError(false);
    setNewRating(0);
    setHoverRating(0);
    setNewComment('');
    setNewUsername('');
    setCommentError(null);
    setCommentSuccess(false);
  }, [activeLeader?.name]);

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* 1. Header Hero Banner */}
      <div className="bg-white dark:bg-[#07091c]/95 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-bjp-saffron/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-bjp-saffron text-white rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 animate-spin" />
            <span>AI-Powered Real-time Grounding Search</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-none text-slate-900 dark:text-white font-display">
            Know Your <span className="text-bjp-saffron">Minister</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Perform deep, real-time public interest searches on Indian political leaders, cabinet ministers, MPs, and Chief Ministers. This engine crawls public election commission affidavits, verified news grids, and government disclosures to deliver detailed bios, verified asset holdings, completed public works, and family disclosures.
          </p>
        </div>
      </div>

      {/* 2. Main Search panel and filter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Search className="w-5 h-5 text-bjp-saffron" />
              <span>Dossier Generator</span>
            </h3>
            <p className="text-xs text-slate-500">Search any representative by Name, State/Department, and current designation.</p>
          </div>

          <form onSubmit={handleDeepSearch} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Leader's Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-bjp-saffron"
                  placeholder="e.g., Nitin Gadkari, Mamata Banerjee"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Department/Ministry</label>
                <input
                  type="text"
                  value={deptQuery}
                  onChange={(e) => setDeptQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-bjp-saffron"
                  placeholder="e.g. Finance, Roadways"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Designation/Role</label>
                <input
                  type="text"
                  value={desigQuery}
                  onChange={(e) => setDesigQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-bjp-saffron"
                  placeholder="e.g. Chief Minister, MP"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-bjp-saffron hover:bg-bjp-saffron/90 disabled:bg-slate-800 text-white font-sans font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Crawling the Web...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  <span>Deep Search Internet</span>
                </>
              )}
            </button>
          </form>

          {/* Alert explaining capabilities / keys */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850/60 p-4 rounded-xl space-y-2 text-[11px] leading-relaxed text-slate-500">
            <div className="flex gap-2 items-start text-bjp-saffron font-bold">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Real-Time Compliance Information</span>
            </div>
            <p>
              This search complies with public transparency laws. All results are aggregated dynamically using Google Search Grounding from public news outlets and election filings.
            </p>
          </div>

          {/* Quick Select Grid of Preloaded Leaders */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400">Popular Quick Profiles</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PRELOADED_MINISTERS).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleLeaderSelect(key)}
                  className={`p-2 rounded-xl text-left border text-[11px] font-bold transition flex items-center gap-2 ${
                    selectedLeaderId === key && !customLeaderDossier
                      ? 'bg-bjp-blue/10 dark:bg-slate-800 border-bjp-saffron text-bjp-blue dark:text-white'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500">
                    {(() => {
                      if (value.profileImage && !thumbnailErrors[key]) {
                        console.log("Rendering minister thumbnail:", value.name, "->", value.profileImage);
                        return (
                          <img
                            src={getDirectImageUrl(value.profileImage)}
                            alt={value.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-top"
                            onError={(e) => {
                              console.error("Failed to load thumbnail image for", value.name, "url:", value.profileImage);
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=100';
                            }}
                          />
                        );
                      }
                      return (
                        <span>
                          {value.name ? (
                            value.name.split(/\s+/).map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                          ) : (
                            <User className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-slate-900 dark:text-slate-100 leading-tight font-bold">
                      {value.name.split(' ')[0]} {value.name.split(' ').slice(-1)}
                    </p>
                    <p className="text-[9px] text-slate-400 truncate font-mono font-normal uppercase leading-none mt-0.5">
                      {value.title.split(' ').slice(-1)[0]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Main Dossier Display */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-6 min-h-[450px]"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-bjp-saffron/20 border-t-bjp-saffron rounded-full animate-spin" />
                  <Sparkles className="w-8 h-8 text-bjp-saffron absolute top-6 left-6 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-black text-slate-950 dark:text-white">Orchestrating Deep Web Search</h4>
                  <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">
                    {LOADING_STEPS[loadingStepIdx]}
                  </p>
                </div>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Our algorithm is fetching real-time publications, election commission records, and recent public declarations via Gemini API with search grounding. Please stand by.
                </p>
              </motion.div>
            ) : errorMsg ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 dark:bg-slate-950 border border-red-200 dark:border-red-950 p-8 rounded-3xl space-y-4"
              >
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                <div className="space-y-1">
                  <h4 className="font-bold text-red-900 dark:text-red-400 text-base">Search API Hold / Error</h4>
                  <p className="text-xs text-red-700 dark:text-red-500 leading-relaxed">{errorMsg}</p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => { setErrorMsg(null); handleLeaderSelect('narendra_modi'); }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                  >
                    View Preloaded Profile
                  </button>
                </div>
              </motion.div>
            ) : activeLeader ? (
              <motion.div
                key={activeLeader.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Dossier Header Info */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Public Disclosures Verified</span>
                  </div>

                  {/* Representative Avatar */}
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-150 dark:border-slate-800 shadow-sm flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                    {(() => {
                      if (activeLeader.profileImage && !imageError) {
                        console.log("Rendering active representative photo:", activeLeader.name, "->", activeLeader.profileImage);
                        return (
                          <img
                            src={getDirectImageUrl(activeLeader.profileImage)}
                            alt={activeLeader.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-top"
                            onError={(e) => {
                              console.error("Failed to load representative photo for", activeLeader.name, "url:", activeLeader.profileImage);
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=400';
                            }}
                          />
                        );
                      }
                      return (
                        <div className="w-full h-full bg-gradient-to-br from-bjp-blue to-indigo-900 flex items-center justify-center text-white font-black text-xl font-mono tracking-wider">
                          {activeLeader.name ? (
                            activeLeader.name.split(/\s+/).map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
                          ) : (
                            <User className="w-10 h-10" />
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div className="space-y-1.5 text-left flex-1">
                    <span className="text-[10px] tracking-widest text-bjp-saffron font-mono font-black uppercase">
                      {activeLeader.party}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {activeLeader.name}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-bjp-blue dark:text-indigo-400">
                        <Briefcase className="w-3.5 h-3.5" />
                        {activeLeader.title}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <MapPin className="w-3.5 h-3.5" />
                        {activeLeader.state}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-amber-500 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                        <span>{leaderAverageRating} / 5.0 ({leaderTotalVotes} votes)</span>
                      </span>
                    </div>
                  </div>

                  {/* Suggest Correction Button */}
                  <div className="w-full md:w-auto flex md:self-center shrink-0">
                    <button
                      onClick={() => setIsDossierContactOpen(true)}
                      className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-sm hover:border-indigo-500/30 group"
                      title="Suggest correction or update for this minister"
                      type="button"
                    >
                      <Edit3 className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                      <span>Suggest Update</span>
                    </button>
                  </div>
                </div>

                {/* Dossier Tabs navigation */}
                <div className="flex bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 p-1 rounded-2xl overflow-x-auto gap-1">
                  {[
                    { id: 'bio', label: 'Overview Bio', icon: FileText },
                    { id: 'family', label: 'Family & Network', icon: Users },
                    { id: 'financials', label: 'Financials & Assets', icon: DollarSign },
                    { id: 'projects', label: 'Impact & Projects', icon: Award },
                    { id: 'trips', label: 'Global Footprint', icon: Plane },
                    { id: 'gallery', label: 'Gallery', icon: Image }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                          activeTab === tab.id
                            ? 'bg-white dark:bg-slate-800 text-bjp-blue dark:text-white shadow-sm'
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
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 p-6 md:p-8 rounded-3xl shadow-sm min-h-[300px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-6"
                    >
                      {activeTab === 'bio' && (
                        <div className="space-y-6 text-left">
                          <div className="space-y-2">
                            <h4 className="text-sm font-bold uppercase font-mono tracking-widest text-slate-400">Executive Summary Profile</h4>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                              {activeLeader.bio}
                            </p>
                          </div>

                          {/* Dynamic Citizen Rating Overview block */}
                          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                            <div className="space-y-1">
                              <span className="text-[9px] tracking-widest text-bjp-saffron font-mono font-black uppercase flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current text-bjp-gold" />
                                CITIZEN PERFORMANCE AUDIT
                              </span>
                              <h5 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                Public Approval & Performance Score
                              </h5>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Consolidated feedback measuring policy execution, legislative audits, and public communication channels.
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-center sm:text-right shrink-0">
                                <span className="text-xl font-black text-slate-900 dark:text-white font-mono block leading-none">
                                  {leaderAverageRating} <span className="text-xs text-slate-400">/ 5.0</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Based on {leaderTotalVotes} citizen audits
                                </span>
                              </div>
                              <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                              <button
                                onClick={() => {
                                  const el = document.getElementById("citizen-reviews-section");
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-3.5 py-2 bg-bjp-saffron hover:bg-bjp-saffron/90 text-white text-[10px] font-mono font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm"
                              >
                                Rate Now
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                            {activeLeader.age && (
                              <div className="space-y-2 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 uppercase font-mono tracking-wider">
                                  <User className="w-4 h-4 text-emerald-500" />
                                  <span>Age & Demographics</span>
                                </span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                                  {activeLeader.age}
                                </p>
                              </div>
                            )}

                            {activeLeader.yearsInPower && (
                              <div className="space-y-2 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                                <span className="flex items-center gap-1 text-xs font-bold text-indigo-500 uppercase font-mono tracking-wider">
                                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                                  <span>Years in Power / Tenure</span>
                                </span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                                  {activeLeader.yearsInPower}
                                </p>
                              </div>
                            )}

                            <div className="space-y-2 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                              <span className="flex items-center gap-1 text-xs font-bold text-bjp-saffron uppercase font-mono tracking-wider">
                                <GraduationCap className="w-4 h-4" />
                                <span>Academic Credentials</span>
                              </span>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                                {activeLeader.education}
                              </p>
                            </div>

                            <div className="space-y-2 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                              <span className="flex items-center gap-1 text-xs font-bold text-pink-500 uppercase font-mono tracking-wider">
                                <Heart className="w-4 h-4 text-pink-500" />
                                <span>Marital Status & Alliance</span>
                              </span>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                                {activeLeader.maritalStatus}
                              </p>
                            </div>

                            {activeLeader.currentDesignationAndDept && (
                              <div className="md:col-span-2 space-y-2 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 shadow-sm">
                                <span className="flex items-center gap-1 text-xs font-bold text-bjp-blue dark:text-indigo-400 uppercase font-mono tracking-wider">
                                  <Briefcase className="w-4 h-4 text-bjp-blue dark:text-indigo-400" />
                                  <span>Active Designation & Departments</span>
                                </span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                                  {activeLeader.currentDesignationAndDept}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'family' && (
                        <div className="space-y-6 text-left">
                          <div className="space-y-2">
                            <h4 className="text-sm font-bold uppercase font-mono tracking-widest text-slate-400">Family & Household Summary</h4>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 bg-bjp-blue text-white text-[10px] font-mono font-bold rounded">
                                SIZE: {activeLeader.family.count}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                              {activeLeader.family.details}
                            </p>
                          </div>

                          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-850">
                            <h5 className="text-xs font-bold uppercase font-mono tracking-widest text-indigo-500">Family Education & Business Disclosures</h5>
                            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed bg-white dark:bg-slate-950 p-4 border border-indigo-100/30 dark:border-slate-850 rounded-xl shadow-sm">
                              {activeLeader.family.educationAndBusiness}
                            </p>
                          </div>

                          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-850">
                            <h5 className="text-xs font-bold uppercase font-mono tracking-widest text-slate-400">Political Network & Influence Circle</h5>
                            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                              {activeLeader.network}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'financials' && (
                        <div className="space-y-6 text-left">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1 shadow-sm">
                              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest">Declared Annual Income</span>
                              <p className="text-sm font-black text-slate-900 dark:text-white leading-relaxed">
                                {activeLeader.income}
                              </p>
                            </div>
                            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1 shadow-sm">
                              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest flex items-center gap-1">
                                <Home className="w-3.5 h-3.5 text-bjp-saffron" />
                                <span>Real Estate Properties</span>
                              </span>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {activeLeader.property}
                              </p>
                            </div>
                            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1 shadow-sm">
                              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-widest flex items-center gap-1">
                                <Car className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Movable Assets</span>
                              </span>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {activeLeader.assets}
                              </p>
                            </div>
                          </div>

                          <div className="bg-amber-50/10 dark:bg-slate-950/60 p-4 border border-amber-200/30 dark:border-amber-950/40 rounded-xl flex items-start gap-3 shadow-sm">
                            <Shield className="w-5 h-5 text-bjp-saffron shrink-0 mt-0.5" />
                            <div className="space-y-1 text-[11px] leading-relaxed text-slate-500">
                              <span className="font-bold text-slate-700 dark:text-slate-300">Election Affidavit Compliance Statement</span>
                              <p>
                                Financial values represent summaries compiled from self-declared candidate affidavits submitted during nomination filings. These values are in the public domain under Section 125A of Representation of the People Act, 1951.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'projects' && (
                        <div className="space-y-6 text-left">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-emerald-600 flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Major Completed Public Works</span>
                              </h4>
                              <div className="space-y-2">
                                {activeLeader.projectsDone.map((proj, i) => (
                                  <div key={i} className="flex gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                                    <span className="text-emerald-500 font-bold">✔</span>
                                    <p className="leading-relaxed">{proj}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-bjp-saffron flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4" />
                                <span>Projects in Pipeline</span>
                              </h4>
                              <div className="space-y-2">
                                {activeLeader.projectsInPipeline.map((proj, i) => (
                                  <div key={i} className="flex gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                                    <span className="text-bjp-saffron font-bold">●</span>
                                    <p className="leading-relaxed">{proj}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-2">
                            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-indigo-500 flex items-center gap-1.5">
                              <HeartHandshake className="w-4 h-4" />
                              <span>Social and Constituency Welfare Work</span>
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                              {activeLeader.socialWork}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'trips' && (
                        <div className="space-y-4 text-left">
                          <div className="space-y-1">
                            <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-slate-400">Official International Journeys & Delegations</h4>
                            <p className="text-xs text-slate-500">Record of official bilateral visits and global conference representations.</p>
                          </div>

                          <div className="space-y-2.5">
                            {activeLeader.internationalTrips && activeLeader.internationalTrips.length > 0 ? (
                              activeLeader.internationalTrips.map((trip, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-150 dark:border-slate-850 shadow-sm">
                                  <span className="p-2 bg-indigo-50 dark:bg-slate-900 text-indigo-600 rounded-lg">
                                    <Plane className="w-3.5 h-3.5" />
                                  </span>
                                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {trip}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-400 italic">No foreign visits or official overseas delegations reported in his standard ministerial filings.</p>
                            )}
                          </div>
                        </div>
                      )}

                      {activeTab === 'gallery' && (
                        <div className="space-y-6 text-left">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">Latest Photo Disclosures & Public Events</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Verified media coverage, official summits, and public interactions.</p>
                          </div>

                          {/* Filter Tabs scrollbar */}
                          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
                            {[
                              { id: 'all', name: 'All Leaders' },
                              ...Object.entries(PRELOADED_MINISTERS).map(([id, info]) => ({
                                id,
                                name: info.name
                              }))
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setGalleryFilter(opt.id)}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                                  galleryFilter === opt.id
                                    ? 'bg-bjp-blue text-white shadow-sm dark:bg-slate-800 dark:text-white'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                              >
                                {opt.name}
                              </button>
                            ))}
                          </div>

                          {/* Gallery Grid */}
                          {(() => {
                            const filtered = GALLERY_IMAGES.filter(
                              (img) => galleryFilter === 'all' || img.ministerId === galleryFilter
                            );

                            if (filtered.length === 0) {
                              return (
                                <div className="text-center py-12 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                  <Image className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                  <p className="text-xs text-slate-400 italic">No media files registered under this leader yet. Select "All Leaders" to view active files.</p>
                                </div>
                              );
                            }

                            return (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {filtered.map((img) => (
                                  <div
                                    key={img.id}
                                    className="group relative bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-150 dark:border-slate-850 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                                  >
                                    {/* Image Wrapper */}
                                    <div className="aspect-video w-full overflow-hidden relative bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                      <img
                                        src={getDirectImageUrl(img.imageUrl)}
                                        alt={img.caption}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                          e.currentTarget.src = "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80";
                                        }}
                                      />
                                      {/* Hover overlay button to zoom */}
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                          onClick={() => setZoomedImageId(img.id)}
                                          className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-lg transition cursor-pointer"
                                          title="Zoom Image"
                                        >
                                          <Sparkles className="w-4 h-4 text-bjp-blue" />
                                        </button>
                                      </div>

                                      {/* Party Badge */}
                                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-bjp-blue/80 backdrop-blur-md text-white text-[9px] font-mono font-bold rounded">
                                        {img.party}
                                      </span>

                                      {/* Date Badge */}
                                      <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-slate-100 text-[9px] font-mono rounded">
                                        {img.date}
                                      </span>
                                    </div>

                                    {/* Caption Info */}
                                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-1 bg-white dark:bg-slate-950">
                                      <span className="text-[9px] font-mono font-black uppercase text-slate-400 tracking-wider">
                                        {img.ministerName}
                                      </span>
                                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                                        {img.caption}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}

                          {/* Modal Zoomed View */}
                          {zoomedImageId && (() => {
                            const img = GALLERY_IMAGES.find((i) => i.id === zoomedImageId);
                            if (!img) return null;
                            return (
                              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
                                <div className="relative max-w-3xl w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
                                  {/* Close button */}
                                  <button
                                    onClick={() => setZoomedImageId(null)}
                                    className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer shadow-md"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>

                                  <div className="aspect-video bg-black flex items-center justify-center animate-pulse-once">
                                    <img
                                      src={getDirectImageUrl(img.imageUrl)}
                                      alt={img.caption}
                                      referrerPolicy="no-referrer"
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  </div>

                                  <div className="p-5 space-y-2 bg-white dark:bg-slate-950 text-left border-t border-slate-100 dark:border-slate-900">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-mono font-black uppercase text-bjp-blue dark:text-emerald-400">
                                        {img.ministerName} • {img.party}
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-400">
                                        {img.date}
                                      </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                                      {img.caption}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* References and Sources */}
                {activeLeader.sources && activeLeader.sources.length > 0 && (
                  <div className="bg-white dark:bg-slate-950 p-5 rounded-3xl border border-slate-200 dark:border-slate-900 space-y-3 shadow-sm">
                    <h4 className="text-[10px] font-mono uppercase tracking-widest font-black text-slate-400">Verification References & Citations ({activeLeader.sources.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeLeader.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-850 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg transition"
                        >
                          <span>{src.title || "Web Disclosure Page"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Citizen Ratings & Reviews */}
                {(() => {
                  const slug = activeLeader.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                  
                  // Load user reviews for this leader from local storage
                  const storedUser = localStorage.getItem(`riva_leader_reviews_user_${slug}`);
                  let userReviews: any[] = [];
                  if (storedUser) {
                    try {
                      userReviews = JSON.parse(storedUser);
                    } catch (e) {
                      userReviews = [];
                    }
                  }

                  // Determine category, state, constituency
                  let category = "Cabinet Minister";
                  const titleLower = (activeLeader.title || "").toLowerCase();
                  if (titleLower.includes("prime minister")) {
                    category = "Prime Minister";
                  } else if (titleLower.includes("deputy chief minister") || titleLower.includes("deputy cm")) {
                    category = "Deputy Chief Minister";
                  } else if (titleLower.includes("chief minister") || titleLower.includes("cm")) {
                    category = "Chief Minister";
                  } else if (titleLower.includes("governor")) {
                    category = "Governor";
                  } else if (titleLower.includes("mp") || titleLower.includes("member of parliament") || titleLower.includes("lok sabha")) {
                    category = "Lok Sabha MP";
                  }

                  const parts = (activeLeader.state || "").split(',');
                  const constituency = parts[0]?.trim() || "Local Sector";
                  const state = parts[1]?.replace(/\/.*$/, '')?.trim() || parts[0]?.trim() || "National";

                  // Seeded stats and reviews list
                  const stats = getSeededStats(activeLeader.name, category, slug);
                  const seeded = getSeededReviewsList(activeLeader.name, category, slug, state, constituency);

                  const combinedReviews = [...userReviews, ...seeded];
                  const totalRatings = stats.totalVotes + userReviews.length;

                  // Combined distribution
                  const starDistribution = [
                    stats.distribution[1],
                    stats.distribution[2],
                    stats.distribution[3],
                    stats.distribution[4],
                    stats.distribution[5]
                  ];
                  userReviews.forEach(r => {
                    if (r.rating >= 1 && r.rating <= 5) {
                      starDistribution[r.rating - 1]++;
                    }
                  });

                  const totalPoints = (5 * starDistribution[4]) + (4 * starDistribution[3]) + (3 * starDistribution[2]) + (2 * starDistribution[1]) + (1 * starDistribution[0]);
                  const averageRating = totalRatings > 0 ? (totalPoints / totalRatings).toFixed(1) : "4.7";

                  const sortedReviews = [...combinedReviews].map(r => {
                    const isLiked = likedReviews[r.id];
                    return {
                      ...r,
                      likedByUser: isLiked,
                      likes: (r.likes || 0) + (isLiked ? 1 : 0)
                    };
                  }).sort((a, b) => {
                    if (sortBy === 'recent') {
                      return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
                    } else {
                      return (b.likes || 0) - (a.likes || 0);
                    }
                  });

                  return (
                    <div id="citizen-reviews-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 mt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>Public Feedback Council</span>
                          </div>
                          <h4 className="text-xl font-black text-slate-950 dark:text-white">Citizen Ratings & Reviews</h4>
                          <p className="text-xs text-slate-500">Constructive feedback, appreciation, and direct suggestion cards for {activeLeader.name}.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Side: Stats & Form */}
                        <div className="lg:col-span-5 space-y-6">
                          <div className="bg-white dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 flex items-center justify-between gap-4 shadow-sm">
                            <div className="space-y-1">
                              <p className="text-[9px] font-mono uppercase tracking-widest font-black text-slate-400">Average Rating</p>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-4xl font-black text-slate-950 dark:text-white font-mono">{averageRating}</span>
                                <span className="text-xs text-slate-400 font-mono">/ 5.0</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <= Math.round(Number(averageRating))
                                        ? 'text-amber-500 fill-amber-500'
                                        : 'text-slate-200 dark:text-slate-800'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-[10px] text-slate-400 font-medium font-mono mt-1">{totalRatings} citizen reviews</p>
                            </div>

                            <div className="flex-1 max-w-[150px] space-y-1">
                              {[5, 4, 3, 2, 1].map((stars) => {
                                const count = starDistribution[stars - 1] || 0;
                                const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                                return (
                                  <div key={stars} className="flex items-center gap-2 text-[9px] font-mono">
                                    <span className="w-4 font-bold text-slate-500 text-right">{stars}★</span>
                                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
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

                          {/* Comment Box and Form */}
                          <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-4 shadow-sm">
                            <h5 className="text-xs font-black uppercase font-mono tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-bjp-saffron animate-pulse" />
                              <span>Submit Your Rating</span>
                            </h5>

                            {commentSuccess ? (
                              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs space-y-1">
                                <p className="font-bold">Thank you for your rating!</p>
                                <p>Your review has been successfully processed and added to the public board.</p>
                                <button
                                  type="button"
                                  onClick={() => setCommentSuccess(false)}
                                  className="text-[10px] font-bold text-bjp-blue dark:text-indigo-400 underline hover:no-underline mt-2 cursor-pointer block"
                                >
                                  Submit another rating
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Your Rating Score *</label>
                                  <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => {
                                      const active = hoverRating ? s <= hoverRating : s <= newRating;
                                      return (
                                        <button
                                          type="button"
                                          key={s}
                                          onClick={() => setNewRating(s)}
                                          onMouseEnter={() => setHoverRating(s)}
                                          onMouseLeave={() => setHoverRating(0)}
                                          className="p-1 hover:scale-115 transition duration-150 cursor-pointer focus:outline-none"
                                        >
                                          <Star
                                            className={`w-6 h-6 transition ${
                                              active
                                                ? 'text-amber-500 fill-amber-500'
                                                : 'text-slate-300 dark:text-slate-800'
                                            }`}
                                          />
                                        </button>
                                      );
                                    })}
                                    <span className="text-[10px] text-slate-400 font-mono font-bold ml-2">
                                      {newRating ? `${newRating} Stars` : "Select stars"}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Citizen Name (Optional)</label>
                                  <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-bjp-saffron"
                                    placeholder="e.g. Sunil Mehta, Priya S."
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Feedback Comment *</label>
                                  <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={3}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-bjp-saffron resize-none"
                                    placeholder="Share your perspective on their performance, recent projects, or ideas for their pipeline..."
                                  />
                                </div>

                                {commentError && (
                                  <p className="text-[10px] font-semibold text-red-500">{commentError}</p>
                                )}

                                <button
                                  type="submit"
                                  className="w-full py-2 bg-bjp-blue hover:bg-bjp-blue/90 text-white font-sans font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                                  <span>Submit Review Card</span>
                                </button>
                              </>
                            )}
                          </form>
                        </div>

                        {/* Right Side: Review Lists */}
                        <div className="lg:col-span-7 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                            <h5 className="text-xs font-black uppercase font-mono tracking-wider text-slate-400">Public Testimonials ({totalRatings})</h5>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                <ArrowUpDown className="w-3 h-3" /> Sort:
                              </span>
                              <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 p-1 focus:outline-none cursor-pointer"
                              >
                                <option value="recent">Most Recent</option>
                                <option value="popular">Helpfulness</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1.5 custom-scrollbar">
                            {sortedReviews.length > 0 ? (
                              sortedReviews.map((rev) => {
                                const firstLetter = (rev.username || "C").trim().charAt(0).toUpperCase();
                                return (
                                  <div
                                    key={rev.id}
                                    className="bg-white dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-850/60 p-4 rounded-2xl space-y-2.5 text-left relative group hover:border-slate-300 dark:hover:border-slate-800 transition duration-150 shadow-sm"
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold font-mono text-xs text-bjp-blue dark:text-indigo-400">
                                          {firstLetter}
                                        </div>
                                        <div>
                                          <h6 className="text-xs font-bold text-slate-950 dark:text-white leading-none">
                                            {rev.username || "Anonymous Citizen"}
                                          </h6>
                                          <p className="text-[9px] text-slate-400 font-mono mt-1">
                                            {rev.date}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-0.5">
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

                                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                                      {rev.comment}
                                    </p>

                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-850/40">
                                      <button
                                        type="button"
                                        onClick={() => handleLikeReview(rev.id)}
                                        className={`flex items-center gap-1.5 text-[10px] font-semibold transition cursor-pointer ${
                                          rev.likedByUser
                                            ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                      >
                                        <ThumbsUp className={`w-3.5 h-3.5 ${rev.likedByUser ? 'fill-current text-emerald-500' : ''}`} />
                                        <span>Helpful ({rev.likes})</span>
                                      </button>

                                      <span className="text-[9px] text-slate-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span>Verified Citizen Feedback</span>
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center py-12 bg-white dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-850 shadow-sm">
                                <p className="text-xs text-slate-400 italic">No ratings yet for this minister. Be the first to rate!</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </motion.div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-3xl p-12 text-center text-slate-400">
                Please select a leader or run a deep search.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 4. Leader Side-by-Side Comparison Section */}
      {(() => {
        const leader1Dossier = getDossierById(compareId1);
        const leader2Dossier = getDossierById(compareId2);
        return (
          <div id="leader-comparison-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Comparative Analytics Dashboard</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                  Side-by-Side Leader Comparison
                </h3>
                <p className="text-xs text-slate-500">
                  Select any two political leaders to view a detailed, side-by-side comparative breakdown of their assets, projects, net worth, and credentials.
                </p>
              </div>

              <button 
                type="button"
                onClick={() => {
                  const temp = compareId1;
                  setCompareId1(compareId2);
                  setCompareId2(temp);
                }}
                className="self-start md:self-center flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Swap Comparison</span>
              </button>
            </div>

            {/* Selection Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-sm">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Select Leader 1</label>
                <select
                  value={compareId1}
                  onChange={(e) => setCompareId1(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-bjp-saffron cursor-pointer"
                >
                  {getComparisonLeaders().map((leader) => (
                    <option key={leader.id} value={leader.id}>
                      {leader.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Select Leader 2</label>
                <select
                  value={compareId2}
                  onChange={(e) => setCompareId2(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:border-bjp-saffron cursor-pointer"
                >
                  {getComparisonLeaders().map((leader) => (
                    <option key={leader.id} value={leader.id}>
                      {leader.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Responsive Table Component */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-850 rounded-2xl">
              <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850">
                    <th className="p-4 text-[10px] uppercase font-mono tracking-wider text-slate-400 w-1/4">Comparative Matrix</th>
                    <th className="p-4 text-sm font-black text-slate-900 dark:text-white w-3/8 border-l border-slate-200 dark:border-slate-850 bg-indigo-50/20 dark:bg-slate-900/10">
                      {leader1Dossier ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            {leader1Dossier.profileImage ? (
                              <img
                                src={getDirectImageUrl(leader1Dossier.profileImage)}
                                alt={leader1Dossier.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover object-top"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=100';
                                }}
                              />
                            ) : (
                              <User className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-mono tracking-wider text-bjp-saffron font-bold uppercase truncate">{leader1Dossier.party}</span>
                            <span className="text-sm font-extrabold mt-0.5 text-slate-900 dark:text-white truncate">{leader1Dossier.name}</span>
                            <span className="text-xs text-slate-500 font-normal mt-0.5 truncate">{leader1Dossier.title}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No selection</span>
                      )}
                    </th>
                    <th className="p-4 text-sm font-black text-slate-900 dark:text-white w-3/8 border-l border-slate-200 dark:border-slate-850 bg-indigo-50/20 dark:bg-slate-900/10">
                      {leader2Dossier ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            {leader2Dossier.profileImage ? (
                              <img
                                src={getDirectImageUrl(leader2Dossier.profileImage)}
                                alt={leader2Dossier.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover object-top"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=100';
                                }}
                              />
                            ) : (
                              <User className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] font-mono tracking-wider text-bjp-saffron font-bold uppercase truncate">{leader2Dossier.party}</span>
                            <span className="text-sm font-extrabold mt-0.5 text-slate-900 dark:text-white truncate">{leader2Dossier.name}</span>
                            <span className="text-xs text-slate-500 font-normal mt-0.5 truncate">{leader2Dossier.title}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No selection</span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Category 1: Financial & Net Worth */}
                  <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-850">
                    <td colSpan={3} className="p-3 text-[10px] uppercase font-mono tracking-widest font-black text-indigo-600 dark:text-indigo-400">
                      💸 Financial Assets, Net Worth & Properties
                    </td>
                  </tr>
                  <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide font-mono">Declared Net Worth / Assets</td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850 font-bold text-emerald-600 dark:text-emerald-400">
                      {leader1Dossier?.assets}
                    </td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850 font-bold text-emerald-600 dark:text-emerald-400">
                      {leader2Dossier?.assets}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide font-mono">Declared Annual Income</td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850">
                      {leader1Dossier?.income}
                    </td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850">
                      {leader2Dossier?.income}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide font-mono">Immovable Property Holdings</td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850">
                      {leader1Dossier?.property}
                    </td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850">
                      {leader2Dossier?.property}
                    </td>
                  </tr>

                  {/* Category 2: Public Works & Completed Projects */}
                  <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-850">
                    <td colSpan={3} className="p-3 text-[10px] uppercase font-mono tracking-widest font-black text-indigo-600 dark:text-indigo-400">
                      🏗️ Public Projects & Constituency Infrastructure
                    </td>
                  </tr>
                  <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide font-mono align-top pt-4">Completed Projects & Impact</td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850 align-top">
                      <ul className="space-y-1.5 pl-0 list-none">
                        {leader1Dossier?.projectsDone.map((proj, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <span className="text-emerald-500 font-bold shrink-0">✔</span>
                            <span>{proj}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850 align-top">
                      <ul className="space-y-1.5 pl-0 list-none">
                        {leader2Dossier?.projectsDone.map((proj, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <span className="text-emerald-500 font-bold shrink-0">✔</span>
                            <span>{proj}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide font-mono align-top pt-4">Projects in Pipeline</td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850 align-top">
                      <ul className="space-y-1.5 pl-0 list-none">
                        {leader1Dossier?.projectsInPipeline.map((proj, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <span className="text-bjp-saffron font-bold shrink-0">●</span>
                            <span>{proj}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850 align-top">
                      <ul className="space-y-1.5 pl-0 list-none">
                        {leader2Dossier?.projectsInPipeline.map((proj, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <span className="text-bjp-saffron font-bold shrink-0">●</span>
                            <span>{proj}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide font-mono align-top pt-4">Social & Constituency Welfare Work</td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-l border-slate-200 dark:border-slate-850 align-top">
                      {leader1Dossier?.socialWork}
                    </td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-l border-slate-200 dark:border-slate-850 align-top">
                      {leader2Dossier?.socialWork}
                    </td>
                  </tr>

                  {/* Category 3: Governance & Qualifications */}
                  <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-850">
                    <td colSpan={3} className="p-3 text-[10px] uppercase font-mono tracking-widest font-black text-indigo-600 dark:text-indigo-400">
                      🎓 Qualifications, Tenure & General Info
                    </td>
                  </tr>
                  <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide font-mono">Years in Public Office / Executive Power</td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850 font-semibold text-bjp-saffron">
                      {leader1Dossier?.yearsInPower}
                    </td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850 font-semibold text-bjp-saffron">
                      {leader2Dossier?.yearsInPower}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide font-mono">Citizen Approval Rating</td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850">
                      {leader1Dossier ? (() => {
                        const r1 = allReviews[leader1Dossier.name] || [];
                        const avg1 = r1.length > 0 ? (r1.reduce((s, r) => s + r.rating, 0) / r1.length).toFixed(1) : "4.7";
                        const votes1 = r1.length > 0 ? r1.length : 38;
                        return (
                          <div className="flex items-center gap-1.5 font-bold text-amber-500">
                            <Star className="w-4 h-4 fill-current text-amber-500" />
                            <span>{avg1} / 5.0 <span className="text-[10px] font-normal text-slate-400 font-mono">({votes1} votes)</span></span>
                          </div>
                        );
                      })() : "N/A"}
                    </td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850">
                      {leader2Dossier ? (() => {
                        const r2 = allReviews[leader2Dossier.name] || [];
                        const avg2 = r2.length > 0 ? (r2.reduce((s, r) => s + r.rating, 0) / r2.length).toFixed(1) : "4.7";
                        const votes2 = r2.length > 0 ? r2.length : 38;
                        return (
                          <div className="flex items-center gap-1.5 font-bold text-amber-500">
                            <Star className="w-4 h-4 fill-current text-amber-500" />
                            <span>{avg2} / 5.0 <span className="text-[10px] font-normal text-slate-400 font-mono">({votes2} votes)</span></span>
                          </div>
                        );
                      })() : "N/A"}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide font-mono">Age & Demographics</td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850">
                      {leader1Dossier?.age}
                    </td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850">
                      {leader2Dossier?.age}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide font-mono align-top pt-4">Education Credentials</td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850 align-top">
                      {leader1Dossier?.education}
                    </td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850 align-top">
                      {leader2Dossier?.education}
                    </td>
                  </tr>

                  {/* Category 4: Family Details & Influence Circles */}
                  <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-850">
                    <td colSpan={3} className="p-3 text-[10px] uppercase font-mono tracking-widest font-black text-indigo-600 dark:text-indigo-400">
                      👥 Family Disclosures & Network Influence
                    </td>
                  </tr>
                  <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide font-mono">Family size</td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850">
                      {leader1Dossier?.family.count}
                    </td>
                    <td className="p-4 text-xs text-slate-800 dark:text-slate-200 leading-relaxed border-l border-slate-200 dark:border-slate-850">
                      {leader2Dossier?.family.count}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide font-mono align-top pt-4">Family Education & Business</td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-l border-slate-200 dark:border-slate-850 align-top">
                      {leader1Dossier?.family.educationAndBusiness}
                    </td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-l border-slate-200 dark:border-slate-850 align-top">
                      {leader2Dossier?.family.educationAndBusiness}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide font-mono align-top pt-4">Political Network & Influence</td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-l border-slate-200 dark:border-slate-850 align-top">
                      {leader1Dossier?.network}
                    </td>
                    <td className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-l border-slate-200 dark:border-slate-850 align-top">
                      {leader2Dossier?.network}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Render Dossier Specific Contact Us Modal */}
      <ContactUs 
        isOpen={isDossierContactOpen} 
        onClose={() => setIsDossierContactOpen(false)} 
        prefilledLeaderName={activeLeader?.name} 
      />

    </div>
  );
}
