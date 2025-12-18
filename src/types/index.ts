export interface FilterConditions {
  marketCapMin: number;
  marketCapMax: number;
  volumeRatioMin: number;
  changePercentMin: number;
  changePercentMax: number;
  turnoverRateMin: number;
  turnoverRateMax: number;
  excludeST: boolean;
  timelineAboveAvgRatio: number;
}

export interface TimelinePoint {
  time: string;
  price: number;
  avgPrice: number;
}

export interface StockData {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  change: number;
  volume: number;
  amount: number;
  turnoverRate: number | null;
  volumeRatio: number | null;
  circulatingMarketCap: number | null;
  totalMarketCap: number | null;
  pe: number | null;
  pb: number | null;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  timeline?: TimelinePoint[];
  timelineAboveAvgRatio?: number;
}

export type Theme = 'cyber' | 'aurora' | 'sunset' | 'midnight' | 'crystal';

export interface ThemeConfig {
  name: string;
  label: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

