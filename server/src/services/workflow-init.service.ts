/**
 * Workflow system initialization — simplified version
 * No Redis/BullMQ. Just RBAC setup on first run.
 */

import { rbacService } from './workflow/rbac.service.js';
import prisma from '../lib/prisma.js';

export const initializeWorkflowSystem = async (): Promise<void> => {
    try {
        // Auto-assign OWNER role to first user if no roles exist yet
        const userCount = await prisma.user.count();
        const roleCount = await prisma.userRole.count();

        if (userCount > 0 && roleCount === 0) {
            const firstUser = await prisma.user.findFirst();
            if (firstUser) {
                await rbacService.assignRole(firstUser.id, 'OWNER');
                console.log(`✓ Assigned OWNER role to ${firstUser.email}`);
            }
        } else if (roleCount > 0) {
            console.log(`✓ RBAC configured (${roleCount} role assignments)`);
        }
    } catch (error) {
        // Non-fatal — log and continue
        console.warn('⚠ Could not initialize workflow system:', error instanceof Error ? error.message : error);
    }
};

export const shutdownWorkflowSystem = async (): Promise<void> => {
    // Nothing async to shut down in simplified version
};
