export const getDirectImageUrl = (url?: string) => {
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
    bio: "Rahul Gandhi is a prominent Indian politician serving as the Leader of the Opposition in the 18th Lok Sabha. He has worked as a Member of Parliament since 2004 representing Amethi (2004-2019), Wayanad (2019-2024), and currently represents Rae Bareli (2024-Present), totaling 22 years of legislative work. While he has never served as a Chief Minister or executive cabinet minister (0 years in executive power), he currently holds the designation of Leader of the Opposition in the Lok Sabha (since June 2024), where he manages the shadow legislative council of the I.N.D.I.a coalition.",
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
      "Introduced free public transit for women in Delhi."
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
