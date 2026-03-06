import { Account, RpcProvider, Signer, hash, CallData } from "starknet";
const provider = new RpcProvider({ nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" });
const accountAddress = "0x042B9476550fAE25897cB9afd568f41Aa3ba9B48342Bf6d949d039565f7eed09";
const privateKey = "0x03d7441fdaf5b902ea07cfa3980a8ecf888df134657bda9b807f44b629ba86a7";

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
