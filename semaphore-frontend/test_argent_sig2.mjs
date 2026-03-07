import { Account, RpcProvider, Signer } from "starknet";
const provider = new RpcProvider({ nodeUrl: process.env.STARKNET_RPC_URL || "https://api.cartridge.gg/x/starknet/sepolia" });
const accountAddress = process.env.ARGENT_ACCOUNT_ADDRESS || "";
const privateKey = process.env.ARGENT_PRIVATE_KEY || "";

if (!accountAddress || !privateKey) {
    throw new Error("Missing ARGENT_ACCOUNT_ADDRESS or ARGENT_PRIVATE_KEY in environment.");
}

class ArgentPadSigner extends Signer {
    async signDeclareTransaction(transactions, transactionsDetail) {
        const sig = await super.signDeclareTransaction(transactions, transactionsDetail);
        console.log("Original declare sig:", sig);
        if (!Array.isArray(sig)) {
            console.log("It's not an array! Trying to pad array inside...");
        }
        return sig;
    }
}
const customSigner = new ArgentPadSigner(privateKey);
const account = new Account({ provider, address: accountAddress, signer: customSigner, cairoVersion: "1" });

async function test() {
    console.log("Testing padded signature execution...");
    try {
        const dummyDeclare = await account.declare({
            contract: '{"sierra_program":[]}',
            casm: '{"bytecode":[]}',
        });
        console.log(dummyDeclare);
    } catch (e) {
        console.log("Wait:", e.message);
    }
}
test();
