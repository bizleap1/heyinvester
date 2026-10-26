import { TeamMember } from '@/types';

export const COMPANY_INFO = {
  name: 'Hey Investor Pvt. Ltd.',
  shortName: 'Hey Investor',
  tagline: 'Land with a longer view.',
  descriptor: 'Curated plotted developments and land investments around Nagpur.',
  reraNumber: 'A50500037507',
  address: {
    line1: '103, Ghatate Building, WHC Road',
    line2: 'Nr. Law College Sq.',
    city: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
    full: '103, Ghatate Building, WHC Road, Nr. Law College Sq., Nagpur, Maharashtra, India',
  },
  phone: '+91 93256 50256',
  phoneRaw: '+919325650256',
  email: 'info@heyinvestor.in',
  whatsappUrl: 'https://wa.me/919325650256',
  logoUrl: '/logo (1).png',
  qrCodeUrl: '/qrcode.png',
  loanAssistance: 'Up to 80%–90% Bank Finance assistance with major nationalized & private banks',
  establishedFocus: 'Specializing strictly in verified NMRDA & RL-sanctioned plotted developments across Vidarbha’s top infrastructure corridors.',
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Nandlal Tandekar',
    initials: 'NT',
    role: 'Founder & Director',
    bio: 'Over 15 years of real estate experience across Nagpur and Vidarbha, specializing in strategic land acquisitions and regulatory sanctioning.',
    image: '/nandlal.jpg',
  },
  {
    name: 'Gyaneshwar Singh Thakur',
    initials: 'GST',
    role: 'Sales Head',
    bio: 'Specialises in land acquisition, regulatory approvals, and project planning with clear-title due diligence.',
    image: '/gst.jpg',
  },
  {
    name: 'Sushilkumar Dongarwar',
    initials: 'SD',
    role: 'Operational Head',
    bio: 'Trusted advisor to 200+ investors. Expert in plot selection, layout viability, and institutional bank financing.',
    image: '/sushil.jpg',
  },
];

export const CORRIDORS = [
  {
    name: 'Wardha Road',
    summary: 'The flagship infrastructure spine connecting MIHAN SEZ, AIIMS Nagpur, IIM, and Dr. Babasaheb Ambedkar International Airport.',
    relevance: 'High commercial demand, institutional hubs, and rapid metro connectivity.',
  },
  {
    name: 'Amravati Road (NH-53)',
    summary: 'Strategic arterial highway connecting Nagpur to Western Maharashtra with close proximity to Wadi, Lava, and emerging logistics corridors.',
    relevance: 'Excellent road geometry, major educational institutions, and steady residential absorption.',
  },
  {
    name: 'Hingna Corridor',
    summary: 'Prominent industrial and academic hub anchored by Hingna MIDC, top engineering institutions (YCCE), and Outer Ring Road access.',
    relevance: 'Robust employment anchor, Metro Phase extensions, and sustained rental & capital appreciation.',
  },
  {
    name: 'Koradi Road & North Nagpur',
    summary: 'Rapidly emerging northern corridor with direct access to Koradi Temple & Lake, Outer Ring Road interchange, and Godhani residential hubs.',
    relevance: 'High residential preference, peaceful lakefront living, expanding transit infrastructure, and clear NMRDA/RL plotted layouts.',
  },
];
