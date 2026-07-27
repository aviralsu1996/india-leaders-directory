import { getLocalLeaders, getLocalJobs } from './supabaseClient';
import { ELECTIONS_DATA } from '../data/electionsData';
import { initialParties } from '../data';
import { ExportColumnOption } from './exportEngine';
import { SupabaseLeader, Job } from '../types';

export type DatasetCategory =
  | 'all'
  | 'prime_ministers'
  | 'chief_ministers'
  | 'governors'
  | 'cabinet_ministers'
  | 'union_ministers'
  | 'ministers_of_state'
  | 'lok_sabha'
  | 'rajya_sabha'
  | 'mlas'
  | 'political_parties'
  | 'elections'
  | 'govt_jobs'
  | 'entire_database';

export interface DatasetMeta {
  id: DatasetCategory;
  name: string;
  description: string;
  count: number;
  columns: ExportColumnOption[];
}

export interface ExportFilterParams {
  state?: string;
  party?: string;
  alliance?: string;
  category?: string;
  gender?: string;
  ministry?: string;
  electionYear?: string;
  status?: string; // 'Current' | 'Former' | 'All'
  verifiedOnly?: boolean;
  featuredOnly?: boolean;
  searchKeyword?: string;
}

/**
 * Standard Column Schemas
 */
export const LEADER_COLUMNS: ExportColumnOption[] = [
  { key: 'name', label: 'Full Name' },
  { key: 'category', label: 'Category / Role' },
  { key: 'designation', label: 'Designation' },
  { key: 'party', label: 'Party' },
  { key: 'state', label: 'State / UT' },
  { key: 'constituency', label: 'Constituency' },
  { key: 'district', label: 'District' },
  { key: 'gender', label: 'Gender' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'age', label: 'Age' },
  { key: 'education', label: 'Education' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'email', label: 'Email Address' },
  { key: 'officeAddress', label: 'Office Address' },
  { key: 'website', label: 'Website' },
  { key: 'status', label: 'Current / Former Status' },
  { key: 'image', label: 'Image URL' },
  { key: 'bio', label: 'Biography' }
];

export const PARTY_COLUMNS: ExportColumnOption[] = [
  { key: 'name', label: 'Party Name' },
  { key: 'abbreviation', label: 'Abbreviation' },
  { key: 'color', label: 'Brand Color' },
  { key: 'description', label: 'Description & Philosophy' },
  { key: 'achievements', label: 'Key Campaign Achievements' }
];

export const ELECTION_COLUMNS: ExportColumnOption[] = [
  { key: 'state', label: 'State / Union Territory' },
  { key: 'type', label: 'Election Type' },
  { key: 'expected_month', label: 'Expected Month' },
  { key: 'year', label: 'Election Year' },
  { key: 'total_seats', label: 'Total Assembly Seats' },
  { key: 'current_chief_minister', label: 'Current Chief Minister' },
  { key: 'current_governing_party', label: 'Ruling Party / Alliance' },
  { key: 'status', label: 'Schedule Status' },
  { key: 'eci_url', label: 'ECI Portal Link' }
];

export const JOB_COLUMNS: ExportColumnOption[] = [
  { key: 'title', label: 'Job Title' },
  { key: 'department', label: 'Department / Organization' },
  { key: 'category', label: 'Category (Central/State)' },
  { key: 'state', label: 'State' },
  { key: 'vacancies', label: 'Vacancies' },
  { key: 'salary', label: 'Salary / Pay Scale' },
  { key: 'qualification', label: 'Qualification' },
  { key: 'lastDate', label: 'Application Deadline' },
  { key: 'officialNotificationUrl', label: 'Official PDF Link' },
  { key: 'applyUrl', label: 'Apply Online URL' }
];

/**
 * Get Available Datasets Metadata
 */
export function getDatasetsMetadata(): DatasetMeta[] {
  const leaders = getLocalLeaders();
  const jobs = getLocalJobs();

  return [
    {
      id: 'entire_database',
      name: 'Entire Database',
      description: 'Unified multi-dataset master record of all leaders, parties, elections and job vacancies.',
      count: leaders.length + jobs.length + ELECTIONS_DATA.length + initialParties.length,
      columns: LEADER_COLUMNS
    },
    {
      id: 'prime_ministers',
      name: 'Prime Ministers',
      description: 'Honourable Prime Minister and former Prime Ministers dossiers.',
      count: leaders.filter(l => l.category === 'Prime Minister' || l.designation?.toLowerCase().includes('prime minister')).length,
      columns: LEADER_COLUMNS
    },
    {
      id: 'chief_ministers',
      name: 'Chief Ministers',
      description: 'Chief Ministers serving across 28 Indian States and Union Territories.',
      count: leaders.filter(l => l.category === 'Chief Minister' || l.designation?.toLowerCase().includes('chief minister')).length,
      columns: LEADER_COLUMNS
    },
    {
      id: 'governors',
      name: 'Governors',
      description: 'Constitutional Governors and Lieutenant Governors of Indian States and UTs.',
      count: leaders.filter(l => l.category === 'Governor' || l.designation?.toLowerCase().includes('governor')).length,
      columns: LEADER_COLUMNS
    },
    {
      id: 'cabinet_ministers',
      name: 'Cabinet Ministers',
      description: 'Union Cabinet Ministers and State Cabinet Portfolio Holders.',
      count: leaders.filter(l => l.category === 'Cabinet Minister' || l.designation?.toLowerCase().includes('cabinet')).length,
      columns: LEADER_COLUMNS
    },
    {
      id: 'union_ministers',
      name: 'Union Ministers',
      description: 'Central Union Council of Ministers of India.',
      count: leaders.filter(l => (l.category as string) === 'Union Minister' || l.designation?.toLowerCase().includes('union')).length,
      columns: LEADER_COLUMNS
    },
    {
      id: 'ministers_of_state',
      name: 'Ministers of State',
      description: 'Ministers of State (Independent Charge) and MoS portfolios.',
      count: leaders.filter(l => (l.category as string) === 'Minister of State' || l.designation?.toLowerCase().includes('state')).length,
      columns: LEADER_COLUMNS
    },
    {
      id: 'lok_sabha',
      name: 'Lok Sabha MPs',
      description: 'Members of Parliament representing 543 Lok Sabha constituencies.',
      count: leaders.filter(l => (l.category as string) === 'Lok Sabha' || l.designation?.toLowerCase().includes('lok sabha')).length,
      columns: LEADER_COLUMNS
    },
    {
      id: 'rajya_sabha',
      name: 'Rajya Sabha MPs',
      description: 'Members of Parliament in the Upper House of Indian Parliament.',
      count: leaders.filter(l => (l.category as string) === 'Rajya Sabha' || l.designation?.toLowerCase().includes('rajya sabha')).length,
      columns: LEADER_COLUMNS
    },
    {
      id: 'mlas',
      name: 'MLAs (Members of Legislative Assembly)',
      description: 'State legislators elected across Indian State Assemblies.',
      count: leaders.filter(l => l.category === 'MLA').length,
      columns: LEADER_COLUMNS
    },
    {
      id: 'political_parties',
      name: 'Political Parties',
      description: 'National and State Recognized Political Parties in India.',
      count: initialParties.length,
      columns: PARTY_COLUMNS
    },
    {
      id: 'elections',
      name: 'Election Calendar',
      description: 'State Assembly and Parliamentary Election Schedules (2026 - 2031).',
      count: ELECTIONS_DATA.length,
      columns: ELECTION_COLUMNS
    },
    {
      id: 'govt_jobs',
      name: 'Government Jobs',
      description: 'Official Central and State Government Job Notifications.',
      count: jobs.length,
      columns: JOB_COLUMNS
    }
  ];
}

/**
 * Filter Records based on Export Filters
 */
export function filterDatasetRecords(
  datasetId: DatasetCategory,
  filters: ExportFilterParams
): { data: any[]; columns: ExportColumnOption[]; datasetName: string } {
  let rawData: any[] = [];
  let columns: ExportColumnOption[] = LEADER_COLUMNS;
  let datasetName = 'Leaders Directory Export';

  const leaders = getLocalLeaders();
  const jobs = getLocalJobs();

  switch (datasetId) {
    case 'prime_ministers':
      rawData = leaders.filter(l => l.category === 'Prime Minister' || l.designation?.toLowerCase().includes('prime minister'));
      datasetName = 'Prime Ministers of India';
      break;

    case 'chief_ministers':
      rawData = leaders.filter(l => l.category === 'Chief Minister' || l.designation?.toLowerCase().includes('chief minister'));
      datasetName = 'Chief Ministers of India';
      break;

    case 'governors':
      rawData = leaders.filter(l => l.category === 'Governor' || l.designation?.toLowerCase().includes('governor'));
      datasetName = 'State Governors & LGs';
      break;

    case 'cabinet_ministers':
      rawData = leaders.filter(l => l.category === 'Cabinet Minister' || l.designation?.toLowerCase().includes('cabinet'));
      datasetName = 'Cabinet Ministers';
      break;

    case 'union_ministers':
      rawData = leaders.filter(l => (l.category as string) === 'Union Minister' || l.designation?.toLowerCase().includes('union'));
      datasetName = 'Union Council of Ministers';
      break;

    case 'ministers_of_state':
      rawData = leaders.filter(l => (l.category as string) === 'Minister of State' || l.designation?.toLowerCase().includes('state'));
      datasetName = 'Ministers of State';
      break;

    case 'lok_sabha':
      rawData = leaders.filter(l => (l.category as string) === 'Lok Sabha' || l.designation?.toLowerCase().includes('lok sabha'));
      datasetName = 'Lok Sabha MPs';
      break;

    case 'rajya_sabha':
      rawData = leaders.filter(l => (l.category as string) === 'Rajya Sabha' || l.designation?.toLowerCase().includes('rajya sabha'));
      datasetName = 'Rajya Sabha MPs';
      break;

    case 'mlas':
      rawData = leaders.filter(l => l.category === 'MLA');
      datasetName = 'State Legislative Assembly MLAs';
      break;

    case 'political_parties':
      rawData = [...initialParties];
      columns = PARTY_COLUMNS;
      datasetName = 'Political Parties';
      break;

    case 'elections':
      rawData = [...ELECTIONS_DATA];
      columns = ELECTION_COLUMNS;
      datasetName = 'Upcoming Election Calendar';
      break;

    case 'govt_jobs':
      rawData = [...jobs];
      columns = JOB_COLUMNS;
      datasetName = 'Government Recruitment Notifications';
      break;

    case 'entire_database':
    case 'all':
    default:
      rawData = [...leaders];
      datasetName = 'Entire Leaders Directory Database';
      break;
  }

  // Apply Granular Filters
  if (datasetId !== 'political_parties' && datasetId !== 'elections' && datasetId !== 'govt_jobs') {
    rawData = rawData.filter((item: SupabaseLeader) => {
      // State Filter
      if (filters.state && filters.state !== 'All' && filters.state !== 'all') {
        if ((item.state || '').toLowerCase() !== filters.state.toLowerCase()) return false;
      }

      // Party Filter
      if (filters.party && filters.party !== 'All' && filters.party !== 'all') {
        if ((item.party || '').toLowerCase() !== filters.party.toLowerCase()) return false;
      }

      // Alliance Filter
      if (filters.alliance && filters.alliance !== 'All' && filters.alliance !== 'all') {
        const party = (item.party || '').toUpperCase();
        if (filters.alliance === 'NDA' && !['BJP', 'JD(U)', 'TDP', 'LJP', 'SHS'].includes(party)) return false;
        if (filters.alliance === 'INDIA' && !['INC', 'SP', 'TMC', 'DMK', 'AAP', 'RJD', 'NC', 'SS(UBT)'].includes(party)) return false;
        if (filters.alliance === 'Others' && ['BJP', 'INC', 'SP', 'TMC', 'DMK', 'AAP'].includes(party)) return false;
      }

      // Category / Designation Filter
      if (filters.category && filters.category !== 'All' && filters.category !== 'all') {
        if ((item.category || '').toLowerCase() !== filters.category.toLowerCase()) return false;
      }

      // Gender Filter
      if (filters.gender && filters.gender !== 'All' && filters.gender !== 'all') {
        if ((item.gender || '').toLowerCase() !== filters.gender.toLowerCase()) return false;
      }

      // Current vs Former Status Filter
      if (filters.status && filters.status !== 'All' && filters.status !== 'all') {
        const itemStatus = (item as any).status || '';
        if (filters.status === 'Current' && itemStatus === 'Former') return false;
        if (filters.status === 'Former' && itemStatus !== 'Former') return false;
      }

      // Featured Only Filter
      if (filters.featuredOnly && !item.featured) return false;

      // Search Keyword
      if (filters.searchKeyword && filters.searchKeyword.trim()) {
        const q = filters.searchKeyword.toLowerCase().trim();
        const matchesName = (item.name || '').toLowerCase().includes(q);
        const matchesParty = (item.party || '').toLowerCase().includes(q);
        const matchesState = (item.state || '').toLowerCase().includes(q);
        const matchesConst = (item.constituency || '').toLowerCase().includes(q);
        const matchesDesig = (item.designation || '').toLowerCase().includes(q);

        if (!matchesName && !matchesParty && !matchesState && !matchesConst && !matchesDesig) return false;
      }

      return true;
    });
  } else if (datasetId === 'govt_jobs') {
    rawData = rawData.filter((job: Job) => {
      if (filters.state && filters.state !== 'All' && filters.state !== 'all') {
        if ((job.state || '').toLowerCase() !== filters.state.toLowerCase()) return false;
      }
      if (filters.searchKeyword && filters.searchKeyword.trim()) {
        const q = filters.searchKeyword.toLowerCase().trim();
        return (job.title || '').toLowerCase().includes(q) || (job.department || '').toLowerCase().includes(q);
      }
      return true;
    });
  } else if (datasetId === 'elections') {
    rawData = rawData.filter((e: any) => {
      if (filters.state && filters.state !== 'All' && filters.state !== 'all') {
        if ((e.state || '').toLowerCase() !== filters.state.toLowerCase()) return false;
      }
      if (filters.electionYear && filters.electionYear !== 'All' && filters.electionYear !== 'all') {
        if (String(e.year || e.election_year) !== filters.electionYear) return false;
      }
      return true;
    });
  }

  return { data: rawData, columns, datasetName };
}
