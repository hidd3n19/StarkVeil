import {
  Amount,
  Contract,
  OnboardStrategy,
  StarkSDK,
  StarkSigner,
  fromAddress,
  sepoliaTokens
} from "starkzap";
import { STARKNET_RPC } from "../config.js";

const sdk = new StarkSDK({
  network: "sepolia",
  rpcUrl: STARKNET_RPC,
  explorer: { provider: "starkscan" }
});

const grantsAbi = [
  {
    type: "struct",
    name: "CommunityView",
    members: [
      { name: "id", type: "u64" },
      { name: "name", type: "felt252" },
      { name: "group_id", type: "felt252" },
      { name: "merkle_tree_depth", type: "u8" },
      { name: "treasury_admin", type: "core::starknet::contract_address::ContractAddress" },
      { name: "quorum", type: "u32" },
      { name: "yes_threshold_bps", type: "u16" },
      { name: "max_ask_bps", type: "u16" },
      { name: "treasury_balance", type: "u128" }
    ]
  },
  {
    type: "struct",
    name: "ProposalView",
    members: [
      { name: "id", type: "u64" },
      { name: "community_id", type: "u64" },
      { name: "creator", type: "core::starknet::contract_address::ContractAddress" },
      { name: "title", type: "felt252" },
      { name: "summary", type: "felt252" },
      { name: "recipient", type: "core::starknet::contract_address::ContractAddress" },
      { name: "ask_amount", type: "u128" },
      { name: "scope", type: "felt252" },
      { name: "voting_start", type: "u64" },
      { name: "voting_end", type: "u64" },
      { name: "status", type: "u8" },
      { name: "yes_votes", type: "u32" },
      { name: "no_votes", type: "u32" },
      { name: "total_votes", type: "u32" }
    ]
  },
  {
    type: "function",
    name: "get_owner",
    inputs: [],
    outputs: [{ type: "core::starknet::contract_address::ContractAddress" }],
    state_mutability: "view"
  },
  {
    type: "function",
    name: "get_semaphore",
    inputs: [],
    outputs: [{ type: "core::starknet::contract_address::ContractAddress" }],
    state_mutability: "view"
  },
  {
    type: "function",
    name: "get_token",
    inputs: [],
    outputs: [{ type: "core::starknet::contract_address::ContractAddress" }],
    state_mutability: "view"
  },
  {
    type: "function",
    name: "get_community",
    inputs: [{ name: "community_id", type: "u64" }],
    outputs: [{ type: "CommunityView" }],
    state_mutability: "view"
  },
  {
    type: "function",
    name: "get_proposal",
    inputs: [{ name: "proposal_id", type: "u64" }],
    outputs: [{ type: "ProposalView" }],
    state_mutability: "view"
  }
];

const semaphoreAbi = [
  {
    type: "function",
    name: "get_root",
    inputs: [{ name: "group_id", type: "felt252" }],
    outputs: [{ type: "felt252" }],
    state_mutability: "view"
  },
  {
    type: "function",
    name: "is_nullifier_used",
    inputs: [{ name: "nullifier", type: "felt252" }],
    outputs: [{ type: "bool" }],
    state_mutability: "view"
  }
];

function normalizeValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "object" && "toString" in value) return value.toString();
  return String(value);
}

function normalizeCommunity(view) {
  return {
    id: normalizeValue(view.id),
    name: normalizeValue(view.name),
    groupId: normalizeValue(view.group_id),
    depth: normalizeValue(view.merkle_tree_depth),
    treasuryAdmin: normalizeValue(view.treasury_admin),
    quorum: normalizeValue(view.quorum),
    yesThresholdBps: normalizeValue(view.yes_threshold_bps),
    maxAskBps: normalizeValue(view.max_ask_bps),
    treasuryBalance: normalizeValue(view.treasury_balance)
  };
}

function normalizeBool(value) {
  if (typeof value === "boolean") return value;
  const raw = normalizeValue(value).toLowerCase();
  return raw === "1" || raw === "true";
}

function normalizeProposal(view) {
  return {
    id: normalizeValue(view.id),
    communityId: normalizeValue(view.community_id),
    creator: normalizeValue(view.creator),
    title: feltToAscii(view.title),
    summary: feltToAscii(view.summary),
    recipient: normalizeValue(view.recipient),
    askAmount: normalizeValue(view.ask_amount),
    scope: normalizeValue(view.scope),
    votingStart: normalizeValue(view.voting_start),
    votingEnd: normalizeValue(view.voting_end),
    status: normalizeValue(view.status),
    yesVotes: normalizeValue(view.yes_votes),
    noVotes: normalizeValue(view.no_votes),
    totalVotes: normalizeValue(view.total_votes)
  };
}

function getGrantsContract(address) {
  return new Contract(grantsAbi, address, sdk.getProvider());
}

function getSemaphoreContract(address) {
  return new Contract(semaphoreAbi, address, sdk.getProvider());
}

export function shortStringToFelt(value) {
  const text = value.trim().slice(0, 31);
  if (!text) {
    throw new Error("Short-string fields cannot be empty.");
  }
  const bytes = Array.from(new TextEncoder().encode(text));
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `0x${hex}`;
}

export function feltToAscii(value) {
  const raw = normalizeValue(value);
  if (!raw || raw === "0") return "";
  const hex = raw.startsWith("0x") ? raw.slice(2) : BigInt(raw).toString(16);
  if (hex.length === 0) return "";
  const padded = hex.length % 2 === 0 ? hex : `0${hex}`;
  try {
    const bytes = padded.match(/.{1,2}/g)?.map((pair) => Number.parseInt(pair, 16)) ?? [];
    return new TextDecoder().decode(new Uint8Array(bytes)).replace(/\0/g, "");
  } catch {
    return raw;
  }
}

export function getProvider() {
  return sdk.getProvider();
}

export async function readProductState(grantsAddress, communityId, proposalId, nullifier) {
  const grants = getGrantsContract(grantsAddress);
  const [owner, semaphoreAddress, tokenAddress, community] = await Promise.all([
    grants.get_owner(),
    grants.get_semaphore(),
    grants.get_token(),
    grants.get_community(communityId)
  ]);

  const semaphore = getSemaphoreContract(semaphoreAddress);
  const [root, nullifierUsed] = await Promise.all([
    semaphore.get_root(community.group_id),
    semaphore.is_nullifier_used(nullifier)
  ]);

  let proposal = null;
  try {
    proposal = normalizeProposal(await grants.get_proposal(proposalId));
  } catch {
    proposal = null;
  }

  return {
    owner: normalizeValue(owner),
    semaphoreAddress: normalizeValue(semaphoreAddress),
    tokenAddress: normalizeValue(tokenAddress),
    root: normalizeValue(root),
    nullifierUsed: normalizeBool(nullifierUsed),
    community: normalizeCommunity(community),
    proposal
  };
}

export async function connectTreasuryWallet(privateKey) {
  if (!privateKey) {
    throw new Error("Set VITE_STARKZAP_PRIVATE_KEY in frontend/.env.local");
  }

  const { wallet } = await sdk.onboard({
    strategy: OnboardStrategy.Signer,
    account: { signer: new StarkSigner(privateKey) },
    deploy: "if_needed"
  });

  return wallet;
}

export async function readTreasuryBalance(wallet) {
  const balance = await wallet.balanceOf(sepoliaTokens.STRK);
  return {
    token: "STRK",
    formatted: balance.format({ decimals: 2 }),
    raw: balance.toString()
  };
}

async function executeAndWait(wallet, call) {
  const tx = await wallet.execute([call]);
  await tx.wait();
  return tx;
}

export async function fundCommunity(wallet, grantsAddress, communityId, amount) {
  return executeAndWait(wallet, {
    contractAddress: grantsAddress,
    entrypoint: "fund_community",
    calldata: [String(communityId), String(amount)]
  });
}

export async function submitProposal(wallet, grantsAddress, communityId, proposal) {
  return executeAndWait(wallet, {
    contractAddress: grantsAddress,
    entrypoint: "submit_proposal",
    calldata: [
      String(communityId),
      shortStringToFelt(proposal.title),
      shortStringToFelt(proposal.summary),
      proposal.recipient,
      String(proposal.askAmount),
      String(proposal.votingStart),
      String(proposal.votingEnd)
    ]
  });
}

export async function castAnonymousVote(wallet, grantsAddress, proposalId, proofBundle) {
  return executeAndWait(wallet, {
    contractAddress: grantsAddress,
    entrypoint: "cast_vote",
    calldata: [
      String(proposalId),
      "1",
      proofBundle.depth,
      proofBundle.root,
      proofBundle.nullifier,
      proofBundle.messageHash,
      proofBundle.scopeHash,
      String(proofBundle.proofPoints.length),
      ...proofBundle.proofPoints
    ]
  });
}

export async function finalizeProposal(wallet, grantsAddress, proposalId) {
  return executeAndWait(wallet, {
    contractAddress: grantsAddress,
    entrypoint: "finalize_proposal",
    calldata: [String(proposalId)]
  });
}

export async function executeProposal(wallet, grantsAddress, proposalId) {
  return executeAndWait(wallet, {
    contractAddress: grantsAddress,
    entrypoint: "execute_proposal",
    calldata: [String(proposalId)]
  });
}

export function txUrl(tx) {
  return tx?.explorerUrl ?? "";
}
