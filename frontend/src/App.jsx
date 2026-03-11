import { useEffect, useMemo, useState } from "react";
import { DEFAULT_GRANTS_ADDRESS, DEMO_PROPOSAL } from "./config.js";
import { loadDemoProofBundle } from "./lib/demoProof.js";
import {
  castAnonymousVote,
  connectTreasuryWallet,
  finalizeProposal,
  fundCommunity,
  readProductState,
  readTreasuryBalance,
  submitProposal,
  executeProposal,
  txUrl
} from "./lib/starkveil.js";

function statusTone(kind) {
  if (kind === "good") return "pill pill-good";
  if (kind === "warn") return "pill pill-warn";
  if (kind === "bad") return "pill pill-bad";
  return "pill";
}

function proposalStatusLabel(status) {
  if (status === "0") return "Draft";
  if (status === "1") return "Active";
  if (status === "2") return "Passed";
  if (status === "3") return "Rejected";
  if (status === "4") return "Executed";
  if (status === "5") return "Expired";
  return "Not created";
}

function emptyActionState() {
  return { busy: false, txUrl: "", error: "" };
}

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [walletError, setWalletError] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState(null);
  const [grantsAddress, setGrantsAddress] = useState(DEFAULT_GRANTS_ADDRESS);
  const [communityId, setCommunityId] = useState("1");
  const [proposalId, setProposalId] = useState("1");
  const [fundAmount, setFundAmount] = useState("5");
  const [recipient, setRecipient] = useState(DEMO_PROPOSAL.defaultRecipient);
  const [proposalForm, setProposalForm] = useState({
    title: DEMO_PROPOSAL.title,
    summary: DEMO_PROPOSAL.summary,
    askAmount: DEMO_PROPOSAL.askStrk,
    votingStart: "0",
    votingEnd: "4102444800"
  });
  const [proofBundle, setProofBundle] = useState(null);
  const [chainState, setChainState] = useState(null);
  const [refreshError, setRefreshError] = useState("");
  const [fundState, setFundState] = useState(emptyActionState());
  const [submitState, setSubmitState] = useState(emptyActionState());
  const [voteState, setVoteState] = useState(emptyActionState());
  const [finalizeState, setFinalizeState] = useState(emptyActionState());
  const [executeState, setExecuteState] = useState(emptyActionState());

  useEffect(() => {
    loadDemoProofBundle()
      .then(setProofBundle)
      .catch((error) => setRefreshError(error instanceof Error ? error.message : String(error)));
  }, []);

  useEffect(() => {
    let active = true;
    if (!wallet) return undefined;

    readTreasuryBalance(wallet)
      .then((value) => {
        if (active) setBalance(value);
      })
      .catch((error) => {
        if (active) setWalletError(error instanceof Error ? error.message : String(error));
      });

    return () => {
      active = false;
    };
  }, [wallet]);

  async function refresh() {
    if (!grantsAddress) {
      setChainState(null);
      return;
    }
    try {
      setRefreshError("");
      const nextState = await readProductState(grantsAddress, communityId, proposalId, proofBundle?.nullifier ?? "0");
      setChainState(nextState);
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : String(error));
      setChainState(null);
    }
  }

  useEffect(() => {
    if (!proofBundle || !grantsAddress) return;
    refresh();
  }, [proofBundle, grantsAddress, communityId, proposalId]);

  async function handleConnect() {
    try {
      setConnecting(true);
      setWalletError("");
      const nextWallet = await connectTreasuryWallet(import.meta.env.VITE_STARKZAP_PRIVATE_KEY);
      setWallet(nextWallet);
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : String(error));
    } finally {
      setConnecting(false);
    }
  }

  async function handleFund() {
    if (!wallet) {
      setFundState({ busy: false, txUrl: "", error: "Connect the treasury wallet first." });
      return;
    }
    try {
      setFundState(emptyActionState());
      setFundState((state) => ({ ...state, busy: true }));
      const tx = await fundCommunity(wallet, grantsAddress, communityId, fundAmount);
      setFundState({ busy: false, txUrl: txUrl(tx), error: "" });
      await refresh();
    } catch (error) {
      setFundState({ busy: false, txUrl: "", error: error instanceof Error ? error.message : String(error) });
    }
  }

  async function handleSubmitProposal() {
    if (!wallet) {
      setSubmitState({ busy: false, txUrl: "", error: "Connect the treasury wallet first." });
      return;
    }
    try {
      setSubmitState({ busy: true, txUrl: "", error: "" });
      const tx = await submitProposal(wallet, grantsAddress, communityId, {
        ...proposalForm,
        recipient
      });
      setSubmitState({ busy: false, txUrl: txUrl(tx), error: "" });
      setProposalId("1");
      await refresh();
    } catch (error) {
      setSubmitState({ busy: false, txUrl: "", error: error instanceof Error ? error.message : String(error) });
    }
  }

  async function handleVote() {
    if (!wallet) {
      setVoteState({ busy: false, txUrl: "", error: "Connect the treasury wallet first." });
      return;
    }
    if (!proofBundle) {
      setVoteState({ busy: false, txUrl: "", error: "Demo proof bundle is not loaded yet." });
      return;
    }
    if (proposalId !== proofBundle.scope) {
      setVoteState({
        busy: false,
        txUrl: "",
        error: `The bundled real proof only matches proposal ${proofBundle.scope} on a fresh grants deployment.`
      });
      return;
    }
    try {
      setVoteState({ busy: true, txUrl: "", error: "" });
      const tx = await castAnonymousVote(wallet, grantsAddress, proposalId, proofBundle);
      setVoteState({ busy: false, txUrl: txUrl(tx), error: "" });
      await refresh();
    } catch (error) {
      setVoteState({ busy: false, txUrl: "", error: error instanceof Error ? error.message : String(error) });
    }
  }

  async function handleFinalize() {
    if (!wallet) {
      setFinalizeState({ busy: false, txUrl: "", error: "Connect the treasury wallet first." });
      return;
    }
    try {
      setFinalizeState({ busy: true, txUrl: "", error: "" });
      const tx = await finalizeProposal(wallet, grantsAddress, proposalId);
      setFinalizeState({ busy: false, txUrl: txUrl(tx), error: "" });
      await refresh();
    } catch (error) {
      setFinalizeState({ busy: false, txUrl: "", error: error instanceof Error ? error.message : String(error) });
    }
  }

  async function handleExecute() {
    if (!wallet) {
      setExecuteState({ busy: false, txUrl: "", error: "Connect the treasury wallet first." });
      return;
    }
    try {
      setExecuteState({ busy: true, txUrl: "", error: "" });
      const tx = await executeProposal(wallet, grantsAddress, proposalId);
      setExecuteState({ busy: false, txUrl: txUrl(tx), error: "" });
      await refresh();
    } catch (error) {
      setExecuteState({ busy: false, txUrl: "", error: error instanceof Error ? error.message : String(error) });
    }
  }

  const proposalLabel = useMemo(
    () => proposalStatusLabel(chainState?.proposal?.status ?? ""),
    [chainState?.proposal?.status]
  );

  return (
    <div className="page-shell">
      <div className="mesh" />
      <header className="hero">
        <div>
          <p className="eyebrow">StarkVeil Grants</p>
          <h1>Anonymous community funding with a real StarkVeil product contract</h1>
          <p className="hero-copy">
            The product layer now lives in a dedicated grants contract: treasury funding, proposal
            creation, StarkVeil-gated vote submission, finalization, and payout execution. The
            bundled proof is real upstream Semaphore data for proposal <strong>#1</strong>.
          </p>
        </div>
        <div className="wallet-panel">
          <p className="panel-label">Treasury session</p>
          {wallet ? (
            <>
              <div className="wallet-address">{wallet.address?.toString?.() ?? "connected"}</div>
              <div className="wallet-balance">
                {balance ? `${balance.formatted} ${balance.token}` : "Loading balance..."}
              </div>
            </>
          ) : (
            <p className="wallet-hint">
              Connect with StarkZap using <code>VITE_STARKZAP_PRIVATE_KEY</code> in{" "}
              <code>frontend/.env.local</code>.
            </p>
          )}
          <button className="primary-button" disabled={connecting} onClick={handleConnect}>
            {connecting ? "Connecting..." : wallet ? "Treasury connected" : "Connect treasury"}
          </button>
          {walletError ? <p className="error-text">{walletError}</p> : null}
        </div>
      </header>

      <main className="grid">
        <section className="card card-community">
          <div className="section-head">
            <div>
              <p className="section-kicker">Community contract</p>
              <h2>Grants controller</h2>
            </div>
            <span className={statusTone(chainState ? "good" : "warn")}>
              {chainState ? "Live product state" : "Needs grants address"}
            </span>
          </div>

          <label className="field">
            <span>StarkVeilGrants address</span>
            <input value={grantsAddress} onChange={(event) => setGrantsAddress(event.target.value)} placeholder="0x..." />
          </label>

          <div className="inline-metrics compact-metrics">
            <div>
              <span>Community ID</span>
              <input value={communityId} onChange={(event) => setCommunityId(event.target.value)} />
            </div>
            <div>
              <span>Proposal ID</span>
              <input value={proposalId} onChange={(event) => setProposalId(event.target.value)} />
            </div>
          </div>

          <button className="secondary-button" onClick={refresh}>
            Refresh live state
          </button>
          {refreshError ? <p className="error-text">{refreshError}</p> : null}

          <div className="metric-grid">
            <div className="metric">
              <span>Semaphore</span>
              <strong>{chainState?.semaphoreAddress ? `${chainState.semaphoreAddress.slice(0, 12)}…` : "—"}</strong>
            </div>
            <div className="metric">
              <span>Group ID</span>
              <strong>{chainState?.community?.groupId ?? "—"}</strong>
            </div>
            <div className="metric">
              <span>Current root</span>
              <strong>{chainState?.root ? `${chainState.root.slice(0, 12)}…` : "—"}</strong>
            </div>
            <div className="metric">
              <span>Treasury</span>
              <strong>{chainState?.community?.treasuryBalance ? `${chainState.community.treasuryBalance} STRK` : "—"}</strong>
            </div>
          </div>

          <div className="stack">
            <label className="field">
              <span>Fund treasury</span>
              <input value={fundAmount} onChange={(event) => setFundAmount(event.target.value)} />
            </label>
            <button className="primary-button" disabled={fundState.busy} onClick={handleFund}>
              {fundState.busy ? "Funding..." : "Fund community treasury"}
            </button>
            {fundState.error ? <p className="error-text">{fundState.error}</p> : null}
            {fundState.txUrl ? (
              <a className="tx-link" href={fundState.txUrl} target="_blank" rel="noreferrer">
                View funding tx
              </a>
            ) : null}
          </div>
        </section>

        <section className="card card-proposal">
          <div className="section-head">
            <div>
              <p className="section-kicker">Proposal lifecycle</p>
              <h2>{chainState?.proposal?.title || "Fresh proposal #1"}</h2>
            </div>
            <span
              className={statusTone(
                proposalLabel === "Executed"
                  ? "good"
                  : proposalLabel === "Passed" || proposalLabel === "Active"
                    ? "warn"
                    : proposalLabel === "Rejected" || proposalLabel === "Expired"
                      ? "bad"
                      : ""
              )}
            >
              {proposalLabel}
            </span>
          </div>

          <p className="proposal-summary">
            {chainState?.proposal?.summary || DEMO_PROPOSAL.summary}
          </p>
          <p className="proposal-description">{DEMO_PROPOSAL.description}</p>

          <div className="inline-metrics">
            <div>
              <span>Ask</span>
              <strong>{chainState?.proposal?.askAmount || proposalForm.askAmount} STRK</strong>
            </div>
            <div>
              <span>Yes votes</span>
              <strong>{chainState?.proposal?.yesVotes ?? "0"}</strong>
            </div>
            <div>
              <span>Proof nullifier</span>
              <strong>{chainState?.nullifierUsed ? "Burned" : "Unused"}</strong>
            </div>
          </div>

          <div className="stack">
            <label className="field">
              <span>Recipient address</span>
              <input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="0x..." />
            </label>
            <label className="field">
              <span>Title (short string)</span>
              <input
                value={proposalForm.title}
                onChange={(event) => setProposalForm((current) => ({ ...current, title: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Summary (short string)</span>
              <input
                value={proposalForm.summary}
                onChange={(event) => setProposalForm((current) => ({ ...current, summary: event.target.value }))}
              />
            </label>
            <label className="field">
              <span>Ask amount</span>
              <input
                value={proposalForm.askAmount}
                onChange={(event) => setProposalForm((current) => ({ ...current, askAmount: event.target.value }))}
              />
            </label>
          </div>

          <div className="action-row">
            <button className="secondary-button" disabled={submitState.busy} onClick={handleSubmitProposal}>
              {submitState.busy ? "Submitting..." : "Create proposal #1"}
            </button>
            <button className="primary-button" disabled={voteState.busy || !proofBundle} onClick={handleVote}>
              {voteState.busy ? "Voting..." : "Cast anonymous yes vote"}
            </button>
            <button className="secondary-button" disabled={finalizeState.busy} onClick={handleFinalize}>
              {finalizeState.busy ? "Finalizing..." : "Finalize proposal"}
            </button>
            <button className="secondary-button" disabled={executeState.busy} onClick={handleExecute}>
              {executeState.busy ? "Executing..." : "Execute payout"}
            </button>
          </div>

          {submitState.error ? <p className="error-text">{submitState.error}</p> : null}
          {voteState.error ? <p className="error-text">{voteState.error}</p> : null}
          {finalizeState.error ? <p className="error-text">{finalizeState.error}</p> : null}
          {executeState.error ? <p className="error-text">{executeState.error}</p> : null}

          <div className="timeline">
            <div className="timeline-item">
              <span className="timeline-label">Proof bundle</span>
              <strong>{proofBundle ? `Loaded (${proofBundle.proofPoints.length} calldata values)` : "Loading..."}</strong>
            </div>
            <div className="timeline-item">
              <span className="timeline-label">Create</span>
              {submitState.txUrl ? (
                <a href={submitState.txUrl} target="_blank" rel="noreferrer">View on Starkscan</a>
              ) : (
                <strong>Not sent yet</strong>
              )}
            </div>
            <div className="timeline-item">
              <span className="timeline-label">Vote</span>
              {voteState.txUrl ? (
                <a href={voteState.txUrl} target="_blank" rel="noreferrer">View on Starkscan</a>
              ) : (
                <strong>Not sent yet</strong>
              )}
            </div>
            <div className="timeline-item">
              <span className="timeline-label">Execute</span>
              {executeState.txUrl ? (
                <a href={executeState.txUrl} target="_blank" rel="noreferrer">View on Starkscan</a>
              ) : (
                <strong>Not sent yet</strong>
              )}
            </div>
          </div>
        </section>

        <section className="card card-notes">
          <div className="section-head">
            <div>
              <p className="section-kicker">Operating note</p>
              <h2>Fresh demo requirement</h2>
            </div>
          </div>

          <ul className="bullet-list">
            <li>The bundled proof is real upstream Semaphore data for <code>message=1</code> and <code>scope=1</code>.</li>
            <li>That means the vote button only works honestly for proposal <strong>#1</strong> on a fresh grants deployment.</li>
            <li>The grants contract still handles the full product flow: treasury funding, proposal state, StarkVeil verification, tallying, finalization, and payout.</li>
            <li>To reset the demo, deploy a fresh grants contract wired to a fresh StarkVeil semaphore stack and paste the new address here.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
