# Platform Change Request (PCR) Template

**PCR ID:** `PCR-YYYYMMDD-short-name`  
**Requester stream:**  
**Owning reviewer:** Platform  
**Status:** proposed / approved / implemented / rejected

## Problem
What cross-cutting problem cannot be solved inside the requesting domain/experience without changing shared Platform/contracts/events?

## Requested shared change
Exact files/contracts/events/configs affected.

## Ownership and contract impact
- contract IDs/versions:
- domains/streams affected:
- DB views/functions/migrations affected:
- Edge Functions affected:
- UI/design/navigation/runtime affected:

## Backward compatibility
Explain why existing consumers keep working. If breaking, specify the parallel v2 contract and migration window.

## Test plan
- local regression tests:
- contract equivalence tests:
- integration smoke:
- production smoke:

## Rollout / feature gate
Required? If yes, define default and rollback behavior. Feature-gate implementation belongs to M4+.

## Rollback
Exact Git/runtime/DB rollback path. Deployed migrations are never edited/reverted destructively.

## Approval
- Platform owner:
- impacted domain owners:
- approved commit/PR:
