export const NETWORK = "sepolia";
export const STARKNET_RPC =
  import.meta.env.VITE_STARKNET_RPC ?? "https://api.cartridge.gg/x/starknet/sepolia";

export const LIVE_ADDRESSES = {
  verifierClassHash: "0x0598d0f4685f333914064bfb4632b50432fce3679c3566625fb04cf6aa0bc345",
  bridge: "0x055aecde30ae1f25b638aad4d3fa3666e2f4f831b5811982fa3253dd028284ed",
  adapter: "0x00fec1a4666c7c432244fd6a291083ba9e4917362d5d9e55fed73b4edc3f88b1",
  semaphore: "0x02eb60aa229b096a73aea78c056c75154420d3ace68347707912a204c4f7b165"
};

export const DEFAULT_GRANTS_ADDRESS = import.meta.env.VITE_GRANTS_ADDRESS ?? "";

export const DEMO_PROPOSAL = {
  title: "Residency",
  summary: "Open Lab",
  description:
    "The first proposal on a fresh demo grants contract asks for a small STRK residency payout. The bundled proof is real and only matches proposal #1 on a fresh deployment.",
  askStrk: "3",
  defaultRecipient: "",
  thresholdLabel: "1 verified yes vote passes"
};
