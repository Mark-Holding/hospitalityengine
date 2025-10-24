import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default function MenuCalculatorPage() {
  return (
    <PlaceholderPage
      icon="🍽️"
      title="Menu Cost Calculator"
      description="Calculate dish costs accurately, track ingredient prices, and optimize your menu profitability."
      features={[
        'Recipe costing with ingredient tracking',
        'Automatic food cost percentage calculations',
        'Pricing suggestions based on target margins',
        'Bulk import from CSV',
        'Allergen and dietary information tracking',
        'Menu engineering analysis',
      ]}
    />
  );
}
