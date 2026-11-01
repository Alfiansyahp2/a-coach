# Performance Budgets & Latency SLAs

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Performance Engineer & Principal Architect  
**Related Documents:** [NON_FUNCTIONAL_REQUIREMENTS.md](../01-product/NON_FUNCTIONAL_REQUIREMENTS.md)

---

## 1. Quantitative Budgets

| Metric | Target SLA | Critical Threshold |
| :--- | :--- | :--- |
| **API Response Time (Dashboard)** | $< 150\text{ ms}$ | $> 300\text{ ms}$ |
| **First Contentful Paint (FCP)** | $< 800\text{ ms}$ | $> 1500\text{ ms}$ |
| **Cumulative Layout Shift (CLS)** | $< 0.05$ | $> 0.10$ |
| **JS Bundle Size (First Load)** | $< 120\text{ kB}$ | $> 200\text{ kB}$ |
| **Chart Re-render Frame Rate** | $\ge 55\text{ fps}$ | $< 30\text{ fps}$ |
