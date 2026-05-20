# Prism Lab Cocos v0.1 Decisions

## D-01 New Cocos Path, No Old Runtime Mutation
- Decision: implement all new runtime in `cocos-prism-lab/`, do not modify old `minigame/src`.
- Reason: avoid cross-stack coupling and preserve old baseline.

## D-02 Keep Optics Core Engine-Agnostic
- Decision: preserve pure TS core modules for geometry/simulation.
- Reason: enables deterministic unit testing and future engine portability.

## D-03 Prism Lightweight Implementation
- Decision: prism splits into -15/0/+15 degree rays; no full dispersion simulation.
- Reason: meets v0.1 gameplay target without over-architecture.

## D-04 Runtime UI Bootstrap
- Decision: controller/view scripts create fallback UI bindings when editor references are absent.
- Reason: improves resilience of generated scene handoff in code-first workflow.

## D-05 Validator-First Level Gate
- Decision: every level must embed `solution.objects`; release gate requires full validator pass.
- Reason: prevents shipping unsolved or broken levels.

## D-06 Parallel Subagent Delivery + Main-Agent Integration
- Decision: split skeleton/core/ui/spec work across subagents, then integrate and verify centrally.
- Reason: faster throughput while keeping final consistency under one integration authority.
