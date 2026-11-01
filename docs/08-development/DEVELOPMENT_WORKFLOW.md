# Engineering Development Workflow & SDLC

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Engineering Lead & Scrum Master  
**Related Documents:** [CODING_AGENT_RULES.md](./CODING_AGENT_RULES.md)

---

## 1. Feature Lifecycle Protocol
1. **Requirements Review:** Inspect PRD and feature specification in `/docs/01-product/`.
2. **Schema & Types Check:** Ensure interfaces in `src/types/index.ts` and `schema.sql` represent required fields.
3. **Domain Implementation:** Write testable pure logic in `src/lib/`.
4. **API Integration:** Implement or update Route Handlers in `src/app/api/`.
5. **Presentation Layer:** Build responsive React client components adhering to `ANTI_AI_SLOP.md`.
6. **Verification Gate:** Pass `npm run build` and review Definition of Done checklist.
