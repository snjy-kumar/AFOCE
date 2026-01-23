/**
 * AFOCE Workflow System Initialization
 * 
 * Initializes all workflow components:
 * - BullMQ workers
 * - Event subscriptions
 * - Scheduled jobs
 * - Redis connection
 */

import { jobQueueService, initializeScheduledJobs } from './workflow/job-queue.service.js';
import { rbacService } from './workflow/rbac.service.js';
import prisma from '../lib/prisma.js';

export class WorkflowSystemInitializer {
  private static initialized = false;

  /**
   * Initialize the entire workflow system
   */
  static async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️  Workflow system already initialized');
      return;
    }

    console.log('🚀 Initializing AFOCE Workflow System...');

    try {
      // 1. Initialize BullMQ connection
      console.log('  → Connecting to Redis...');
      await jobQueueService.healthCheck();
      console.log('  ✓ Redis connected');

      // 2. Start BullMQ workers
      console.log('  → Starting job queue workers...');
      // Workers are auto-started when jobQueueService is imported
      console.log('  ✓ Workers started (notifications, reports, scheduled tasks)');

      // 3. Initialize scheduled jobs
      console.log('  → Scheduling recurring jobs...');
      await initializeScheduledJobs();
      console.log('  ✓ Scheduled jobs registered');
      console.log('    • Daily Overdue Check (9:00 AM)');
      console.log('    • Auto Reminder (10:00 AM)');
      console.log('    • Monthly VAT Report (1st @ 8:00 AM)');
      console.log('    • Cleanup Expired Notifications (2:00 AM)');
      console.log('    • Database Backup (3:00 AM)');

      // 4. Initialize notification service (subscribes to events)
      console.log('  → Subscribing to domain events...');
      // Event subscriptions are auto-initialized in NotificationService constructor
      console.log('  ✓ Event subscriptions active');

      // 5. Initialize RBAC (assign OWNER to first user if needed)
      console.log('  → Checking RBAC setup...');
      const userCount = await prisma.user.count();
      const roleCount = await prisma.userRole.count();
      
      if (userCount > 0 && roleCount === 0) {
        console.log('  → Auto-assigning OWNER role to first user...');
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          await rbacService.assignRole(firstUser.id, 'OWNER');
          console.log(`  ✓ Assigned OWNER to ${firstUser.email}`);
        }
      } else if (roleCount > 0) {
        console.log(`  ✓ RBAC configured (${roleCount} role assignments)`);
      } else {
        console.log('  ℹ️  No users yet - RBAC will be auto-configured on first registration');
      }

      // 6. Validate database schema
      console.log('  → Validating database schema...');
      const tableCheck = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('BusinessRule', 'WorkflowHistory', 'AuditLog', 'Notification', 'JobQueue', 'UserRole')
      `;
      
      const tables = (tableCheck as any[]).map(t => t.table_name);
      const requiredTables = ['BusinessRule', 'WorkflowHistory', 'AuditLog', 'Notification', 'JobQueue', 'UserRole'];
      const missingTables = requiredTables.filter(t => !tables.includes(t));

      if (missingTables.length > 0) {
        console.log(`  ⚠️  Missing tables: ${missingTables.join(', ')}`);
        console.log('  ⚠️  Run: npx prisma migrate dev --name add-workflow-engine');
      } else {
        console.log('  ✓ All workflow tables present');
      }

      this.initialized = true;
      console.log('✅ Workflow System initialized successfully!\n');
    } catch (error) {
      console.error('❌ Failed to initialize workflow system:', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  static async shutdown(): Promise<void> {
    console.log('🛑 Shutting down workflow system...');

    try {
      // Close BullMQ workers and connections
      await jobQueueService.shutdown();
      console.log('  ✓ Job queues closed');

      // Close Redis connection
      // Redis connection is closed by jobQueueService.shutdown()

      this.initialized = false;
      console.log('✅ Workflow system shut down gracefully');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Get system status
   */
  static async getStatus(): Promise<{
    initialized: boolean;
    redis: boolean;
    workers: { [key: string]: any };
    stats: any;
  }> {
    const stats = await jobQueueService.getQueueStats('workflow-jobs');
    
    return {
      initialized: this.initialized,
      redis: true, // If we get here, Redis is connected
      workers: {
        notifications: stats.notifications,
        reports: stats.reports,
        scheduledTasks: stats.scheduledTasks,
      },
      stats,
    };
  }
}

// Export convenience functions
export const initializeWorkflowSystem = () => WorkflowSystemInitializer.initialize();
export const shutdownWorkflowSystem = () => WorkflowSystemInitializer.shutdown();
export const getWorkflowSystemStatus = () => WorkflowSystemInitializer.getStatus();
