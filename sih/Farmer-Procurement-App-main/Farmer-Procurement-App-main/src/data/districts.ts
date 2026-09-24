export interface DistrictInfo {
  name: string;
  nameMr: string;
  talukas: string[];
  description: string;
}

export const MAHARASHTRA_DISTRICTS: DistrictInfo[] = [
  {
    name: 'Pune',
    nameMr: 'पुणे',
    talukas: ['Baramati', 'Indapur', 'Shirur', 'Daund', 'Haveli', 'Purandar'],
    description: 'Western Maharashtra Sugar & Soybean belt',
  },
  {
    name: 'Satara',
    nameMr: 'सातारा',
    talukas: ['Karad', 'Phaltan', 'Wai', 'Koregaon', 'Khatav'],
    description: 'Krishna valley fertile basin for Soybean & Cotton',
  },
  {
    name: 'Nashik',
    nameMr: 'नाशिक',
    talukas: ['Niphad', 'Lasalgaon', 'Malegaon', 'Yeola', 'Dindori'],
    description: 'Major Northern Grain, Onion & Soybean hub',
  },
  {
    name: 'Ahmednagar',
    nameMr: 'अहिल्यानगर (अहमदनगर)',
    talukas: ['Rahuri', 'Kopargaon', 'Shrirampur', 'Nevasa', 'Sangamner'],
    description: 'Central agricultural hub with warehousing facilities',
  },
  {
    name: 'Solapur',
    nameMr: 'सोलापूर',
    talukas: ['Pandharpur', 'Barshi', 'Mohol', 'Karmala', 'Madha'],
    description: 'Dryland pulse, cotton & coarse cereal belt',
  },
  {
    name: 'Kolhapur',
    nameMr: 'कोल्हापूर',
    talukas: ['Shirol', 'Hatkanangale', 'Karvir', 'Radhanagari'],
    description: 'Southern river basin paddy & grain procurement',
  },
];
