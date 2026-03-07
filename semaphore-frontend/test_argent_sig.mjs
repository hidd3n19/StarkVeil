import { Account, RpcProvider, Signer, hash, CallData } from "starknet";
const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL || "https://api.cartridge.gg/x/starknet/sepolia" });
const accountAddress = process.env.ARGENT_ACCOUNT_ADDRESS || "";
const privateKey = process.env.ARGENT_PRIVATE_KEY || "";

if (!accountAddress || !privateKey) {
    throw new Error("Missing ARGENT_ACCOUNT_ADDRESS or ARGENT_PRIVATE_KEY in environment.");
}

class ArgentSigner extends Signer {
    async signTransaction(transactions, transactionsDetail) {
        const sig = await super.signTransaction(transactions, transactionsDetail);
        // Argent often expects signature to be 3 felts [r, s, 0] or similar?
        console.log("Original Signature length:", sig.length);
        console.log("Original Signature:", sig);
        return [...sig, "0x0"]; 
    }
}

const customSigner = new ArgentSigner(privateKey);
const account = new Account({ provider, address: accountAddress, signer: customSigner, cairoVersion: "1" });

async function test() {
    console.log("Testing padded signature execution via a dummy call...");
    // Let's just make a dummy call to is_valid_signature or execute to see if it passes validation
    try {
        const x = await account.execute([{ 
            contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562B82f9e004dc7", 
            entrypoint: "transfer",
            calldata: CallData.compile({ recipient: "0x123", amount: { low: "1", high: "0" } })
        }]);
        console.log("Success?", x.transaction_hash);
    } catch(e) {
        console.log("Error:", e.message);
    }
}
test();
