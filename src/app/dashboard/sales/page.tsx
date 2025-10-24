import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default function SalesPage() {

  return (
    
      <PlaceholderPage
        icon="💰"
        title="Sales Reports"
        description="Comprehensive sales reporting and analysis to understand what's driving revenue."
        features={[
          'Daily, weekly, and monthly sales reports',
          'Sales by item, category, and server',
          'Peak hours analysis',
          'Payment method breakdowns',
          'Year-over-year comparisons',
          'Export to Excel and PDF',
        ]}
      />
    
  );
}
