import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default function AnalyticsPage() {
  return (
    <PlaceholderPage
      icon="📈"
      title="Analytics"
      description="Get powerful insights into your business performance with real-time analytics and reporting."
      features={[
        'Revenue and profit trends',
        'Cost analysis and variance reports',
        'Sales performance by item and category',
        'Labor cost optimization insights',
        'Custom date range comparisons',
      ]}
    />
  );
}
