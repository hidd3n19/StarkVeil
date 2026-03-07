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
const feedScopeCreatedBtn = document.getElementById("feedScopeCreated");
const feedSearchInput = document.getElementById("feedSearchInput");
const discoverScopeAllBtn = document.getElementById("discoverScopeAll");
const discoverScopeMineBtn = document.getElementById("discoverScopeMine");
const discoverScopeCreatedBtn = document.getElementById("discoverScopeCreated");
const discoverSearchInput = document.getElementById("discoverSearchInput");

// Admin DOM
const groupIdEl = document.getElementById("groupId");
const groupNameEl = document.getElementById("groupName");
const groupDescriptionEl = document.getElementById("groupDescription");
const groupHeaderImageUrlEl = document.getElementById("groupHeaderImageUrl");
const groupHeaderImageFileEl = document.getElementById("groupHeaderImageFile");
const policyMinTokenEl = document.getElementById("policyMinToken");
const minReputationEl = document.getElementById("minReputation");
const allowlistIdsEl = document.getElementById("allowlistIds");
const groupTagsEl = document.getElementById("groupTags");
const groupRulesEl = document.getElementById("groupRules");
const groupPolicyOpenEl = document.getElementById("groupPolicyOpen");
const groupPolicyTokenEnabledEl = document.getElementById("groupPolicyTokenEnabled");
const groupPolicyRepEnabledEl = document.getElementById("groupPolicyRepEnabled");
const groupPolicyKycEnabledEl = document.getElementById("groupPolicyKycEnabled");
const groupPolicyAllowlistEnabledEl = document.getElementById("groupPolicyAllowlistEnabled");
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
const floatingHistoryNav = document.getElementById("floatingHistoryNav");
const floatingBackBtn = document.getElementById("floatingBackBtn");
const floatingForwardBtn = document.getElementById("floatingForwardBtn");

const viewDiscover = document.getElementById("viewDiscover");
const viewFeed = document.getElementById("viewFeed");
const viewGroup = document.getElementById("viewGroup");
const viewCreateGroup = document.getElementById("viewCreateGroup");
const viewCreateTopic = document.getElementById("viewCreateTopic");
const viewIdentity = document.getElementById("viewIdentity");
const viewTopic = document.getElementById("viewTopic");
const viewAdminTools = document.getElementById("viewAdminTools");
const groupPageOut = document.getElementById("groupPageOut");
const topicPageOut = document.getElementById("topicPageOut");
const backToDiscover = document.getElementById("backToDiscover");
const backToGroup = document.getElementById("backToGroup");
const adminGroupNameLabel = document.getElementById("adminGroupNameLabel");
const adminMemberCommitmentInput = document.getElementById("adminMemberCommitmentInput");
const adminMemberDropdownToggle = document.getElementById("adminMemberDropdownToggle");
const adminMemberDropdown = document.getElementById("adminMemberDropdown");
const adminMemberLastAction = document.getElementById("adminMemberLastAction");
const adminPolicyOpen = document.getElementById("adminPolicyOpen");
const adminPolicyTokenEnabled = document.getElementById("adminPolicyTokenEnabled");
const adminPolicyRepEnabled = document.getElementById("adminPolicyRepEnabled");
const adminPolicyKycEnabled = document.getElementById("adminPolicyKycEnabled");
const adminPolicyAllowlistEnabled = document.getElementById("adminPolicyAllowlistEnabled");
const adminPolicyMinToken = document.getElementById("adminPolicyMinToken");
const adminPolicyMinReputation = document.getElementById("adminPolicyMinReputation");
const adminPolicyRequireKyc = document.getElementById("adminPolicyRequireKyc");
const adminPolicyAllowlist = document.getElementById("adminPolicyAllowlist");
const adminAddMemberBtn = document.getElementById("adminAddMemberBtn");
const adminRemoveMemberBtn = document.getElementById("adminRemoveMemberBtn");
const adminUpdatePolicyBtn = document.getElementById("adminUpdatePolicyBtn");
const adminGroupMetaName = document.getElementById("adminGroupMetaName");
const adminGroupMetaDescription = document.getElementById("adminGroupMetaDescription");
const adminGroupMetaHeaderImage = document.getElementById("adminGroupMetaHeaderImage");
const adminGroupMetaTags = document.getElementById("adminGroupMetaTags");
const adminGroupMetaRules = document.getElementById("adminGroupMetaRules");
const adminUpdateMetadataBtn = document.getElementById("adminUpdateMetadataBtn");
const adminTargetIdentityInput = document.getElementById("adminTargetIdentityInput");
const adminAddAdminBtn = document.getElementById("adminAddAdminBtn");
const adminRemoveAdminBtn = document.getElementById("adminRemoveAdminBtn");
const adminTargetIdentityToggle = document.getElementById("adminTargetIdentityToggle");
const adminTargetIdentityDropdown = document.getElementById("adminTargetIdentityDropdown");
const adminArchiveGroupBtn = document.getElementById("adminArchiveGroupBtn");
const adminReopenGroupBtn = document.getElementById("adminReopenGroupBtn");
const adminToolsOut = document.getElementById("adminToolsOut");
const topicEditModal = document.getElementById("topicEditModal");
const topicEditCloseBtn = document.getElementById("topicEditCloseBtn");
const topicEditCancelBtn = document.getElementById("topicEditCancelBtn");
const topicEditSaveBtn = document.getElementById("topicEditSaveBtn");
const topicEditName = document.getElementById("topicEditName");
const topicEditMetaHint = document.getElementById("topicEditMetaHint");
const topicEditBody = document.getElementById("topicEditBody");
const topicEditImageUrl = document.getElementById("topicEditImageUrl");
const topicEditLinkUrl = document.getElementById("topicEditLinkUrl");
const groupRulesModal = document.getElementById("groupRulesModal");
const groupRulesModalCloseBtn = document.getElementById("groupRulesModalCloseBtn");
const groupRulesModalTitle = document.getElementById("groupRulesModalTitle");
const groupRulesModalBody = document.getElementById("groupRulesModalBody");

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
let selectedAdminGroupId = null;
let currentViewId = null;
let lastKnownState = null;
let currentRouteSnapshot = null;
let topicEditDraftId = null;
const adminMemberUiState = {
  fromDropdown: false,
  suggestedAction: null,
  lastInteraction: "none"
};
const viewHistoryStack = [];
const viewForwardStack = [];
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

function renderLucideIcons() {
  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
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

function parseIdentityListInput(text) {
  return String(text || "")
    .split(/[\n,]+/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function shortCommitment(value) {
  const text = String(value || "");
  if (!text) return "-";
  return text.length > 20 ? `${text.slice(0, 10)}...${text.slice(-8)}` : text;
}

function clampDepthValue(value) {
  const digitsOnly = String(value ?? "").replace(/[^\d]/g, "");
  const parsed = Number(digitsOnly || 20);
  return Math.min(32, Math.max(1, Number.isFinite(parsed) ? parsed : 20));
}

function getCurrentGroupRecord(groupId) {
  return lastKnownState?.groups?.[String(groupId)] || null;
}

function getTopicGroupRecord(topic) {
  return getCurrentGroupRecord(topic?.group_id);
}

function isGroupArchived(group) {
  return String(group?.status || "active") === "archived";
}

function isTopicArchived(topic) {
  return String(topic?.status || "active") === "archived";
}

function isTopicDeleted(topic) {
  return String(topic?.status || "active") === "deleted";
}

function isTopicActive(topic) {
  return !isTopicArchived(topic) && !isTopicDeleted(topic);
}

function isTopicOwner(topic) {
  return String(topic?.author_identity_id || "") === String(lastIdentity?.id || "");
}

function topicScopeValue(topic) {
  return String(topic?.scope || `${topic?.group_id || ""}:${topic?.id || ""}`);
}

function topicActionIcon(type) {
  if (type === "edit") {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>`;
  }
  if (type === "delete") {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
  }
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="5" x="2" y="3" rx="1"></rect><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"></path><path d="M10 12h4"></path></svg>`;
}

function canEditOwnTopic(topic) {
  const group = getTopicGroupRecord(topic);
  return Boolean(isTopicOwner(topic) && isTopicActive(topic) && !isGroupArchived(group));
}

function canDeleteOwnTopic(topic) {
  const group = getTopicGroupRecord(topic);
  return Boolean(isTopicOwner(topic) && !isTopicDeleted(topic) && !isGroupArchived(group));
}

function canArchiveTopic(topic) {
  const group = getTopicGroupRecord(topic);
  return Boolean(group && canManageGroup(group) && !isTopicDeleted(topic));
}

function canManageGroup(group) {
  const admins = getGroupAdminIds(group);
  const activeId = String(lastIdentity?.id || "");
  return Boolean(activeId && admins.includes(activeId));
}

function getGroupAdminIds(group) {
  const admins = new Set(Array.isArray(group?.admins) ? group.admins.map(String) : []);
  if (group?.created_by_identity_id) {
    admins.add(String(group.created_by_identity_id));
  }
  return [...admins];
}

function setAdminMemberInteraction(source, suggestedAction = null) {
  adminMemberUiState.lastInteraction = source;
  adminMemberUiState.suggestedAction = suggestedAction;
  if (adminMemberLastAction) {
    const hint = suggestedAction ? ` (${suggestedAction})` : "";
    adminMemberLastAction.textContent = `Last interaction: ${source}${hint}`;
  }
}

function updateAdminMemberButtonsAvailability() {
  const hasInput = String(adminMemberCommitmentInput?.value || "").trim().length > 0;
  if (adminAddMemberBtn) {
    adminAddMemberBtn.disabled = !hasInput;
  }
  if (adminRemoveMemberBtn) {
    adminRemoveMemberBtn.disabled = !hasInput;
  }
}

function setScopeButtons(allBtn, mineBtn, createdBtn, scope) {
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
  applyStyle(createdBtn, scope === "created");
}

function syncFilterControlsUi() {
  setScopeButtons(feedScopeAllBtn, feedScopeMineBtn, feedScopeCreatedBtn, uiFilters.feedScope);
  setScopeButtons(discoverScopeAllBtn, discoverScopeMineBtn, discoverScopeCreatedBtn, uiFilters.discoverScope);
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

function findReplyTextarea(textareaId, topicId = null) {
  const direct = document.getElementById(String(textareaId || ""));
  if (direct) return direct;

  const fallbackIds = [
    topicId ? `reply-page-${topicId}` : null,
    topicId ? `reply-feed-${topicId}` : null
  ].filter(Boolean);

  const candidates = Array.from(
    document.querySelectorAll("textarea[id^='reply-page-'], textarea[id^='reply-feed-'], textarea[id^='reply-input-']")
  );
  return candidates.find((node) => fallbackIds.includes(node.id) || node.id === String(textareaId || "")) || null;
}

function findBestReplyTextarea(textareaId, topicId = null) {
  const direct = findReplyTextarea(textareaId, topicId);
  if (direct && String(direct.value || "").trim()) {
    return direct;
  }
  const candidates = Array.from(
    document.querySelectorAll("textarea[id^='reply-page-'], textarea[id^='reply-feed-'], textarea[id^='reply-input-']")
  );
  return candidates.find((node) => String(node.value || "").trim()) || direct;
}

function normalizeEligibilityPolicy(policy) {
  const source = policy && typeof policy === "object" ? policy : {};
  const rawType = String(source.type || source.mode || "open");
  const type = rawType === "rep_min" ? "reputation_min" : rawType;
  const allowlist = Array.isArray(source.allowlist_identity_ids)
    ? source.allowlist_identity_ids.map(String).filter(Boolean)
    : Array.isArray(source.allowlist_ids)
      ? source.allowlist_ids.map(String).filter(Boolean)
      : [];
  const minToken = Number(source.min_token_balance || 0);
  const minRep = Number(source.min_reputation || 0);
  const requireKyc = Boolean(source.require_kyc);

  if (type === "allowlist" || allowlist.length > 0) {
    return {
      type: "allowlist",
      open: false,
      min_token_balance: 0,
      min_reputation: 0,
      require_kyc: false,
      allowlist_identity_ids: allowlist
    };
  }
  if (type === "token_min" || type === "reputation_min" || type === "kyc" || minToken > 0 || minRep > 0 || requireKyc) {
    return {
      type: "composite",
      open: false,
      min_token_balance: minToken,
      min_reputation: minRep,
      require_kyc: requireKyc,
      allowlist_identity_ids: []
    };
  }
  return {
    type: "open",
    open: true,
    min_token_balance: 0,
    min_reputation: 0,
    require_kyc: false,
    allowlist_identity_ids: []
  };
}

function formatPolicyLabel(policy) {
  const normalized = normalizeEligibilityPolicy(policy);
  if (normalized.type === "open") {
    return "Open";
  }
  if (normalized.type === "allowlist") {
    return "Allowlist Only";
  }
  const parts = [];
  if (normalized.min_token_balance > 0) {
    parts.push(`Req: ${normalized.min_token_balance} STRK`);
  }
  if (normalized.min_reputation > 0) {
    parts.push(`Req: ${normalized.min_reputation} Rep`);
  }
  if (normalized.require_kyc) {
    parts.push("KYC Required");
  }
  return parts.join(" + ") || "Open";
}

function buildPolicySummaryParts(policy) {
  const normalized = normalizeEligibilityPolicy(policy);
  if (normalized.type === "open") {
    return ["Open"];
  }
  if (normalized.type === "allowlist") {
    return ["Allowlist Only"];
  }
  const parts = [];
  if (normalized.min_token_balance > 0) parts.push(`${normalized.min_token_balance} STRK`);
  if (normalized.min_reputation > 0) parts.push(`${normalized.min_reputation} Rep`);
  if (normalized.require_kyc) parts.push("KYC");
  return parts;
}

function syncPolicyCheckboxes(openEl, tokenEl, repEl, kycEl, allowlistEl, tokenInputEl, repInputEl, allowlistInputEl) {
  const openChecked = Boolean(openEl?.checked);
  const allowlistChecked = Boolean(allowlistEl?.checked);
  const compositeChecked = Boolean(tokenEl?.checked || repEl?.checked || kycEl?.checked);

  if (openChecked) {
    if (allowlistEl) allowlistEl.checked = false;
    if (tokenEl) tokenEl.checked = false;
    if (repEl) repEl.checked = false;
    if (kycEl) kycEl.checked = false;
  } else if (allowlistChecked) {
    if (openEl) openEl.checked = false;
    if (tokenEl) tokenEl.checked = false;
    if (repEl) repEl.checked = false;
    if (kycEl) kycEl.checked = false;
  } else if (compositeChecked) {
    if (openEl) openEl.checked = false;
    if (allowlistEl) allowlistEl.checked = false;
  }

  if (tokenInputEl) tokenInputEl.disabled = !tokenEl?.checked || openEl?.checked || allowlistEl?.checked;
  if (repInputEl) repInputEl.disabled = !repEl?.checked || openEl?.checked || allowlistEl?.checked;
  if (allowlistInputEl) allowlistInputEl.disabled = !allowlistEl?.checked || openEl?.checked;

  const setRowState = (controlEl, shouldDim) => {
    const row = controlEl?.closest("label");
    if (!row) return;
    row.style.opacity = shouldDim ? "0.45" : "1";
  };

  setRowState(openEl, compositeChecked || allowlistChecked);
  setRowState(allowlistEl, openChecked || compositeChecked);
  setRowState(tokenEl, openChecked || allowlistChecked);
  setRowState(repEl, openChecked || allowlistChecked);
  setRowState(kycEl, openChecked || allowlistChecked);
}

function hasAnyPolicySelected(openEl, tokenEl, repEl, kycEl, allowlistEl) {
  return Boolean(openEl?.checked || tokenEl?.checked || repEl?.checked || kycEl?.checked || allowlistEl?.checked);
}

function openGroupRulesModal(group) {
  if (!groupRulesModalBody || !groupRulesModalTitle || !groupRulesModal) return;
  const rules = Array.isArray(group?.rules) ? group.rules : [];
  groupRulesModalTitle.textContent = `${String(group?.name || group?.id || "Community")} Rules`;
  groupRulesModalBody.innerHTML = rules.length > 0
    ? rules.map((rule, index) => `<div style="padding:10px 12px; border-radius:10px; background:rgba(255,255,255,0.04);">${index + 1}. ${escapeHtml(rule)}</div>`).join("")
    : `<div style="color:var(--muted);">No rules configured for this community.</div>`;
  groupRulesModal.classList.remove("hidden");
}

function closeGroupRulesModal() {
  groupRulesModal?.classList.add("hidden");
}

function renderTopicCard(topic) {
  const isPoll = topic.type === "poll";
  const group = getTopicGroupRecord(topic);
  const topicDeleted = isTopicDeleted(topic);
  const topicArchived = isTopicArchived(topic);
  const groupArchived = isGroupArchived(group);
  const topicLocked = topicArchived || topicDeleted || groupArchived;
  const yesCount = Number(topic?.poll?.counts?.YES ?? 0);
  const noCount = Number(topic?.poll?.counts?.NO ?? 0);
  const total = Math.max(0, Number(topic?.poll?.total_votes ?? (yesCount + noCount)));
  const yesPct = total > 0 ? Math.round((yesCount / total) * 100) : 0;
  const noPct = total > 0 ? Math.round((noCount / total) * 100) : 0;
  const safeGroup = encodeURIComponent(topic.group_id);
  const safeName = encodeURIComponent(topic.name);
  const safeTopicId = encodeURIComponent(topic.id);
  const safeScope = encodeURIComponent(topicScopeValue(topic));
  const imageBlock = topic.image_url
    ? `<img src="${escapeHtml(topic.image_url)}" alt="topic" style="width:100%; height:210px; object-fit:cover; border-radius:14px 14px 0 0;">`
    : `<div style="height:210px; border-radius:14px 14px 0 0; background:linear-gradient(140deg,#3968af,#76a8dd);"></div>`;

  const bodyHtml = topicDeleted ? "" : (topic.body ? escapeHtml(topic.body) : "");
  const isTruncated = bodyHtml.length > 180 && !selectedTopicId;
  const truncBody = isTruncated ? bodyHtml.substring(0, 180) + '...' : bodyHtml;
  const statusBadges = [
    topicDeleted ? `<span class="chip" style="background:#3f3f46; color:#e5e7eb;">Deleted</span>` : "",
    topicArchived ? `<span class="chip" style="background:rgba(245,158,11,0.14); color:#fcd34d;">Archived</span>` : "",
    groupArchived ? `<span class="chip" style="background:rgba(248,113,113,0.12); color:#fca5a5;">Community Closed</span>` : ""
  ].filter(Boolean).join("");
  const topicActionButtons = selectedTopicId
    ? `
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        ${canEditOwnTopic(topic) ? `<button title="Edit Post" aria-label="Edit Post" onclick="openTopicEditModal('${escapeHtml(topic.id)}')" class="topic-action-btn edit">${topicActionIcon("edit")}</button>` : ""}
        ${canDeleteOwnTopic(topic) ? `<button title="Delete Post" aria-label="Delete Post" onclick="deleteTopicConfirm('${escapeHtml(topic.id)}')" class="topic-action-btn delete">${topicActionIcon("delete")}</button>` : ""}
        ${canArchiveTopic(topic) ? `<button title="${topicArchived ? "Reopen Post" : "Archive Post"}" aria-label="${topicArchived ? "Reopen Post" : "Archive Post"}" onclick="toggleTopicArchive('${escapeHtml(topic.id)}', '${topicArchived ? "active" : "archived"}')" class="topic-action-btn archive">${topicActionIcon("archive")}</button>` : ""}
      </div>
    `
    : "";
  const lockNotice = topicDeleted
    ? `<div style="margin:10px 0 12px 0; padding:10px 12px; border-radius:10px; background:#27272a; color:#d4d4d8;">This topic was soft-deleted by its author and is now read-only.</div>`
    : topicArchived
      ? `<div style="margin:10px 0 12px 0; padding:10px 12px; border-radius:10px; background:#422006; color:#fde68a;">This topic is archived and read-only.</div>`
      : groupArchived
        ? `<div style="margin:10px 0 12px 0; padding:10px 12px; border-radius:10px; background:#3f1d1d; color:#fecaca;">This community is archived. Posts remain visible but interaction is locked.</div>`
        : "";

  const openIconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;

  // Only show reply inputs on the dedicated topic page
  const renderReplyControls = !!selectedTopicId;

  return `
    <article style="background:#f6f8fa; color:#1f2937; border:1px solid #d1d5db; border-radius:16px; overflow:hidden;">
      ${imageBlock}
      <div style="padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:14px; margin-bottom:6px;">
          <div style="font-size:1.3rem; color:#111827; cursor:pointer; font-weight:bold;" onclick="location.hash='#/group/${safeGroup}/topic/${escapeHtml(topic.id)}'">${escapeHtml(topic.name)}</div>
          ${selectedTopicId ? topicActionButtons : ""}
        </div>
        <div style="font-size:0.82rem; color:#6b7280; margin-bottom:12px;">Community: ${escapeHtml(topic.group_id)}</div>
        ${statusBadges ? `<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">${statusBadges}</div>` : ""}
        ${lockNotice}
        ${bodyHtml ? `<div id="body-${topic.id}" data-full="${bodyHtml}" data-trunc="${truncBody}" style="margin:0 0 12px 0; color:#4b5563; white-space: pre-wrap; font-size:0.95rem;">${truncBody}</div>` : ""}
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
              <button class="btn-blue" style="flex:1;" ${topicLocked ? "disabled" : ""} onclick="submitPollVote(decodeURIComponent('${safeGroup}'), decodeURIComponent('${safeScope}'), decodeURIComponent('${safeTopicId}'), 'YES')">Yes</button>
              <button class="btn-blue" style="flex:1;" ${topicLocked ? "disabled" : ""} onclick="submitPollVote(decodeURIComponent('${safeGroup}'), decodeURIComponent('${safeScope}'), decodeURIComponent('${safeTopicId}'), 'NO')">NO</button>
            </div>
            ${renderReplyControls && !topicLocked ? `
              <div style="display:flex; gap:10px; flex-direction:column; margin-top:10px; border-top:1px solid #e5e7eb; padding-top:14px;">
                <textarea id="reply-${selectedTopicId ? 'page' : 'feed'}-${escapeHtml(topic.id)}" rows="2" placeholder="Write your comment..." style="background:#ffffff; color:#111827; border:1px solid #d1d5db;"></textarea>
                <button class="btn-blue" onclick="submitSignalText(this, decodeURIComponent('${safeGroup}'), decodeURIComponent('${safeScope}'), '${escapeHtml(topic.id)}', 'reply-${selectedTopicId ? 'page' : 'feed'}-${escapeHtml(topic.id)}', null, 'poll')">Submit Comment</button>
              </div>
            ` : ""}
          </div>
        ` : `
          <div style="display:flex; gap:10px; flex-direction:column; margin-top:14px;">
            ${topicLocked ? "" : `
            <textarea id="reply-${selectedTopicId ? 'page' : 'feed'}-${escapeHtml(topic.id)}" rows="2" placeholder="Write your anonymous reply..." style="background:#ffffff; color:#111827; border:1px solid #d1d5db;"></textarea>
            <button class="btn-blue" onclick="submitSignalText(this, decodeURIComponent('${safeGroup}'), decodeURIComponent('${safeScope}'), '${escapeHtml(topic.id)}', 'reply-${selectedTopicId ? 'page' : 'feed'}-${escapeHtml(topic.id)}', null, 'open')">Submit Anonymous Reply</button>
            `}
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
    if (floatingHistoryNav) floatingHistoryNav.style.display = "none";
  } else {
    landingOverlay.classList.add("hidden");
    appShell.style.display = "grid";
    if (floatingHistoryNav) floatingHistoryNav.style.display = "flex";
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

function captureRouteSnapshot(viewId = currentViewId) {
  return {
    viewId: viewId || null,
    groupId: selectedGroupId || null,
    topicId: selectedTopicId || null,
    adminGroupId: selectedAdminGroupId || null
  };
}

function sameRouteSnapshot(a, b) {
  return JSON.stringify(a || null) === JSON.stringify(b || null);
}

function rememberViewTransition(nextViewId) {
  if (!nextViewId) return;
  const nextSnapshot = captureRouteSnapshot(nextViewId);
  if (currentRouteSnapshot && !sameRouteSnapshot(currentRouteSnapshot, nextSnapshot)) {
    viewHistoryStack.push(currentRouteSnapshot);
    if (viewHistoryStack.length > 64) {
      viewHistoryStack.shift();
    }
    viewForwardStack.length = 0;
  }
  currentViewId = nextViewId;
  currentRouteSnapshot = nextSnapshot;
}

function popPreviousView() {
  while (viewHistoryStack.length > 0) {
    const candidate = viewHistoryStack.pop();
    if (candidate && !sameRouteSnapshot(candidate, currentRouteSnapshot)) {
      return candidate;
    }
  }
  return null;
}

function popForwardView() {
  while (viewForwardStack.length > 0) {
    const candidate = viewForwardStack.pop();
    if (candidate && !sameRouteSnapshot(candidate, currentRouteSnapshot)) {
      return candidate;
    }
  }
  return null;
}

function applyRouteSnapshot(snapshot, { storeForward = false } = {}) {
  if (!snapshot?.viewId) return false;
  if (storeForward && currentRouteSnapshot) {
    viewForwardStack.push(currentRouteSnapshot);
  }
  selectedGroupId = snapshot.groupId || null;
  selectedTopicId = snapshot.topicId || null;
  selectedAdminGroupId = snapshot.adminGroupId || null;
  setView(snapshot.viewId, { skipHistory: true });
  currentViewId = snapshot.viewId;
  currentRouteSnapshot = captureRouteSnapshot(snapshot.viewId);
  return true;
}

// Router
function setView(viewId, options = {}) {
  if (!options.skipHistory) {
    rememberViewTransition(viewId);
  } else {
    currentViewId = viewId;
    currentRouteSnapshot = captureRouteSnapshot(viewId);
  }
  const views = [viewDiscover, viewFeed, viewGroup, viewTopic, viewCreateGroup, viewCreateTopic, viewIdentity, viewAdminTools];
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
  if (viewId === 'viewAdminTools') { viewAdminTools.classList.remove("hidden"); loadAdmin(); }
}

function applyRouteFromHash() {
  const hash = String(location.hash || "");
  if (hash.startsWith("#/group/")) {
    const route = hash.replace("#/group/", "");
    const adminSuffix = "/admin";
    if (route.endsWith(adminSuffix)) {
      selectedGroupId = decodeURIComponent(route.slice(0, -adminSuffix.length));
      selectedTopicId = null;
      selectedAdminGroupId = selectedGroupId;
      const nextSnapshot = captureRouteSnapshot("viewAdminTools");
      if (!sameRouteSnapshot(nextSnapshot, currentRouteSnapshot)) {
        setView("viewAdminTools");
      }
      return;
    }

    const parts = route.split("/topic/");
    selectedGroupId = decodeURIComponent(parts[0] || "");
    selectedAdminGroupId = null;
    if (parts.length > 1) {
      selectedTopicId = decodeURIComponent(parts[1] || "");
      const nextSnapshot = captureRouteSnapshot("viewTopic");
      if (!sameRouteSnapshot(nextSnapshot, currentRouteSnapshot)) {
        setView("viewTopic");
      }
    } else {
      selectedTopicId = null;
      const nextSnapshot = captureRouteSnapshot("viewGroup");
      if (!sameRouteSnapshot(nextSnapshot, currentRouteSnapshot)) {
        setView("viewGroup");
      }
    }
    return;
  }
  selectedGroupId = null;
  selectedTopicId = null;
  selectedAdminGroupId = null;
}

window.openGroupPage = (groupId) => {
  if (!groupId) return;
  selectedGroupId = decodeURIComponent(String(groupId));
  selectedAdminGroupId = null;
  selectedTopicId = null;
  setView("viewGroup");
  location.hash = `#/group/${encodeURIComponent(selectedGroupId)}`;
};

window.openGroupAdminTools = (groupId) => {
  if (!groupId) return;
  selectedAdminGroupId = decodeURIComponent(String(groupId));
  selectedGroupId = selectedAdminGroupId;
  selectedTopicId = null;
  setView("viewAdminTools");
  location.hash = `#/group/${encodeURIComponent(selectedAdminGroupId)}/admin`;
};

window.openRulesModalForGroup = (groupId) => {
  const resolvedGroupId = decodeURIComponent(String(groupId || ""));
  const group = lastKnownState?.groups?.[resolvedGroupId];
  if (!group) return;
  openGroupRulesModal(group);
};

backToDiscover?.addEventListener("click", () => {
  const previous = popPreviousView();
  if (previous && applyRouteSnapshot(previous, { storeForward: true })) {
    return;
  }
  selectedGroupId = null;
  location.hash = "";
  setView("viewDiscover");
});

backToGroup?.addEventListener("click", () => {
  const previous = popPreviousView();
  if (previous && applyRouteSnapshot(previous, { storeForward: true })) {
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

floatingBackBtn?.addEventListener("click", () => {
  const previous = popPreviousView();
  if (previous) {
    applyRouteSnapshot(previous, { storeForward: true });
  }
});

floatingForwardBtn?.addEventListener("click", () => {
  const next = popForwardView();
  if (next) {
    viewHistoryStack.push(currentRouteSnapshot);
    applyRouteSnapshot(next);
  }
});

topicEditCloseBtn?.addEventListener("click", closeTopicEditModal);
topicEditCancelBtn?.addEventListener("click", closeTopicEditModal);
topicEditModal?.addEventListener("click", (event) => {
  if (event.target === topicEditModal) {
    closeTopicEditModal();
  }
});
groupRulesModalCloseBtn?.addEventListener("click", closeGroupRulesModal);
groupRulesModal?.addEventListener("click", (event) => {
  if (event.target === groupRulesModal) {
    closeGroupRulesModal();
  }
});
topicEditSaveBtn?.addEventListener("click", async () => {
  setBusy(topicEditSaveBtn, true);
  try {
    await saveTopicEditModal();
  } catch (error) {
    alert("Post edit failed: " + error.message);
  } finally {
    setBusy(topicEditSaveBtn, false);
  }
});

window.addEventListener("hashchange", applyRouteFromHash);

[
  groupPolicyOpenEl,
  groupPolicyTokenEnabledEl,
  groupPolicyRepEnabledEl,
  groupPolicyKycEnabledEl,
  groupPolicyAllowlistEnabledEl
].forEach((checkbox) => checkbox?.addEventListener("change", () => {
  syncPolicyCheckboxes(
    groupPolicyOpenEl,
    groupPolicyTokenEnabledEl,
    groupPolicyRepEnabledEl,
    groupPolicyKycEnabledEl,
    groupPolicyAllowlistEnabledEl,
    policyMinTokenEl,
    minReputationEl,
    allowlistIdsEl
  );
}));

[
  adminPolicyOpen,
  adminPolicyTokenEnabled,
  adminPolicyRepEnabled,
  adminPolicyKycEnabled,
  adminPolicyAllowlistEnabled
].forEach((checkbox) => checkbox?.addEventListener("change", () => {
  syncPolicyCheckboxes(
    adminPolicyOpen,
    adminPolicyTokenEnabled,
    adminPolicyRepEnabled,
    adminPolicyKycEnabled,
    adminPolicyAllowlistEnabled,
    adminPolicyMinToken,
    adminPolicyMinReputation,
    adminPolicyAllowlist
  );
}));

document.getElementById("groupDepth")?.addEventListener("input", (event) => {
  const input = event.currentTarget;
  input.value = String(clampDepthValue(input.value));
});

syncPolicyCheckboxes(
  groupPolicyOpenEl,
  groupPolicyTokenEnabledEl,
  groupPolicyRepEnabledEl,
  groupPolicyKycEnabledEl,
  groupPolicyAllowlistEnabledEl,
  policyMinTokenEl,
  minReputationEl,
  allowlistIdsEl
);
syncPolicyCheckboxes(
  adminPolicyOpen,
  adminPolicyTokenEnabled,
  adminPolicyRepEnabled,
  adminPolicyKycEnabled,
  adminPolicyAllowlistEnabled,
  adminPolicyMinToken,
  adminPolicyMinReputation,
  adminPolicyAllowlist
);

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

feedScopeCreatedBtn?.addEventListener("click", async () => {
  uiFilters.feedScope = "created";
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

discoverScopeCreatedBtn?.addEventListener("click", async () => {
  uiFilters.discoverScope = "created";
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
    lastKnownState = state;
    const myGroups = await getJoinedGroups(state);
    const discoverQuery = normalizeSearchValue(uiFilters.discoverQuery);
    const allGroups = Object.entries(state.groups || {});
    const visibleGroups = allGroups.filter(([id, group]) => {
      const isJoined = myGroups.includes(id);
      if (uiFilters.discoverScope === "mine" && !isJoined) {
        return false;
      }
      if (uiFilters.discoverScope === "created" && String(group?.created_by_identity_id || "") !== String(lastIdentity?.id || "")) {
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
      const archived = isGroupArchived(group);
      const policyLabel = formatPolicyLabel(group?.eligibility_policy);
      const showAdminGear = (uiFilters.discoverScope === "mine" || uiFilters.discoverScope === "created") && canManageGroup(group);
      const gearButton = showAdminGear
        ? `<button title="Community Admin Tools" onclick="openGroupAdminTools('${encodeURIComponent(id)}')" style="padding:8px 10px; border-radius:8px; border:none; background:transparent; color:var(--text); cursor:pointer; margin-bottom:8px;">⚙️</button>`
        : "";
      const communityVisual = group?.header_image_url
        ? `<img src="${escapeHtml(group.header_image_url)}" alt="${escapeHtml(group?.name || id)}" style="width:58px; height:58px; border-radius:16px; object-fit:cover; border:1px solid rgba(255,255,255,0.12); flex:0 0 auto;" />`
        : `<div style="width:58px; height:58px; border-radius:16px; display:flex; align-items:center; justify-content:center; background:linear-gradient(145deg,#23437a,#3f7cff); border:1px solid rgba(255,255,255,0.12); color:#f8fbff; font-weight:700; font-size:1rem; flex:0 0 auto;">${escapeHtml(String(group?.name || id || "C").trim().slice(0, 2).toUpperCase())}</div>`;

      html += `
        <div style="background:rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:14px; min-width:0;">
            ${communityVisual}
            <div style="min-width:0;">
              <h3 style="margin:0 0 5px 0; font-size: 1.1rem; cursor:pointer; text-decoration:underline;" onclick="openGroupPage('${encodeURIComponent(id)}')">#${escapeHtml(id)}</h3>
              <small style="display:block; color:var(--muted); margin-bottom:4px;">${escapeHtml(group.description || "")}</small>
              <span class="chip" style="font-size: 0.8rem;">${escapeHtml(policyLabel)}</span>
              ${archived ? `<span class="chip" style="font-size:0.8rem; margin-left:8px; background:rgba(248,113,113,0.12); color:#fca5a5;">Archived</span>` : ""}
              <small style="color:var(--muted); margin-left: 10px;">${group.leaves.length} Members</small>
            </div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end;">
            ${gearButton}
            ${archived
          ? `<button disabled style="background:#222; opacity: 0.8;">Closed</button>`
          : isJoined
          ? `<button disabled style="background:#222; opacity: 0.8;">Member</button>`
          : `<button class="btn-blue" onclick="joinGroupClick('${encodeURIComponent(id)}')">+ Join</button>`}
          </div>
        </div>
      `;
    }
    html += `</div>`;
    if (visibleGroups.length === 0) {
      discoverOut.innerHTML = uiFilters.discoverScope === "mine"
        ? "No communities matched in your memberships."
        : uiFilters.discoverScope === "created"
          ? "No communities created by your active identity."
          : "No communities matched your search.";
      return;
    }
    discoverOut.innerHTML = html;
    renderLucideIcons();
  } catch (err) {
    discoverOut.innerHTML = "Error loading discover: " + err.message;
  }
}

async function loadFeed() {
  try {
    const [topics, state] = await Promise.all([api("/api/topics"), api("/api/state")]);
    lastKnownState = state;
    const myGroups = await getJoinedGroups(state);
    const feedQuery = normalizeSearchValue(uiFilters.feedQuery);
    feedOut.innerHTML = ``;

    const visibleTopics = (topics || [])
      .filter((topic) => {
        if (uiFilters.feedScope === "all") return true;
        if (uiFilters.feedScope === "mine") return myGroups.includes(topic.group_id);
        if (uiFilters.feedScope === "created") return String(topic?.author_identity_id || "") === String(lastIdentity?.id || "");
        return true;
      })
      .filter((topic) => {
        if (!feedQuery) return true;
        const searchBlob = normalizeSearchValue([topic.group_id, topic.name, topic.type, topic.body].join(" "));
        return searchBlob.includes(feedQuery);
      })
      .sort((a, b) => Date.parse(b?.created_at || 0) - Date.parse(a?.created_at || 0));

    if (visibleTopics.length === 0) {
      feedOut.innerHTML = uiFilters.feedScope === "mine"
        ? "<p>No posts matched in your communities.</p>"
        : uiFilters.feedScope === "created"
          ? "<p>No posts created by your active identity.</p>"
          : "<p>No posts matched your search.</p>";
      return;
    }

    let html = `<div style="display:flex; flex-direction:column; gap: 15px;">`;
    for (const topic of visibleTopics) {
      html += renderTopicCard(topic);
    }
    html += `</div>`;
    feedOut.innerHTML = html;
    renderLucideIcons();
  } catch (err) {
    feedOut.innerHTML = "Error loading feed: " + err.message;
  }
}

async function loadGroupPage() {
  try {
    if (!selectedGroupId) {
      groupPageOut.innerHTML = "Community not selected.";
      return;
    }
    const [state, topics] = await Promise.all([api("/api/state"), api("/api/topics")]);
    lastKnownState = state;
    const group = state?.groups?.[selectedGroupId];
    if (!group) {
      groupPageOut.innerHTML = `Community not found: ${escapeHtml(selectedGroupId)}`;
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
    const groupArchived = isGroupArchived(group);
    const showAdminGear = canManageGroup(group);
    const policyLabel = formatPolicyLabel(group?.eligibility_policy);
    const tagHtml = Array.isArray(group?.tags) && group.tags.length > 0
      ? `<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;">${group.tags.map((tag) => `<span class="chip" style="background:rgba(96,165,250,0.12); color:#93c5fd;">${escapeHtml(tag)}</span>`).join("")}</div>`
      : "";
    const rulesButton = `<button type="button" onclick="openRulesModalForGroup('${encodeURIComponent(selectedGroupId)}')" style="padding:10px 18px; border-radius:10px; border:1px solid transparent; background:var(--accent); color:#ffffff; cursor:pointer; box-shadow:none; min-width:120px;">Rules</button>`;
    const adminGear = showAdminGear
      ? `<button title="Community Admin Tools" onclick="openGroupAdminTools('${encodeURIComponent(selectedGroupId)}')" style="padding:8px 10px; border-radius:8px; border:none; background:transparent; color:var(--text); cursor:pointer;">⚙️</button>`
      : "";

    let html = `
      <div style="display:flex; flex-direction:column; gap:14px;">
        ${headerImage}
        <div style="background:rgba(0,0,0,0.25); border:1px solid var(--line); border-radius:12px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
            <h2 style="margin:0 0 6px 0;">${escapeHtml(group.name || group.id)}</h2>
            ${adminGear}
          </div>
          <p style="margin:0 0 8px 0; color:var(--muted);">${escapeHtml(group.description || "No introduction yet.")}</p>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            <span class="chip">Members: ${Number(group?.stats?.member_count ?? group?.leaves?.length ?? 0)}</span>
            <span class="chip">Topics: ${Number(group?.stats?.topic_count ?? groupTopics.length)}</span>
            ${groupArchived ? `<span class="chip" style="background:rgba(248,113,113,0.12); color:#fca5a5;">Archived</span>` : ""}
            <span class="chip">Policy: ${escapeHtml(policyLabel)}</span>
          </div>
          ${tagHtml}
          <div style="margin-top:10px;">
            ${groupArchived
        ? `<button disabled style="padding:10px 18px; border-radius:10px; border:1px solid var(--line); background:#222; color:#d1d5db; opacity:0.85; min-width:120px;">Closed</button>`
        : isJoined
        ? `<button disabled style="padding:10px 18px; border-radius:10px; border:1px solid var(--line); background:#222; color:#d1d5db; opacity:0.85; min-width:120px;">Member</button>`
        : `<button class="btn-blue" style="padding:10px 18px; min-width:120px;" onclick="joinGroupClick('${encodeURIComponent(selectedGroupId)}')">+ Join</button>`}
            ${rulesButton}
          </div>
        </div>
      </div>
    `;

    if (groupTopics.length === 0) {
      html += `<p style="color:var(--muted); margin-top:14px;">No posts in this community yet.</p>`;
    } else {
      html += `<div style="margin-top:14px; display:flex; flex-direction:column; gap:14px;">`;
      for (const topic of groupTopics) {
        html += renderTopicCard(topic);
      }
      html += `</div>`;
    }

    groupPageOut.innerHTML = html;
    renderLucideIcons();
  } catch (err) {
    groupPageOut.innerHTML = "Error loading community page: " + err.message;
  }
}

async function loadTopicPage() {
  try {
    if (!selectedGroupId || !selectedTopicId) {
      topicPageOut.innerHTML = "Post not selected.";
      return;
    }
    const [state, topics] = await Promise.all([api("/api/state"), api("/api/topics")]);
    lastKnownState = state;
    const topic = (topics || []).find((t) => t.id === selectedTopicId);
    if (!topic) {
      topicPageOut.innerHTML = `Post not found.`;
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
      const canModerateComments = canManageGroup(getCurrentGroupRecord(topic.group_id));
      const commentsLocked = !isTopicActive(topic) || isGroupArchived(getCurrentGroupRecord(topic.group_id));

      const renderSignal = (sig, isNested = false) => {
        const reactions = sig.reactions || {};
        const myActiveReaction = activeIdentityId && sig?.reaction_users?.[activeIdentityId]
          ? String(sig.reaction_users[activeIdentityId])
          : null;
        const isOwnComment = activeIdentityId && String(sig.identity_id || "") === activeIdentityId;
        const canEditOrDeleteComment = !commentsLocked && (isOwnComment || canModerateComments);
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
        const addReactionBarHtml = commentsLocked ? "" : `<button onclick="window.openEmojiPicker(event, 'signal', '${sig.id}')" style="padding:4px; border-radius:999px; border:1px dashed #9ca3af; background:#ffffff; cursor:pointer; color:#374151; display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px;" title="Add Reaction"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M8 10h.01"></path><path d="M16 10h.01"></path><path d="M8.8 15.2c.9 1 2 1.5 3.2 1.5s2.3-.5 3.2-1.5"></path></svg></button>`;
        const commentActionsHtml = canEditOrDeleteComment
          ? `<div style="display:flex; gap:8px;">
               <button onclick="editCommentPrompt('${sig.id}', '${safeMessage}')" style="padding:4px 8px; font-size:0.78rem; border-radius:8px; border:1px solid #d1d5db; background:#fff; color:#374151; cursor:pointer;">Edit</button>
               <button onclick="deleteCommentConfirm('${sig.id}')" style="padding:4px 8px; font-size:0.78rem; border-radius:8px; border:1px solid #fecaca; background:#fff1f2; color:#b91c1c; cursor:pointer;">Delete</button>
             </div>`
          : "";
        const editedLabel = sig.edited_at ? `<span style="margin-left:6px; color:#9ca3af;">(edited)</span>` : "";

        let nestedRepliesHtml = "";
        if (isPoll && !isNested && !commentsLocked) {
          const children = topicSignals.filter(s => s.parent_id === sig.id);
          nestedRepliesHtml = children.map(c => renderSignal(c, true)).join('');

          const safeGroup = encodeURIComponent(topic.group_id);
          const safeScope = encodeURIComponent(topicScopeValue(topic));
          nestedRepliesHtml += `
            <button onclick="const box = document.getElementById('reply-box-${sig.id}'); box.style.display = box.style.display === 'none' ? 'flex' : 'none';" style="background:transparent; color:#60a5fa; border:none; cursor:pointer; font-size:0.9rem; padding:0; margin-top:10px; box-shadow:none;">Reply to this comment</button>
            <div id="reply-box-${sig.id}" style="display:none; flex-direction:column; gap:6px; margin-top:8px;">
              <textarea id="reply-input-${sig.id}" rows="2" placeholder="Write a reply..." style="background:#ffffff; color:#111827; border:1px solid #d1d5db;"></textarea>
              <button class="btn-blue" onclick="submitSignalText(this, decodeURIComponent('${safeGroup}'), decodeURIComponent('${safeScope}'), '${escapeHtml(topic.id)}', 'reply-input-${sig.id}', '${sig.id}', 'poll')" style="padding:4px 8px; font-size:0.8rem; width:fit-content;">Submit Reply</button>
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
    renderLucideIcons();
  } catch (err) {
    topicPageOut.innerHTML = "Error loading post page: " + err.message;
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

function closeTopicEditModal() {
  topicEditDraftId = null;
  if (topicEditName) {
    topicEditName.disabled = false;
    topicEditName.title = "";
  }
  if (topicEditMetaHint) {
    topicEditMetaHint.textContent = "";
  }
  topicEditModal?.classList.add("hidden");
}

window.openTopicEditModal = async (topicId) => {
  if (!lastIdentity) {
    alert("You need to select an Identity first.");
    return;
  }
  try {
    const topics = await api("/api/topics");
    const topic = (topics || []).find((entry) => String(entry.id) === String(topicId));
    if (!topic) {
      throw new Error("TOPIC_NOT_FOUND");
    }
    const hasActivity = Number(topic?.poll?.total_votes || 0) > 0 || Number(topic?.stats?.signal_count || 0) > 0;
    topicEditDraftId = String(topicId);
    if (topicEditName) {
      topicEditName.value = String(topic.name || "");
      topicEditName.disabled = hasActivity;
      topicEditName.title = hasActivity ? "Post title is locked after votes or replies exist." : "";
    }
    if (topicEditMetaHint) {
      topicEditMetaHint.textContent = hasActivity
        ? "Title is locked because this post already has votes or replies. Body, image, and link remain editable."
        : "Post type stays fixed. Title, body, image, and link can be updated.";
    }
    if (topicEditBody) topicEditBody.value = String(topic.body || "");
    if (topicEditImageUrl) topicEditImageUrl.value = String(topic.image_url || "");
    if (topicEditLinkUrl) topicEditLinkUrl.value = String(topic.link_url || "");
    topicEditModal?.classList.remove("hidden");
  } catch (err) {
    alert("Post edit failed: " + err.message);
  }
};

async function saveTopicEditModal() {
  if (!topicEditDraftId) {
    throw new Error("POST_NOT_SELECTED");
  }
  await api("/api/topics/edit", {
    method: "POST",
    body: JSON.stringify({
      topic_id: topicEditDraftId,
      identity_id: lastIdentity?.id || null,
      name: String(topicEditName?.value || "").trim(),
      body: String(topicEditBody?.value || "").trim(),
      image_url: String(topicEditImageUrl?.value || "").trim() || null,
      link_url: String(topicEditLinkUrl?.value || "").trim() || null
    })
  });
  closeTopicEditModal();
  await loadFeed();
  if (selectedGroupId) await loadGroupPage();
  if (selectedTopicId) await loadTopicPage();
}

window.deleteTopicConfirm = async (topicId) => {
  if (!lastIdentity) {
    alert("You need to select an Identity first.");
    return;
  }
  if (!window.confirm("Soft delete this topic? It will remain visible and become read-only.")) {
    return;
  }
  try {
    await api("/api/topics/delete", {
      method: "POST",
      body: JSON.stringify({
        topic_id: topicId,
        identity_id: lastIdentity.id
      })
    });
    await loadFeed();
    if (selectedGroupId) await loadGroupPage();
    if (selectedTopicId) await loadTopicPage();
  } catch (err) {
    alert("Post delete failed: " + err.message);
  }
};

window.toggleTopicArchive = async (topicId, status) => {
  if (!lastIdentity) {
    alert("You need to select an Identity first.");
    return;
  }
  const label = status === "archived" ? "archive" : "reopen";
  if (!window.confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} this post?`)) {
    return;
  }
  try {
    await api("/api/topics/archive", {
      method: "POST",
      body: JSON.stringify({
        topic_id: topicId,
        identity_id: lastIdentity.id,
        status
      })
    });
    await loadFeed();
    if (selectedGroupId) await loadGroupPage();
    if (selectedTopicId) await loadTopicPage();
  } catch (err) {
    alert("Post archive failed: " + err.message);
  }
};

async function loadAdmin() {
  try {
    const state = await api("/api/state");
    lastKnownState = state;
    adminTopicGroup.innerHTML = '';
    const groups = Object.entries(state.groups || {});
    for (const [id, group] of groups) {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = group?.name ? `${group.name} (#${id})` : id;
      adminTopicGroup.appendChild(opt);
    }

    const manageableGroups = groups.filter(([, group]) => canManageGroup(group));

    if (groups.length === 0) {
      selectedAdminGroupId = null;
      if (adminGroupNameLabel) adminGroupNameLabel.textContent = "No communities available";
      if (adminMemberDropdown) adminMemberDropdown.innerHTML = "<option value=''>No identities</option>";
      if (adminMemberCommitmentInput) adminMemberCommitmentInput.value = "";
      if (adminAddMemberBtn) adminAddMemberBtn.disabled = true;
      if (adminRemoveMemberBtn) adminRemoveMemberBtn.disabled = true;
      if (adminUpdatePolicyBtn) adminUpdatePolicyBtn.disabled = true;
      if (adminUpdateMetadataBtn) adminUpdateMetadataBtn.disabled = true;
      if (adminAddAdminBtn) adminAddAdminBtn.disabled = true;
      if (adminRemoveAdminBtn) adminRemoveAdminBtn.disabled = true;
      if (adminArchiveGroupBtn) adminArchiveGroupBtn.disabled = true;
      if (adminReopenGroupBtn) adminReopenGroupBtn.disabled = true;
      setAdminMemberInteraction("none");
      return;
    }

    if (manageableGroups.length === 0) {
      selectedAdminGroupId = null;
      if (adminGroupNameLabel) adminGroupNameLabel.textContent = "No admin access for active identity";
      if (adminMemberDropdown) adminMemberDropdown.innerHTML = "<option value=''>No access</option>";
      if (adminMemberCommitmentInput) adminMemberCommitmentInput.value = "";
      if (adminToolsOut) {
        setOutput(adminToolsOut, "Admin access denied. Switch to a community owner/admin identity.", true);
      }
      if (adminAddMemberBtn) adminAddMemberBtn.disabled = true;
      if (adminRemoveMemberBtn) adminRemoveMemberBtn.disabled = true;
      if (adminUpdatePolicyBtn) adminUpdatePolicyBtn.disabled = true;
      if (adminUpdateMetadataBtn) adminUpdateMetadataBtn.disabled = true;
      if (adminAddAdminBtn) adminAddAdminBtn.disabled = true;
      if (adminRemoveAdminBtn) adminRemoveAdminBtn.disabled = true;
      if (adminArchiveGroupBtn) adminArchiveGroupBtn.disabled = true;
      if (adminReopenGroupBtn) adminReopenGroupBtn.disabled = true;
      setAdminMemberInteraction("access_denied");
      return;
    }

    const defaultManageableGroupId = String(manageableGroups[0][0]);
    const preferredGroupId = selectedAdminGroupId || selectedGroupId || defaultManageableGroupId;
    const resolvedGroupId = manageableGroups.some(([gid]) => String(gid) === String(preferredGroupId))
      ? String(preferredGroupId)
      : defaultManageableGroupId;
    selectedAdminGroupId = resolvedGroupId;

    const group = state.groups?.[resolvedGroupId];
    if (adminGroupNameLabel) {
      const statusText = isGroupArchived(group) ? "archived" : "active";
      adminGroupNameLabel.textContent = `${group?.name || resolvedGroupId} (#${resolvedGroupId}) · ${statusText}`;
    }
    if (adminToolsOut) {
      adminToolsOut.textContent = "";
    }

    const identityByCommitment = new Map();
    for (const [identityId, identity] of Object.entries(state.identities || {})) {
      const commitment = String(identity?.commitment || "");
      if (!commitment) continue;
      identityByCommitment.set(commitment, identityId);
    }

    const groupLeaves = Array.isArray(group?.leaves) ? group.leaves.map((x) => String(x)) : [];
    const groupLeafSet = new Set(groupLeaves);

    if (adminMemberDropdown) {
      const addCandidates = Object.entries(state.identities || {})
        .map(([identityId, identity]) => ({
          identityId: String(identityId),
          commitment: String(identity?.commitment || ""),
          action: "add"
        }))
        .filter((x) => x.commitment && !groupLeafSet.has(x.commitment));

      const removeCandidates = groupLeaves.map((commitment) => ({
        identityId: identityByCommitment.get(commitment) || "unknown",
        commitment: String(commitment),
        action: "remove"
      }));

      const options = [...addCandidates, ...removeCandidates];
      if (options.length === 0) {
        adminMemberDropdown.innerHTML = "<option value='' data-action='none'>No identity options</option>";
      } else {
        adminMemberDropdown.innerHTML = options
          .map((x) => {
            const stateLabel = x.action === "remove" ? "In group" : "Available";
            return `<option value="${escapeHtml(x.commitment)}" data-action="${escapeHtml(x.action)}">${escapeHtml(x.identityId)} · ${escapeHtml(stateLabel)} · ${escapeHtml(shortCommitment(x.commitment))}</option>`;
          })
          .join("");
        adminMemberDropdown.innerHTML = `<option value="" data-action="none">Select from identity list</option>${adminMemberDropdown.innerHTML}`;
      }
    }

    if (adminTargetIdentityDropdown) {
      const currentAdminSet = new Set(getGroupAdminIds(group));
      const identityOptions = Object.keys(state.identities || {})
        .map((identityId) => {
          const role = currentAdminSet.has(String(identityId)) ? "Current admin" : "Available identity";
          return `<option value="${escapeHtml(identityId)}">${escapeHtml(identityId)} · ${escapeHtml(role)}</option>`;
        });
      adminTargetIdentityDropdown.innerHTML = identityOptions.length > 0
        ? `<option value="">Select from identity list</option>${identityOptions.join("")}`
        : "<option value=''>No identity options</option>";
    }

    if (adminMemberCommitmentInput) {
      adminMemberCommitmentInput.value = "";
    }
    if (adminGroupMetaName) adminGroupMetaName.value = String(group?.name || "");
    if (adminGroupMetaDescription) adminGroupMetaDescription.value = String(group?.description || "");
    if (adminGroupMetaHeaderImage) adminGroupMetaHeaderImage.value = String(group?.header_image_url || "");
    if (adminGroupMetaTags) adminGroupMetaTags.value = Array.isArray(group?.tags) ? group.tags.join("\n") : "";
    if (adminGroupMetaRules) adminGroupMetaRules.value = Array.isArray(group?.rules) ? group.rules.join("\n") : "";
    if (adminTargetIdentityInput) adminTargetIdentityInput.value = "";
    const normalizedPolicy = normalizeEligibilityPolicy(group?.eligibility_policy);
    if (adminPolicyOpen) adminPolicyOpen.checked = normalizedPolicy.type === "open";
    if (adminPolicyTokenEnabled) adminPolicyTokenEnabled.checked = normalizedPolicy.min_token_balance > 0 && normalizedPolicy.type !== "allowlist";
    if (adminPolicyRepEnabled) adminPolicyRepEnabled.checked = normalizedPolicy.min_reputation > 0 && normalizedPolicy.type !== "allowlist";
    if (adminPolicyKycEnabled) adminPolicyKycEnabled.checked = normalizedPolicy.require_kyc && normalizedPolicy.type !== "allowlist";
    if (adminPolicyAllowlistEnabled) adminPolicyAllowlistEnabled.checked = normalizedPolicy.type === "allowlist";
    if (adminPolicyMinToken) adminPolicyMinToken.value = Number(group?.eligibility_policy?.min_token_balance || 0);
    if (adminPolicyMinReputation) adminPolicyMinReputation.value = Number(group?.eligibility_policy?.min_reputation || 0);
    if (adminPolicyAllowlist) {
      adminPolicyAllowlist.value = Array.isArray(group?.eligibility_policy?.allowlist_identity_ids)
        ? group.eligibility_policy.allowlist_identity_ids.join("\n")
        : "";
    }
    syncPolicyCheckboxes(
      adminPolicyOpen,
      adminPolicyTokenEnabled,
      adminPolicyRepEnabled,
      adminPolicyKycEnabled,
      adminPolicyAllowlistEnabled,
      adminPolicyMinToken,
      adminPolicyMinReputation,
      adminPolicyAllowlist
    );
    adminMemberUiState.fromDropdown = false;
    setAdminMemberInteraction("ready");
    updateAdminMemberButtonsAvailability();
    if (adminUpdatePolicyBtn) adminUpdatePolicyBtn.disabled = false;
    if (adminUpdateMetadataBtn) adminUpdateMetadataBtn.disabled = false;
    if (adminAddAdminBtn) adminAddAdminBtn.disabled = false;
    if (adminRemoveAdminBtn) adminRemoveAdminBtn.disabled = false;
    if (adminArchiveGroupBtn) adminArchiveGroupBtn.disabled = isGroupArchived(group);
    if (adminReopenGroupBtn) adminReopenGroupBtn.disabled = !isGroupArchived(group);
  } catch (err) {
    console.error(err);
  }
}

// Identity Logic
const LOCAL_VAULT_KEY = "vs_identities";
const LOCAL_VAULT_CLEAR_ONCE_KEY = "vs_local_vault_cleared_20260307_reset5";
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
    if (!hasAnyPolicySelected(groupPolicyOpenEl, groupPolicyTokenEnabledEl, groupPolicyRepEnabledEl, groupPolicyKycEnabledEl, groupPolicyAllowlistEnabledEl)) {
      throw new Error("Select at least one policy.");
    }
    const id = groupIdEl.value.trim();
    const name = groupNameEl.value.trim() || id;
    const description = groupDescriptionEl.value.trim();
    const tags = parseIdentityListInput(String(groupTagsEl?.value || ""));
    const rules = parseIdentityListInput(String(groupRulesEl?.value || ""));
    let header_image_url = groupHeaderImageUrlEl.value.trim() || null;
    const base64File = await readFileAsBase64(groupHeaderImageFileEl.files?.[0]);
    if (base64File) {
      header_image_url = base64File;
    }
    const depth = clampDepthValue(document.getElementById("groupDepth").value);
    let eligibility_policy = { type: "open", open: true };
    if (groupPolicyAllowlistEnabledEl?.checked) {
      eligibility_policy = {
        type: "allowlist",
        allowlist_identity_ids: parseIdentityListInput(String(allowlistIdsEl?.value || ""))
      };
    } else if (!groupPolicyOpenEl?.checked) {
      eligibility_policy = {
        type: "composite",
        min_token_balance: groupPolicyTokenEnabledEl?.checked ? Number(policyMinTokenEl.value || 0) : 0,
        min_reputation: groupPolicyRepEnabledEl?.checked ? Number(minReputationEl?.value || 0) : 0,
        require_kyc: Boolean(groupPolicyKycEnabledEl?.checked)
      };
    }

    const body = {
      group_id: id,
      name,
      description,
      header_image_url,
      tags,
      rules,
      depth,
      eligibility_policy,
      created_by_identity_id: lastIdentity?.id || null
    };
    await api("/api/groups/create", { method: "POST", body: JSON.stringify(body) });
    setOutput(groupOut, `Community ${id} created.`, false);
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
    setOutput(topicOut, `Post "${body.name}" created.`, false);
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

function buildAdminPolicyPayload() {
  if (adminPolicyOpen?.checked) {
    return { type: "open", open: true };
  }
  if (adminPolicyAllowlistEnabled?.checked) {
    return {
      type: "allowlist",
      allowlist_identity_ids: parseIdentityListInput(String(adminPolicyAllowlist?.value || ""))
    };
  }
  return {
    type: "composite",
    min_token_balance: adminPolicyTokenEnabled?.checked ? Number(adminPolicyMinToken?.value || 0) : 0,
    min_reputation: adminPolicyRepEnabled?.checked ? Number(adminPolicyMinReputation?.value || 0) : 0,
    require_kyc: Boolean(adminPolicyKycEnabled?.checked)
  };
}

function renderAdminActionResult(action, responsePayload) {
  const relay = responsePayload?.relay || null;
  const txHash = relay?.tx_hash ? String(relay.tx_hash) : "n/a";
  const relayStatus = relay?.status ? String(relay.status) : "n/a";
  const root = responsePayload?.root ? String(responsePayload.root) : "-";
  const leavesCount = Array.isArray(responsePayload?.leaves) ? responsePayload.leaves.length : 0;
  setOutput(
    adminToolsOut,
    `${action} succeeded\nrelay_status=${relayStatus}\ntx_hash=${txHash}\nroot=${root}\nmembers=${leavesCount}`,
    false
  );
}

function renderStatefulActionResult(action, responsePayload) {
  const status = responsePayload?.status ? String(responsePayload.status) : "-";
  setOutput(adminToolsOut, `${action} succeeded\nstatus=${status}`, false);
}

adminUpdateMetadataBtn?.addEventListener("click", async () => {
  setBusy(adminUpdateMetadataBtn, true);
  try {
    const groupId = String(selectedAdminGroupId || "").trim();
    if (!groupId) throw new Error("Community is required.");
    const response = await api("/api/groups/update-metadata", {
      method: "POST",
      body: JSON.stringify({
        group_id: groupId,
        admin_identity_id: lastIdentity?.id || null,
        name: String(adminGroupMetaName?.value || "").trim(),
        description: String(adminGroupMetaDescription?.value || "").trim(),
        header_image_url: String(adminGroupMetaHeaderImage?.value || "").trim() || null,
        tags: parseIdentityListInput(String(adminGroupMetaTags?.value || "")),
        rules: parseIdentityListInput(String(adminGroupMetaRules?.value || ""))
      })
    });
    renderStatefulActionResult("Update metadata", response);
    await loadAdmin();
    if (selectedGroupId === groupId) await loadGroupPage();
    if (selectedTopicId) await loadTopicPage();
    await loadDiscover();
  } catch (error) {
    setOutput(adminToolsOut, error.message || "Metadata update failed", true);
  } finally {
    setBusy(adminUpdateMetadataBtn, false);
  }
});

async function submitAdminListAction(action) {
  const groupId = String(selectedAdminGroupId || "").trim();
  const targetIdentityId = String(adminTargetIdentityInput?.value || "").trim();
  if (!groupId || !targetIdentityId) {
    throw new Error("Community and target identity are required.");
  }
  const response = await api("/api/groups/manage-admins", {
    method: "POST",
    body: JSON.stringify({
      group_id: groupId,
      admin_identity_id: lastIdentity?.id || null,
      target_identity_id: targetIdentityId,
      action
    })
  });
  setOutput(
    adminToolsOut,
    `${action === "add" ? "Add admin" : "Remove admin"} succeeded\nadmins=${(response?.admins || []).join(", ") || "-"}`,
    false
  );
  await loadAdmin();
  await loadDiscover();
  if (selectedGroupId === groupId) await loadGroupPage();
}

adminAddAdminBtn?.addEventListener("click", async () => {
  setBusy(adminAddAdminBtn, true);
  try {
    await submitAdminListAction("add");
  } catch (error) {
    setOutput(adminToolsOut, error.message || "Add admin failed", true);
  } finally {
    setBusy(adminAddAdminBtn, false);
  }
});

adminRemoveAdminBtn?.addEventListener("click", async () => {
  setBusy(adminRemoveAdminBtn, true);
  try {
    await submitAdminListAction("remove");
  } catch (error) {
    setOutput(adminToolsOut, error.message || "Remove admin failed", true);
  } finally {
    setBusy(adminRemoveAdminBtn, false);
  }
});

async function submitGroupStatus(status) {
  const groupId = String(selectedAdminGroupId || "").trim();
  if (!groupId) throw new Error("Community is required.");
  const response = await api("/api/groups/archive", {
    method: "POST",
    body: JSON.stringify({
      group_id: groupId,
      admin_identity_id: lastIdentity?.id || null,
      status
    })
  });
  renderStatefulActionResult(status === "archived" ? "Archive community" : "Reopen community", response);
  await loadAdmin();
  await loadDiscover();
  if (selectedGroupId === groupId) await loadGroupPage();
  if (selectedTopicId) await loadTopicPage();
}

adminArchiveGroupBtn?.addEventListener("click", async () => {
  setBusy(adminArchiveGroupBtn, true);
  try {
    await submitGroupStatus("archived");
  } catch (error) {
    setOutput(adminToolsOut, error.message || "Archive community failed", true);
  } finally {
    setBusy(adminArchiveGroupBtn, false);
  }
});

adminReopenGroupBtn?.addEventListener("click", async () => {
  setBusy(adminReopenGroupBtn, true);
  try {
    await submitGroupStatus("active");
  } catch (error) {
    setOutput(adminToolsOut, error.message || "Reopen community failed", true);
  } finally {
    setBusy(adminReopenGroupBtn, false);
  }
});

adminMemberCommitmentInput?.addEventListener("focus", () => {
  adminMemberUiState.fromDropdown = false;
  setAdminMemberInteraction("input_focus");
});

adminMemberCommitmentInput?.addEventListener("input", () => {
  adminMemberUiState.fromDropdown = false;
  setAdminMemberInteraction("input_edit");
  updateAdminMemberButtonsAvailability();
});

adminMemberDropdownToggle?.addEventListener("click", () => {
  if (!adminMemberDropdown) return;
  const nextDisplay = adminMemberDropdown.style.display === "none" ? "block" : "none";
  adminMemberDropdown.style.display = nextDisplay;
  setAdminMemberInteraction("dropdown_toggle");
});

adminMemberDropdown?.addEventListener("change", () => {
  const selectedOption = adminMemberDropdown.selectedOptions?.[0];
  const commitment = String(selectedOption?.value || "").trim();
  const action = String(selectedOption?.dataset?.action || "").trim() || null;
  if (adminMemberCommitmentInput) {
    adminMemberCommitmentInput.value = commitment;
  }
  adminMemberUiState.fromDropdown = true;
  setAdminMemberInteraction("dropdown_select", action);
  updateAdminMemberButtonsAvailability();
  adminMemberDropdown.style.display = "none";
});

adminTargetIdentityToggle?.addEventListener("click", () => {
  if (!adminTargetIdentityDropdown) return;
  const nextDisplay = adminTargetIdentityDropdown.style.display === "none" ? "block" : "none";
  adminTargetIdentityDropdown.style.display = nextDisplay;
});

adminTargetIdentityDropdown?.addEventListener("change", () => {
  const selectedOption = adminTargetIdentityDropdown.selectedOptions?.[0];
  const identityId = String(selectedOption?.value || "").trim();
  if (adminTargetIdentityInput) {
    adminTargetIdentityInput.value = identityId;
  }
  adminTargetIdentityDropdown.style.display = "none";
});

adminAddMemberBtn?.addEventListener("click", async () => {
  setBusy(adminAddMemberBtn, true);
  try {
    const groupId = String(selectedAdminGroupId || "").trim();
    const identityCommitment = String(adminMemberCommitmentInput?.value || "").trim();
    if (!groupId || !identityCommitment) {
      throw new Error("Community and identity commitment are required.");
    }
    if (adminMemberUiState.fromDropdown && adminMemberUiState.suggestedAction === "remove") {
      throw new Error("Selected dropdown member is tagged for REMOVE. Edit input or choose an ADD entry.");
    }
    const body = {
      group_id: groupId,
      identity_commitment: identityCommitment,
      admin_identity_id: lastIdentity?.id || null
    };
    if (!body.admin_identity_id) {
      throw new Error("Active identity required.");
    }
    const response = await api("/api/admin/add-member", {
      method: "POST",
      body: JSON.stringify(body)
    });
    setAdminMemberInteraction("action_add", adminMemberUiState.suggestedAction);
    renderAdminActionResult("Add member", response);
    await loadAdmin();
    await loadDiscover();
  } catch (error) {
    setOutput(adminToolsOut, error.message || "Add member failed", true);
  } finally {
    setBusy(adminAddMemberBtn, false);
  }
});

adminRemoveMemberBtn?.addEventListener("click", async () => {
  setBusy(adminRemoveMemberBtn, true);
  try {
    const groupId = String(selectedAdminGroupId || "").trim();
    const identityCommitment = String(adminMemberCommitmentInput?.value || "").trim();
    if (!groupId || !identityCommitment) {
      throw new Error("Community and identity commitment are required.");
    }
    if (adminMemberUiState.fromDropdown && adminMemberUiState.suggestedAction === "add") {
      throw new Error("Selected dropdown member is tagged for ADD. Edit input or choose a REMOVE entry.");
    }
    const body = {
      group_id: groupId,
      identity_commitment: identityCommitment,
      admin_identity_id: lastIdentity?.id || null
    };
    if (!body.admin_identity_id) {
      throw new Error("Active identity required.");
    }
    const response = await api("/api/admin/remove-member", {
      method: "POST",
      body: JSON.stringify(body)
    });
    setAdminMemberInteraction("action_remove", adminMemberUiState.suggestedAction);
    renderAdminActionResult("Remove member", response);
    await loadAdmin();
    await loadDiscover();
  } catch (error) {
    setOutput(adminToolsOut, error.message || "Remove member failed", true);
  } finally {
    setBusy(adminRemoveMemberBtn, false);
  }
});

adminUpdatePolicyBtn?.addEventListener("click", async () => {
  setBusy(adminUpdatePolicyBtn, true);
  try {
    const groupId = String(selectedAdminGroupId || "").trim();
    if (!groupId) {
      throw new Error("Community is required.");
    }
    if (!hasAnyPolicySelected(adminPolicyOpen, adminPolicyTokenEnabled, adminPolicyRepEnabled, adminPolicyKycEnabled, adminPolicyAllowlistEnabled)) {
      throw new Error("Select at least one policy.");
    }
    const body = {
      group_id: groupId,
      eligibility_policy: buildAdminPolicyPayload(),
      admin_identity_id: lastIdentity?.id || null
    };
    if (!body.admin_identity_id) {
      throw new Error("Active identity required.");
    }
    const response = await api("/api/admin/update-policy", {
      method: "POST",
      body: JSON.stringify(body)
    });
    renderAdminActionResult("Update policy", response);
    await loadAdmin();
    await loadDiscover();
  } catch (error) {
    setOutput(adminToolsOut, error.message || "Policy update failed", true);
  } finally {
    setBusy(adminUpdatePolicyBtn, false);
  }
});

// User Actions
window.joinGroupClick = async (groupId) => {
  groupId = decodeURIComponent(String(groupId));
  if (!lastIdentity) return alert("Create an identity first!");
  if (!walletConnected()) return alert("Connect a Starknet Wallet first!");

  try {
    const state = lastKnownState || await api("/api/state");
    const group = state?.groups?.[groupId] || null;
    const normalizedPolicy = normalizeEligibilityPolicy(group?.eligibility_policy);
    const balance = await getStrkBalance(walletState.address);
    const requiredTokens = Number(normalizedPolicy?.min_token_balance || 0);
    if (requiredTokens > 0 && balance < requiredTokens) {
      alert(`Insufficient balance! You need ${requiredTokens} STRK, but have ${balance.toFixed(2)}.`);
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

window.submitPollVote = async (groupId, topicScope, topicId, vote) => {
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
    const scope = String(topicScope || `${groupId}:${topicId}`);
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

window.submitSignalText = async (triggerEl, groupId, topicScope, topicId, textareaId, parentId = null, topicType = "open") => {
  let textarea = findBestReplyTextarea(textareaId, topicId);
  if (!textarea && triggerEl?.closest) {
    textarea = triggerEl.closest("div")?.querySelector("textarea") || null;
  }
  const message = String(textarea?.value ?? "").trim();
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
      if (textarea) textarea.value = "";
      if (selectedTopicId) loadTopicPage();
    } catch (e) {
      alert("Comment failed: " + e.message);
      setFlowStatus("Comment failed.");
    }
  } else {
    // Advanced Web3 ZK Proof fully anonymous route
    await window.submitSignal(groupId, topicScope, message, parentId, topicType, topicId);
    if (textarea) textarea.value = "";
  }
}

window.submitSignal = async (groupId, topicScope, message, parentId = null, topicType = "open", topicId = null) => {
  if (!lastIdentity || !window.lastPassphrase) {
    alert("Requires active identity in session.");
    return;
  }
  if (!message) return alert("Message cannot be empty");

  try {
    setFlowStatus("Generating Zero Knowledge Proof in background...");
    const scope = String(topicScope || `${groupId}:${topicId}`);

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
renderLucideIcons();

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
