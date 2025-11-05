export interface StatCardProps {
  icon: string | React.ReactNode;
  value: string | number;
  label: string;
  unit?: string;
  change?: {
    value: string;
    positive: boolean;
  };
  variant?: 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'default';
  onClick?: () => void;
}
