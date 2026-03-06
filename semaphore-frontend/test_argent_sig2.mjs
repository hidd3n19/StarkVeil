import { Account, RpcProvider, Signer } from "starknet";
const provider = new RpcProvider({ nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" });
const accountAddress = "0x042B9476550fAE25897cB9afd568f41Aa3ba9B48342Bf6d949d039565f7eed09";
const privateKey = "0x03d7441fdaf5b902ea07cfa3980a8ecf888df134657bda9b807f44b629ba86a7";

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
