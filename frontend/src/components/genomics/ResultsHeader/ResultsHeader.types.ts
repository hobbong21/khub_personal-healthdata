export interface AnalysisMeta {
  date: string;
  source: string;
  snpCount: string;
}

export interface ResultsHeaderProps {
  healthScore: number;
  analysisMeta: AnalysisMeta;
}
