import fs from "fs";
import promptSync from "prompt-sync";
import { Account, json, RpcProvider } from "starknet";

const prompt = promptSync();

const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";

const provider = new RpcProvider({ nodeUrl: RPC_URL });

console.log("🚀 Starting Starknet Deployer (Bypassing Wallet UIs)");

const accountAddress = "0x042B9476550fAE25897cB9afd568f41Aa3ba9B48342Bf6d949d039565f7eed09";
const privateKey = prompt("Please enter the Private Key for " + accountAddress + ": ");

// Argent X accounts typically use a specific smart wallet class hash
const account = new Account({
    provider,
    address: accountAddress,
    signer: privateKey,
    cairoVersion: "1"
});

console.log(`\n✅ Account initialized: ${account.address}`);

async function deployContracts() {
    try {
        console.log("\n📦 Loading compiled Groth16 Verifier...");
        const verifierSierra = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Groth16Backend.contract_class.json").toString("ascii"));
        const verifierCasm = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Groth16Backend.compiled_contract_class.json").toString("ascii"));

        console.log("🚀 Declaring and Deploying Verifier... (this takes ~1 min)");

        // Force version 3 to use STRK fees
        let deployResponse = await account.declareAndDeploy({
            contract: verifierSierra,
            casm: verifierCasm,
        }, { version: 3 });

        console.log(`Tx Hash: ${deployResponse.deploy.transaction_hash}`);
        await provider.waitForTransaction(deployResponse.deploy.transaction_hash);

        const verifierAddress = deployResponse.deploy.contract_address;
        console.log(`✅ Verifier deployed at: ${verifierAddress}`);

        // -------------------------------------------------------------------

        console.log("\n📦 Loading compiled Semaphore logic...");
        const semSierra = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Semaphore.contract_class.json").toString("ascii"));
        const semCasm = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Semaphore.compiled_contract_class.json").toString("ascii"));

        console.log("🚀 Declaring and Deploying Semaphore... (this takes ~1 min)");
        const deploySemResponse = await account.declareAndDeploy({
            contract: semSierra,
            casm: semCasm,
            constructorCalldata: [verifierAddress, account.address]
        }, { version: 3 });

        console.log(`Tx Hash: ${deploySemResponse.deploy.transaction_hash}`);
        await provider.waitForTransaction(deploySemResponse.deploy.transaction_hash);

        console.log(`\n🎉🎉 FINAL SEMAPHORE CONTRACT: ${deploySemResponse.deploy.contract_address} 🎉🎉`);
        console.log("Copy that address into main.js!");

    } catch (error) {
        console.error("❌ Deployment Failed:", error);
    }
}

deployContracts();
