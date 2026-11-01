# Athletic Metric Definitions & Precise Mathematical Formulas

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Principal Software Architect & QA Architect  
**Related Documents:** [PERFORMANCE_METRICS.md](./PERFORMANCE_METRICS.md)

---

## 1. Metric Specification Directory

### 1.1 Running Pace ($P_{\text{sec/km}}$)
* **Definition:** Time in seconds required to run one kilometer.
* **Formula:**
  $$P_{\text{sec/km}} = \frac{1000}{v_{\text{mps}}}$$
* **Display Format:** `MM:SS /km`
* **Data Source:** Strava `average_speed` (meters per second).
* **Missing Data:** If $v_{\text{mps}} \le 0$, render `--:-- /km`.

### 1.2 Distance Delta ($\Delta D$)
* **Definition:** Actual distance minus prescribed target distance.
* **Formula:**
  $$\Delta D = D_{\text{actual}} - D_{\text{target}} \quad (\text{meters})$$

### 1.3 Pace Delta ($\Delta P$)
* **Definition:** Actual pace seconds minus target pace seconds.
* **Formula:**
  $$\Delta P = P_{\text{actual}} - P_{\text{target}} \quad (\text{seconds / km})$$
* **Rule:** Negative value represents faster execution than prescribed.

### 1.4 Completion Percentage ($C$)
* **Definition:** Ratio of actual distance to planned distance.
* **Formula:**
  $$C = \left( \frac{D_{\text{actual}}}{D_{\text{target}}} \right) \times 100\%$$

### 1.5 Weekly Volume Change Percentage ($\Delta V$)
* **Definition:** Percentage difference in distance between current week and previous week.
* **Formula:**
  $$\Delta V = \left( \frac{V_{\text{current}} - V_{\text{prev}}}{V_{\text{prev}}} \right) \times 100\%$$
