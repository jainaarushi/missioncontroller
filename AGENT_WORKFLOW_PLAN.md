# AgentStudio: Real Agent Workflows Plan

> **Goal:** Transform agents from "fancy prompt → markdown" into real tool-using, multi-step workflows inspired by awesome-llm-apps patterns, adapted for our Next.js + Vercel AI SDK stack.

---

## The Problem

Currently, even agents with "tools" mostly just call `generateText()` once with a system prompt. The tools exist but:
- No agent actually chains tool results into multi-step reasoning
- No agent does iterative research (search → read → search again)
- No agent uses structured output (Pydantic/Zod schema for typed responses)
- No multi-agent coordination (agent A → agent B → agent C)
- DuckDuckGo (free, no key) isn't available — only Tavily (requires paid key)

awesome-llm-apps agents work because they have **real tool loops**: the LLM decides when to call tools, reads results, calls more tools, then synthesizes. Our `maxSteps` is set to 3-8 but the tools are underutilized.

---

## Architecture: What Needs to Change

### Current Flow
```
User → title + description → generateText(systemPrompt, userMessage, tools?) → markdown
```

### New Flow
```
User → structured input (agent form) →
  Step 1: generateText(researchPrompt, tools=[search, scrape]) → raw data
  Step 2: generateText(analysisPrompt, context=rawData, tools=[calculator]) → structured analysis
  Step 3: generateText(synthesisPrompt, context=analysis) → polished output
```

### Key Architectural Changes

#### 1. Add DuckDuckGo Search (Free, No Key)
awesome-llm-apps uses DuckDuckGo as the default search — free, no API key. This means ALL research agents work out of the box without Tavily.

**File:** `src/lib/ai/tools/duckduckgo.ts` (NEW)
- Use DuckDuckGo's HTML search (no official API, but `lite.duckduckgo.com` is scrapable)
- Or use `duckduckgo-search` npm package
- Fallback: Tavily if user has key, else DuckDuckGo
- This unblocks ALL research agents for free-tier users

#### 2. Multi-Step Tool Loops (Agentic Execution)
The core pattern from awesome-llm-apps is letting the LLM **decide** when to call tools. Currently we pass tools but `maxSteps: 3` limits iterations. For research agents, we need `maxSteps: 10+`.

**Change in `runPipeline()`:** Instead of treating `isCore` as "one generateText call with tools", make it a proper agentic loop:
- Let the LLM call tools iteratively until it decides it has enough data
- Stream progress updates as tools are called
- Cap at `maxSteps` per pipeline step (configurable per agent)

#### 3. Structured Output with Zod Schemas
awesome-llm-apps uses Pydantic models for typed output. We use Zod + Vercel AI SDK's `experimental_output` for the same effect.

**File:** `src/lib/ai/schemas/` (NEW directory)
- Define Zod schemas for agent outputs (e.g., `InvestmentReport`, `TravelItinerary`)
- Agents that have custom output renderers MUST produce structured data
- This eliminates fragile regex parsing in output renderers

#### 4. Context Chaining Between Pipeline Steps
Currently `isCore2` just gets `draftOutput` as a string. New approach: pass structured context.

```typescript
// Pipeline step now carries context from previous steps
interface StepContext {
  rawData?: unknown;       // Tool call results
  draftOutput?: string;    // Text draft
  structuredData?: unknown; // Parsed/structured data
}
```

---

## Agent-by-Agent Workflow Upgrades

### Tier 1: High-Impact Agents (Tool-Heavy, Impressive Results)

#### 1. Investment Analyst
**awesome-llm-apps pattern:** `YFinanceTools` → stock_price, analyst_recommendations, fundamentals, company_news → synthesize into report

**Current:** Has `finance-data` tool but only fetches one data type per call.

**Upgrade:**
- System prompt tells LLM to call `get_stock_data` multiple times (quote + fundamentals + history for each ticker)
- Add `web_search` tool for news/sentiment (DuckDuckGo, free)
- Increase `maxSteps` from 8 → 15
- Add structured output schema: `{ tickers: [...], metrics: {...}, recommendation: string, risk: number }`
- `isCore2` step synthesizes all tool data into formatted report

```
Step 1: "Gather data" → LLM calls get_stock_data(AAPL, quote), get_stock_data(AAPL, fundamentals),
        get_stock_data(AAPL, history), web_search("AAPL news 2025") — iteratively
Step 2: "Analyze & recommend" → Gets all tool results, produces structured report
```

#### 2. Deep Research
**awesome-llm-apps pattern:** Firecrawl deep_research tool → multi-query search from different angles → deduplicate → synthesize with citations

**Current:** Has `deep-research` and `web-search` tools. The deep-research tool does multi-query internally.

**Upgrade:**
- Replace single `deep-research` tool call with LLM-driven iterative search
- LLM reads search results, identifies gaps, searches again with refined queries
- Add `web_scrape` tool for full article reading when search snippets aren't enough
- Track sources automatically for citation
- `maxSteps: 15` to allow thorough research
- Add DuckDuckGo fallback so it works without Tavily

```
Step 1: "Research" → LLM searches 3-5 initial queries, reads results, identifies gaps,
        searches 3-5 more refined queries, scrapes key articles — 10-15 tool calls
Step 2: "Synthesize" → Produces structured report with [source] citations
```

#### 3. Competitor Intelligence
**awesome-llm-apps pattern:** ExaTools/Perplexity → search each competitor → scrape pricing pages → structured comparison matrix → SWOT

**Upgrade:**
- LLM searches for each competitor individually (company info, pricing, features, reviews)
- Scrapes competitor websites for current pricing/feature data
- Builds comparison matrix with real data
- Produces SWOT analysis grounded in actual findings
- `maxSteps: 15`

#### 4. Data Analyst
**awesome-llm-apps pattern:** DuckDB/SQL queries → explore schema → run analytical queries → visualize

**Current:** Has `data-query` (alasql) tool.

**Upgrade:**
- LLM first explores the data (SELECT * FROM uploaded_data LIMIT 5, column types, row count)
- Then runs analytical queries iteratively based on user's question
- Each query result informs the next query
- `maxSteps: 12` for iterative exploration
- Structured output: `{ insights: [...], tables: [...], metrics: [...] }`

#### 5. Journalist
**awesome-llm-apps pattern:** SerpAPI search → Newspaper4k article extraction → multi-source synthesis → inverted pyramid article

**Upgrade:**
- Search for the story from multiple angles (news, opinion, data)
- Scrape 2-3 key articles for full context (not just search snippets)
- Cross-reference facts across sources
- Write article with inline source references
- `maxSteps: 10`

---

### Tier 2: Medium-Impact Agents (Enhanced with Search)

These agents currently have no tools but would benefit enormously from web search:

#### 6. Startup Trend Analyst → Add DuckDuckGo search
- Search for recent funding rounds, product launches, market reports
- Currently guesses from training data — with search, gets real current data

#### 7. Fact Checker → Add DuckDuckGo search
- Search for claims to verify, find primary sources
- Currently can only reason from training data — useless for recent claims

#### 8. Academic Researcher → Add DuckDuckGo search
- Search for recent papers, citations, research findings
- Could also search ArXiv API directly

#### 9. Strategy Advisor → Add DuckDuckGo search
- Search for market data, competitor info, industry trends
- Strategic advice grounded in current market reality

#### 10. Travel Planner → Enhanced search
- Already has web-search, but upgrade to search for:
  - Real hotel/restaurant names and ratings
  - Current prices and availability info
  - Local events during travel dates
  - Weather patterns for the dates

#### 11. Sales Rep → Enhanced search
- Already has web-search, but upgrade to:
  - Deep-dive prospect company (recent news, funding, tech stack)
  - Find decision-maker LinkedIn profiles
  - Research pain points specific to their industry

#### 12. Recruitment Agent → Enhanced search
- Search for salary benchmarks by role/location
- Research company culture and Glassdoor reviews
- Find similar job postings for competitive analysis

---

### Tier 3: Pure-LLM Agents (Better Prompts, No Tools Needed)

These 30+ entertainment/creative agents don't need tools — they need better prompts:

**Approach:** Upgrade system prompts with:
- More specific output structure instructions
- Better few-shot examples embedded in prompts
- Persona consistency improvements
- Output length/format guidelines

**No code changes needed** — just update `src/seed/agents.ts` system prompts.

---

## Implementation Plan

### Phase 1: Free Search for Everyone (DuckDuckGo)
**Impact: Unlocks 10+ agents without any API key**

```
Step 1: CREATE  src/lib/ai/tools/duckduckgo.ts          — DuckDuckGo search tool
Step 2: EDIT    src/lib/ai/tools/registry.ts             — Add duckduckgo to registry
Step 3: EDIT    src/app/api/tasks/[id]/run/route.ts      — Smart search: DuckDuckGo free, Tavily if key exists
Step 4: EDIT    src/lib/ai/pipelines.ts                  — Add search to Tier 2 agents (fact-checker, startup-trends, etc.)
```

**DuckDuckGo tool implementation:**
```typescript
// src/lib/ai/tools/duckduckgo.ts
// Uses DuckDuckGo Lite HTML endpoint — no API key needed
// Parse search results from HTML response
// Returns: { results: [{ title, url, snippet }] }
```

**Smart search fallback in run route:**
```typescript
// If agent needs search:
//   1. Use Tavily if user has key (better quality)
//   2. Fall back to DuckDuckGo (free, always works)
// This means research agents work for ALL users
```

### Phase 2: Agentic Tool Loops
**Impact: Agents actually use tools iteratively like awesome-llm-apps**

```
Step 5: EDIT    src/app/api/tasks/[id]/run/route.ts      — Increase maxSteps, add progress streaming
Step 6: EDIT    src/lib/ai/pipelines.ts                  — Per-agent maxSteps config
Step 7: EDIT    agent system prompts (seed/agents.ts)    — Tell agents HOW to use tools iteratively
```

**Key change:** The system prompt must explicitly instruct the LLM to:
- Call tools multiple times to gather comprehensive data
- Read tool results before deciding what to search next
- Synthesize all gathered data into the final response

Example for Investment Analyst:
```
You have access to tools. For each stock ticker:
1. First call get_stock_data with data_type="quote" for current price
2. Then call get_stock_data with data_type="fundamentals" for P/E, revenue, etc.
3. Then call get_stock_data with data_type="history" for 6-month trend
4. Then search the web for recent news about the company
5. After gathering ALL data, write your analysis using the REAL numbers.
Never make up financial data. Always use tool results.
```

### Phase 3: Structured Output Schemas
**Impact: Output renderers get clean data instead of parsing markdown**

```
Step 8:  CREATE  src/lib/ai/schemas/investment.ts        — Zod schema for investment reports
Step 9:  CREATE  src/lib/ai/schemas/research.ts          — Zod schema for research reports
Step 10: CREATE  src/lib/ai/schemas/travel.ts            — Zod schema for itineraries
Step 11: CREATE  src/lib/ai/schemas/comparison.ts        — Zod schema for competitor analysis
Step 12: EDIT    run/route.ts                            — Use experimental_output for schema-based agents
Step 13: EDIT    output renderers                        — Parse JSON instead of regex on markdown
```

**How it works:**
```typescript
// In run route, for agents with schemas:
const result = await generateText({
  model: aiModel,
  system: systemPrompt,
  prompt: userMessage,
  tools: stepTools,
  maxSteps: 15,
  experimental_output: Output.object({ schema: investmentSchema }),
});
// result.experimental_output → typed JSON object
// Store as task.output = JSON.stringify(result.experimental_output)
// Output renderer: JSON.parse(task.output) → render directly
```

### Phase 4: Context Chaining
**Impact: Multi-step pipelines where each step builds on the previous**

```
Step 14: EDIT    run/route.ts                            — Pass structured context between steps
Step 15: EDIT    pipelines.ts                            — Define inter-step context flow
```

Current: `isCore2` gets raw text draft.
New: `isCore2` gets structured tool results + draft, enabling smarter refinement.

### Phase 5: Enhanced Agent Prompts
**Impact: All 56 agents produce better, more specific output**

```
Step 16: EDIT    src/seed/agents.ts                      — Upgraded system prompts for all agents
```

Focus on:
- Tool-use instructions for agents that have tools
- Output structure specifications matching renderer expectations
- Iterative search patterns for research agents
- Better persona consistency for entertainment agents

---

## Priority Order

| Priority | Phase | What | Why |
|----------|-------|------|-----|
| **P0** | Phase 1 | DuckDuckGo search | Unlocks 10+ agents for free users |
| **P0** | Phase 2 | Agentic loops + prompts | Makes tool-using agents actually work |
| **P1** | Phase 5 | Enhanced prompts | All 56 agents improve immediately |
| **P2** | Phase 3 | Structured schemas | Cleaner output rendering |
| **P3** | Phase 4 | Context chaining | Better multi-step quality |

---

## What We're NOT Doing (and Why)

| awesome-llm-apps feature | Why we skip it |
|--------------------------|----------------|
| **Agno/Phidata framework** | We use Vercel AI SDK — same capabilities, better for Next.js |
| **CrewAI/agency_swarm** | Over-engineered for our use case — sequential pipeline is sufficient |
| **Vector databases (PgVector)** | No RAG needed — agents work on user input, not stored documents |
| **Code execution (E2B)** | Security risk in multi-tenant platform — not worth it yet |
| **Streamlit UI** | We have a better UI already |
| **Local LLM support (Ollama)** | Out of scope — cloud-first product |
| **MCP protocol** | No clear use case yet — tools are sufficient |

---

## Expected Outcomes

**Before:** User asks Investment Analyst to analyze AAPL → gets generic essay about Apple from LLM training data

**After:** Investment Analyst calls `get_stock_data(AAPL, quote)`, `get_stock_data(AAPL, fundamentals)`, `get_stock_data(AAPL, history)`, `web_search("AAPL news March 2025")` → produces report with REAL current price ($XXX), P/E ratio (XX.X), 6-month trend chart data, and recent news

**Before:** Deep Research on "AI regulation in Europe" → generic essay

**After:** Deep Research searches 5 queries, reads 10+ sources, scrapes 3 key articles → produces structured report with 15 cited sources and current 2025 data

**Before:** Fact Checker asked to verify a claim → reasons from training data (possibly outdated)

**After:** Fact Checker searches for the claim, finds primary sources, cross-references → verdict with linked evidence
