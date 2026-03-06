import fs from "fs";
import promptSync from "prompt-sync";
import { Account, json, RpcProvider, Signer, stark } from "starknet";

const prompt = promptSync();
const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";
const provider = new RpcProvider({ nodeUrl: RPC_URL });

console.log("🚀 Starting Starknet Deployer (Argent X Compatible Signer Hack)");

const accountAddress = "0x042B9476550fAE25897cB9afd568f41Aa3ba9B48342Bf6d949d039565f7eed09";
const privateKey = "0x03d7441fdaf5b902ea07cfa3980a8ecf888df134657bda9b807f44b629ba86a7";

// The Argent Smart Contract expects [r, s, guardian_signature_length=0] or similar padding
class ArgentPadSigner extends Signer {
    async signTransaction(transactions, transactionsDetail) {
        const sig = await super.signTransaction(transactions, transactionsDetail);
        return [...stark.signatureToHexArray(sig), "0x0"];
    }
    async signDeclareTransaction(transaction, transactionsDetail) {
        const sig = await super.signDeclareTransaction(transaction, transactionsDetail);
        return [...stark.signatureToHexArray(sig), "0x0"];
    }
    async signDeployAccountTransaction(transaction, transactionsDetail) {
        const sig = await super.signDeployAccountTransaction(transaction, transactionsDetail);
        return [...stark.signatureToHexArray(sig), "0x0"];
    }
}

const customSigner = new ArgentPadSigner(privateKey);

const account = new Account({
    provider,
    address: accountAddress,
    signer: customSigner,
    cairoVersion: "1" // Let starknet.js know it's a modern account
});

async function deploy() {
    try {
        console.log("\n📦 Loading compiled Groth16 Verifier...");
        const verifierSierra = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Groth16Backend.contract_class.json").toString("ascii"));
        const verifierCasm = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Groth16Backend.compiled_contract_class.json").toString("ascii"));

        console.log("🚀 1/4: Declaring Verifier... (this takes ~1 min)");

        const declareResponse = await account.declare({
            contract: verifierSierra,
            casm: verifierCasm,
        });

        console.log(`Declare Tx Hash: ${declareResponse.transaction_hash}`);
        await provider.waitForTransaction(declareResponse.transaction_hash);
        console.log("✅ Verifier Declared.");

        const verifierClassHash = declareResponse.class_hash;

        console.log("🚀 2/4: Deploying Verifier...");
        const deployResponse = await account.deploy({
            classHash: verifierClassHash,
            constructorCalldata: [],
        });
        console.log(`Deploy Tx Hash: ${deployResponse.transaction_hash}`);
        await provider.waitForTransaction(deployResponse.transaction_hash);

        const verifierAddress = deployResponse.contract_address[0];
        console.log(`✅ Verifier Deployed at: ${verifierAddress}`);

        console.log("\n📦 Loading compiled Semaphore logic...");
        const semSierra = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Semaphore.contract_class.json").toString("ascii"));
        const semCasm = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Semaphore.compiled_contract_class.json").toString("ascii"));

        console.log("🚀 3/4: Declaring Semaphore...");
        const semDeclareResponse = await account.declare({
            contract: semSierra,
            casm: semCasm,
        });

        console.log(`Declare Tx: ${semDeclareResponse.transaction_hash}`);
        await provider.waitForTransaction(semDeclareResponse.transaction_hash);
        console.log("✅ Semaphore Declared.");

        console.log("🚀 4/4: Deploying Semaphore...");
        const semDeployResponse = await account.deploy({
            classHash: semDeclareResponse.class_hash,
            constructorCalldata: [verifierAddress, account.address]
        });

        console.log(`Deploy Tx: ${semDeployResponse.transaction_hash}`);
        await provider.waitForTransaction(semDeployResponse.transaction_hash);

        console.log(`\n🎉🎉 FINAL SEMAPHORE CONTRACT: ${semDeployResponse.contract_address[0]} 🎉🎉`);

    } catch (e) {
        console.error("❌ Deployment Failed:", e);
    }
}

deploy();
