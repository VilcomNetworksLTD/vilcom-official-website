import { Server, Monitor, Globe, MessageSquare, Briefcase, Package, Wifi } from "lucide-react";

export const getIconByType = (type: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    'hosting_package': Server,
    'web_development': Monitor,
    'domain': Globe,
    'bulk_sms': MessageSquare,
    'service': Briefcase,
    'internet_plan': Wifi,
    'other': Package,
  };
  return icons[type] || Package;
};

export const getColorByType = (type: string) => {
  const colors: Record<string, string> = {
    'hosting_package': 'text-blue-400',
    'web_development': 'text-emerald-400',
    'domain': 'text-purple-400',
    'bulk_sms': 'text-orange-400',
    'service': 'text-indigo-400',
    'internet_plan': 'text-amber-400',
    'other': 'text-slate-400',
  };
  return colors[type] || 'text-slate-400';
};

export const getBlobColorByType = (type: string) => {
  const colors: Record<string, string> = {
    'hosting_package': 'bg-blue-500/20',
    'web_development': 'bg-emerald-500/20',
    'domain': 'bg-purple-500/20',
    'bulk_sms': 'bg-orange-500/20',
    'service': 'bg-indigo-500/20',
    'internet_plan': 'bg-amber-500/20',
    'other': 'bg-slate-500/20',
  };
  return colors[type] || 'bg-slate-500/20';
};

