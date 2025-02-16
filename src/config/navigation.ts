
export type NavigationItem = {
  name: string;
  href: string;
  icon: any;
  description: string;
};

export type NavigationSection = {
  category: string;
  items: NavigationItem[];
};

// We'll reimplement this later with a new structure
export const getNavigation = (): NavigationSection[] => {
  return [];
}; 