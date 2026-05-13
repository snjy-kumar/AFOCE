# AFOCE Realignment Audit

This audit tags the current codebase against the product goal: an adaptive finance operations and compliance engine that acts automatically from policy and routes only exceptions to humans.

## Keep

These areas support the target architecture and should be reused.

| Area | Status | Why |
| --- | --- | --- |
| `app/api/clients` | Keep | Client/vendor records are source facts for invoices, PAN validation, and compliance. |
| `app/api/invoices` | Keep, then adapt | Invoice records are needed, but status changes should become policy-driven actions. |
| `app/api/expenses` | Keep, then adapt | This is the first autonomous decision slice. |
| `app/api/bank-lines` | Keep, then adapt | Bank lines are finance events for reconciliation decisions. |
| `app/api/reports` | Keep, then adapt | VAT and audit reports remain compliance outputs. |
| `app/api/notifications` | Keep | Useful for exception routing and decision updates. |
| `lib/supabase` | Keep | Supabase SSR auth is a useful foundation. |
| `lib/utils/audit.ts` | Keep | Mutation audit logs remain required. |
| `lib/utils/validation.ts` | Keep, then extend | Zod validation is the right boundary pattern. |
| `supabase/schema.sql` | Keep, then extend | RLS and tenant tables are a useful base. |

## Replace

These areas express the old dashboard/workflow product and should be replaced by engine-first behavior.

| Area | Status | Replacement Direction |
| --- | --- | --- |
| `lib/utils/workflow.ts` | Replace gradually | Move hardcoded approvals and matching into `lib/afoce/*` policy and decision modules. |
| `app/dashboard/queues/page.tsx` | Replace language and filters | Treat queues as exception queues, not normal work queues. |
| `app/dashboard/policies/page.tsx` | Replace shallow model | Show executable conditions, actions, priority, version, and decision impact. |
| `components/modals/PolicyModal.tsx` | Replace shallow form | Capture rule conditions/actions instead of only name/category/description. |
| `docs/FEATURES.md` | Replace progressively | Rewrite user-facing docs around autonomous operations and exception handling. |
| `COMPLETION.md` | Replace/quarantine | It overstates completion and conflicts with the real product goal. |

## Quarantine

These areas are not part of the target product and should not guide future architecture.

| Area | Status | Reason |
| --- | --- | --- |
| `app/todos/page.tsx` | Quarantine | Scaffold/demo route unrelated to AFOCE. Do not expand it. Remove after confirming no dependency. |
| `lib/services/mock-finance-service.ts` | Quarantine | Useful only for demos; do not use as domain truth. |
| `lib/demo-data.ts` and `lib/mock-data.ts` | Quarantine | Demo data should not drive product behavior or tests for policy logic. |
| `.qoder/skills/*` deleted entries | Quarantine | Historical tool config, not part of product behavior. |

## Delete Later

Deletion should happen after confirming route usage and protecting any user edits.

| Area | Condition For Deletion |
| --- | --- |
| `app/todos/page.tsx` | No navigation, tests, or docs depend on it. |
| Old completion claims | Replaced by current roadmap/status docs. |
| Demo-only mock services | Real APIs and test factories replace them. |

## Realignment Rule

New work should enter through the autonomous loop:

1. Capture a finance event.
2. Evaluate executable policies.
3. Produce an explainable decision.
4. Execute safe actions automatically.
5. Route only exceptions to humans.
6. Persist audit and decision logs.

Code that does not fit this loop can still exist as infrastructure, but it should not define the domain model.
