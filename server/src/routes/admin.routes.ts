/**
 * Admin Routes
 * Routes for administrative functions (workflow rules, settings, etc.)
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { ruleManagementService } from '../services/workflow/rule-engine.service.js';
import { sendSuccess } from '../utils/response.js';
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
import type { RuleType, EntityType, RuleAction, RuleSeverity } from '@prisma/client';
import type { RuleConditionAST, RuleActionParams } from '../types/workflow.types.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get all workflow rules
 * GET /api/admin/workflow-rules
 * Query params: entityType, isActive
 */
router.get('/workflow-rules', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('User ID not found');

    const { entityType, isActive } = req.query;
    
    const filters: any = {};
    if (entityType) filters.entityType = String(entityType);
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const rules = await ruleManagementService.listRules(filters);
    sendSuccess(res, rules);
  } catch (error) {
    next(error);
  }
});

/**
 * Create workflow rule
 * POST /api/admin/workflow-rules
 */
router.post('/workflow-rules', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('User ID not found');

    const { 
      name, 
      description, 
      ruleType,
      entityType,
      condition, 
      action,
      actionParams,
      severity,
      priority 
    } = req.body;
    
    const rule = await ruleManagementService.createRule({
      name,
      description,
      ruleType: (ruleType || 'VALIDATION') as RuleType,
      entityType: entityType as EntityType,
      condition: condition as RuleConditionAST,
      action: action as RuleAction,
      actionParams: actionParams as RuleActionParams,
      severity: (severity || 'WARNING') as RuleSeverity,
      priority: priority || 100,
    }, userId);

    sendSuccess(res, rule, 201);
  } catch (error) {
    next(error);
  }
});

/**
 * Update workflow rule
 * PATCH /api/admin/workflow-rules/:id
 */
router.patch('/workflow-rules/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('User ID not found');

    const { id } = req.params;
    const updates = req.body;
    
    const rule = await ruleManagementService.updateRule(id, updates);
    sendSuccess(res, rule);
  } catch (error) {
    next(error);
  }
});

/**
 * Delete workflow rule
 * DELETE /api/admin/workflow-rules/:id
 */
router.delete('/workflow-rules/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('User ID not found');

    const { id } = req.params;
    
    await ruleManagementService.deleteRule(id);
    sendSuccess(res, { message: 'Rule deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
