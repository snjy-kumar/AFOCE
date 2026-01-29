/**
 * AFOCE RBAC (Role-Based Access Control) System
 * 
 * Enterprise-grade permission management with:
 * - Role hierarchy (OWNER > MANAGER > ACCOUNTANT > VIEWER)
 * - Fine-grained permission matrix
 * - Resource-level access control
 * - Conditional permissions (e.g., "own resources only")
 * - Permission caching for performance
 */

import type { RoleType } from '../../generated/prisma/client.js';
import type {
  Permission,
  PermissionAction,
  PermissionCheckContext,
  PermissionMatrix,
} from '../../types/workflow.types.js';
import prisma from '../../lib/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

// ============================================
// PERMISSION MATRIX DEFINITION
// ============================================

/**
 * Complete permission matrix for all roles
 * Defines what each role can do with each resource
 */
const PERMISSION_MATRIX: PermissionMatrix = {
  OWNER: [
    // Full access to everything
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
    { resource: '*', action: 'approve' },
    { resource: '*', action: 'reject' },
    { resource: '*', action: 'send' },
    { resource: '*', action: 'export' },
    { resource: '*', action: 'import' },
    { resource: '*', action: 'configure' },
  ],

  MANAGER: [
    // Invoices - full CRUD + approve
    { resource: 'invoices', action: 'create' },
    { resource: 'invoices', action: 'read' },
    { resource: 'invoices', action: 'update' },
    { resource: 'invoices', action: 'delete' },
    { resource: 'invoices', action: 'approve' },
    { resource: 'invoices', action: 'reject' },
    { resource: 'invoices', action: 'send' },
    { resource: 'invoices', action: 'export' },

    // Expenses - full CRUD + approve
    { resource: 'expenses', action: 'create' },
    { resource: 'expenses', action: 'read' },
    { resource: 'expenses', action: 'update' },
    { resource: 'expenses', action: 'delete' },
    { resource: 'expenses', action: 'approve' },
    { resource: 'expenses', action: 'reject' },
    { resource: 'expenses', action: 'export' },

    // Customers & Vendors - full CRUD
    { resource: 'customers', action: 'create' },
    { resource: 'customers', action: 'read' },
    { resource: 'customers', action: 'update' },
    { resource: 'customers', action: 'delete' },
    { resource: 'customers', action: 'export' },

    { resource: 'vendors', action: 'create' },
    { resource: 'vendors', action: 'read' },
    { resource: 'vendors', action: 'update' },
    { resource: 'vendors', action: 'delete' },
    { resource: 'vendors', action: 'export' },

    // Reports - read + export
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'export' },

    // Bank accounts - read + update
    { resource: 'bank-accounts', action: 'read' },
    { resource: 'bank-accounts', action: 'update' },

    // VAT - read + export
    { resource: 'vat', action: 'read' },
    { resource: 'vat', action: 'export' },

    // Accounts - read only
    { resource: 'accounts', action: 'read' },

    // Audit logs - read only
    { resource: 'audit-logs', action: 'read' },

    // Business rules - read only (can view but not modify)
    { resource: 'business-rules', action: 'read' },
  ],

  ACCOUNTANT: [
    // Invoices - create, read, update (no delete, no approve)
    { resource: 'invoices', action: 'create' },
    { resource: 'invoices', action: 'read' },
    { resource: 'invoices', action: 'update' },
    { resource: 'invoices', action: 'send' },
    { resource: 'invoices', action: 'export' },

    // Expenses - full CRUD (no approve)
    { resource: 'expenses', action: 'create' },
    { resource: 'expenses', action: 'read' },
    { resource: 'expenses', action: 'update' },
    { resource: 'expenses', action: 'delete' },
    { resource: 'expenses', action: 'export' },

    // Customers & Vendors - full CRUD
    { resource: 'customers', action: 'create' },
    { resource: 'customers', action: 'read' },
    { resource: 'customers', action: 'update' },
    { resource: 'customers', action: 'delete' },
    { resource: 'customers', action: 'export' },

    { resource: 'vendors', action: 'create' },
    { resource: 'vendors', action: 'read' },
    { resource: 'vendors', action: 'update' },
    { resource: 'vendors', action: 'delete' },
    { resource: 'vendors', action: 'export' },

    // Reports - read + export
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'export' },

    // Bank accounts - full CRUD
    { resource: 'bank-accounts', action: 'create' },
    { resource: 'bank-accounts', action: 'read' },
    { resource: 'bank-accounts', action: 'update' },
    { resource: 'bank-accounts', action: 'delete' },

    // VAT - full access
    { resource: 'vat', action: 'create' },
    { resource: 'vat', action: 'read' },
    { resource: 'vat', action: 'update' },
    { resource: 'vat', action: 'export' },

    // Accounts - read only
    { resource: 'accounts', action: 'read' },
  ],

  VIEWER: [
    // Read-only access to everything (except settings and rules)
    { resource: 'invoices', action: 'read' },
    { resource: 'invoices', action: 'export' },
    
    { resource: 'expenses', action: 'read' },
    { resource: 'expenses', action: 'export' },
    
    { resource: 'customers', action: 'read' },
    { resource: 'customers', action: 'export' },
    
    { resource: 'vendors', action: 'read' },
    { resource: 'vendors', action: 'export' },
    
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'export' },
    
    { resource: 'bank-accounts', action: 'read' },
    
    { resource: 'vat', action: 'read' },
    { resource: 'vat', action: 'export' },
    
    { resource: 'accounts', action: 'read' },
    
    { resource: 'audit-logs', action: 'read' },
  ],
};

// ============================================
// ROLE HIERARCHY
// ============================================

const ROLE_HIERARCHY: Record<RoleType, number> = {
  OWNER: 4,
  MANAGER: 3,
  ACCOUNTANT: 2,
  VIEWER: 1,
};

// ============================================
// RBAC SERVICE
// ============================================

export class RBACService {
  private permissionCache: Map<string, CachedPermissions> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes

  /**
   * Check if user has permission to perform action on resource
   */
  async hasPermission(context: PermissionCheckContext): Promise<boolean> {
    try {
      // Get user roles
      const roles = await this.getUserRoles(context.userId);
      
      if (roles.length === 0) {
        return false; // No roles assigned
      }

      // Check if any role has the required permission
      for (const role of roles) {
        const permissions = this.getRolePermissions(role);
        
        // Check wildcard permissions (OWNER has *)
        const hasWildcard = permissions.some(
          p => p.resource === '*' && p.action === context.action
        );
        
        if (hasWildcard) {
          return true;
        }

        // Check specific resource permission
        const hasSpecific = permissions.some(
          p => p.resource === context.resource && p.action === context.action
        );

        if (hasSpecific) {
          // Check conditional permissions if present
          const permission = permissions.find(
            p => p.resource === context.resource && p.action === context.action
          );

          if (permission?.conditions) {
            const conditionsMet = await this.checkConditions(
              permission.conditions,
              context
            );
            if (!conditionsMet) {
              continue; // Try next role
            }
          }

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false; // Fail closed
    }
  }

  /**
   * Require permission (throws error if not authorized)
   */
  async requirePermission(context: PermissionCheckContext): Promise<void> {
    const hasPermission = await this.hasPermission(context);
    
    if (!hasPermission) {
      throw new ApiError(
        403,
        'PERMISSION_DENIED',
        `Forbidden: You don't have permission to ${context.action} ${context.resource}`
      );
    }
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId: string, role: RoleType): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  async hasAnyRole(userId: string, roles: RoleType[]): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some(r => roles.includes(r));
  }

  /**
   * Check if user's role is higher in hierarchy than target role
   */
  async isHigherRole(userId: string, targetRole: RoleType): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    
    if (userRoles.length === 0) {
      return false;
    }

    // Get highest role
    const highestRole = userRoles.reduce((highest, current) => {
      return ROLE_HIERARCHY[current] > ROLE_HIERARCHY[highest] ? current : highest;
    });

    return ROLE_HIERARCHY[highestRole] > ROLE_HIERARCHY[targetRole];
  }

  /**
   * Get user's roles with caching
   */
  async getUserRoles(userId: string): Promise<RoleType[]> {
    // Check cache
    const cached = this.permissionCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.roles;
    }

    // Fetch from database
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      select: { roleType: true },
    });

    const roles = userRoles.map((ur: { roleType: RoleType }) => ur.roleType);

    // If no roles, check if user is owner (first user or business owner)
    if (roles.length === 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      });

      // Auto-assign OWNER role to first user (can be changed later)
      if (user) {
        const isFirstUser = await prisma.user.count() === 1;
        if (isFirstUser) {
          await this.assignRole(userId, 'OWNER');
          roles.push('OWNER');
        }
      }
    }

    // Update cache
    this.permissionCache.set(userId, {
      roles,
      timestamp: Date.now(),
    });

    return roles;
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, role: RoleType): Promise<void> {
    await prisma.userRole.upsert({
      where: {
        userId_roleType: {
          userId,
          roleType: role,
        },
      },
      create: {
        userId,
        roleType: role,
      },
      update: {}, // No-op if already exists
    });

    // Invalidate cache
    this.permissionCache.delete(userId);
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, role: RoleType): Promise<void> {
    await prisma.userRole.delete({
      where: {
        userId_roleType: {
          userId,
          roleType: role,
        },
      },
    });

    // Invalidate cache
    this.permissionCache.delete(userId);
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(role: RoleType): Permission[] {
    return PERMISSION_MATRIX[role] || [];
  }

  /**
   * Get all permissions for a user (combined from all roles)
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const roles = await this.getUserRoles(userId);
    
    const allPermissions: Permission[] = [];
    const seen = new Set<string>();

    for (const role of roles) {
      const rolePermissions = this.getRolePermissions(role);
      
      for (const permission of rolePermissions) {
        const key = `${permission.resource}:${permission.action}`;
        if (!seen.has(key)) {
          allPermissions.push(permission);
          seen.add(key);
        }
      }
    }

    return allPermissions;
  }

  /**
   * Check conditional permissions
   */
  private async checkConditions(
    conditions: any[],
    context: PermissionCheckContext
  ): Promise<boolean> {
    for (const condition of conditions) {
      if (condition.type === 'OWN_RESOURCE') {
        // User can only access their own resources
        if (context.resourceOwnerId && context.resourceOwnerId !== context.userId) {
          return false;
        }
      }

      if (condition.type === 'ROLE_HIERARCHY') {
        // Check role hierarchy
        const userRoles = await this.getUserRoles(context.userId);
        const hasHigherRole = userRoles.some(
          role => ROLE_HIERARCHY[role] >= (condition.minLevel || 0)
        );
        if (!hasHigherRole) {
          return false;
        }
      }

      if (condition.type === 'CUSTOM' && condition.validator) {
        const result = await condition.validator(context);
        if (!result) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get role hierarchy level
   */
  getRoleLevel(role: RoleType): number {
    return ROLE_HIERARCHY[role];
  }

  /**
   * Invalidate permission cache for user
   */
  invalidateCache(userId: string): void {
    this.permissionCache.delete(userId);
  }

  /**
   * Clear all permission cache
   */
  clearCache(): void {
    this.permissionCache.clear();
  }
}

// ============================================
// PERMISSION CHECKER MIDDLEWARE HELPER
// ============================================

/**
 * Helper function to create permission check contexts
 */
export function createPermissionContext(
  userId: string,
  userRoles: RoleType[],
  resource: string,
  action: PermissionAction,
  options?: {
    resourceOwnerId?: string;
    metadata?: Record<string, unknown>;
  }
): PermissionCheckContext {
  return {
    userId,
    userRoles,
    resource,
    action,
    resourceOwnerId: options?.resourceOwnerId,
    metadata: options?.metadata,
  };
}

// ============================================
// TYPES
// ============================================

interface CachedPermissions {
  roles: RoleType[];
  timestamp: number;
}

// Export singleton instance
export const rbacService = new RBACService();
