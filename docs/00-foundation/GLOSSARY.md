# Athletic & Technical Glossary

**Status:** CONFIRMED  
**Version:** 1.0  
**Last Updated:** 2026-11-01  
**Owner:** Technical Documentation Engineer  
**Related Documents:** [METRIC_DEFINITIONS.md](../05-domain-logic/METRIC_DEFINITIONS.md)

---

## 1. Athletic & Physiological Terminology
* **ACWR (Acute:Chronic Workload Ratio):** The ratio of training volume/load performed in the past 7 days (acute) divided by the average weekly volume over the past 28 days (chronic).
* **Cadence:** The number of steps taken per minute while running (spm) or revolutions of the pedal crank per minute while cycling (rpm).
* **Cardiovascular Drift:** The gradual increase in heart rate during prolonged steady-state aerobic exercise despite a constant work rate, caused by dehydration and rising core body temperature.
* **Fartlek:** Swedish term for "speed play"—unstructured interval training blending continuous running with intermittent surges of fast efforts.
* **Moving Time:** The duration during an activity where the athlete was actively in motion, excluding stops for traffic lights or breaks.
* **Elapsed Time:** Total clock duration from the start to the end of an activity recording.
* **Pace:** The time required to travel a standard distance, conventionally expressed in minutes and seconds per kilometer (`mm:ss /km`) or per mile.
* **Progressive Overload:** The gradual, systematic increase of stress placed upon the musculoskeletal and cardiovascular systems during training to stimulate physiological adaptation.
* **RPE (Rate of Perceived Exertion):** Subjective scale from 1 (rest) to 10 (maximal effort) measuring perceived exercise intensity.
* **Tempo Run:** Continuous run sustained at the athlete's lactate threshold pace (comfortably hard, sustainable for ~60 minutes in a race setting).
* **Zone 2 (Aerobic Base):** Low-to-moderate intensity training performed below the first ventilatory threshold, building mitochondrial density and fat oxidation efficiency.

## 2. Technical & Architectural Terminology
* **AES-256-GCM:** Advanced Encryption Standard in Galois/Counter Mode; authenticated symmetric encryption providing both confidentiality and data integrity validation.
* **C4 Model:** Context, Container, Component, and Code architectural hierarchy diagramming methodology.
* **CSRF (Cross-Site Request Forgery):** Attack vector mitigated in OAuth 2.0 via a cryptographically random `state` parameter.
* **Heuristic Matching:** Algorithmic rule set that pairs an ingested Strava activity with a scheduled workout based on temporal proximity and sport classification.
* **Idempotency:** Property where an operation can be applied multiple times without altering the result beyond the initial application (e.g. upserting activities by Strava ID).
* **Rate Limiting:** Server-enforced boundaries restricting the frequency of API requests over defined time windows (e.g. Strava's 100 req / 15 min).
* **Token Rotation / Auto-Refresh:** Automated background cycle refreshing short-lived access tokens using long-lived refresh tokens prior to expiration.
