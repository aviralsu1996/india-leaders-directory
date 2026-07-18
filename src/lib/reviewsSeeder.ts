export interface SharedReview {
  id: string;
  name: string;      // Used by LeaderDetailsPage
  username: string;  // Used by KnowYourMinister
  rating: number;
  comment: string;
  tag: string;
  date: string;
  likes: number;
  liked?: boolean;
  likedByUser?: boolean;
}

const REVIEW_TAGS = ["Development", "Infrastructure", "Policy Execution", "Accessibility", "Welfare"];

const CITIZEN_NAMES_GOOD = [
  "Dr. Ramesh Kumar", "Sunita Deshmukh", "Rajesh Kumar", "Priya Sharma", "Amit Patel",
  "Sanjay Mehta", "Neha Shah", "Arvind Rao", "Vikram Jeet", "Meera Nair",
  "Deepak Gupta", "Rohan Sen", "Kavita Rao", "Suresh G.", "Anoop Mathews",
  "Kalyan Krishna", "Latha Murthy", "Shrikant Deshpande", "Gaurav Joshi", "Ananya Hegde"
];

const CITIZEN_NAMES_BAD = [
  "Karan Malhotra", "Ravi Verma", "Siddharth J.", "Anjali Bose", "Manish Pandey",
  "Pooja Hegde", "Suresh Kumar", "Divya Singh", "Hiten Chawla", "Preeti Desai",
  "Vikram Aditya", "Naveen Lal", "Tarun Goel", "Shreya Sen", "Rahul Khanna"
];

const CATEGORY_TEMPLATES: Record<string, { good: string[]; bad: string[] }> = {
  'Prime Minister': {
    good: [
      "Outstanding digital transformation and infrastructure development! The UPI grid and digital public infrastructure have made transactions incredibly seamless even in rural corners.",
      "Strong diplomatic presence globally. The attention on local semiconductor plants and manufacturing is a massive positive for our nation's progress.",
      "Incredible focus on cleaning up corruption in welfare schemes through direct benefit transfer. Very clear vision for India 2047.",
      "The progress on national highway networks and green corridors is highly impressive. The logistics sector is seeing a massive boost across states.",
      "Very strong stand on national security and border infrastructure. Decisive leadership has placed India at the center stage of global growth."
    ],
    bad: [
      "While highway development is excellent, we need faster action on domestic technical employment and lowering taxes on middle-class taxpayers.",
      "The welfare schemes are reaching people, but inflation in essential commodities and fuel prices has severely burdened average families.",
      "Access to high-level governance portals should be simplified. Many micro-businesses are still struggling with local compliance red tape."
    ]
  },
  'Governor': {
    good: [
      "Maintaining absolute constitutional dignity. The Governor's address in state assemblies has consistently highlighted the right development benchmarks.",
      "As Chancellor of State Universities, the Governor has brought highly needed transparency in administrative appointments and academic calendars.",
      "Highly gracious and dignified. Regularly hosts civil society members, sportspersons, and social workers at the Raj Bhavan to encourage local talent.",
      "The Governor's intervention in resolving the inter-state boundary dispute was highly statesmanlike and brought immediate peace.",
      "Excellent advocacy for tribal area welfare and scheduling rights. Ensuring funds are directly utilized for tribal school libraries."
    ],
    bad: [
      "The Governor should remain strictly neutral. Sometimes public statements create unnecessary friction with the elected state government.",
      "Raj Bhavan administrative processes should be more transparent. Information access under RTI has a very long turnaround time.",
      "Though university reform has started, students in rural colleges are still suffering from exam delays and lack of basic laboratory gear."
    ]
  },
  'Chief Minister': {
    good: [
      "The regional welfare schemes like direct cash transfers and healthcare cards have truly empowered vulnerable communities in our state. Grassroots impact is superb!",
      "Excellent handling of state highway widening and solar power integration. The industrial corridors in {state} are finally picking up speed.",
      "The Chief Minister's portal for grievance redressal is actually functional. My local water supply issue was escalated and fixed in 72 hours.",
      "Strong impetus on upgrading state primary schools and establishing skill development institutes for youth in every district.",
      "Very proactive in inviting investments to our state. New technology parks and manufacturing units are creating direct jobs for locals."
    ],
    bad: [
      "Welfare schemes are good but administrative delays at the district level are highly frustrating. Ground level officers still demand red tape.",
      "While capital city infrastructure is getting all the highlights, rural roads in {state} remain neglected and filled with potholes after the monsoons.",
      "Public transport networks in Tier-2 and Tier-3 cities of our state are severely lagging. We need more electric buses instead of just flyovers."
    ]
  },
  'Deputy Chief Minister': {
    good: [
      "Great synergy with the administrative machinery. Working diligently on core state portfolios to ensure fast-tracked approvals for major projects.",
      "Highly accessible leader. Visited our flooded constituency of {constituency} to directly monitor relief operations and water drainage.",
      "The rural road connectivity scheme launched under the Deputy CM's portfolio has significantly reduced commute times for local farmers.",
      "Focused on local tourism development and restoring heritage sites. It's helping generate livelihood opportunities for local youths in {state}.",
      "Doing a stellar job in supervising the urban local bodies. Waste segregation and sanitation indexes have improved noticeably in major blocks."
    ],
    bad: [
      "A lot of announcements on social media, but physical work on ground is moving slow. The suburban sanitation works in our ward are still pending.",
      "Needs to ensure even distribution of developmental grants. Some assembly segments are getting major budgets while others are being sidelined.",
      "Youth unemployment programs are mostly paper-bound. We need concrete job fairs and vocational placements rather than just training certificates."
    ]
  },
  'Lok Sabha MP': {
    good: [
      "Extremely active MP. Raised critical questions about our local railway station upgrade and industrial bypass in the Parliament. Real fighter!",
      "Utilizing the MPLADS funds very effectively in {constituency}. Installed high-mast solar lights, drinking water filtration booths, and built community halls.",
      "Runs a weekly 'Janata Darbar' (public court) in the constituency office where average citizens can directly hand over grievance letters.",
      "Successfully lobbied with central ministries to get a major national highway bypass sanctioned for our choked city roads in {constituency}.",
      "Introduced skill training centers for rural women which has boosted household incomes. Excellent work at the grassroots in our constituency!"
    ],
    bad: [
      "Only visits {constituency} during election season. We haven't seen our MP in our block since the victory rally last year.",
      "MPLADS funds are being spent, but there is no quality audit. The newly built community hall in {constituency} already has plaster peeling off.",
      "Failed to represent our local craft industry's tax concerns in the parliament. We need active economic advocacy, not just photo-ops."
    ]
  }
};

const DEFAULT_TEMPLATES = {
  good: [
    "A dedicated public representative who has worked tirelessly for the constituency. Highly accessible and results-oriented.",
    "Brought significant developmental projects, particularly in rural connectivity and clean drinking water facilities.",
    "Very humble leader with deep connection to the grassroots. Always ready to listen and resolve citizen grievances.",
    "Significant improvements in municipal administration, waste management, and street lighting under their guidance.",
    "Promoting youth skill programs and self-help groups for women, creating local livelihood channels."
  ],
  bad: [
    "Needs to focus more on direct public interaction. The local office response time is too slow.",
    "A few major projects are announced but progress on ground is highly delayed due to administrative clearances.",
    "Basic civic issues like drainage clearing and solid waste collection need much stronger supervision."
  ]
};

// Deterministic 32-bit hash function
function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getSeededStats(name: string, category: string, slug: string) {
  const hash = getDeterministicHash(name + (category || "") + slug);
  const voteCount = 500 + (hash % 501); // 500 to 1000 ratings
  
  // Mix rating: exactly 70% good (4★ & 5★), 30% negative (3★, 2★, 1★)
  const goodPercentage = 68 + (hash % 5); // 68% to 72%
  const badPercentage = 100 - goodPercentage; // 28% to 32%
  
  const stars5 = Math.floor(voteCount * (goodPercentage - 25) / 100);
  const stars4 = Math.floor(voteCount * 25 / 100);
  const stars3 = Math.floor(voteCount * (badPercentage - 18) / 100);
  const stars2 = Math.floor(voteCount * 10 / 100);
  const stars1 = voteCount - (stars5 + stars4 + stars3 + stars2);

  return {
    totalVotes: voteCount,
    distribution: {
      5: stars5,
      4: stars4,
      3: stars3,
      2: stars2,
      1: stars1
    }
  };
}

export function getSeededReviewsList(
  name: string,
  category: string,
  slug: string,
  state: string = "State",
  constituency: string = "Constituency"
): SharedReview[] {
  const hashBase = getDeterministicHash(name + (category || "") + slug);
  const templates = CATEGORY_TEMPLATES[category] || DEFAULT_TEMPLATES;
  
  const reviews: SharedReview[] = [];

  // Generate 5 good reviews (4 or 5 stars)
  for (let i = 0; i < 5; i++) {
    const hash = hashBase + i * 17;
    const templateIndex = hash % templates.good.length;
    let comment = templates.good[templateIndex];
    
    // Replace place holders
    comment = comment
      .replace(/{state}/g, state || "the state")
      .replace(/{constituency}/g, constituency || "the constituency")
      .replace(/{name}/g, name);

    const citizenName = CITIZEN_NAMES_GOOD[hash % CITIZEN_NAMES_GOOD.length];
    const rating = (hash % 2) === 0 ? 5 : 4;
    const tag = REVIEW_TAGS[hash % REVIEW_TAGS.length];
    
    // Deterministic date in mid-2026
    const day = 1 + (hash % 28);
    const month = (hash % 2) === 0 ? "06" : "07";
    const date = `2026-${month}-${day < 10 ? '0' + day : day}`;
    const likes = (hash % 45) + 5;

    reviews.push({
      id: `seeded-${slug}-good-${i}`,
      name: citizenName,
      username: citizenName,
      rating,
      comment,
      tag,
      date,
      likes,
      liked: false,
      likedByUser: false
    });
  }

  // Generate 2 critical reviews (1, 2, or 3 stars)
  for (let i = 0; i < 2; i++) {
    const hash = hashBase + i * 29 + 101;
    const templateIndex = hash % templates.bad.length;
    let comment = templates.bad[templateIndex];
    
    // Replace placeholders
    comment = comment
      .replace(/{state}/g, state || "the state")
      .replace(/{constituency}/g, constituency || "the constituency")
      .replace(/{name}/g, name);

    const citizenName = CITIZEN_NAMES_BAD[hash % CITIZEN_NAMES_BAD.length];
    const rating = (hash % 3) + 1; // 1, 2, or 3 stars
    const tag = REVIEW_TAGS[hash % REVIEW_TAGS.length];
    
    // Deterministic date in mid-2026
    const day = 1 + (hash % 28);
    const month = (hash % 2) === 0 ? "05" : "06";
    const date = `2026-${month}-${day < 10 ? '0' + day : day}`;
    const likes = (hash % 20) + 1;

    reviews.push({
      id: `seeded-${slug}-bad-${i}`,
      name: citizenName,
      username: citizenName,
      rating,
      comment,
      tag,
      date,
      likes,
      liked: false,
      likedByUser: false
    });
  }

  // Sort reviews: recent date first
  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
