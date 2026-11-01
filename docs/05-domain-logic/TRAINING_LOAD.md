# Training Load & Workload Ratio Specifications

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Sports Science Advisor  
**Related Documents:** [METRIC_DEFINITIONS.md](./METRIC_DEFINITIONS.md)

---

## 1. Acute:Chronic Workload Ratio (ACWR)
* **Acute Load ($L_{\text{acute}}$):** Cumulative distance over the past 7 days.
* **Chronic Load ($L_{\text{chronic}}$):** Average weekly distance over the past 28 days ($\text{Sum}_{28d} / 4$).
* **Calculation:**
  $$\text{ACWR} = \frac{L_{\text{acute}}}{L_{\text{chronic}}}$$

### 2. Risk Zone Classifications
* $\text{ACWR} < 0.8$: **Under-training / Tapering Zone** (Fitness decaying or race-week taper).
* $0.8 \le \text{ACWR} \le 1.3$: **Optimal Progression Zone** (Safe progressive overload).
* $1.3 < \text{ACWR} \le 1.5$: **Caution Zone** (Elevated fatigue accumulation).
* $\text{ACWR} > 1.5$: **Danger Zone** (Overload spike; significant increase in soft tissue injury likelihood).
