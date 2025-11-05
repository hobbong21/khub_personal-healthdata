export interface Activity {
  id: string;
  icon: string;
  title: string;
  time: string;
  type: 'measurement' | 'medication' | 'appointment' | 'exercise' | 'journal';
  timestamp?: Date;
}

export interface ActivityListProps {
  activities: Activity[];
  maxItems?: number;
  onActivityClick?: (activity: Activity) => void;
}
