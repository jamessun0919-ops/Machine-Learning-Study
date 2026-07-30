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

export interface AxisRange {
  min: number;
  max: number;
}

// Global min/max per variable across the whole dataset, so the 3D chart's
// axis ranges stay fixed when switching feature presets instead of each
// combo auto-scaling to its own subset of the data.
function computeRange(values: number[]): AxisRange {
  return { min: Math.min(...values), max: Math.max(...values) };
}

export const fixedRanges: Record<
  'rdSpend' | 'administration' | 'marketingSpend' | 'profit',
  AxisRange
> = {
  rdSpend: computeRange(startups.map((s) => s.rdSpend)),
  administration: computeRange(startups.map((s) => s.administration)),
  marketingSpend: computeRange(startups.map((s) => s.marketingSpend)),
  profit: computeRange(startups.map((s) => s.profit)),
};

// Human-readable labels for the chart's axis legend.
export const fieldLabels: Record<
  'rdSpend' | 'administration' | 'marketingSpend' | 'profit',
  string
> = {
  rdSpend: '研發支出（R&D Spend）',
  administration: '行政支出（Administration）',
  marketingSpend: '行銷支出（Marketing Spend）',
  profit: '獲利（Profit）',
};

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
