// src/components/auth/RoleRouteGuard.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import { UserRole } from '@/types/database';

interface RoleRouteGuardProps {
  allowedRoles?: UserRole[];
  redirectMap?: Partial<Record<UserRole, string>>;
}

export const RoleRouteGuard: React.FC<RoleRouteGuardProps> = ({
  allowedRoles,
  redirectMap = {
    super_admin: '/dashboard',
    org_admin: '/dashboard',
    event_manager: '/dashboard',
    security: '/field',
    medical: '/field',
    attendee: '/app',
  },
}) => {
  const { currentUser } = useAppStore();
  const location = useLocation();

  const role = currentUser?.role || 'super_admin';

  if (allowedRoles && !allowedRoles.includes(role)) {
    const target = redirectMap[role] || '/dashboard';
    if (location.pathname !== target) {
      return <Navigate to={target} replace />;
    }
  }

  return <Outlet />;
};
