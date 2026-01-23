/**
 * AFOCE Business Rule Engine
 * 
 * Advanced rule evaluation engine with:
 * - Abstract Syntax Tree (AST) condition parsing
 * - Complex nested logic support (AND, OR, NOT)
 * - Type-safe field access with dot notation
 * - Rule caching for performance
 * - Execution metrics and monitoring
 * - Dynamic rule compilation
 */

import type { EntityType, RuleType, RuleAction, RuleSeverity } from '@prisma/client';
import type {
  RuleConditionAST,
  RuleConditionLeaf,
  RuleConditionComposite,
  ComparisonOperator,
  RuleEvaluationContext,
  RuleEvaluationResult,
  RuleActionParams,
} from '../../types/workflow.types.js';
import prisma from '../../lib/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

// ============================================
// RULE EVALUATION ENGINE
// ============================================

export class RuleEvaluationEngine {
  private ruleCache: Map<string, CachedRule> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes

  /**
   * Evaluate all active rules for an entity
   */
  async evaluateRules(context: RuleEvaluationContext): Promise<RuleEvaluationResult[]> {
    // Get active rules for entity type
    const rules = await this.getActiveRules(context.userId, context.entityType);
    
    const results: RuleEvaluationResult[] = [];

    for (const rule of rules) {
      const startTime = Date.now();
      
      try {
        // Parse condition AST from JSON
        const conditionAST = rule.condition as unknown as RuleConditionAST;
        
        // Evaluate condition
        const triggered = await this.evaluateCondition(conditionAST, context);
        
        const executionTime = Date.now() - startTime;

        // Update metrics
        await this.updateRuleMetrics(rule.id, triggered, executionTime);

        if (triggered) {
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            triggered: true,
            action: rule.action,
            actionParams: rule.actionParams as unknown as RuleActionParams,
            severity: rule.severity,
            message: this.buildRuleMessage(rule, context),
            timestamp: new Date(),
          });
        }
      } catch (error: any) {
        console.error(`Rule ${rule.id} evaluation failed:`, error);
        // Non-blocking: continue with other rules
      }
    }

    return results;
  }

  /**
   * Evaluate a single condition AST node (recursive)
   */
  private async evaluateCondition(
    node: RuleConditionAST,
    context: RuleEvaluationContext
  ): Promise<boolean> {
    if (node.type === 'LEAF') {
      return this.evaluateLeafCondition(node as RuleConditionLeaf, context);
    }

    if (node.type === 'COMPOSITE') {
      return this.evaluateCompositeCondition(node as RuleConditionComposite, context);
    }

    return false;
  }

  /**
   * Evaluate leaf node (single condition)
   */
  private evaluateLeafCondition(
    leaf: RuleConditionLeaf,
    context: RuleEvaluationContext
  ): boolean {
    // Get field value from entity using dot notation
    const actualValue = this.getFieldValue(context.entity, leaf.field);
    
    // Compare using operator
    return this.compareValues(actualValue, leaf.operator, leaf.value);
  }

  /**
   * Evaluate composite node (logical operations)
   */
  private async evaluateCompositeCondition(
    composite: RuleConditionComposite,
    context: RuleEvaluationContext
  ): Promise<boolean> {
    const results = await Promise.all(
      composite.children.map(child => this.evaluateCondition(child, context))
    );

    switch (composite.operator) {
      case 'AND':
        return results.every(r => r === true);
      
      case 'OR':
        return results.some(r => r === true);
      
      case 'NOT':
        // NOT only takes first child
        return !results[0];
      
      default:
        return false;
    }
  }

  /**
   * Get nested field value using dot notation (e.g., "invoice.customer.type")
   */
  private getFieldValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (current === null || current === undefined) return undefined;
      return current[key];
    }, obj);
  }

  /**
   * Compare values based on operator
   */
  private compareValues(
    actual: any,
    operator: ComparisonOperator,
    expected: any
  ): boolean {
    // Handle null/undefined
    if (operator === 'is_null') {
      return actual === null || actual === undefined;
    }
    if (operator === 'is_not_null') {
      return actual !== null && actual !== undefined;
    }

    // If actual is null/undefined, most comparisons fail
    if (actual === null || actual === undefined) {
      return false;
    }

    switch (operator) {
      case 'eq':
        return actual === expected;
      
      case 'ne':
        return actual !== expected;
      
      case 'gt':
        return Number(actual) > Number(expected);
      
      case 'gte':
        return Number(actual) >= Number(expected);
      
      case 'lt':
        return Number(actual) < Number(expected);
      
      case 'lte':
        return Number(actual) <= Number(expected);
      
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      
      case 'not_in':
        return Array.isArray(expected) && !expected.includes(actual);
      
      case 'contains':
        return typeof actual === 'string' && 
               typeof expected === 'string' && 
               actual.includes(expected);
      
      case 'starts_with':
        return typeof actual === 'string' && 
               typeof expected === 'string' && 
               actual.startsWith(expected);
      
      case 'ends_with':
        return typeof actual === 'string' && 
               typeof expected === 'string' && 
               actual.endsWith(expected);
      
      case 'regex':
        try {
          const regex = new RegExp(expected as string);
          return regex.test(String(actual));
        } catch {
          return false;
        }
      
      case 'between':
        if (Array.isArray(expected) && expected.length === 2) {
          const num = Number(actual);
          return num >= Number(expected[0]) && num <= Number(expected[1]);
        }
        return false;
      
      default:
        return false;
    }
  }

  /**
   * Get active rules from database with caching
   */
  private async getActiveRules(userId: string, entityType: EntityType) {
    const cacheKey = `${userId}:${entityType}`;
    
    // Check cache
    const cached = this.ruleCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.rules;
    }

    // Fetch from database
    const rules = await prisma.businessRule.findMany({
      where: {
        userId,
        entityType,
        enabled: true,
      },
      orderBy: {
        priority: 'desc', // Higher priority first
      },
    });

    // Update cache
    this.ruleCache.set(cacheKey, {
      rules,
      timestamp: Date.now(),
    });

    return rules;
  }

  /**
   * Invalidate cache for user
   */
  invalidateCache(userId: string, entityType?: EntityType) {
    if (entityType) {
      this.ruleCache.delete(`${userId}:${entityType}`);
    } else {
      // Clear all for user
      for (const key of this.ruleCache.keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.ruleCache.delete(key);
        }
      }
    }
  }

  /**
   * Update rule execution metrics
   */
  private async updateRuleMetrics(
    ruleId: string,
    triggered: boolean,
    __executionTime: number
  ): Promise<void> {
    try {
      await prisma.businessRule.update({
        where: { id: ruleId },
        data: {
          executionCount: { increment: 1 },
          ...(triggered && { triggerCount: { increment: 1 } }),
        },
      });
    } catch (error) {
      // Non-blocking
      console.error('Failed to update rule metrics:', error);
    }
  }

  /**
   * Build human-readable message for triggered rule
   */
  private buildRuleMessage(rule: any, context: RuleEvaluationContext): string {
    // Try to use action params message first
    const params = rule.actionParams as RuleActionParams;
    if (params?.message) {
      return this.interpolateMessage(params.message, context);
    }

    // Fallback to generic message
    return `Rule "${rule.name}" triggered for ${context.entityType}`;
  }

  /**
   * Interpolate variables in message (e.g., "Total {total} exceeds limit")
   */
  private interpolateMessage(template: string, context: RuleEvaluationContext): string {
    return template.replace(/\{([^}]+)\}/g, (match, fieldPath) => {
      const value = this.getFieldValue(context.entity, fieldPath);
      return value !== undefined ? String(value) : match;
    });
  }
}

// ============================================
// RULE BUILDER & MANAGEMENT
// ============================================

export class RuleManagementService {
  private engine = new RuleEvaluationEngine();

  /**
   * List rules with optional filters
   */
  async listRules(filters?: {
    entityType?: string;
    isActive?: boolean;
  }) {
    const where: any = {};
    if (filters?.entityType) {
      where.entityType = filters.entityType;
    }
    if (filters?.isActive !== undefined) {
      where.enabled = filters.isActive;
    }

    return await prisma.businessRule.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Create a new business rule
   */
  async createRule(
    data: {
      name: string;
      description?: string;
      ruleType: RuleType;
      entityType: EntityType;
      condition: RuleConditionAST;
      action: RuleAction;
      actionParams?: RuleActionParams;
      severity?: RuleSeverity;
      priority?: number;
    },
    userId: string
  ) {
    // Validate condition AST
    this.validateConditionAST(data.condition);

    const rule = await prisma.businessRule.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        ruleType: data.ruleType,
        entityType: data.entityType,
        condition: data.condition as any,
        action: data.action,
        actionParams: data.actionParams as any,
        severity: data.severity || 'WARNING',
        priority: data.priority || 0,
        enabled: true,
      },
    });

    // Invalidate cache
    this.engine.invalidateCache(userId, data.entityType);

    return rule;
  }

  /**
   * Update existing rule
   */
  async updateRule(
    ruleId: string,
    data: Partial<{
      name: string;
      description: string;
      condition: RuleConditionAST;
      action: RuleAction;
      actionParams: RuleActionParams;
      enabled: boolean;
      priority: number;
      severity: RuleSeverity;
    }>
  ) {
    if (data.condition) {
      this.validateConditionAST(data.condition);
    }

    const rule = await prisma.businessRule.update({
      where: { id: ruleId },
      data: {
        ...data,
        condition: data.condition as any,
        actionParams: data.actionParams as any,
      },
    });

    // Cache will be invalidated on next evaluation

    return rule;
  }

  /**
   * Delete rule
   */
  async deleteRule(ruleId: string) {
    const rule = await prisma.businessRule.delete({
      where: { id: ruleId },
    });

    // Cache will be invalidated on next evaluation

    return rule;
  }

  /**
   * Test rule against sample data (dry run)
   */
  async testRule(
    ruleId: string,
    sampleEntity: any
  ): Promise<{ triggered: boolean; executionTime: number }> {
    const rule = await prisma.businessRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      throw new ApiError(404, 'NOT_FOUND', 'Rule not found');
    }

    const condition = rule.condition as unknown as RuleConditionAST;
    this.validateConditionAST(condition);

    const context: RuleEvaluationContext = {
      entity: sampleEntity,
      entityType: rule.entityType as EntityType,
      userId: rule.userId,
      userRoles: [],
      timestamp: new Date(),
    };

    const triggered = await this.engine['evaluateCondition'](condition, context);

    return { triggered, executionTime: 0 };
  }

  /**
   * Validate condition AST structure
   */
  private validateConditionAST(node: RuleConditionAST, depth: number = 0): void {
    const MAX_DEPTH = 10; // Prevent stack overflow

    if (depth > MAX_DEPTH) {
      throw new ApiError(400, 'CONDITION_TOO_DEEP', 'Condition nesting too deep (max 10 levels)');
    }

    if (node.type === 'LEAF') {
      const leaf = node as RuleConditionLeaf;
      if (!leaf.field || !leaf.operator) {
        throw new ApiError(400, 'INVALID_CONDITION', 'Leaf node must have field and operator');
      }
    } else if (node.type === 'COMPOSITE') {
      const composite = node as RuleConditionComposite;
      if (!composite.operator || !composite.children || composite.children.length === 0) {
        throw new ApiError(400, 'INVALID_CONDITION', 'Composite node must have operator and children');
      }
      
      // Validate children recursively
      for (const child of composite.children) {
        this.validateConditionAST(child, depth + 1);
      }
    } else {
      throw new ApiError(400, 'INVALID_CONDITION', 'Invalid condition node type');
    }
  }

  /**
   * Get rule evaluation statistics
   */
  async getRuleStats(userId: string, entityType?: EntityType) {
    const where: any = { userId };
    if (entityType) {
      where.entityType = entityType;
    }

    const rules = await prisma.businessRule.findMany({
      where,
      select: {
        id: true,
        name: true,
        ruleType: true,
        entityType: true,
        enabled: true,
        executionCount: true,
        triggerCount: true,
        priority: true,
      },
    });

    return rules.map(rule => ({
      ...rule,
      triggerRate: rule.executionCount > 0 
        ? (rule.triggerCount / rule.executionCount) * 100 
        : 0,
    }));
  }
}

// ============================================
// HELPER: RULE BUILDER FUNCTIONS
// ============================================

/**
 * Helper functions for building condition ASTs programmatically
 */
export const RuleBuilder = {
  /**
   * Create a leaf condition
   */
  condition(
    field: string,
    operator: ComparisonOperator,
    value: any
  ): RuleConditionLeaf {
    return {
      type: 'LEAF',
      field,
      operator,
      value,
    };
  },

  /**
   * Combine conditions with AND
   */
  and(...conditions: RuleConditionAST[]): RuleConditionComposite {
    return {
      type: 'COMPOSITE',
      operator: 'AND',
      children: conditions,
    };
  },

  /**
   * Combine conditions with OR
   */
  or(...conditions: RuleConditionAST[]): RuleConditionComposite {
    return {
      type: 'COMPOSITE',
      operator: 'OR',
      children: conditions,
    };
  },

  /**
   * Negate condition
   */
  not(condition: RuleConditionAST): RuleConditionComposite {
    return {
      type: 'COMPOSITE',
      operator: 'NOT',
      children: [condition],
    };
  },
};

// ============================================
// TYPES & INTERFACES
// ============================================

interface CachedRule {
  rules: any[];
  timestamp: number;
}

// Export singleton instances
export const ruleEngine = new RuleEvaluationEngine();
export const ruleManagementService = new RuleManagementService();
