# From Zero to GenLayer: Build an AI Freelancer Escrow DApp

> A practical tutorial that takes you from zero to a fully deployed AI-powered DApp on GenLayer Testnet Bradbury.

---

## What You'll Build

An **AI Freelancer Escrow** where:
- Client posts a job with requirements and payment
- Freelancer submits their work as a URL
- AI validators **fetch the URL live** and judge if work meets requirements
- Verdict stored permanently on-chain — no human, no company, no middleman

This is impossible on Ethereum. It's native to GenLayer.

**Time:** ~45 minutes
**Level:** Beginner to Intermediate

---

## Part 1: Understanding GenLayer

### What Makes GenLayer Different?

| | Ethereum | GenLayer |
|---|---|---|
| Language | Solidity | Python |
| Logic | Deterministic only | AI + Web access |
| Data | On-chain only | Fetches live web data |
| Decisions | Math only | Subjective AI judgment |

- **Bitcoin** → Trustless money
- **Ethereum** → Trustless code
- **GenLayer** → Trustless decisions

### Optimistic Democracy

1. One validator (the **Leader**) executes the contract
2. Other validators **independently** run the same contract
3. They compare results using the **Equivalence Principle**
4. If enough validators agree → result committed on-chain

### The Equivalence Principle

LLMs give slightly different outputs each time. Validators don't check exact equality — they check **structural equivalence**. We use `json.dumps(parsed, sort_keys=True)` so validators agree on the same JSON structure.

---

## Part 2: Setup

### Step 1 — Get MetaMask
1. Install [MetaMask](https://metamask.io)
2. Create a wallet and save your seed phrase

### Step 2 — Join the Builder Portal
1. Go to [portal.genlayer.foundation](https://portal.genlayer.foundation)
2. Connect MetaMask
3. Add the GenLayer Testnet chain
4. Get testnet GEN tokens

### Step 3 — Open the Studio
Go to [studio.genlayer.com](https://studio.genlayer.com)

> Use a desktop browser. Mobile browsers add hidden characters that break the contract schema parser.

---

## Part 3: The Intelligent Contract

Create a new file in the Studio and paste the contract from `contract/freelancer_escrow.py`.

### Key Parts Explained

**Storage Variables**
All fields declared as class annotations, all initialized in `__init__`. Required for schema loading.

**`submit_work()`**
Freelancer calls this with their deliverable URL. Sets status to "submitted".

**`evaluate_work()` — The AI Magic**
```python
def check() -> str:
    page = gl.nondet.web.get(deliverable)      # fetch URL live
    content = page.body.decode("utf-8")[:3000]
    result = gl.nondet.exec_prompt(task)        # AI judges the work
    return json.dumps(json.loads(result), sort_keys=True)

output = gl.eq_principle.strict_eq(check)      # validators reach consensus
This is what makes GenLayer unique:
gl.nondet.web.get() → fetches live URL on-chain
gl.nondet.exec_prompt() → calls the AI
gl.eq_principle.strict_eq() → consensus across validators
