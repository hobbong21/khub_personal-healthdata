export interface SNPData {
  snpId: string;
  chromosome: string;
  position: number;
  genotype: string;
  trait: string;
}

export interface SortConfig {
  key: keyof SNPData | null;
  direction: 'asc' | 'desc';
}

export interface SNPTableProps {
  data: SNPData[];
  itemsPerPage?: number;
}
