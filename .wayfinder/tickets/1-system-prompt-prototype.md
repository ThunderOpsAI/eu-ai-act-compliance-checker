## Question

**How do we structure the LLM system prompt and context to ensure accurate JSON output without blowing the context window or hallucinating articles?**

- We need to encode the four risk tiers, the Article 5 prohibited list, and the Annex III category list.
- We need to enforce structured JSON output: `{risk_tier, matched_category, matched_article, confidence, rationale}`.
- Do we inject the raw text of the Act, or a dense summary?
- How do we inject the configurable "last verified against the Act" date?

**Type**: `wayfinder:prototype`
**Assignee**: antigravity

## Resolution

- **Strategy:** We will use a dense summary of Article 5 and Annex III rather than the raw legal text. This minimizes token usage/latency, prevents "needle in a haystack" hallucinations, and covers 95% of startup use cases.
- **Configurable Date:** We will use template injection (`{{VERIFIED_DATE}}`) in the Python API to pass the config value into the prompt at runtime.
- **Output:** The prompt explicitly enforces the requested JSON structure and forbids conversational wrapping.
- **Prototype Asset:** [prompt-prototype-v1.md](../assets/prompt-prototype-v1.md)

*Status: Closed*
