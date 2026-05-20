# v0.1 Decisions

- Mirror is the only active player tool in v0.1 clear path.
- Prism / concentrator / portable concentrator / hint path are v0.2+ placeholders only.
- Prism splitting and concentrator energy recovery are not implemented in v0.1.
- `RaycastSystem` excludes prism/concentrator hit logic in v0.1 and keeps mirror/wall/target geometry only.
- Screen adaptation uses `src/utils/layout.ts` (`topBar`, `playArea`, `bottomBar`, `dialog`) to place UI and drag bounds.
- Canvas visual direction for v0.1: light gradient background + sparse lines + play area card; no dense debug grid.
- Light distance decays by actual traveled path length.
- Raycast must use real geometry, not fake path animation.
- No ads, login, ranking, payment, backend, or sharing incentives.
- `wx` API is allowed only in `minigame/src/platform/`; `game.js` keeps minimal dist entry require.
