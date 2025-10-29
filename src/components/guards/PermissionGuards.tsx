'use client';

import { useBusinessContext } from '@/contexts/BusinessContext';
import { ReactNode } from 'react';
import type { UserRole } from '@/hooks/useUserProfile';

interface PermissionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  businessId?: string;
}

/**
 * Only render children if user is an owner of the active (or specified) business
 */
export function OwnerOnly({ children, fallback = null, businessId }: PermissionGuardProps) {
  const { hasRole, currentBusinessId } = useBusinessContext();
  const targetBusinessId = businessId || currentBusinessId;

  if (!targetBusinessId || !hasRole('owner', targetBusinessId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Only render children if user is an admin or owner of the active (or specified) business
 */
export function AdminOnly({ children, fallback = null, businessId }: PermissionGuardProps) {
  const { hasRole, currentBusinessId } = useBusinessContext();
  const targetBusinessId = businessId || currentBusinessId;

  if (!targetBusinessId || !hasRole('admin', targetBusinessId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Only render children if user is at least a member of the active (or specified) business
 */
export function MemberPlus({ children, fallback = null, businessId }: PermissionGuardProps) {
  const { hasRole, currentBusinessId } = useBusinessContext();
  const targetBusinessId = businessId || currentBusinessId;

  if (!targetBusinessId || !hasRole('member', targetBusinessId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Render children based on specific role check
 */
interface RoleGuardProps extends PermissionGuardProps {
  role: UserRole;
}

export function RoleGuard({ role, children, fallback = null, businessId }: RoleGuardProps) {
  const { hasRole, currentBusinessId } = useBusinessContext();
  const targetBusinessId = businessId || currentBusinessId;

  if (!targetBusinessId || !hasRole(role, targetBusinessId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook for checking permissions in code (non-UI)
 */
export function usePermissions(businessId?: string) {
  const { hasRole, currentBusinessId, isOwner, isAdmin, activeBusiness } = useBusinessContext();
  const targetBusinessId = businessId || currentBusinessId;

  return {
    isOwner: targetBusinessId ? hasRole('owner', targetBusinessId) : isOwner,
    isAdmin: targetBusinessId ? hasRole('admin', targetBusinessId) : isAdmin,
    isMember: targetBusinessId ? hasRole('member', targetBusinessId) : !!activeBusiness,
    hasRole: (role: UserRole) => targetBusinessId ? hasRole(role, targetBusinessId) : false,
    canManageTeam: targetBusinessId ? hasRole('admin', targetBusinessId) : isAdmin,
    canManageSettings: targetBusinessId ? hasRole('admin', targetBusinessId) : isAdmin,
    canDeleteBusiness: targetBusinessId ? hasRole('owner', targetBusinessId) : isOwner,
  };
}
