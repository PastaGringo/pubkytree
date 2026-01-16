export interface Link {
  id: string;
  title: string;
  url: string;
  icon?: string;
  order: number;
  clicks?: number;
}

export interface Profile {
  name: string;
  bio: string;
  avatarUrl?: string;
  pubkyAvatarUrl?: string; // Original pubky:// URL for SDK-based loading
}

export interface Theme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardStyle: 'glass' | 'solid' | 'gradient';
}

export interface PubkyTreeData {
  profile: Profile;
  links: Link[];
  theme?: Theme;
}

// Demo data for when not connected to Pubky
export const DEMO_PROFILE: Profile = {
  name: "PubkyTree Demo",
  bio: "Your decentralized link-in-bio. Own your data, own your identity. 🔐",
  avatarUrl: undefined,
};

export const DEMO_LINKS: Link[] = [
  {
    id: "1",
    title: "🌐 My Website",
    url: "https://example.com",
    order: 0,
    clicks: 142,
  },
  {
    id: "2",
    title: "🐦 Twitter / X",
    url: "https://x.com",
    order: 1,
    clicks: 89,
  },
  {
    id: "3",
    title: "💻 GitHub",
    url: "https://github.com",
    order: 2,
    clicks: 67,
  },
  {
    id: "4",
    title: "📸 Instagram",
    url: "https://instagram.com",
    order: 3,
    clicks: 54,
  },
  {
    id: "5",
    title: "💼 LinkedIn",
    url: "https://linkedin.com",
    order: 4,
    clicks: 38,
  },
  {
    id: "6",
    title: "☕ Buy me a coffee",
    url: "https://buymeacoffee.com",
    order: 5,
    clicks: 21,
  },
];
