/**
 * Admin Controller - System administration and configuration
 * 
 * Handles:
 * - Workflow rule management (CRUD)
 * - System settings
 * - User management (future)
 */

import type { Response } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
import type { RuleType, RuleAction, RuleSeverity, EntityType } from '../generated/prisma/client.js';
import type { RuleConditionAST, RuleActionParams } from '../types/workflow.types.js';
import { RuleManagementService } from '../services/workflow/rule-engine.service.js';
import { ApiError } from '../middleware/errorHandler.js';

const ruleService = new RuleManagementService();

/**
 * GET /api/admin/workflow-rules
 * List all workflow rules with optional filters
 */
export const listWorkflowRules = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { entityType, isActive } = req.query;

    const filters: any = {};
    if (entityType) {
      filters.entityType = String(entityType);
    }
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const rules = await ruleService.listRules(filters);

    res.json({
      success: true,
      data: rules,
      meta: {
        total: rules.length,
        filtered: !!entityType || isActive !== undefined,
      },
    });
  } catch (error: any) {
    console.error('Failed to list workflow rules:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_RULES_FAILED',
        message: error.message || 'Failed to fetch workflow rules',
      },
    });
  }
};

/**
 * POST /api/admin/workflow-rules
 * Create a new workflow rule
 */
export const createWorkflowRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      description,
      ruleType,
      entityType,
      condition,
      action,
      actionParams,
      severity,
      priority,
    } = req.body;

    // Validate required fields
    if (!name || !ruleType || !entityType || !condition || !action) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Missing required fields: name, ruleType, entityType, condition, action');
    }

    // Validate enums
    const validRuleTypes: RuleType[] = ['APPROVAL', 'VALIDATION', 'COMPLIANCE', 'NOTIFICATION', 'AUTOMATION'];
    const validEntityTypes: EntityType[] = ['INVOICE', 'EXPENSE', 'CUSTOMER', 'VENDOR', 'PAYMENT'];
    const validActions: RuleAction[] = ['REQUIRE_APPROVAL', 'REQUIRE_ATTACHMENT', 'BLOCK_CREATION', 'SHOW_WARNING', 'SEND_NOTIFICATION', 'AUTO_ASSIGN', 'CALCULATE_FIELD'];
    const validSeverities: RuleSeverity[] = ['CRITICAL', 'WARNING', 'INFO'];

    if (!validRuleTypes.includes(ruleType)) {
      throw new ApiError(400, 'INVALID_RULE_TYPE', `Rule type must be one of: ${validRuleTypes.join(', ')}`);
    }
    if (!validEntityTypes.includes(entityType)) {
      throw new ApiError(400, 'INVALID_ENTITY_TYPE', `Entity type must be one of: ${validEntityTypes.join(', ')}`);
    }
    if (!validActions.includes(action)) {
      throw new ApiError(400, 'INVALID_ACTION', `Action must be one of: ${validActions.join(', ')}`);
    }
    if (severity && !validSeverities.includes(severity)) {
      throw new ApiError(400, 'INVALID_SEVERITY', `Severity must be one of: ${validSeverities.join(', ')}`);
    }

    const userId = req.user!.userId; // From authenticate middleware

    const rule = await ruleService.createRule(
      {
        name,
        description,
        ruleType: ruleType as RuleType,
        entityType: entityType as EntityType,
        condition: condition as RuleConditionAST,
        action: action as RuleAction,
        actionParams: actionParams as RuleActionParams,
        severity: severity as RuleSeverity,
        priority: priority ? Number(priority) : undefined,
      },
      userId
    );

    res.status(201).json({
      success: true,
      data: rule,
      message: 'Workflow rule created successfully',
    });
  } catch (error: any) {
    console.error('Failed to create workflow rule:', error);
    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_RULE_FAILED',
          message: error.message || 'Failed to create workflow rule',
        },
      });
    }
  }
};

/**
 * PATCH /api/admin/workflow-rules/:id
 * Update an existing workflow rule
 */
export const updateWorkflowRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      condition,
      action,
      actionParams,
      enabled,
      priority,
      severity,
    } = req.body;

    // Validate at least one field to update
    if (!name && !description && !condition && !action && !actionParams && enabled === undefined && !priority && !severity) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'At least one field must be provided for update');
    }

    // Validate enums if provided
    if (action) {
      const validActions: RuleAction[] = ['REQUIRE_APPROVAL', 'REQUIRE_ATTACHMENT', 'BLOCK_CREATION', 'SHOW_WARNING', 'SEND_NOTIFICATION', 'AUTO_ASSIGN', 'CALCULATE_FIELD'];
      if (!validActions.includes(action)) {
        throw new ApiError(400, 'INVALID_ACTION', `Action must be one of: ${validActions.join(', ')}`);
      }
    }
    if (severity) {
      const validSeverities: RuleSeverity[] = ['CRITICAL', 'WARNING', 'INFO'];
      if (!validSeverities.includes(severity)) {
        throw new ApiError(400, 'INVALID_SEVERITY', `Severity must be one of: ${validSeverities.join(', ')}`);
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (condition) updateData.condition = condition as RuleConditionAST;
    if (action) updateData.action = action as RuleAction;
    if (actionParams) updateData.actionParams = actionParams as RuleActionParams;
    if (enabled !== undefined) updateData.enabled = Boolean(enabled);
    if (priority !== undefined) updateData.priority = Number(priority);
    if (severity) updateData.severity = severity as RuleSeverity;

    const rule = await ruleService.updateRule(id, updateData);

    res.json({
      success: true,
      data: rule,
      message: 'Workflow rule updated successfully',
    });
  } catch (error: any) {
    console.error('Failed to update workflow rule:', error);
    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    } else if (error.code === 'P2025') {
      // Prisma record not found
      res.status(404).json({
        success: false,
        error: {
          code: 'RULE_NOT_FOUND',
          message: 'Workflow rule not found',
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_RULE_FAILED',
          message: error.message || 'Failed to update workflow rule',
        },
      });
    }
  }
};

/**
 * DELETE /api/admin/workflow-rules/:id
 * Delete a workflow rule
 */
export const deleteWorkflowRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    await ruleService.deleteRule(id);

    res.json({
      success: true,
      message: 'Workflow rule deleted successfully',
    });
  } catch (error: any) {
    console.error('Failed to delete workflow rule:', error);
    
    if (error.code === 'P2025') {
      // Prisma record not found
      res.status(404).json({
        success: false,
        error: {
          code: 'RULE_NOT_FOUND',
          message: 'Workflow rule not found',
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_RULE_FAILED',
          message: error.message || 'Failed to delete workflow rule',
        },
      });
    }
  }
};

/**
 * POST /api/admin/workflow-rules/:id/test
 * Test a workflow rule with sample data (dry run)
 */
export const testWorkflowRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { sampleEntity } = req.body;

    if (!sampleEntity) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'sampleEntity is required');
    }

    const result = await ruleService.testRule(id, sampleEntity);

    res.json({
      success: true,
      data: result,
      message: result.triggered ? 'Rule would be triggered' : 'Rule would not be triggered',
    });
  } catch (error: any) {
    console.error('Failed to test workflow rule:', error);
    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'TEST_RULE_FAILED',
          message: error.message || 'Failed to test workflow rule',
        },
      });
    }
  }
};

export default {
  listWorkflowRules,
  createWorkflowRule,
  updateWorkflowRule,
  deleteWorkflowRule,
  testWorkflowRule,
};
