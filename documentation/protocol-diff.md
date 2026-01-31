# Protocol Diff 

The Protocol Diff isn't just a "compare" tool—it is a critical piece of infrastructure designed to solve the "Protocol Amendment" pain point. Scientific workflows are plagued by subtle changes that have massive downstream regulatory and financial impacts.

## 1. High-Level Concept: The "Clinical Delta"

A standard diff tool (like GitHub) focuses on lines of code. A **Protocol Diff** focuses on **Scientific Variables**. It must identify changes in inclusion criteria, dosage, and biomarker thresholds across different versions of a study.


## 2. Strategic Requirements

- Semantic Grouping: Instead of a flat list, group changes by domain (e.g., "Patient Eligibility," "Primary Endpoints," "Safety Markers").
- Impact Analysis: Use visual cues to indicate the direction of a change. For example, tightening a biomarker threshold (making it harder to hit) should be flagged differently than loosening it.
- Information Density Control: Provide a "Show Only Changes" toggle to eliminate the "noise" of hundreds of unchanged scientific parameters.
- Persistent Context: Use sticky headers and synchronized scrolling so that when a researcher is deep in a 500-row biomarker list, they always know which two versions they are comparing.
- Audit-Ready Metadata: Display who changed the value and why (linked to the "Amendment Reason" field in your PocketBase schema).


The diff engine should flatten the comparison into a scannable array that the Vue.js template can iterate over with high performance.

| Field | Old Value | New Value | Insight / Status |
| ------ | ----------- | ----------- | ------------------ |
| HbA1c Threshold | < 7.0% | < 6.5% | Tightened (Increased stringency) |
| Patient Age | 18–65 | 18–75 | Expanded (Improved recruitment) |
| Phase | II | II | Unchanged |


Since we are using Tailwind CSS, we should avoid standard "red/green" diff colors, which can be confusing in a clinical context where red might mean "Safety Alert." We should use a more sophisticated, "scientific" palette (Indigo/Slate/Amber).

## UI tools 

Use Nuxt UI for the infrastructure and Tailwind for the insight.

Use Nuxt UI for: The Sidebar, Navigation, Modals for "Adding a Biomarker," and the primary Data Table container.

Use Plain Tailwind for: The custom "Diffing" logic, such as the specific red/green/amber highlights and custom sparklines that represent scientific trends.

