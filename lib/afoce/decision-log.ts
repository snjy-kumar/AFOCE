import type { AutonomousDecision, DecisionLogInsert } from "@/lib/afoce/types";

export function createDecisionLogInsert({
  decision,
  orgId,
  actorId,
  entityId,
}: {
  decision: AutonomousDecision;
  orgId: string;
  actorId: string | null;
  entityId: string;
}): DecisionLogInsert {
  return {
    org_id: orgId,
    actor_id: actorId,
    event_type: decision.eventType,
    entity_type: decision.entityType,
    entity_id: entityId,
    outcome: decision.outcome,
    confidence: decision.confidence,
    matched_policy_ids: decision.matchedPolicyIds,
    rationale: decision.rationale,
    facts: decision.facts,
    actions: decision.actions,
  };
}

export function summarizeDecision(decision: AutonomousDecision): Record<string, unknown> {
  return {
    event_type: decision.eventType,
    outcome: decision.outcome,
    confidence: decision.confidence,
    matched_policy_ids: decision.matchedPolicyIds,
    requires_human: decision.requiresHuman,
    rationale: decision.rationale,
  };
}
