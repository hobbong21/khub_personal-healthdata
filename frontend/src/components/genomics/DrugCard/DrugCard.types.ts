export type DrugResponse = 'normal' | 'increased' | 'decreased';

export interface DrugCardProps {
  drugName: string;
  response: DrugResponse;
  description: string;
}
