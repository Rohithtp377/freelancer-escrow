# ⚖️ AI Freelancer Escrow — GenLayer Intelligent Contract

> A decentralized escrow system where AI validators fetch the freelancer's deliverable live and judge if the work meets requirements — no middleman, no centralized platform, just on-chain AI consensus.

**Built on GenLayer Testnet Bradbury**

---

## 🌟 Why This Is Unique

This project is impossible on Ethereum, Solana, or any traditional blockchain. Here's what makes it special:

- **Live Web Fetch**: AI validators fetch the freelancer's deliverable URL directly on-chain
- **AI Judgment**: Multiple LLM-powered validators independently assess the work quality
- **Optimistic Democracy**: Validators reach consensus — no single point of failure
- **Tamper-proof**: The verdict is stored permanently on-chain, forever auditable
- **Zero Intermediaries**: No Upwork, no Fiverr, no escrow service needed

---

## 🏗️ Project Structure

```
freelancer-escrow/
├── contract/
│   └── freelancer_escrow.py    # GenLayer Intelligent Contract
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   └── App.jsx              # Main UI component
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── TUTORIAL.md                  # Step-by-step tutorial
└── README.md
```

---

## 🚀 Quick Start

### 1. Deploy the Contract

1. Go to [studio.genlayer.com](https://studio.genlayer.com)
2. Paste the contents of `contract/freelancer_escrow.py`
3. Deploy with constructor args:
   - `job_title`: e.g. `"Build a REST API"`
   - `job_requirements`: e.g. `"A working Node.js REST API with CRUD endpoints, hosted on GitHub"`
   - `payment_amount`: e.g. `"500 USDC"`
4. Copy the deployed contract address

### 2. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), paste your contract address and connect MetaMask.

### 3. Test the Flow

1. **Post Job** — deploy the contract as the client
2. **Submit Work** — connect with a different wallet, paste a GitHub repo URL
3. **Evaluate** — click "Evaluate with AI" and watch validators reach consensus
4. **See Verdict** — approved or disputed, with AI reasoning stored on-chain

---

## 🧠 How It Works

```
Client deploys contract (job title + requirements + payment)
         ↓
Freelancer calls submit_work(deliverable_url)
         ↓
Anyone calls evaluate_work()
         ↓
Leader validator fetches the URL live → calls LLM → returns verdict
         ↓
Other validators independently verify the result structure
         ↓
Optimistic Democracy consensus → verdict written on-chain
         ↓
"approved" → payment released | "disputed" → work needs revision
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Intelligent Contract | Python + GenLayer SDK |
| Blockchain | GenLayer Testnet Bradbury |
| Frontend | React 18 + Vite |
| Blockchain SDK | genlayer-js |
| Wallet | MetaMask |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## 📖 Tutorial

See [TUTORIAL.md](./TUTORIAL.md) for the full step-by-step tutorial covering:
- GenLayer concepts (Optimistic Democracy, Equivalence Principle)
- Writing the Intelligent Contract
- Building the React frontend
- Deploying to Vercel

---

## 🌐 Live Demo

[https://freelancer-escrow.vercel.app](https://freelancer-escrow.vercel.app) *(deploy your own)*

---

## 📄 License

MIT
