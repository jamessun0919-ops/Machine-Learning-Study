import startupsData from '../data/50-startups.json';

export interface StartupRecord {
  rdSpend: number;
  administration: number;
  marketingSpend: number;
  state: string;
  profit: number;
}

export interface FeaturePreset {
  id: string;
  label: string;
  xKey: keyof Pick<StartupRecord, 'rdSpend' | 'administration' | 'marketingSpend'>;
  yKey: keyof Pick<StartupRecord, 'rdSpend' | 'administration' | 'marketingSpend'>;
  targetKey: keyof Pick<StartupRecord, 'profit'>;
}

export const startups: StartupRecord[] = startupsData as StartupRecord[];

export const featurePresets: FeaturePreset[] = [
  {
    id: 'rd-marketing',
    label: 'R&D Spend + Marketing Spend',
    xKey: 'rdSpend',
    yKey: 'marketingSpend',
    targetKey: 'profit',
  },
  {
    id: 'rd-admin',
    label: 'R&D Spend + Administration',
    xKey: 'rdSpend',
    yKey: 'administration',
    targetKey: 'profit',
  },
  {
    id: 'marketing-admin',
    label: 'Marketing Spend + Administration',
    xKey: 'marketingSpend',
    yKey: 'administration',
    targetKey: 'profit',
  },
];
