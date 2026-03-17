import { useState, useEffect } from "react";
import { createClient } from "genlayer-js";

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";

const client = createClient();

function StatusBadge({ status }) {
  const colors = {
    open:      "background:#dbeafe;color:#1e40af",
    submitted: "background:#fef9c3;color:#854d0e",
    approved:  "background:#dcfce7;color:#166534",
    disputed:  "background:#fee2e2;color:#991b1b",
  };
  const style = colors[status] || "background:#f3f4f6;color:#374151";
  return (
    <span style={{...Object.fromEntries(style.split(";").map(s => s.split(":"))), padding:"4px 12px", borderRadius:"999px", fontSize:"12px", fontWeight:"600"}}>
      {status ? status.toUpperCase() : "UNKNOWN"}
    </span>
  );
}

export default function App() {
  const [account, setAccount]           = useState(null);
  const [contractAddr, setContractAddr] = useState(CONTRACT_ADDRESS);
  const [job, setJob]                   = useState(null);
  const [verdict, setVerdict]           = useState(null);
  const [status, setStatus]             = useState("");
  const [loading, setLoading]           = useState(false);
  const [txMsg, setTxMsg]               = useState("");
  const [error, setError]               = useState("");
  const [activeTab, setActiveTab]       = useState("job");
  const [deliverableUrl, setDeliverableUrl] = useState("");

  async function connectWallet() {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (e) { setError(e.message); }
  }

  async function loadData() {
    if (!contractAddr || contractAddr === "YOUR_CONTRACT_ADDRESS_HERE") return;
    try {
      setLoading(true);
      const [j, v, s] = await Promise.all([
        client.readContract({ address: contractAddr, functionName: "get_job",     args: [] }),
        client.readContract({ address: contractAddr, functionName: "get_verdict", args: [] }),
        client.readContract({ address: contractAddr, functionName: "get_status",  args: [] }),
      ]);
      setJob(typeof j === "string" ? JSON.parse(j) : j);
      setVerdict(typeof v === "string" ? JSON.parse(v) : v);
      setStatus(typeof s === "string" ? s : String(s));
    } catch (e) { setError("Could not load: " + e.message); }
    finally { setLoading(false); }
  }

  async function submitWork() {
    if (!deliverableUrl) { setError("Enter a URL."); return; }
    try {
      setLoading(true);
      setTxMsg("Submitting work...");
      const tx = await client.writeContract({ address: contractAddr, functionName: "submit_work", args: [deliverableUrl] });
      await client.waitForTransactionReceipt({ hash: tx });
      setTxMsg("Work submitted! ✅");
      await loadData();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function evaluateWork() {
    try {
      setLoading(true);
      setTxMsg("AI validators working... wait 30-60 seconds ⏱");
      const tx = await client.writeContract({ address: contractAddr, functionName: "evaluate_work", args: [] });
      await client.waitForTransactionReceipt({ hash: tx });
      setTxMsg("AI evaluation complete! ✅");
      await loadData();
      setActiveTab("verdict");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, [contractAddr]);

  const s = { fontFamily:"sans-serif", maxWidth:"600px", margin:"0 auto", padding:"16px", background:"#fff9f5", minHeight:"100vh" };
  const card = { background:"white", borderRadius:"16px", padding:"20px", marginBottom:"16px", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" };
  const input = { width:"100%", border:"1px solid #e5e7eb", borderRadius:"10px", padding:"10px 14px", fontSize:"14px", boxSizing:"border-box", marginTop:"6px" };
  const btnPrimary = { background:"#e07b00", color:"white", border:"none", borderRadius:"10px", padding:"10px 20px", fontWeight:"600", cursor:"pointer", fontSize:"14px", width:"100%" };
  const btnSecondary = { background:"#f3f4f6", color:"#374151", border:"none", borderRadius:"10px", padding:"10px 20px", fontWeight:"600", cursor:"pointer", fontSize:"14px" };
  const btnSuccess = { background:"#16a34a", color:"white", border:"none", borderRadius:"10px", padding:"10px 20px", fontWeight:"600", cursor:"pointer", fontSize:"14px", width:"100%" };
  const label = { fontSize:"13px", fontWeight:"500", color:"#374151" };

  return (
    <div style={s}>
      {/* Header */}
      <div style={{...card, display:"flex", justifyContent:"space-between", alignItems:"center", background:"linear-gradient(135deg,#fff3e0,#fff)"}}>
        <div>
          <div style={{fontSize:"22px", fontWeight:"800", color:"#1a1a2e"}}>⚖️ AI Freelancer Escrow</div>
          <div style={{fontSize:"12px", color:"#9ca3af", marginTop:"2px"}}>Powered by GenLayer</div>
        </div>
        {account
          ? <div style={{background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"10px", padding:"6px 12px", fontSize:"12px", color:"#166534", fontFamily:"monospace"}}>{account.slice(0,6)}...{account.slice(-4)}</div>
          : <button style={{...btnSecondary, width:"auto"}} onClick={connectWallet}>Connect Wallet</button>
        }
      </div>

      {/* Contract Address */}
      <div style={card}>
        <div style={label}>Contract Address</div>
        <div style={{display:"flex", gap:"8px", marginTop:"6px"}}>
          <input style={{...input, marginTop:0, flex:1}} value={contractAddr} onChange={e => setContractAddr(e.target.value)} placeholder="0x..." />
          <button style={{...btnSecondary, width:"auto"}} onClick={loadData}>Load</button>
        </div>
      </div>

      {/* Error */}
      {error && <div style={{background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:"10px", padding:"12px", fontSize:"14px", color:"#991b1b", marginBottom:"16px"}}>{error}</div>}

      {/* Tx Message */}
      {txMsg && <div style={{background:"#dbeafe", border:"1px solid #93c5fd", borderRadius:"10px", padding:"12px", fontSize:"14px", color:"#1e40af", marginBottom:"16px"}}>{txMsg}</div>}

      {job && <>
        {/* Status */}
        <div style={{...card, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div><div style={{fontSize:"12px", color:"#9ca3af"}}>Status</div><div style={{marginTop:"4px"}}><StatusBadge status={status} /></div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:"12px", color:"#9ca3af"}}>Payment</div><div style={{fontWeight:"700", color:"#e07b00", fontSize:"18px"}}>{job.payment}</div></div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex", gap:"4px", marginBottom:"16px", borderBottom:"2px solid #f3f4f6"}}>
          {["job","submit","verdict"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{background:"none", border:"none", padding:"10px 16px", cursor:"pointer", fontWeight:"600", fontSize:"13px",
              color: activeTab===t ? "#e07b00" : "#9ca3af",
              borderBottom: activeTab===t ? "2px solid #e07b00" : "2px solid transparent",
              marginBottom:"-2px"}}>
              {t==="job" ? "📋 Job" : t==="submit" ? "📤 Submit" : "🤖 Verdict"}
            </button>
          ))}
        </div>

        {/* Job Tab */}
        {activeTab==="job" && <div style={card}>
          <div style={{fontSize:"20px", fontWeight:"700", marginBottom:"16px"}}>{job.title}</div>
          <div style={{fontSize:"12px", color:"#9ca3af", marginBottom:"6px", fontWeight:"600", textTransform:"uppercase"}}>Requirements</div>
          <div style={{background:"#f9fafb", borderRadius:"10px", padding:"14px", fontSize:"14px", color:"#374151", lineHeight:"1.6"}}>{job.requirements}</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginTop:"16px"}}>
            <div style={{background:"#fff3e0", borderRadius:"10px", padding:"14px"}}>
              <div style={{fontSize:"12px", color:"#9ca3af"}}>Payment</div>
              <div style={{fontWeight:"700", color:"#e07b00"}}>{job.payment}</div>
            </div>
            <div style={{background:"#f9fafb", borderRadius:"10px", padding:"14px"}}>
              <div style={{fontSize:"12px", color:"#9ca3af"}}>Client</div>
              <div style={{fontFamily:"monospace", fontSize:"11px", color:"#374151"}}>{job.client.slice(0,10)}...{job.client.slice(-6)}</div>
            </div>
          </div>
        </div>}

        {/* Submit Tab */}
        {activeTab==="submit" && <div style={card}>
          <div style={{fontSize:"18px", fontWeight:"700", marginBottom:"8px"}}>Submit Your Deliverable</div>
          <div style={{fontSize:"14px", color:"#6b7280", marginBottom:"20px"}}>Provide a public URL. AI validators will fetch it and verify your work.</div>
          <div style={label}>Deliverable URL</div>
          <input style={input} value={deliverableUrl} onChange={e => setDeliverableUrl(e.target.value)} placeholder="https://github.com/yourname/project" disabled={status !== "open"} />
          <div style={{height:"12px"}}/>
          <button style={btnPrimary} onClick={submitWork} disabled={status !== "open" || !account || loading}>
            {loading ? "Processing..." : "Submit Work"}
          </button>
          {status === "submitted" && <div style={{marginTop:"24px", borderTop:"1px solid #f3f4f6", paddingTop:"20px"}}>
            <div style={{fontSize:"16px", fontWeight:"700", marginBottom:"8px"}}>Trigger AI Evaluation</div>
            <div style={{background:"#fff3e0", borderRadius:"10px", padding:"12px", fontSize:"13px", color:"#92400e", marginBottom:"12px"}}>⏱ Takes 30-60 seconds — AI validators reaching consensus on GenLayer</div>
            <button style={btnSuccess} onClick={evaluateWork} disabled={!account || loading}>
              {loading ? "Evaluating..." : "🤖 Evaluate with AI"}
            </button>
          </div>}
        </div>}

        {/* Verdict Tab */}
        {activeTab==="verdict" && <div style={card}>
          <div style={{fontSize:"18px", fontWeight:"700", marginBottom:"16px"}}>AI Validator Verdict</div>
          {verdict && verdict.verdict ? <>
            <div style={{background: verdict.verdict==="approved" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${verdict.verdict==="approved" ? "#bbf7d0" : "#fecaca"}`, borderRadius:"14px", padding:"20px", marginBottom:"16px"}}>
              <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"12px"}}>
                <span style={{fontSize:"32px"}}>{verdict.verdict==="approved" ? "✅" : "❌"}</span>
                <div>
                  <div style={{fontSize:"12px", color:"#9ca3af"}}>Verdict</div>
                  <div style={{fontSize:"24px", fontWeight:"800", color: verdict.verdict==="approved" ? "#166534" : "#991b1b"}}>{verdict.verdict.toUpperCase()}</div>
                </div>
                <div style={{marginLeft:"auto", textAlign:"center"}}>
                  <div style={{fontSize:"12px", color:"#9ca3af"}}>Score</div>
                  <div style={{fontSize:"28px", fontWeight:"800", color: verdict.verdict==="approved" ? "#16a34a" : "#dc2626"}}>{verdict.score}/100</div>
                </div>
              </div>
            </div>
            <div style={{fontSize:"12px", color:"#9ca3af", marginBottom:"6px", fontWeight:"600", textTransform:"uppercase"}}>AI Reasoning</div>
            <div style={{background:"#f9fafb", borderRadius:"10px", padding:"14px", fontSize:"14px", lineHeight:"1.6", marginBottom:"16px"}}>{verdict.reasoning}</div>
            <div style={{background: verdict.verdict==="approved" ? "#f0fdf4" : "#fef2f2", borderRadius:"10px", padding:"14px", fontSize:"14px", fontWeight:"600", textAlign:"center", color: verdict.verdict==="approved" ? "#166534" : "#991b1b"}}>
              {verdict.verdict==="approved" ? "🎉 Payment of " + job.payment + " should be released!" : "⚠️ Work needs revision. Payment held."}
            </div>
          </> : <div style={{textAlign:"center", padding:"40px", color:"#9ca3af"}}>
            <div style={{fontSize:"40px"}}>🤖</div>
            <div style={{fontWeight:"600", marginTop:"8px"}}>No verdict yet</div>
            <div style={{fontSize:"14px", marginTop:"4px"}}>Submit work and trigger evaluation first</div>
          </div>}
        </div>}
      </>}

      {/* How it works */}
      {!job && <div style={card}>
        <div style={{fontWeight:"700", fontSize:"16px", marginBottom:"16px"}}>How It Works</div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px"}}>
          {[["📋","Post Job","Client deploys with requirements"],["📤","Submit Work","Freelancer submits deliverable URL"],["🤖","AI Evaluates","Validators fetch URL + judge live"],["⚖️","Verdict","Payment approved or disputed"]].map(([icon,title,desc]) => (
            <div key={title} style={{background:"#fff3e0", borderRadius:"12px", padding:"14px", textAlign:"center"}}>
              <div style={{fontSize:"24px"}}>{icon}</div>
              <div style={{fontWeight:"600", fontSize:"13px", marginTop:"6px"}}>{title}</div>
              <div style={{fontSize:"12px", color:"#6b7280", marginTop:"4px"}}>{desc}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:"13px", color:"#9ca3af", textAlign:"center", marginTop:"16px"}}>Enter a contract address above to get started</div>
      </div>}

      <div style={{textAlign:"center", fontSize:"12px", color:"#d1d5db", paddingBottom:"20px"}}>
        Built on GenLayer Testnet Bradbury · AI Freelancer Escrow · 2026
      </div>
    </div>
  );
  }
