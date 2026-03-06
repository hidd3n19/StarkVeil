// App Shell vs Landing
const appShell = document.getElementById("appShell");
const landingOverlay = document.getElementById("landingOverlay");
const connectWalletLanding = document.getElementById("connectWalletLanding");
const walletStatusLanding = document.getElementById("walletStatusLanding");
const disconnectWalletBtn = document.getElementById("disconnectWallet");

// Removed old Identity DOM queries (toggleIdentityVault, etc) as they now live in the Advanced Vault or no longer exist.

// Telemetry DOM
const teleRoot = document.getElementById("teleRoot");
const teleScope = document.getElementById("teleScope");
const teleNullifier = document.getElementById("teleNullifier");
const teleMessageHash = document.getElementById("teleMessageHash");

// Discover & Feed DOM
const discoverOut = document.getElementById("discoverOut");
const feedOut = document.getElementById("feedOut");
const feedScopeAllBtn = document.getElementById("feedScopeAll");
const feedScopeMineBtn = document.getElementById("feedScopeMine");
const feedSearchInput = document.getElementById("feedSearchInput");
const discoverScopeAllBtn = document.getElementById("discoverScopeAll");
const discoverScopeMineBtn = document.getElementById("discoverScopeMine");
const discoverSearchInput = document.getElementById("discoverSearchInput");

// Admin DOM
const groupIdEl = document.getElementById("groupId");
const groupNameEl = document.getElementById("groupName");
const groupDescriptionEl = document.getElementById("groupDescription");
const groupHeaderImageUrlEl = document.getElementById("groupHeaderImageUrl");
const groupHeaderImageFileEl = document.getElementById("groupHeaderImageFile");
const policyMinTokenEl = document.getElementById("policyMinToken");
const groupKycRequiredEl = document.getElementById("groupKycRequired");
const groupOut = document.getElementById("groupOut");
const adminTopicGroup = document.getElementById("adminTopicGroup");
const adminTopicName = document.getElementById("adminTopicName");
const adminTopicType = document.getElementById("adminTopicType");
const adminTopicBody = document.getElementById("adminTopicBody");
const adminTopicImageUrl = document.getElementById("adminTopicImageUrl");
const adminTopicImageFileEl = document.getElementById("adminTopicImageFile");
const adminTopicLinkUrl = document.getElementById("adminTopicLinkUrl");
const topicOut = document.getElementById("topicOut");

// Profile DOM
const profWallet = document.getElementById("profWallet");
const profBalance = document.getElementById("profBalance");
const profStatus = document.getElementById("profStatus");
const profIdentitySelect = document.getElementById("profIdentitySelect");
const profGroupsJoined = document.getElementById("profGroupsJoined");

// Navigation
const navDiscover = document.getElementById("navDiscover");
const navFeed = document.getElementById("navFeed");
const navCreateGroup = document.getElementById("navCreateGroup");
const navCreateTopic = document.getElementById("navCreateTopic");
const navIdentity = document.getElementById("navIdentity");

const viewDiscover = document.getElementById("viewDiscover");
const viewFeed = document.getElementById("viewFeed");
const viewGroup = document.getElementById("viewGroup");
const viewCreateGroup = document.getElementById("viewCreateGroup");
const viewCreateTopic = document.getElementById("viewCreateTopic");
const viewIdentity = document.getElementById("viewIdentity");
const viewTopic = document.getElementById("viewTopic");
const groupPageOut = document.getElementById("groupPageOut");
const topicPageOut = document.getElementById("topicPageOut");
const backToDiscover = document.getElementById("backToDiscover");
const backToGroup = document.getElementById("backToGroup");

// Advanced Identity DOM
const advCreateIdentity = document.getElementById("advCreateIdentity");
const advIdentityOut = document.getElementById("advIdentityOut");
const advIdentityPassphrase = document.getElementById("advIdentityPassphrase");
const localIdentitiesList = document.getElementById("localIdentitiesList");
const recoverIdentityId = document.getElementById("recoverIdentityId");
const recoverCode = document.getElementById("recoverCode");
const recoverPassphrase = document.getElementById("recoverPassphrase");
const recoverIdentity = document.getElementById("recoverIdentity");
const identityReputationInput = document.getElementById("identityReputationInput");
const identityKycVerifiedInput = document.getElementById("identityKycVerifiedInput");
const applyIdentityAttrs = document.getElementById("applyIdentityAttrs");
const incReputationBtn = document.getElementById("incReputationBtn");
const decReputationBtn = document.getElementById("decReputationBtn");
const identityAttrsOut = document.getElementById("identityAttrsOut");

const walletModalEl = document.getElementById("walletModal");
const walletModalBodyEl = document.getElementById("walletModalBody");
const walletModalHintEl = document.getElementById("walletModalHint");
const walletModalCloseEl = document.getElementById("walletModalClose");
const walletModalBackdropEl = document.getElementById("walletModalBackdrop");

const buttons = {
  createGroup: document.getElementById("createGroup"),
  createTopic: document.getElementById("createTopic")
};

let lastIdentity = null;
let selectedGroupId = null;
let selectedTopicId = null;
let currentViewId = null;
const viewHistoryStack = [];
const uiFilters = {
  feedScope: "all",
  feedQuery: "",
  discoverScope: "all",
  discoverQuery: ""
};
const walletState = {
  provider: null,
  address: "",
  chainId: "-",
  name: "Starknet Wallet",
  available: false,
  installedWallets: []
};

// STRK Contract on Sepolia
const STRK_ADDRESS = "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6ab07201858f4287c938D";

function setFlowStatus(text, isError = false) {
  // Keep flow status in console for now, with explicit severity.
  if (isError) {
    console.error(`[FLOW] ${text}`);
    return;
  }
  console.log(`[FLOW] ${text}`);
}

function setOutput(target, text, isError = false) {
  target.textContent = text;
  target.style.color = isError ? "var(--danger)" : "var(--good)";
}

function setBusy(button, isBusy) {
  if (!button) return;
  button.disabled = isBusy;
  button.style.opacity = isBusy ? "0.5" : "1";
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function shortSignalValue(value) {
  const text = String(value ?? "-");
  return text.length > 12 ? `${text.substring(0, 12)}...` : text;
}

function normalizeSearchValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function setScopeButtons(allBtn, mineBtn, scope) {
  const applyStyle = (button, isActive) => {
    if (!button) return;
    button.style.background = isActive ? "rgba(75, 85, 99, 0.55)" : "transparent";
    button.style.color = isActive ? "var(--ink)" : "var(--text)";
    button.style.border = isActive ? "1px solid rgba(156, 163, 175, 0.35)" : "1px solid var(--line)";
    button.style.boxShadow = "none";
    button.style.opacity = isActive ? "1" : "0.85";
  };
  applyStyle(allBtn, scope === "all");
  applyStyle(mineBtn, scope === "mine");
}

function syncFilterControlsUi() {
  setScopeButtons(feedScopeAllBtn, feedScopeMineBtn, uiFilters.feedScope);
  setScopeButtons(discoverScopeAllBtn, discoverScopeMineBtn, uiFilters.discoverScope);
}

function escapeHtml(input) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function formatAgeLabel(isoDate) {
  const ts = Date.parse(String(isoDate || ""));
  if (!Number.isFinite(ts)) return "-";
  const seconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function renderTopicCard(topic) {
  const isPoll = topic.type === "poll";
  const yesCount = Number(topic?.poll?.counts?.YES ?? 0);
  const noCount = Number(topic?.poll?.counts?.NO ?? 0);
  const total = Math.max(0, Number(topic?.poll?.total_votes ?? (yesCount + noCount)));
  const yesPct = total > 0 ? Math.round((yesCount / total) * 100) : 0;
  const noPct = total > 0 ? Math.round((noCount / total) * 100) : 0;
  const safeGroup = encodeURIComponent(topic.group_id);
  const safeName = encodeURIComponent(topic.name);
  const safeTopicId = encodeURIComponent(topic.id);
  const imageBlock = topic.image_url
    ? `<img src="${escapeHtml(topic.image_url)}" alt="topic" style="width:100%; height:210px; object-fit:cover; border-radius:14px 14px 0 0;">`
    : `<div style="height:210px; border-radius:14px 14px 0 0; background:linear-gradient(140deg,#3968af,#76a8dd);"></div>`;

  const bodyHtml = topic.body ? escapeHtml(topic.body) : "";
  const isTruncated = bodyHtml.length > 180 && !selectedTopicId;
  const truncBody = isTruncated ? bodyHtml.substring(0, 180) + '...' : bodyHtml;

  const openIconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

  // Only show reply inputs on the dedicated topic page
  const renderReplyControls = !!selectedTopicId;

  return `
    <article style="background:#f6f8fa; color:#1f2937; border:1px solid #d1d5db; border-radius:16px; overflow:hidden;">
      ${imageBlock}
      <div style="padding:16px;">
        <div style="font-size:1.3rem; color:#111827; margin-bottom:6px; cursor:pointer; font-weight:bold;" onclick="location.hash='#/group/${safeGroup}/topic/${escapeHtml(topic.id)}'">${escapeHtml(topic.name)}</div>
        <div style="font-size:0.82rem; color:#6b7280; margin-bottom:12px;">Group: ${escapeHtml(topic.group_id)}</div>
        
        ${topic.body ? `<div id="body-${topic.id}" data-full="${bodyHtml}" data-trunc="${truncBody}" style="margin:0 0 12px 0; color:#4b5563; white-space: pre-wrap; font-size:0.95rem;">${truncBody}</div>` : ""}
        ${isTruncated ? `<button onclick="const b=document.getElementById('body-${topic.id}'); if(b.dataset.expanded==='1'){ b.innerHTML=b.dataset.trunc; b.dataset.expanded='0'; this.innerText='Show More ↓'; } else { b.innerHTML=b.dataset.full; b.dataset.expanded='1'; this.innerText='Show Less ↑'; }" style="margin-bottom:12px; background:transparent; border:none; color:var(--accent); cursor:pointer; padding:0; font-weight:bold;">Show More ↓</button>` : ""}
        
        ${isPoll ? `
          <div style="display:flex; flex-direction:column; gap:10px;">
            <div style="display:grid; grid-template-columns: 1fr auto; align-items:center; gap:8px;">
              <div style="height:50px; border-radius:999px; background:#e5e7eb; overflow:hidden;">
                <div style="height:100%; width:${yesPct}%; background:linear-gradient(90deg, #374151 0%, #9ca3af 100%); display:flex; align-items:center; padding:0 14px; color:#f8fafc; font-weight:700;">Yes</div>
              </div>
              <div style="font-weight:700;">${yesPct}% (${yesCount})</div>
            </div>
            <div style="display:grid; grid-template-columns: 1fr auto; align-items:center; gap:8px;">
              <div style="height:50px; border-radius:999px; background:#e5e7eb; overflow:hidden;">
                <div style="height:100%; width:${noPct}%; background:linear-gradient(90deg, #374151 0%, #9ca3af 100%); display:flex; align-items:center; padding:0 14px; color:#f8fafc; font-weight:700; opacity:${noPct > 0 ? "0.55" : "0.25"};">No</div>
              </div>
              <div style="font-weight:700;">${noPct}% (${noCount})</div>
            </div>
            <div style="font-size:0.82rem; color:#6b7280;">Total votes: ${total}</div>
            <div style="display:flex; gap:10px;">
              <button class="btn-blue" style="flex:1;" onclick="submitPollVote(decodeURIComponent('${safeGroup}'), decodeURIComponent('${safeName}'), decodeURIComponent('${safeTopicId}'), 'YES')">Vote YES</button>
              <button class="btn-blue" style="flex:1;" onclick="submitPollVote(decodeURIComponent('${safeGroup}'), decodeURIComponent('${safeName}'), decodeURIComponent('${safeTopicId}'), 'NO')">Vote NO</button>
            </div>
            ${renderReplyControls ? `
              <div style="display:flex; gap:10px; flex-direction:column; margin-top:10px; border-top:1px solid #e5e7eb; padding-top:14px;">
                <textarea id="reply-${selectedTopicId ? 'page' : 'feed'}-${escapeHtml(topic.id)}" rows="2" placeholder="Write your comment..." style="background:#ffffff; color:#111827; border:1px solid #d1d5db;"></textarea>
                <button class="btn-blue" onclick="submitSignalText(decodeURIComponent('${safeGroup}'), decodeURIComponent('${safeName}'), '${escapeHtml(topic.id)}', 'reply-${selectedTopicId ? 'page' : 'feed'}-${escapeHtml(topic.id)}', null, 'poll')">Submit Comment</button>
              </div>
            ` : ""}
          </div>
        ` : `
          <div style="display:flex; gap:10px; flex-direction:column; margin-top:14px;">
            <textarea id="reply-${selectedTopicId ? 'page' : 'feed'}-${escapeHtml(topic.id)}" rows="2" placeholder="Write your anonymous reply..." style="background:#ffffff; color:#111827; border:1px solid #d1d5db;"></textarea>
            <button class="btn-blue" onclick="submitSignalText(decodeURIComponent('${safeGroup}'), decodeURIComponent('${safeName}'), '${escapeHtml(topic.id)}', 'reply-${selectedTopicId ? 'page' : 'feed'}-${escapeHtml(topic.id)}', null, 'open')">Submit Anonymous Reply</button>
          </div>
        `}
        <div style="margin-top:12px; display:flex; justify-content:space-between; align-items:center; color:#9ca3af; font-size:0.8rem;">
          <span style="display:flex; gap:12px; align-items:center;">
            <span>${formatAgeLabel(topic.created_at)}</span>
            ${!selectedTopicId ? `<span>💬 ${Number(topic?.stats?.signal_count || 0)} ${isPoll ? 'Comments' : 'Replies'}</span>` : ""}
          </span>
          <span style="display:flex; gap:8px;">
            ${topic.link_url ? `<a href="${escapeHtml(topic.link_url)}" target="_blank" rel="noopener noreferrer" style="color:#6b7280; text-decoration:none;">Link</a>` : ""}
            ${!selectedTopicId ? `<button style="padding:4px; border-radius:8px; border:none; background:transparent; color:#111827; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:none;" onmouseenter="this.style.color='#000000'" onmouseleave="this.style.color='#111827'" onclick="location.hash='#/group/${safeGroup}/topic/${escapeHtml(topic.id)}'">${openIconSvg}</button>` : ""}
          </span>
        </div>
      </div>
    </article>
  `;
}

function normalizeProofPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("INVALID_PROOF_PAYLOAD");
  }

  const publicSignals = Array.isArray(payload.publicSignals) ? payload.publicSignals : [];
  const merkle_tree_root = payload.merkle_tree_root ?? publicSignals[0];
  const nullifier = payload.nullifier ?? publicSignals[1];
  const message_hash = payload.message_hash ?? publicSignals[2];
  const scope = payload.scope ?? publicSignals[3];

  if (
    merkle_tree_root === undefined ||
    nullifier === undefined ||
    message_hash === undefined ||
    scope === undefined
  ) {
    throw new Error("PROOF_PAYLOAD_MISSING_SIGNALS");
  }

  return {
    ...payload,
    merkle_tree_root: String(merkle_tree_root),
    nullifier: String(nullifier),
    message_hash: String(message_hash),
    scope: String(scope),
    merkle_tree_depth:
      payload?.merkle_tree_depth !== undefined
        ? Number(payload.merkle_tree_depth)
        : undefined
  };
}

function shortAddress(value) {
  const v = String(value || "");
  if (!v) return "-";
  if (v.length <= 16) return v;
  return `${v.slice(0, 6)}...${v.slice(-4)}`;
}

function walletConnected() {
  return Boolean(walletState.address);
}

function getInstalledWallets() {
  if (typeof window === "undefined") return [];
  const candidates = [
    { id: "argentx", name: "Argent X", provider: window.starknet_argentX || null, installUrl: "https://www.argent.xyz/argent-x/" },
    { id: "braavos", name: "Braavos", provider: window.starknet_braavos || null, installUrl: "https://braavos.app/" },
    { id: "ready", name: "Ready Wallet", provider: window.starknet_ready || null, installUrl: "https://www.ready.co/" }
  ];

  const installed = candidates.filter((x) => Boolean(x.provider));
  const generic = window.starknet || null;
  if (generic && !installed.some((x) => x.provider === generic)) {
    installed.push({ id: "starknet", name: generic.name || "Starknet Wallet", provider: generic, installUrl: "" });
  }
  return installed;
}

function clearWalletState() {
  const installedWallets = getInstalledWallets();
  walletState.provider = null;
  walletState.address = "";
  walletState.chainId = "-";
  walletState.name = "Starknet Wallet";
  walletState.available = installedWallets.length > 0;
  walletState.installedWallets = installedWallets;
}

// Wallet Rendering
function updateWalletUi() {
  const connected = walletConnected();

  if (!connected) {
    walletStatusLanding.textContent = "No wallet detected";
    landingOverlay.classList.remove("hidden");
    appShell.style.display = "none";
  } else {
    landingOverlay.classList.add("hidden");
    appShell.style.display = "grid";
    profWallet.textContent = shortAddress(walletState.address);
    profStatus.textContent = "Connected";
    profStatus.style.color = "var(--good)";
    updateStrkBalanceUI();
  }
}

async function updateStrkBalanceUI() {
  try {
    const balance = await getStrkBalance(walletState.address);
    profBalance.textContent = `${balance} STRK`;
  } catch (e) {
    profBalance.textContent = `Error loading STRK`;
  }
}

async function getStrkBalance(address) {
  if (!walletConnected()) return 0;
  try {
    const { hash } = window.starknet_js || window.starknet;
    let walletObj = walletState.provider;

    // 1. Check network to route to the correct high-availability RPC
    let chainIdHex = "0x534e5f5345504f4c4941"; // SN_SEPOLIA default
    try {
      if (walletObj.provider && walletObj.provider.getChainId) {
        chainIdHex = await walletObj.provider.getChainId();
      } else if (walletObj.chainId) {
        chainIdHex = walletObj.chainId;
      }
    } catch (e) { }

    const isMainnet = chainIdHex === "0x534e5f4d41494e" || chainIdHex === "SN_MAIN";
    const rpcUrl = isMainnet
      ? "https://api.cartridge.gg/x/starknet/mainnet"
      : "https://api.cartridge.gg/x/starknet/sepolia";

    console.log(`[DEBUG] Attempting pure JSON-RPC STRK balance read...`);
    console.log(`[DEBUG] Target Wallet: ${address}`);
    console.log(`[DEBUG] Detected Network: ${isMainnet ? 'Mainnet' : 'Sepolia'}`);
    console.log(`[DEBUG] Direct RPC Endpoint: ${rpcUrl}`);

    // Generate 'balanceOf' selector and bypass buggy wallet injections
    const selector = hash.getSelectorFromName("balanceOf");
    const payload = {
      jsonrpc: "2.0",
      id: 1,
      method: "starknet_call",
      params: [{
        contract_address: STRK_ADDRESS,
        entry_point_selector: selector,
        calldata: [address]
      }, "latest"]
    };

    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("[DEBUG] Pure JSON-RPC Response result:", data.result);

    let weiAmount = "0";
    if (data && data.result && data.result.length >= 2) {
      // Starknet Uint256 is returned as [low, high] felt string array natively via JSON-RPC
      const low = BigInt(data.result[0]);
      const high = BigInt(data.result[1]);
      weiAmount = (low + (high << 128n)).toString();
    } else if (data && data.result && data.result.length === 1) {
      weiAmount = BigInt(data.result[0]).toString();
    }

    const etherAmount = Number(weiAmount) / 1e18;
    console.log(`Resolved token balance for ${address}: ${etherAmount.toFixed(4)} STRK`);
    return etherAmount;
  } catch (error) {
    console.warn("Failed to get STRK balance:", error.message);
    return 0; // Return 0 on failure for safety
  }
}

async function connectWalletWithProvider(walletMeta) {
  const wallet = walletMeta?.provider || null;
  if (!wallet) return;

  walletState.provider = wallet;
  walletState.available = true;
  walletState.name = walletMeta?.name || wallet.name || wallet.id || "Starknet Wallet";
  walletState.installedWallets = getInstalledWallets();

  try {
    if (typeof wallet.enable === "function") {
      await wallet.enable();
    }
  } catch (error) {
    throw new Error("WALLET_CONNECT_FAILED");
  }

  const addr = wallet.selectedAddress || wallet.account?.address;
  if (!addr) {
    throw new Error("WALLET_NOT_CONNECTED");
  }

  walletState.address = String(addr);
  let chainId = "-";
  if (wallet.provider?.getChainId) chainId = await wallet.provider.getChainId();
  walletState.chainId = String(chainId);
  updateWalletUi();
  walletModalEl.classList.add("hidden");
}

function createWalletOptionRow(walletMeta) {
  const row = document.createElement("div");
  row.className = "wallet-option";
  const str = `<strong>${walletMeta.name}</strong><small>Detected</small>`;
  const meta = document.createElement("div");
  meta.innerHTML = str;
  const action = document.createElement("button");
  action.type = "button";
  action.className = "wallet-option-action btn-blue";
  action.textContent = "Connect";
  action.onclick = () => connectWalletWithProvider(walletMeta);
  row.append(meta, action);
  return row;
}

function rememberViewTransition(nextViewId) {
  if (!nextViewId) return;
  if (currentViewId && currentViewId !== nextViewId) {
    viewHistoryStack.push(currentViewId);
    if (viewHistoryStack.length > 64) {
      viewHistoryStack.shift();
    }
  }
  currentViewId = nextViewId;
}

function popPreviousView() {
  while (viewHistoryStack.length > 0) {
    const candidate = viewHistoryStack.pop();
    if (candidate && candidate !== currentViewId) {
      return candidate;
    }
  }
  return null;
}

function applyViewWithoutHash(viewId) {
  if (!viewId) return false;
  if (viewId === "viewGroup" && selectedGroupId) {
    setView("viewGroup");
    return true;
  }
  if (viewId === "viewTopic" && selectedGroupId && selectedTopicId) {
    setView("viewTopic");
    return true;
  }
  if (viewId === "viewDiscover") {
    selectedGroupId = null;
    selectedTopicId = null;
    location.hash = "";
    setView("viewDiscover");
    return true;
  }
  if (viewId === "viewFeed") {
    selectedGroupId = null;
    selectedTopicId = null;
    location.hash = "";
    setView("viewFeed");
    return true;
  }
  if (viewId === "viewCreateGroup") {
    selectedGroupId = null;
    selectedTopicId = null;
    location.hash = "";
    setView("viewCreateGroup");
    return true;
  }
  if (viewId === "viewCreateTopic") {
    selectedGroupId = null;
    selectedTopicId = null;
    location.hash = "";
    setView("viewCreateTopic");
    return true;
  }
  if (viewId === "viewIdentity") {
    selectedGroupId = null;
    selectedTopicId = null;
    location.hash = "";
    setView("viewIdentity");
    return true;
  }
  return false;
}

// Router
function setView(viewId) {
  rememberViewTransition(viewId);
  const views = [viewDiscover, viewFeed, viewGroup, viewTopic, viewCreateGroup, viewCreateTopic, viewIdentity];
  const navs = [navDiscover, navFeed, navCreateGroup, navCreateTopic, navIdentity];

  views.forEach(v => v.classList.add("hidden"));
  navs.forEach(n => n.classList.remove("active"));

  if (viewId === 'viewDiscover') { viewDiscover.classList.remove("hidden"); navDiscover.classList.add("active"); loadDiscover(); }
  if (viewId === 'viewFeed') { viewFeed.classList.remove("hidden"); navFeed.classList.add("active"); loadFeed(); }
  if (viewId === 'viewGroup') { viewGroup.classList.remove("hidden"); navDiscover.classList.add("active"); loadGroupPage(); }
  if (viewId === 'viewTopic') { viewTopic.classList.remove("hidden"); navDiscover.classList.add("active"); loadTopicPage(); }
  if (viewId === 'viewCreateGroup') { viewCreateGroup.classList.remove("hidden"); navCreateGroup.classList.add("active"); }
  if (viewId === 'viewCreateTopic') { viewCreateTopic.classList.remove("hidden"); navCreateTopic.classList.add("active"); loadAdmin(); }
  if (viewId === 'viewIdentity') { viewIdentity.classList.remove("hidden"); navIdentity.classList.add("active"); renderLocalIdentities(); }
}

function applyRouteFromHash() {
  const hash = String(location.hash || "");
  if (hash.startsWith("#/group/")) {
    const parts = hash.replace("#/group/", "").split("/topic/");
    selectedGroupId = decodeURIComponent(parts[0] || "");
    if (parts.length > 1) {
      selectedTopicId = decodeURIComponent(parts[1] || "");
      setView("viewTopic");
    } else {
      selectedTopicId = null;
      setView("viewGroup");
    }
    return;
  }
  selectedGroupId = null;
  selectedTopicId = null;
}

window.openGroupPage = (groupId) => {
  if (!groupId) return;
  selectedGroupId = decodeURIComponent(String(groupId));
  location.hash = `#/group/${encodeURIComponent(selectedGroupId)}`;
  setView("viewGroup");
};

backToDiscover?.addEventListener("click", () => {
  const previous = popPreviousView();
  if (previous && applyViewWithoutHash(previous)) {
    return;
  }
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  selectedGroupId = null;
  location.hash = "";
  setView("viewDiscover");
});

backToGroup?.addEventListener("click", () => {
  const previous = popPreviousView();
  if (previous && applyViewWithoutHash(previous)) {
    return;
  }
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  selectedTopicId = null;
  if (selectedGroupId) {
    location.hash = `#/group/${encodeURIComponent(selectedGroupId)}`;
    return;
  }
  location.hash = "";
  setView("viewDiscover");
});

window.addEventListener("hashchange", applyRouteFromHash);

navDiscover.onclick = () => { location.hash = ""; setView('viewDiscover'); };
navFeed.onclick = () => { location.hash = ""; setView('viewFeed'); };
navCreateGroup.onclick = () => { location.hash = ""; setView('viewCreateGroup'); };
navCreateTopic.onclick = () => { location.hash = ""; setView('viewCreateTopic'); };
navIdentity.onclick = () => { location.hash = ""; setView('viewIdentity'); };

feedScopeAllBtn?.addEventListener("click", async () => {
  uiFilters.feedScope = "all";
  syncFilterControlsUi();
  await loadFeed();
});

feedScopeMineBtn?.addEventListener("click", async () => {
  uiFilters.feedScope = "mine";
  syncFilterControlsUi();
  await loadFeed();
});

discoverScopeAllBtn?.addEventListener("click", async () => {
  uiFilters.discoverScope = "all";
  syncFilterControlsUi();
  await loadDiscover();
});

discoverScopeMineBtn?.addEventListener("click", async () => {
  uiFilters.discoverScope = "mine";
  syncFilterControlsUi();
  await loadDiscover();
});

feedSearchInput?.addEventListener("input", async () => {
  uiFilters.feedQuery = feedSearchInput.value || "";
  await loadFeed();
});

discoverSearchInput?.addEventListener("input", async () => {
  uiFilters.discoverQuery = discoverSearchInput.value || "";
  await loadDiscover();
});

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...options
  });

  const raw = await response.text();
  let payload = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const errorMessage =
      payload?.error ||
      payload?.message ||
      raw ||
      `REQUEST_FAILED_${response.status}`;
    throw new Error(errorMessage);
  }
  return payload ?? {};
}

// Global State Refreshers
async function getJoinedGroups(stateSnapshot = null) {
  if (!lastIdentity) return [];
  const state = stateSnapshot || await api("/api/state");
  if (Array.isArray(state?.indexes?.membership_by_identity?.[lastIdentity.id])) {
    return state.indexes.membership_by_identity[lastIdentity.id];
  }
  const groups = [];
  for (const [id, group] of Object.entries(state.groups || {})) {
    if (Array.isArray(group?.leaves) && group.leaves.includes(lastIdentity.commitment)) {
      groups.push(id);
    }
  }
  return groups;
}

async function loadDiscover() {
  try {
    const state = await api("/api/state");
    const myGroups = await getJoinedGroups(state);
    const discoverQuery = normalizeSearchValue(uiFilters.discoverQuery);
    const allGroups = Object.entries(state.groups || {});
    const visibleGroups = allGroups.filter(([id, group]) => {
      const isJoined = myGroups.includes(id);
      if (uiFilters.discoverScope === "mine" && !isJoined) {
        return false;
      }
      if (!discoverQuery) {
        return true;
      }
      const searchBlob = normalizeSearchValue([
        id,
        group?.name,
        group?.description,
        group?.eligibility_policy?.type,
        ...(Array.isArray(group?.tags) ? group.tags : [])
      ].join(" "));
      return searchBlob.includes(discoverQuery);
    });

    discoverOut.innerHTML = ``;
    let html = `<div style="display:flex; flex-direction:column; gap: 10px;">`;
    for (const [id, group] of visibleGroups) {
      const isJoined = myGroups.includes(id);
      const reqTokens = group.eligibility_policy?.min_token_balance || 0;

      html += `
        <div style="background:rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="margin:0 0 5px 0; font-size: 1.1rem; cursor:pointer; text-decoration:underline;" onclick="openGroupPage('${encodeURIComponent(id)}')">#${escapeHtml(id)}</h3>
            <small style="display:block; color:var(--muted); margin-bottom:4px;">${escapeHtml(group.description || "")}</small>
            <span class="chip" style="font-size: 0.8rem;">Req: ${reqTokens} STRK</span>
            <small style="color:var(--muted); margin-left: 10px;">${group.leaves.length} Members</small>
          </div>
          <div>
            ${isJoined
          ? `<button disabled style="background:#222; opacity: 0.8;">Already Joined</button>`
          : `<button class="btn-blue" onclick="joinGroupClick('${encodeURIComponent(id)}', ${reqTokens})">Join Cryptographically</button>`}
          </div>
        </div>
      `;
    }
    html += `</div>`;
    if (visibleGroups.length === 0) {
      discoverOut.innerHTML = uiFilters.discoverScope === "mine"
        ? "No groups matched in your memberships."
        : "No groups matched your search.";
      return;
    }
    discoverOut.innerHTML = html;
  } catch (err) {
    discoverOut.innerHTML = "Error loading discover: " + err.message;
  }
}

async function loadFeed() {
  try {
    const [topics, state] = await Promise.all([api("/api/topics"), api("/api/state")]);
    const myGroups = await getJoinedGroups(state);
    const feedQuery = normalizeSearchValue(uiFilters.feedQuery);
    feedOut.innerHTML = ``;

    const visibleTopics = (topics || [])
      .filter((topic) => uiFilters.feedScope === "all" || myGroups.includes(topic.group_id))
      .filter((topic) => {
        if (!feedQuery) return true;
        const searchBlob = normalizeSearchValue([topic.group_id, topic.name, topic.type, topic.body].join(" "));
        return searchBlob.includes(feedQuery);
      })
      .sort((a, b) => Date.parse(b?.created_at || 0) - Date.parse(a?.created_at || 0));

    if (visibleTopics.length === 0) {
      feedOut.innerHTML = uiFilters.feedScope === "mine"
        ? "<p>No topics matched in your groups.</p>"
        : "<p>No topics matched your search.</p>";
      return;
    }

    let html = `<div style="display:flex; flex-direction:column; gap: 15px;">`;
    for (const topic of visibleTopics) {
      html += renderTopicCard(topic);
    }
    html += `</div>`;
    feedOut.innerHTML = html;
  } catch (err) {
    feedOut.innerHTML = "Error loading feed: " + err.message;
  }
}

async function loadGroupPage() {
  try {
    if (!selectedGroupId) {
      groupPageOut.innerHTML = "Group not selected.";
      return;
    }
    const [state, topics] = await Promise.all([api("/api/state"), api("/api/topics")]);
    const group = state?.groups?.[selectedGroupId];
    if (!group) {
      groupPageOut.innerHTML = `Group not found: ${escapeHtml(selectedGroupId)}`;
      return;
    }
    const myGroups = await getJoinedGroups(state);
    const isJoined = myGroups.includes(selectedGroupId);
    const indexedTopicIds = Array.isArray(state?.indexes?.topics_by_group?.[selectedGroupId])
      ? new Set(state.indexes.topics_by_group[selectedGroupId].map((x) => String(x)))
      : null;
    const groupTopics = (topics || [])
      .filter((t) => indexedTopicIds ? indexedTopicIds.has(String(t.id)) : String(t.group_id) === String(selectedGroupId))
      .sort((a, b) => Date.parse(b?.created_at || 0) - Date.parse(a?.created_at || 0));
    const headerImage = group.header_image_url
      ? `<img src="${escapeHtml(group.header_image_url)}" alt="header" style="width:100%; height:220px; object-fit:cover; border-radius:14px;">`
      : `<div style="height:220px; border-radius:14px; background:linear-gradient(145deg,#1f3f71,#2f6ba8);"></div>`;

    let html = `
      <div style="display:flex; flex-direction:column; gap:14px;">
        ${headerImage}
        <div style="background:rgba(0,0,0,0.25); border:1px solid var(--line); border-radius:12px; padding:16px;">
          <h2 style="margin:0 0 6px 0;">${escapeHtml(group.name || group.id)}</h2>
          <p style="margin:0 0 8px 0; color:var(--muted);">${escapeHtml(group.description || "No introduction yet.")}</p>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            <span class="chip">Members: ${Number(group?.stats?.member_count ?? group?.leaves?.length ?? 0)}</span>
            <span class="chip">Topics: ${Number(group?.stats?.topic_count ?? groupTopics.length)}</span>
            <span class="chip">Policy: ${escapeHtml(
      !group?.eligibility_policy ? "Open" :
        group.eligibility_policy.type === "token_min" ? `Req: ${group.eligibility_policy.min_token_balance} STRK` :
          (group.eligibility_policy.type === "reputation_min" || group.eligibility_policy.type === "rep_min") ? `Req: ${group.eligibility_policy.min_reputation} Rep` :
            group.eligibility_policy.type === "kyc" ? (group.eligibility_policy.require_kyc ? "KYC Required" : "Open") :
              group.eligibility_policy.type === "allowlist" ? "Allowlist Only" : group.eligibility_policy.type
    )}</span>
          </div>
          <div style="margin-top:10px;">
            ${isJoined
        ? `<button disabled style="background:#222; opacity:0.85;">Already Joined</button>`
        : `<button class="btn-blue" onclick="joinGroupClick('${encodeURIComponent(selectedGroupId)}', ${Number(group?.eligibility_policy?.min_token_balance || 0)})">Join Group</button>`}
          </div>
        </div>
      </div>
    `;

    if (groupTopics.length === 0) {
      html += `<p style="color:var(--muted); margin-top:14px;">No topics in this group yet.</p>`;
    } else {
      html += `<div style="margin-top:14px; display:flex; flex-direction:column; gap:14px;">`;
      for (const topic of groupTopics) {
        html += renderTopicCard(topic);
      }
      html += `</div>`;
    }

    groupPageOut.innerHTML = html;
  } catch (err) {
    groupPageOut.innerHTML = "Error loading group page: " + err.message;
  }
}

async function loadTopicPage() {
  try {
    if (!selectedGroupId || !selectedTopicId) {
      topicPageOut.innerHTML = "Topic not selected.";
      return;
    }
    const [state, topics] = await Promise.all([api("/api/state"), api("/api/topics")]);
    const topic = (topics || []).find((t) => t.id === selectedTopicId);
    if (!topic) {
      topicPageOut.innerHTML = `Topic not found.`;
      return;
    }

    // Find all signals bound to this topic
    const topicSignals = (state.signals || [])
      .filter((s) => s.topic_id === selectedTopicId)
      .filter((s) => !s.deleted_at)
      .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));

    let repliesHtml = "";
    if (topicSignals.length === 0) {
      repliesHtml = "<div style=\"padding:16px; color:var(--muted); text-align:center;\">No comments/replies yet. Be the first!</div>";
    } else {
      const isPoll = topic.type === "poll";
      const activeIdentityId = String(lastIdentity?.id || "");

      const renderSignal = (sig, isNested = false) => {
        const reactions = sig.reactions || {};
        const myActiveReaction = activeIdentityId && sig?.reaction_users?.[activeIdentityId]
          ? String(sig.reaction_users[activeIdentityId])
          : null;
        const isOwnComment = activeIdentityId && String(sig.identity_id || "") === activeIdentityId;
        const safeMessage = encodeURIComponent(String(sig.message || ""));
        const authorLabel =
          topic.type === "poll"
            ? (sig.identity_id ? `Identity: ${escapeHtml(sig.identity_id.substring(0, 12))}...` : "Anonymous")
            : "Anonymous";
        const reactionBarHtml = Object.entries(reactions)
          .filter(([_, c]) => Number(c) > 0)
          .sort((a, b) => Number(b[1]) - Number(a[1]) || String(a[0]).localeCompare(String(b[0])))
          .map(([emoji, count]) => {
          const isMine = myActiveReaction === emoji;
          const encodedEmoji = encodeURIComponent(String(emoji));
          return `<button onclick="submitReactionEncoded('signal', '${sig.id}', '${encodedEmoji}')" style="padding:5px 10px; margin-right:6px; border-radius:999px; border:1px solid ${isMine ? '#2563eb' : '#d1d5db'}; background:${isMine ? '#dbeafe' : '#f9fafb'}; color:#111827; cursor:pointer; font-size:0.95rem;" title="${isMine ? 'Undo reaction' : `React ${emoji}`}">${emoji} <span style="font-weight:700; margin-left:4px;">${count}</span></button>`;
        }).join('');
        const addReactionBarHtml = `<button onclick="window.openEmojiPicker(event, 'signal', '${sig.id}')" style="padding:4px; border-radius:999px; border:1px dashed #9ca3af; background:#ffffff; cursor:pointer; color:#374151; display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px;" title="Add Reaction"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M8.8 15.2c.9 1 2 1.5 3.2 1.5s2.3-.5 3.2-1.5"></path></svg></button>`;
        const commentActionsHtml = isOwnComment && topic.type === "poll"
          ? `<div style="display:flex; gap:8px;">
               <button onclick="editCommentPrompt('${sig.id}', '${safeMessage}')" style="padding:4px 8px; font-size:0.78rem; border-radius:8px; border:1px solid #d1d5db; background:#fff; color:#374151; cursor:pointer;">Edit</button>
               <button onclick="deleteCommentConfirm('${sig.id}')" style="padding:4px 8px; font-size:0.78rem; border-radius:8px; border:1px solid #fecaca; background:#fff1f2; color:#b91c1c; cursor:pointer;">Delete</button>
             </div>`
          : "";
        const editedLabel = sig.edited_at ? `<span style="margin-left:6px; color:#9ca3af;">(edited)</span>` : "";

        let nestedRepliesHtml = "";
        if (isPoll && !isNested) {
          const children = topicSignals.filter(s => s.parent_id === sig.id);
          nestedRepliesHtml = children.map(c => renderSignal(c, true)).join('');

          const safeGroup = encodeURIComponent(topic.group_id);
          const safeName = encodeURIComponent(topic.name);
          nestedRepliesHtml += `
            <button onclick="const box = document.getElementById('reply-box-${sig.id}'); box.style.display = box.style.display === 'none' ? 'flex' : 'none';" style="background:transparent; color:#60a5fa; border:none; cursor:pointer; font-size:0.9rem; padding:0; margin-top:10px; box-shadow:none;">Reply to this comment</button>
            <div id="reply-box-${sig.id}" style="display:none; flex-direction:column; gap:6px; margin-top:8px;">
              <textarea id="reply-input-${sig.id}" rows="2" placeholder="Write a reply..." style="background:#ffffff; color:#111827; border:1px solid #d1d5db;"></textarea>
              <button class="btn-blue" onclick="submitSignalText(decodeURIComponent('${safeGroup}'), decodeURIComponent('${safeName}'), '${escapeHtml(topic.id)}', 'reply-input-${sig.id}', '${sig.id}', 'poll')" style="padding:4px 8px; font-size:0.8rem; width:fit-content;">Submit Reply</button>
            </div>
          `;
        }

        return `
          <div style="background:#ffffff; border:1px solid #e5e7eb; border-left:3px solid var(--accent); padding:14px; border-radius:10px; margin-top:12px; margin-bottom:12px; ${isNested ? 'margin-left:20px; border-left-color:var(--muted);' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:8px;">
              <div style="font-size:0.9rem; color:#4b5563;">
                ${authorLabel} · ${formatAgeLabel(sig.created_at)} ${editedLabel}
              </div>
              ${commentActionsHtml}
            </div>
            <p style="margin:0 0 10px 0; color:#111827; white-space:pre-wrap; font-size:1.08rem; line-height:1.45;">${escapeHtml(sig.message)}</p>
            <div style="display:flex; flex-wrap:wrap; align-items:center; gap:4px;">
              ${reactionBarHtml}
              ${addReactionBarHtml}
            </div>
            ${nestedRepliesHtml}
          </div>
        `;
      };

      const topLevelSignals = topicSignals.filter(s => !s.parent_id);
      repliesHtml = topLevelSignals.map(sig => renderSignal(sig, false)).join('');
    }

    let mainCardHtml = renderTopicCard(topic);

    // We only render the nested reply box if it is a poll, or if the main card didn't render one. 
    // The topic card already renders the Top-Level Reply box depending on if it's open/poll.
    // However, if the user specifies open -> no nested comments, we don't render specific nested reply boxes inside the thread. 

    topicPageOut.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:20px;">
        ${mainCardHtml}
        <div>
          <h3 style="margin-top:0; border-bottom:1px solid var(--line); padding-bottom:8px;">${topic.type === "poll" ? "Discussion Thread" : "Anonymous Thread"} (${topicSignals.length})</h3>
          <div style="margin-top:16px;">
            ${repliesHtml}
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    topicPageOut.innerHTML = "Error loading topic page: " + err.message;
  }
}

async function submitReaction(targetType, targetId, reactionType) {
  if (!lastIdentity) {
    alert("You need to create or select an Identity first.");
    return;
  }
  try {
    await api("/api/reactions", {
      method: "POST",
      body: JSON.stringify({
        target_type: targetType,
        target_id: targetId,
        reaction_type: reactionType,
        identity_id: lastIdentity.id
      })
    });
    // Immediately reload the active view
    if (selectedTopicId) {
      await loadTopicPage();
    } else if (selectedGroupId) {
      await loadGroupPage();
    } else {
      await loadFeed();
    }
  } catch (err) {
    alert("Reaction Failed: " + err.message);
  }
}

window.submitReactionEncoded = async (targetType, targetId, encodedReaction) => {
  const reactionType = decodeURIComponent(String(encodedReaction || ""));
  return submitReaction(targetType, targetId, reactionType);
};

window.editCommentPrompt = async (signalId, encodedMessage) => {
  if (!lastIdentity) {
    alert("You need to select an Identity first.");
    return;
  }
  const currentMessage = decodeURIComponent(String(encodedMessage || ""));
  const nextMessage = prompt("Edit your comment:", currentMessage);
  if (nextMessage === null) return;
  if (!String(nextMessage).trim()) {
    alert("Comment cannot be empty.");
    return;
  }
  try {
    await api("/api/comment/edit", {
      method: "POST",
      body: JSON.stringify({
        signal_id: signalId,
        identity_id: lastIdentity.id,
        message: String(nextMessage).trim()
      })
    });
    await loadTopicPage();
  } catch (err) {
    if (String(err.message || "") === "NOT_FOUND") {
      alert("Edit endpoint not loaded. Restart the Node server so /api/comment/edit is active.");
      return;
    }
    alert("Edit failed: " + err.message);
  }
};

window.deleteCommentConfirm = async (signalId) => {
  if (!lastIdentity) {
    alert("You need to select an Identity first.");
    return;
  }
  if (!confirm("Delete this comment?")) return;
  try {
    await api("/api/comment/delete", {
      method: "POST",
      body: JSON.stringify({
        signal_id: signalId,
        identity_id: lastIdentity.id
      })
    });
    await loadTopicPage();
  } catch (err) {
    if (String(err.message || "") === "NOT_FOUND") {
      alert("Delete endpoint not loaded. Restart the Node server so /api/comment/delete is active.");
      return;
    }
    alert("Delete failed: " + err.message);
  }
};

async function loadAdmin() {
  try {
    const state = await api("/api/state");
    adminTopicGroup.innerHTML = '';
    for (const [id, group] of Object.entries(state.groups || {})) {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = group?.name ? `${group.name} (#${id})` : id;
      adminTopicGroup.appendChild(opt);
    }
  } catch (err) {
    console.error(err);
  }
}

// Identity Logic
const LOCAL_VAULT_KEY = "vs_identities";
const LOCAL_VAULT_CLEAR_ONCE_KEY = "vs_local_vault_cleared_20260307";
if (!localStorage.getItem(LOCAL_VAULT_CLEAR_ONCE_KEY)) {
  localStorage.removeItem(LOCAL_VAULT_KEY);
  localStorage.setItem(LOCAL_VAULT_CLEAR_ONCE_KEY, "1");
  window.lastPassphrase = null;
}
let localVault = JSON.parse(localStorage.getItem(LOCAL_VAULT_KEY) || '[]');

function saveLocalVault() {
  localStorage.setItem(LOCAL_VAULT_KEY, JSON.stringify(localVault));
}

function syncIdentityOverviewSelect() {
  if (!profIdentitySelect) return;
  const activeId = String(lastIdentity?.id || "");
  const hasAny = localVault.length > 0;
  const options = [
    `<option value="">${hasAny ? "Select identity..." : "None Setup"}</option>`,
    ...localVault.map((idnt) => {
      const label = `${idnt.id.substring(0, 16)}...`;
      return `<option value="${escapeHtml(idnt.id)}">${escapeHtml(label)}</option>`;
    })
  ];
  profIdentitySelect.innerHTML = options.join("");
  if (activeId && localVault.some((x) => String(x.id) === activeId)) {
    profIdentitySelect.value = activeId;
  } else {
    profIdentitySelect.value = "";
  }
}

function findActiveIdentityRecord() {
  if (!lastIdentity?.id) return null;
  return localVault.find((x) => x.id === lastIdentity.id) || null;
}

function setActiveIdentityControls() {
  const active = findActiveIdentityRecord();
  const hasActive = Boolean(active);
  const rep = Number(active?.reputation ?? lastIdentity?.reputation ?? 0);
  const kyc = Boolean(active?.kyc_verified ?? lastIdentity?.kyc_verified ?? false);

  identityReputationInput.value = String(Number.isFinite(rep) ? Math.max(0, Math.floor(rep)) : 0);
  identityKycVerifiedInput.value = kyc ? "true" : "false";

  [identityReputationInput, identityKycVerifiedInput, applyIdentityAttrs, incReputationBtn, decReputationBtn]
    .forEach((el) => { if (el) el.disabled = !hasActive; });
}

async function updateActiveIdentityAttrs(nextAttrs) {
  if (!lastIdentity?.id) {
    throw new Error("Select an active identity first.");
  }

  const record = findActiveIdentityRecord();
  const payload = {
    identity_id: lastIdentity.id,
    reputation: Number(nextAttrs.reputation ?? record?.reputation ?? lastIdentity?.reputation ?? 0),
    kyc_verified: Boolean(nextAttrs.kyc_verified ?? record?.kyc_verified ?? lastIdentity?.kyc_verified ?? false),
    token_balance: Number(nextAttrs.token_balance ?? record?.token_balance ?? lastIdentity?.token_balance ?? 0)
  };

  const updated = await api("/api/identities/attrs", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const attrs = updated?.attrs || {};
  const merged = {
    ...(record || {}),
    id: lastIdentity.id,
    _cachedPassphrase: record?._cachedPassphrase || window.lastPassphrase || lastIdentity._cachedPassphrase,
    reputation: Number(attrs.reputation ?? payload.reputation),
    kyc_verified: Boolean(attrs.kyc_verified ?? payload.kyc_verified),
    token_balance: Number(attrs.token_balance ?? payload.token_balance)
  };

  const index = localVault.findIndex((x) => x.id === lastIdentity.id);
  if (index >= 0) {
    localVault[index] = merged;
  } else {
    localVault.push(merged);
  }
  saveLocalVault();

  lastIdentity = {
    ...lastIdentity,
    reputation: merged.reputation,
    kyc_verified: merged.kyc_verified,
    token_balance: merged.token_balance
  };

  renderLocalIdentities();
  setActiveIdentityControls();
  setOutput(identityAttrsOut, `Updated: rep = ${merged.reputation}, kyc_verified = ${merged.kyc_verified} `, false);
}

function renderLocalIdentities() {
  localIdentitiesList.innerHTML = '';
  if (localVault.length === 0) {
    localIdentitiesList.innerHTML = `<p style="color:var(--muted); font-size:0.85rem;">No identities locally stored right now.</p>`;
    syncIdentityOverviewSelect();
    setActiveIdentityControls();
    return;
  }

  localVault.forEach(idnt => {
    const isActive = lastIdentity && lastIdentity.id === idnt.id;
    const div = document.createElement("div");
    div.style = `border: 1px solid var(--line); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center; background: rgba(0, 0, 0, 0.3); ${isActive ? 'border-color: var(--accent);' : ''}`;
    div.innerHTML = `
      <div style="font-family:monospace; font-size:0.8rem; overflow:hidden; text-overflow:ellipsis;">
        <strong>ID:</strong> ${idnt.id.substring(0, 16)}...<br>
        <span style="color:var(--muted)">Rep: ${idnt.reputation || 0} | KYC: ${Boolean(idnt.kyc_verified)}</span>
      </div>
      <button style="padding: 6px 12px; border-radius: 6px; background: ${isActive ? 'var(--accent)' : 'transparent'}; color: ${isActive ? 'white' : 'var(--accent)'}; border: 1px solid var(--accent); cursor:pointer; box-shadow:none;">
        ${isActive ? 'Active Session' : 'Make Active'}
      </button>
    `;
    const btn = div.querySelector('button');
    if (!isActive) {
      btn.onclick = () => {
        lastIdentity = idnt;
        window.lastPassphrase = idnt._cachedPassphrase; // Restoring cached passphrase for seamless voting
        renderLocalIdentities();
        setActiveIdentityControls();
      };
    }
    localIdentitiesList.appendChild(div);
  });
  syncIdentityOverviewSelect();
  setActiveIdentityControls();
}

profIdentitySelect?.addEventListener("change", () => {
  const selectedId = String(profIdentitySelect.value || "");
  if (!selectedId) {
    lastIdentity = null;
    window.lastPassphrase = null;
    syncIdentityOverviewSelect();
    setActiveIdentityControls();
    return;
  }
  const identity = localVault.find((x) => String(x.id) === selectedId);
  if (!identity) {
    syncIdentityOverviewSelect();
    return;
  }
  lastIdentity = identity;
  window.lastPassphrase = identity._cachedPassphrase || window.lastPassphrase;
  renderLocalIdentities();
  setActiveIdentityControls();
});

applyIdentityAttrs.addEventListener("click", async () => {
  setBusy(applyIdentityAttrs, true);
  try {
    const reputation = Math.max(0, Number(identityReputationInput.value || 0));
    const kycVerified = identityKycVerifiedInput.value === "true";
    await updateActiveIdentityAttrs({ reputation, kyc_verified: kycVerified });
  } catch (err) {
    setOutput(identityAttrsOut, err.message, true);
  } finally {
    setBusy(applyIdentityAttrs, false);
  }
});

incReputationBtn.addEventListener("click", async () => {
  setBusy(incReputationBtn, true);
  try {
    const current = Math.max(0, Number(identityReputationInput.value || 0));
    const reputation = current + 1;
    identityReputationInput.value = String(reputation);
    const kycVerified = identityKycVerifiedInput.value === "true";
    await updateActiveIdentityAttrs({ reputation, kyc_verified: kycVerified });
  } catch (err) {
    setOutput(identityAttrsOut, err.message, true);
  } finally {
    setBusy(incReputationBtn, false);
  }
});

decReputationBtn.addEventListener("click", async () => {
  setBusy(decReputationBtn, true);
  try {
    const current = Math.max(0, Number(identityReputationInput.value || 0));
    const reputation = Math.max(0, current - 1);
    identityReputationInput.value = String(reputation);
    const kycVerified = identityKycVerifiedInput.value === "true";
    await updateActiveIdentityAttrs({ reputation, kyc_verified: kycVerified });
  } catch (err) {
    setOutput(identityAttrsOut, err.message, true);
  } finally {
    setBusy(decReputationBtn, false);
  }
});

advCreateIdentity.addEventListener("click", async () => {
  setBusy(advCreateIdentity, true);
  setOutput(advIdentityOut, "Generating local identity with Zero Knowledge primitives...", false);
  try {
    const passphrase = advIdentityPassphrase.value;
    const initialReputation = Math.max(0, Number(identityReputationInput.value || 0));
    const initialKycVerified = identityKycVerifiedInput.value === "true";
    if (!passphrase || passphrase.length < 8) throw new Error("Passphrase must be at least 8 characters.");
    const body = { passphrase };
    const res = await api("/api/identities/create", { method: "POST", body: JSON.stringify(body) });
    lastIdentity = res;
    window.lastPassphrase = passphrase;

    // Save to local vault
    const newIdnt = {
      ...res,
      _cachedPassphrase: passphrase,
      reputation: initialReputation,
      kyc_verified: initialKycVerified,
      token_balance: 0
    };
    localVault.push(newIdnt);
    saveLocalVault();

    setOutput(advIdentityOut, `Identity generated successfully!\n\nCommitment ID: \n${res.id} \n\nRecovery Code Hash: \n${res.recovery_code} `, false);
    renderLocalIdentities();
    setActiveIdentityControls();

    // Initialize attrs for simulation
    await api("/api/identities/attrs", {
      method: "POST",
      body: JSON.stringify({ identity_id: res.id, reputation: initialReputation, token_balance: 0, kyc_verified: initialKycVerified })
    });
  } catch (err) {
    setOutput(advIdentityOut, err.message, true);
  } finally {
    setBusy(advCreateIdentity, false);
  }
});

// Quick Identity Builder removed as per the Advanced Vault redesign

const exportIdentityBtn = document.getElementById("exportIdentity");
const importIdentityBtn = document.getElementById("importIdentity");
const importJsonBody = document.getElementById("importJsonBody");

exportIdentityBtn.addEventListener("click", () => {
  if (!lastIdentity || !window.lastPassphrase) {
    return alert("No active identity in this session. Create or select one from your Local Vault first.");
  }

  const payload = {
    id: lastIdentity.id,
    passphrase: window.lastPassphrase,
    reputation: lastIdentity.reputation || 0,
    kyc_verified: Boolean(lastIdentity.kyc_verified || false),
    token_balance: Number(lastIdentity.token_balance || 0),
    recovery_code: lastIdentity.recovery_code
  };

  // Create a downloadable blob
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `veilsignal - identity - ${lastIdentity.id.substring(0, 8)}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
});

importIdentityBtn.addEventListener("click", async () => {
  setBusy(importIdentityBtn, true);
  try {
    const jsonStr = importJsonBody.value.trim();
    if (!jsonStr) throw new Error("Please paste your Identity JSON payload.");

    let imported;
    try {
      imported = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error("Invalid JSON format.");
    }

    if (!imported.id || !imported.passphrase) throw new Error("Missing required 'id' or 'passphrase' fields.");

    // Technically in pure Semaphore, we would just accept this instantly client-side.
    // For our Web2.5 hybrid, let's verify the credentials quietly with the auth endpoint.
    await api("/api/permissions/auth", {
      method: "POST", body: JSON.stringify({ identity_id: imported.id, passphrase: imported.passphrase })
    });

    const importedRep = Math.max(0, Number(imported.reputation ?? 0));
    const importedKyc = Boolean(imported.kyc_verified ?? false);
    const importedBal = Number(imported.token_balance ?? 0);

    // Validated! Save to session and vault
    lastIdentity = { ...imported, reputation: importedRep, kyc_verified: importedKyc, token_balance: importedBal };
    window.lastPassphrase = imported.passphrase;

    // Check if it already exists locally
    const exists = localVault.find(v => v.id === imported.id);
    if (!exists) {
      const newIdnt = {
        id: imported.id,
        _cachedPassphrase: imported.passphrase,
        reputation: importedRep,
        kyc_verified: importedKyc,
        token_balance: importedBal,
        recovery_code: imported.recovery_code
      };
      localVault.push(newIdnt);
      saveLocalVault();
    }

    await api("/api/identities/attrs", {
      method: "POST",
      body: JSON.stringify({
        identity_id: imported.id,
        reputation: importedRep,
        kyc_verified: importedKyc,
        token_balance: importedBal
      })
    });

    alert("Identity successfully imported and verified!");
    importJsonBody.value = "";
    renderLocalIdentities();
    setActiveIdentityControls();
  } catch (err) {
    alert("Import failed: " + err.message);
  } finally {
    setBusy(importIdentityBtn, false);
  }
});

recoverIdentity.addEventListener("click", async () => {
  setBusy(recoverIdentity, true);
  try {
    const body = {
      identity_id: recoverIdentityId.value,
      recovery_code: recoverCode.value,
      new_passphrase: recoverPassphrase.value
    };
    if (!body.new_passphrase || body.new_passphrase.length < 8) throw new Error("Passphrase too short.");

    await api("/api/identities/recover", { method: "POST", body: JSON.stringify(body) });

    // Simulate successful recovery
    const res = await api("/api/permissions/auth", {
      method: "POST", body: JSON.stringify({ identity_id: body.identity_id, passphrase: body.new_passphrase })
    }); // Just to verify it works

    lastIdentity = { id: body.identity_id, _cachedPassphrase: body.new_passphrase, reputation: 0, kyc_verified: false, token_balance: 0 };
    window.lastPassphrase = body.new_passphrase;

    const newIdnt = { id: body.identity_id, _cachedPassphrase: body.new_passphrase, reputation: 0, kyc_verified: false, token_balance: 0 };
    localVault.push(newIdnt);
    saveLocalVault();

    await api("/api/identities/attrs", {
      method: "POST",
      body: JSON.stringify({ identity_id: body.identity_id, reputation: 0, token_balance: 0, kyc_verified: false })
    });

    alert("Identity recovered successfully! It is now stored in your local vault.");
    renderLocalIdentities();
    setActiveIdentityControls();

  } catch (err) {
    alert("Recovery failed: " + err.message);
  } finally {
    setBusy(recoverIdentity, false);
  }
});

// Admin Logic
buttons.createGroup.addEventListener("click", async () => {
  setBusy(buttons.createGroup, true);
  try {
    const id = groupIdEl.value.trim();
    const name = groupNameEl.value.trim() || id;
    const description = groupDescriptionEl.value.trim();
    let header_image_url = groupHeaderImageUrlEl.value.trim() || null;
    const base64File = await readFileAsBase64(groupHeaderImageFileEl.files?.[0]);
    if (base64File) {
      header_image_url = base64File;
    }
    const depth = Number(document.getElementById("groupDepth").value || 20);
    const polType = document.getElementById("policyType").value;
    const kycRequired = groupKycRequiredEl.value === "true";

    let eligibility_policy = { type: polType };
    if (polType === "token_min") {
      eligibility_policy.min_token_balance = Number(policyMinTokenEl.value || 0);
    } else if (polType === "reputation_min" || polType === "rep_min") {
      eligibility_policy.min_reputation = Number(document.getElementById("minReputation").value || 0);
    } else if (polType === "kyc") {
      eligibility_policy.require_kyc = kycRequired;
    } else if (polType === "allowlist") {
      eligibility_policy.allowlist_identity_ids = document.getElementById("allowlistIds").value.split(",").map(s => s.trim()).filter(Boolean);
    }

    const body = { group_id: id, name, description, header_image_url, depth, eligibility_policy };
    await api("/api/groups/create", { method: "POST", body: JSON.stringify(body) });
    setOutput(groupOut, `Group ${id} Created!`, false);
    groupHeaderImageFileEl.value = "";
    loadAdmin();
  } catch (e) {
    setOutput(groupOut, e.message, true);
  } finally {
    setBusy(buttons.createGroup, false);
  }
});

buttons.createTopic.addEventListener("click", async () => {
  setBusy(buttons.createTopic, true);
  try {
    const body = {
      group_id: adminTopicGroup.value,
      name: adminTopicName.value,
      type: adminTopicType.value,
      body: adminTopicBody.value.trim() || null,
      link_url: adminTopicLinkUrl.value.trim() || null,
      author_identity_id: lastIdentity?.id || null
    };

    let image_url = adminTopicImageUrl.value.trim() || null;
    const base64File = await readFileAsBase64(adminTopicImageFileEl.files?.[0]);
    if (base64File) {
      image_url = base64File;
    }
    body.image_url = image_url;

    await api("/api/topics", { method: "POST", body: JSON.stringify(body) });
    setOutput(topicOut, `Topic "${body.name}" created globally!`, false);
    adminTopicBody.value = "";
    adminTopicImageUrl.value = "";
    adminTopicImageFileEl.value = "";
    adminTopicLinkUrl.value = "";
  } catch (e) {
    setOutput(topicOut, e.message, true);
  } finally {
    setBusy(buttons.createTopic, false);
  }
});

// User Actions
window.joinGroupClick = async (groupId, reqTokens) => {
  groupId = decodeURIComponent(String(groupId));
  if (!lastIdentity) return alert("Create an identity first!");
  if (!walletConnected()) return alert("Connect a Starknet Wallet first!");

  try {
    const balance = await getStrkBalance(walletState.address);
    if (balance < reqTokens) {
      alert(`Insufficient balance! You need ${reqTokens} STRK, but have ${balance.toFixed(2)}.`);
      return;
    }

    const active = findActiveIdentityRecord();
    const currentRep = Number(active?.reputation ?? lastIdentity?.reputation ?? 0);
    const currentKyc = Boolean(active?.kyc_verified ?? lastIdentity?.kyc_verified ?? false);

    // Update token balance in backend explicitly to clear eligibility
    await api("/api/identities/attrs", {
      method: "POST",
      body: JSON.stringify({ identity_id: lastIdentity.id, token_balance: balance, reputation: currentRep, kyc_verified: currentKyc })
    });

    if (active) {
      active.token_balance = Number(balance);
      saveLocalVault();
    }
    lastIdentity = { ...lastIdentity, token_balance: Number(balance), reputation: currentRep, kyc_verified: currentKyc };
    setActiveIdentityControls();

    // Join
    await api("/api/groups/join", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, identity_id: lastIdentity.id })
    });

    profGroupsJoined.textContent = (await getJoinedGroups()).length;
    alert("Successfully joined cryptographically!");
    if (selectedGroupId && selectedGroupId === groupId) {
      loadGroupPage();
    }
    loadDiscover();
  } catch (e) {
    alert("Join failed: " + e.message);
  }
};

window.submitPollVote = async (groupId, topicName, topicId, vote) => {
  if (!lastIdentity || !window.lastPassphrase) {
    alert("Requires active identity in session.");
    return;
  }
  const normalizedVote = String(vote || "").toUpperCase();
  if (normalizedVote !== "YES" && normalizedVote !== "NO") {
    alert("Invalid vote option.");
    return;
  }
  try {
    setFlowStatus("Generating Zero Knowledge vote proof...");
    const scope = `${groupId}:${topicName}`;
    const rawProofPayload = await api("/api/proofs/generate", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        identity_id: lastIdentity.id,
        passphrase: window.lastPassphrase,
        scope,
        message: normalizedVote
      })
    });
    const proofPayload = normalizeProofPayload(rawProofPayload);

    if (proofPayload.merkle_tree_depth === undefined || Number.isNaN(proofPayload.merkle_tree_depth)) {
      const state = await api("/api/state");
      const expectedDepth = Number(state?.meta?.circuit_depth ?? state?.groups?.[groupId]?.depth);
      if (Number.isFinite(expectedDepth)) {
        proofPayload.merkle_tree_depth = expectedDepth;
      }
    }

    teleRoot.textContent = shortSignalValue(proofPayload.merkle_tree_root);
    teleScope.textContent = shortSignalValue(proofPayload.scope);
    teleNullifier.textContent = shortSignalValue(proofPayload.nullifier);
    teleMessageHash.textContent = shortSignalValue(proofPayload.message_hash);

    await api("/api/polls/vote", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, topic_id: topicId, proof: proofPayload })
    });

    setFlowStatus("Vote accepted.");
    if (selectedTopicId) {
      await loadTopicPage();
    } else if (selectedGroupId) {
      await loadGroupPage();
    } else {
      await loadFeed();
    }
  } catch (e) {
    const reason = e?.message || "UNKNOWN_ERROR";
    alert("Vote failed: " + reason);
    setFlowStatus(`Vote failed: ${reason}`, true);
  }
};

window.submitSignalText = async (groupId, topicName, topicId, textareaId, parentId = null, topicType = "open") => {
  const message = document.getElementById(textareaId).value;
  if (!message) return alert("Message cannot be empty");

  if (topicType === "poll") {
    if (!lastIdentity) return alert("Requires an active identity to comment.");

    // Web2 style Identity-bound commenting
    setFlowStatus("Submitting Web2 style comment directly to node...");
    try {
      if (!topicId) throw new Error("Could not map topic Name to ID for Web2 comment.");

      await api("/api/comment", {
        method: "POST",
        body: JSON.stringify({
          group_id: groupId,
          topic_id: topicId,
          identity_id: lastIdentity.id,
          message,
          parent_id: parentId
        })
      });
      alert(`Success! Comment posted as Identity ${lastIdentity.id.substring(0, 8)}...`);
      setFlowStatus("Comment Published.");
      if (selectedTopicId) loadTopicPage();
    } catch (e) {
      alert("Comment failed: " + e.message);
      setFlowStatus("Comment failed.");
    }
  } else {
    // Advanced Web3 ZK Proof fully anonymous route
    await window.submitSignal(groupId, topicName, message, parentId, topicType, topicId);
  }
}

window.submitSignal = async (groupId, topicName, message, parentId = null, topicType = "open", topicId = null) => {
  if (!lastIdentity || !window.lastPassphrase) {
    alert("Requires active identity in session.");
    return;
  }
  if (!message) return alert("Message cannot be empty");

  try {
    setFlowStatus("Generating Zero Knowledge Proof in background...");
    const scope = `${groupId}:${topicName}`;

    // Forge Proof via Server (simulating background browser threading for prototype)
    const rawProofPayload = await api("/api/proofs/generate", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        identity_id: lastIdentity.id,
        passphrase: window.lastPassphrase,
        scope,
        message,
        parent_id: parentId
      })
    });
    const proofPayload = normalizeProofPayload(rawProofPayload);

    // Some prover backends return public signals but omit explicit depth.
    if (proofPayload.merkle_tree_depth === undefined || Number.isNaN(proofPayload.merkle_tree_depth)) {
      const state = await api("/api/state");
      const expectedDepth = Number(state?.meta?.circuit_depth ?? state?.groups?.[groupId]?.depth);
      if (Number.isFinite(expectedDepth)) {
        proofPayload.merkle_tree_depth = expectedDepth;
      }
    }

    teleRoot.textContent = shortSignalValue(proofPayload.merkle_tree_root);
    teleScope.textContent = shortSignalValue(proofPayload.scope);
    teleNullifier.textContent = shortSignalValue(proofPayload.nullifier);
    teleMessageHash.textContent = shortSignalValue(proofPayload.message_hash);

    setFlowStatus("Proof Generated. Submitting to protocol...");

    // Submit
    await api("/api/signals/submit", {
      method: "POST",
      body: JSON.stringify({ group_id: groupId, topic_id: topicId, proof: proofPayload })
    });

    alert(`Success! Identity shielded.Message: "${message}"`);
    setFlowStatus("Signal Verified and accepted globally.");
    if (selectedTopicId) {
      await loadTopicPage();
    } else if (selectedGroupId) {
      await loadGroupPage();
    } else {
      await loadFeed();
    }
  } catch (e) {
    const reason = e?.message || "UNKNOWN_ERROR";
    alert("Proof / Submit failed: " + reason);
    console.error("[Proof/Submit Error]", e);
    if (reason === "PROOF_PAYLOAD_MISSING_SIGNALS") {
      console.error("[Proof Payload Raw]", "Payload did not include required fields or publicSignals.");
    }
    setFlowStatus(`Failed: ${reason} `, true);
  }
};

// Wallet Initialization
connectWalletLanding.addEventListener("click", () => {
  const install = getInstalledWallets();
  walletModalBodyEl.innerHTML = '';
  install.forEach(w => walletModalBodyEl.append(createWalletOptionRow(w)));
  walletModalEl.classList.remove("hidden");
});

disconnectWalletBtn.addEventListener("click", async () => {
  walletState.provider = null;
  walletState.address = "";
  walletState.chainId = "-";
  updateWalletUi();
});

walletModalCloseEl.addEventListener("click", () => walletModalEl.classList.add("hidden"));

clearWalletState();
updateWalletUi();
setActiveIdentityControls();
syncIdentityOverviewSelect();
syncFilterControlsUi();

applyRouteFromHash();
if (location.hash.startsWith("#/group/")) {
  setView("viewGroup");
} else {
  setView('viewDiscover');
}

window.emojiTarget = null;
window.openEmojiPicker = (e, targetType, targetId) => {
  e.stopPropagation();
  window.emojiTarget = { type: targetType, id: targetId };

  const overlay = document.getElementById("emojiPickerOverlay");
  const picker = document.getElementById("emojiPickerEl");
  overlay.style.display = "block";

  const rect = e.target.getBoundingClientRect();
  let top = rect.bottom + 5;
  let left = rect.left;

  // Basic bounds checking for typical emoji picker width and height
  if (left + 350 > window.innerWidth) left = window.innerWidth - 350;
  if (top + 400 > window.innerHeight) top = rect.top - 400;

  picker.style.top = top + "px";
  picker.style.left = left + "px";
};

window.closeEmojiPicker = () => {
  document.getElementById("emojiPickerOverlay").style.display = "none";
};

document.addEventListener('DOMContentLoaded', () => {
  const picker = document.getElementById("emojiPickerEl");
  if (picker) {
    picker.addEventListener('emoji-click', event => {
      if (window.emojiTarget) {
        submitReaction(window.emojiTarget.type, window.emojiTarget.id, event.detail.unicode);
      }
      closeEmojiPicker();
    });
    // Prevent clicking on the picker from closing the overlay
    picker.addEventListener('click', e => e.stopPropagation());
  }
});
