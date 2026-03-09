import { useState, useEffect } from 'react';
import { quotesApi, type QuoteSubmission } from '@/services/quotes';
import { Button } from '@/components/ui/button';

interface QuoteRequestFormProps {
  productId?: number;
  productName?: string;
  serviceType?: string; // Preselected service type from parent page
  onSuccess?: (quoteNumber: string) => void;
  onCancel?: () => void;
}

// Glassmorphic card style (matching ContactUs.tsx)
const glassCardStyle = { background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.2)' };

// Service types with their labels
const SERVICE_TYPES: Record<string, string> = {
  internet_plan: 'Internet Plan',
  hosting_package: 'Hosting Package',
  web_development: 'Web Development',
  cloud_services: 'Cloud Services',
  cyber_security: 'Cyber Security',
  network_infrastructure: 'Network Infrastructure',
  isp_services: 'ISP Services',
  cpe_device: 'CPE Device',
  satellite_connectivity: 'Satellite Connectivity',
  media_services: 'Media Services',
  erp_services: 'ERP Services',
  smart_integration: 'Smart Integration',
  other: 'Other',
};

// Technical fields for each service type
const TECHNICAL_FIELDS: Record<string, Record<string, string>> = {
  internet_plan: {
    required_bandwidth: 'Required Bandwidth (Mbps)',
    number_of_users: 'Number of Users',
    connection_type: 'Connection Type (Fiber/LTE/Satellite)',
    coverage_area: 'Coverage Area / Location',
    static_ip_required: 'Static IP Required?',
    sla_requirement: 'SLA Requirement',
  },
  hosting_package: {
    storage_needed: 'Storage Needed (GB)',
    bandwidth_needed: 'Monthly Bandwidth (GB)',
    domains_count: 'Number of Domains',
    email_accounts: 'Email Accounts Required',
    control_panel: 'Preferred Control Panel',
    backup_requirements: 'Backup Requirements',
  },
  web_development: {
    project_type: 'Project Type',
    target_platforms: 'Target Platforms (Web/Mobile/Desktop)',
    desired_features: 'Desired Features',
    existing_system_integration: 'Existing System Integration',
    design_preferences: 'Design Preferences',
    content_ready: 'Is Content Ready?',
  },
  cloud_services: {
    cloud_type: 'Cloud Type (Public/Private/Hybrid)',
    compute_resources: 'Compute Resources (CPU/RAM)',
    storage_requirements: 'Storage Requirements',
    expected_users: 'Expected Number of Users',
    data_residency: 'Data Residency Requirements',
    scalability_needs: 'Scalability Needs',
  },
  cyber_security: {
    security_type: 'Type of Security Solution',
    number_of_devices: 'Number of Devices',
    users_to_protect: 'Number of Users',
    current_setup: 'Current Security Setup',
    compliance_requirements: 'Compliance Requirements (ISO, GDPR, etc.)',
    monitoring_needs: '24/7 Monitoring Needed?',
  },
  network_infrastructure: {
    network_size: 'Network Size (Number of devices)',
    number_of_locations: 'Number of Locations',
    current_infrastructure: 'Current Infrastructure Details',
    required_features: 'Required Network Features',
    equipment_preferences: 'Equipment Preferences',
  },
  isp_services: {
    bandwidth_requirement: 'Bandwidth Requirement',
    number_of_locations: 'Number of Locations',
    service_level: 'Service Level Required',
    static_ips_needed: 'Number of Static IPs Needed',
    redundancy_required: 'Redundancy Required?',
    coverage_location: 'Coverage Location',
  },
  cpe_device: {
    device_type: 'Type of CPE Device',
    quantity: 'Quantity Needed',
    compatibility_requirements: 'Compatibility Requirements',
    management_needs: 'Management/Monitoring Needs',
    installation_support: 'Installation Support Required?',
  },
  satellite_connectivity: {
    location_type: 'Location Type',
    bandwidth_requirement: 'Bandwidth Requirement',
    uptime_requirement: 'Uptime Requirement',
    data_usage_estimation: 'Estimated Monthly Data Usage',
  },
  media_services: {
    service_type: 'Type of Media Service',
    content_type: 'Content Type',
    delivery_requirements: 'Delivery Requirements',
    encoding_needs: 'Encoding Needs',
  },
  erp_services: {
    erp_module: 'ERP Module Needed',
    number_of_users: 'Number of Users',
    current_systems: 'Current Systems in Use',
    integration_needs: 'Integration Requirements',
    customization_level: 'Customization Level',
    training_needed: 'Training Required?',
  },
  smart_integration: {
    integration_type: 'Type of Integration',
    systems_to_integrate: 'Systems to Integrate',
    automation_goals: 'Automation Goals',
    existing_hardware: 'Existing Hardware',
    iot_requirements: 'IoT Requirements',
  },
  other: {
    project_description: 'Project Description',
    specific_requirements: 'Specific Requirements',
    additional_info: 'Additional Information',
  },
};

const BUDGET_RANGES = [
  { value: 'under_10k', label: 'Under KES 10,000' },
  { value: '10k_50k', label: 'KES 10,000 - 50,000' },
  { value: '50k_100k', label: 'KES 50,000 - 100,000' },
  { value: '100k_250k', label: 'KES 100,000 - 250,000' },
  { value: '250k_500k', label: 'KES 250,000 - 500,000' },
  { value: '500k_1m', label: 'KES 500,000 - 1,000,000' },
  { value: '1m_5m', label: 'KES 1,000,000 - 5,000,000' },
  { value: 'over_5m', label: 'Over KES 5,000,000' },
  { value: 'flexible', label: 'Flexible / Discuss' },
];

const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'As Soon As Possible' },
  { value: 'within_1_month', label: 'Within 1 Month' },
  { value: '1_3_months', label: '1-3 Months' },
  { value: '3_6_months', label: '3-6 Months' },
  { value: '6_12_months', label: '6-12 Months' },
  { value: 'flexible', label: 'Flexible' },
];

export default function QuoteRequestForm({ productId, productName, serviceType: initialServiceType, onSuccess, onCancel }: QuoteRequestFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Check if service type is pre-selected (from product page)
  const isServiceTypeLocked = !!initialServiceType;
  
  // Form state - initialize with initialServiceType if provided
  const [serviceType, setServiceType] = useState<string>(initialServiceType || '');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [timeline, setTimeline] = useState('');
  const [preferredStartDate, setPreferredStartDate] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Technical requirements - dynamic based on service type
  const [technicalRequirements, setTechnicalRequirements] = useState<Record<string, string>>({});
  
  // General info
  const [projectOverview, setProjectOverview] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [complianceStandards, setComplianceStandards] = useState('');

  // Get technical fields for selected service type
  const currentTechnicalFields = serviceType ? (TECHNICAL_FIELDS[serviceType] || TECHNICAL_FIELDS.other) : {};

  const handleTechnicalFieldChange = (key: string, value: string) => {
    setTechnicalRequirements(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const submissionData: QuoteSubmission = {
        service_type: serviceType,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone || undefined,
        company_name: companyName || undefined,
        product_id: productId,
        general_info: {
          project_overview: projectOverview,
          target_audience: targetAudience,
          compliance_standards: complianceStandards,
        },
        technical_requirements: Object.keys(technicalRequirements).length > 0 ? technicalRequirements : undefined,
        budget_range: budgetRange || undefined,
        timeline: timeline || undefined,
        preferred_start_date: preferredStartDate || undefined,
        urgency,
        additional_notes: additionalNotes || undefined,
        source: 'web',
      };

      const result = await quotesApi.submit(submissionData);
      setSuccess(`Quote request submitted! Your quote number is ${result.quote_number}`);
      
      if (onSuccess) {
        onSuccess(result.quote_number);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quote request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-2xl p-8 overflow-hidden backdrop-blur-md max-w-3xl mx-auto" style={glassCardStyle}>
      <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)' }} />
      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-bold text-white">Request a Quote</h2>
          {productName && (
            <p className="text-cyan-300 mt-1">
              Requesting quote for: <span className="font-semibold">{productName}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Quote Request Submitted!</h3>
            <p className="text-cyan-300">{success}</p>
            <p className="text-white/50 mt-4 text-sm">
              Our team will review your request and get back to you within 24-48 hours.
            </p>
            {onSuccess && (
              <button
                onClick={() => onSuccess('')}
                className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            )}
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Service Type {isServiceTypeLocked ? '' : '*'}
            </label>
            {isServiceTypeLocked ? (
              <div className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-medium">
                {SERVICE_TYPES[serviceType] || serviceType}
              </div>
            ) : (
              <select
                value={serviceType}
                onChange={(e) => {
                  setServiceType(e.target.value);
                  setTechnicalRequirements({});
                }}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              >
                <option value="">Select a service type...</option>
                {Object.entries(SERVICE_TYPES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent placeholder-white/40"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent placeholder-white/40"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent placeholder-white/40"
                placeholder="+254 7XX XXX XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent placeholder-white/40"
                placeholder="Your company (optional)"
              />
            </div>
          </div>

          {/* General Information */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Project Overview *
            </label>
            <textarea
              value={projectOverview}
              onChange={(e) => setProjectOverview(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent placeholder-white/40 resize-none"
              placeholder="Describe your project goals, objectives, and what you aim to accomplish..."
            />
          </div>

          {/* Technical Requirements - Dynamic based on service type */}
          {serviceType && currentTechnicalFields && Object.keys(currentTechnicalFields).length > 0 && (
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Technical Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(currentTechnicalFields).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={technicalRequirements[key] || ''}
                      onChange={(e) => handleTechnicalFieldChange(key, e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent placeholder-white/40"
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget and Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Budget Range
              </label>
              <select
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              >
                <option value="">Select budget range...</option>
                {BUDGET_RANGES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Timeline
              </label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              >
                <option value="">Select timeline...</option>
                {TIMELINE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Preferred Start Date
              </label>
              <input
                type="date"
                value={preferredStartDate}
                onChange={(e) => setPreferredStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Additional Notes
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent placeholder-white/40 resize-none"
              placeholder="Any other information you'd like to share..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all shadow-lg"
            >
              {loading ? 'Submitting...' : 'Submit Quote Request'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

