export interface NavigationProps {
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface NavItem {
  path: string;
  icon: string;
  label: string;
}
