// Theme configuration for different dashboard types
// This can be imported and used across all dashboard components

export interface DashboardTheme {
  background: string;
  backgroundGradient: string;
  cardBg: string;
  cardBorder: string;
  cardHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  headerBg: string;
  meshGradient: boolean;
  meshColors: string[];
  accentColor: string;
  accentPrimary: string;
  accentSecondary: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarActive: string;
  sidebarHover: string;
}

export const getDashboardTheme = (userType: 'client' | 'staff' | 'admin'): DashboardTheme => {
  switch (userType) {
    case 'client':
      return {
        background: 'bg-slate-950',
        backgroundGradient: 'bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-900',
        cardBg: 'bg-white/10 backdrop-blur-md',
        cardBorder: 'border-white/20',
        cardHover: 'hover:bg-white/15 hover:border-white/30',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        headerBg: 'bg-slate-900/60 backdrop-blur-lg',
        meshGradient: true,
        meshColors: ['from-amber-500/20', 'from-yellow-500/20', 'from-orange-500/10'],
        accentColor: 'amber',
        accentPrimary: '#F59E0B',
        accentSecondary: '#D97706',
        sidebarBg: 'bg-gradient-to-b from-amber-900/80 to-yellow-900/70 backdrop-blur-xl border-r border-amber-500/30',
        sidebarText: 'text-amber-100',
        sidebarActive: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-l-2 border-amber-400',
        sidebarHover: 'hover:bg-white/10',
      };
    case 'admin':
      return {
        background: 'bg-slate-950',
        backgroundGradient: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
        cardBg: 'bg-white/10 backdrop-blur-md',
        cardBorder: 'border-white/20',
        cardHover: 'hover:bg-white/15 hover:border-white/30',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        headerBg: 'bg-slate-900/60 backdrop-blur-lg',
        meshGradient: true,
        meshColors: ['from-blue-500/20', 'from-indigo-500/20', 'from-cyan-500/10', 'from-purple-500/10'],
        accentColor: 'blue',
        accentPrimary: '#0047AB',
        accentSecondary: '#003380',
        sidebarBg: 'bg-gradient-to-b from-blue-900/80 to-indigo-900/70 backdrop-blur-xl border-r border-blue-500/30',
        sidebarText: 'text-blue-100',
        sidebarActive: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-l-2 border-blue-400',
        sidebarHover: 'hover:bg-white/10',
      };
    case 'staff':
    default:
      return {
        background: 'bg-slate-950',
        backgroundGradient: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
        cardBg: 'bg-white/10 backdrop-blur-md',
        cardBorder: 'border-white/20',
        cardHover: 'hover:bg-white/15 hover:border-white/30',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
        headerBg: 'bg-slate-900/60 backdrop-blur-lg',
        meshGradient: true,
        meshColors: ['from-blue-500/20', 'from-indigo-500/20', 'from-cyan-500/10', 'from-purple-500/10'],
        accentColor: 'blue',
        accentPrimary: '#0047AB',
        accentSecondary: '#003380',
        sidebarBg: 'bg-gradient-to-b from-blue-900/80 to-indigo-900/70 backdrop-blur-xl border-r border-blue-500/30',
        sidebarText: 'text-blue-100',
        sidebarActive: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-l-2 border-blue-400',
        sidebarHover: 'hover:bg-white/10',
      };
  }
};

// Helper to get CSS classes for glass card
export const getGlassCardClasses = (theme: DashboardTheme, rounded: string = 'xl') => {
  return `${theme.cardBg} ${theme.cardBorder} border backdrop-blur-md rounded-${rounded} ${theme.cardHover} transition-all duration-300`;
};

// Get accent color classes for various elements
export const getAccentClasses = (theme: DashboardTheme) => {
  return {
    primary: `text-${theme.accentColor}-400`,
    secondary: `text-${theme.accentColor}-300`,
    bg: `bg-${theme.accentColor}-500/20`,
    border: `border-${theme.accentColor}-500/30`,
    gradient: `from-${theme.accentColor}-500 to-${theme.accentColor}-600`,
    hover: `hover:bg-${theme.accentColor}-500/30`,
  };
};

