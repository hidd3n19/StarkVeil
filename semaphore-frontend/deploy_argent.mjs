import fs from "fs";
import promptSync from "prompt-sync";
import { Account, json, RpcProvider, CallData, hash, stark } from "starknet";

const prompt = promptSync();
const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";
const provider = new RpcProvider({ nodeUrl: RPC_URL });

console.log("🚀 Starting Starknet Deployer (Argent X Compatible)");

const accountAddress = "0x042B9476550fAE25897cB9afd568f41Aa3ba9B48342Bf6d949d039565f7eed09";
const privateKey = prompt("Please enter the Private Key for " + accountAddress + ": ");

// Argent X specific account instantiation wrapper
const account = new Account({
    provider,
    address: accountAddress,
    signer: privateKey,
    cairoVersion: "1" // Argent X Cairo 1/2 Smart wallets
});

async function deploy() {
    try {
        console.log("\n📦 Loading compiled Groth16 Verifier...");
        const verifierSierra = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Groth16Backend.contract_class.json").toString("ascii"));
        const verifierCasm = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Groth16Backend.compiled_contract_class.json").toString("ascii"));

        console.log("🚀 1/4: Declaring Verifier... (this takes ~1 min)");
        
        // DECLARE VERIFIER
        const declareResponse = await account.declare({
            contract: verifierSierra,
            casm: verifierCasm,
        }, { version: 3 });
        
        console.log(`Declare Tx Hash: ${declareResponse.transaction_hash}`);
        await provider.waitForTransaction(declareResponse.transaction_hash);
        console.log("✅ Verifier Declared.");

        const verifierClassHash = declareResponse.class_hash;
        
        console.log("🚀 2/4: Deploying Verifier...");
        
        // DEPLOY VERIFIER
        const deployResponse = await account.deploy({
            classHash: verifierClassHash,
            constructorCalldata: [],
        });
        console.log(`Deploy Tx Hash: ${deployResponse.transaction_hash}`);
        await provider.waitForTransaction(deployResponse.transaction_hash);
        
        const verifierAddress = deployResponse.contract_address[0];
        console.log(`✅ Verifier Deployed at: ${verifierAddress}`);

        // -------------------------------------------------------------
        
        console.log("\n📦 Loading compiled Semaphore logic...");
        const semSierra = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Semaphore.contract_class.json").toString("ascii"));
        const semCasm = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Semaphore.compiled_contract_class.json").toString("ascii"));

        console.log("🚀 3/4: Declaring Semaphore...");
        const semDeclareResponse = await account.declare({
            contract: semSierra,
            casm: semCasm,
        }, { version: 3 });
        
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
