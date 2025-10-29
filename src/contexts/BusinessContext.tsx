'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUserProfile, UserProfile, BusinessMembership, UserRole } from '@/hooks/useUserProfile';

interface BusinessContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  switchBusiness: (businessId: string) => Promise<void>;
  hasRole: (role: UserRole, businessId?: string) => boolean;
  activeBusiness: BusinessMembership | null;
  isOwner: boolean;
  isAdmin: boolean;
  currentBusinessId: string | null;
  hasMultipleBusinesses: boolean;
  hasBusiness: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const businessData = useUserProfile();

  return (
    <BusinessContext.Provider value={businessData}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusinessContext must be used within BusinessProvider');
  }
  return context;
}
