import PlaceholderPage from '@/components/dashboard/PlaceholderPage';

export default function InventoryPage() {

  return (
    
      <PlaceholderPage
        icon="📦"
        title="Inventory Management"
        description="Track stock levels, manage suppliers, and reduce waste with intelligent inventory controls."
        features={[
          'Real-time stock level tracking',
          'Automated reorder alerts',
          'Supplier management',
          'Waste tracking and analysis',
          'Stock take tools',
          'Integration with menu costing',
        ]}
      />
    
  );
}
