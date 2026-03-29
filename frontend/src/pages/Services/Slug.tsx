import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, Server, Monitor, Globe, MessageSquare, Briefcase, Package } from 'lucide-react';
import ServicePage from '@/components/ServicePage';
import { productsApi, Product } from '@/services/products';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';

const ServicesSlug = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productsApi.get(slug);
        setProduct(data);
      } catch (err) {
        setError('Service not found or unavailable.');
        console.error('Product fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold text-white mb-4">Service Not Found</h1>
        <p className="text-xl text-slate-300 mb-8 max-w-md">{error || 'The requested service is no longer available.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all">
          <ArrowLeft className="w-5 h-5" />
          Back to Services
        </Link>
      </div>
    );
  }

  // Map product to ServicePage props
  const serviceProps = {
    title: product.name,
    subtitle: product.short_description || `Premium ${product.type?.replace('_', ' ')} service by Vilcom`,
    description: product.description || 'Contact us for detailed information and customized pricing.',
    features: (((product as any).formatted_specs as string[]) || ((product as any).features as string[]) || [])
      .slice(0, 9)
      .map(feat => ({ text: feat })),
    icon: getIconByType(product.type || 'other') as any, // Type assertion for dynamic icon
    iconBgColor: getBgColorByType(product.type || 'other'),
    iconColor: getColorByType(product.type || 'other'),
    blobColor: 'bg-purple-500/20',
    serviceType: product.type,
    productId: product.id,
    productName: product.name,
  };

  return (
    <>
      <ServicePage {...serviceProps} />
    </>
  );
};

// Icon mapping by product type
const getIconByType = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    'hosting_package': <Server size={28} />,
    'web_development': <Monitor size={28} />,
    'domain': <Globe size={28} />,
    'bulk_sms': <MessageSquare size={28} />,
    'service': <Briefcase size={28} />,
    'other': <Package size={28} />,
  };
  return icons[type] || <Package size={28} />;
};

const getBgColorByType = (type: string) => {
  const colors: Record<string, string> = {
    'hosting_package': 'bg-blue-500/20',
    'web_development': 'bg-emerald-500/20',
    'domain': 'bg-purple-500/20',
    'bulk_sms': 'bg-orange-500/20',
    'service': 'bg-indigo-500/20',
    'other': 'bg-slate-500/20',
  };
  return colors[type] || 'bg-slate-500/20';
};

const getColorByType = (type: string) => {
  const colors: Record<string, string> = {
    'hosting_package': 'text-blue-400',
    'web_development': 'text-emerald-400',
    'domain': 'text-purple-400',
    'bulk_sms': 'text-orange-400',
    'service': 'text-indigo-400',
    'other': 'text-slate-400',
  };
  return colors[type] || 'text-slate-400';
};

export default ServicesSlug;

