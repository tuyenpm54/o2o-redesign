# CMS Admin for Restaurant Owners - One-Page PRD

**Date**: 2026-02-21
**Author**: Antigravity
**Status**: Draft

#### Problem
Restaurant owners lack a centralized dashboard to track the performance of their O2O (Online-to-Offline) web applications. Additionally, they cannot easily customize the UI style or toggle specific modular views (like smart suggestions, multi-user ordering, or cross-sales) without developer intervention.

#### Solution
A CMS Admin Dashboard that provides performance statistics and allows owners to configure the UI style and toggle/configure modular views imported from the modular web or single-order-page.

#### Why Now?
- Need to empower restaurant owners with data-driven insights.
- Need to reduce developer bottleneck for simple UI/module configurations.
- Need to support flexible scaling of the O2O platform for various restaurant types.

#### Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Owner Adoption Rate | 0% | 80% |
| Time to configure UI/Modules | Days | Minutes |
| Module Activation | N/A | >2 modules per store |

#### Scope
**In**: 
- Dashboard with performance statistics (orders, revenue, top items).
- UI Style Configuration (colors, fonts, theme).
- Module View Configuration (toggle & reorder):
  - Smart Suggestion Module
  - Multi-user Ordering (Group order for tables)
  - Cross-sale Modules (Value Combos, Flash Sales)
**Out**: 
- Deep integration with third-party POS systems (future phase).
- Advanced analytics with custom query builders.

#### User Flow
```
Login → View Dashboard Stats → Navigate to Settings → Configure UI/Modules → Save & Preview → Publish to production
```

#### Risks
1. **Performance Cost**: Live preview might be heavy → Use minimal standalone components.
2. **Complexity**: Too many configuration options → Start with predefined themes and basic toggles.

#### Timeline
- Design/Planning: Week 1
- Development (Layout & Dashboard): Week 2
- Development (Appearance & Configurator): Week 3
- Development (Module Toggling): Week 4
- Testing & Launch: Week 5
