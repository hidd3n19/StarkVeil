import fs from "fs";
import { Account, CallData, RpcProvider, ec, hash, json } from "starknet";

const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";
const provider = new RpcProvider({ nodeUrl: RPC_URL });

const OZ_ACCOUNT_CLASS_HASH = "0x01d1777db36cdd06dd62cfde77b1b6ae06412af95d57a13dc40ac77b8a702381";

async function run() {
    if (!fs.existsSync("oz_keys.json")) {
        console.error("❌ oz_keys.json not found. Run deploy_setup.mjs first.");
        return;
    }

    console.log("🚀 Step 2: Waking up Secure Deployer Account...");
    const { privateKey } = JSON.parse(fs.readFileSync("oz_keys.json"));

    const publicKey = ec.starkCurve.getStarkKey(privateKey);
    const OZaccountConstructorCallData = CallData.compile({ publicKey });
    const OZcontractAddress = hash.calculateContractAddressFromHash(
        publicKey, OZ_ACCOUNT_CLASS_HASH, OZaccountConstructorCallData, 0
    );

    const devAccount = new Account({ provider, address: OZcontractAddress, signer: privateKey, cairoVersion: "1" });

    // DEPLOY OZ ACCOUNT ITSELF
    console.log("🚀 Deploying Developer Account on-chain...");
    try {
        const deployAccountPayload = {
            classHash: OZ_ACCOUNT_CLASS_HASH,
            constructorCalldata: OZaccountConstructorCallData,
            contractAddress: OZcontractAddress,
            addressSalt: publicKey
        };
        const { transaction_hash, contract_address } = await devAccount.deployAccount(deployAccountPayload, { version: 3 });
        console.log(`⏳ Deploy Tx: ${transaction_hash}`);
        await provider.waitForTransaction(transaction_hash);
        console.log(`✅ Developer Account activated at ${contract_address}`);
    } catch (e) {
        if (!e.message.includes("already deployed")) {
            console.log("Failed to deploy dummy account!", e.message);
            return;
        }
        console.log("✅ Developer Account is already active!");
    }

    // DEPLOY SEMAPHORE
    try {
        console.log("\n📦 Loading compiled Groth16 Verifier...");
        const verifierSierra = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Groth16Backend.contract_class.json").toString("ascii"));
        const verifierCasm = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Groth16Backend.compiled_contract_class.json").toString("ascii"));

        console.log("🚀 Declaring and Deploying Verifier... (this takes ~1 min)");
        const deployResponse = await devAccount.declareAndDeploy({
            contract: verifierSierra,
            casm: verifierCasm,
        }, {
            version: 3,
            resourceBounds: {
                l2_gas: { max_amount: 0x1e8480n, max_price_per_unit: 0x2e90edd000n },
                l1_gas: { max_amount: 0x2710n, max_price_per_unit: 0x5af3107a4000n },
                l1_data_gas: { max_amount: 0xf4240n, max_price_per_unit: 0x2540be400n }
            }
        });

        console.log(`Verifier Tx Hash: ${deployResponse.deploy.transaction_hash}`);
        await provider.waitForTransaction(deployResponse.deploy.transaction_hash);
        const verifierAddress = deployResponse.deploy.contract_address;
        console.log(`✅ Verifier deployed at: ${verifierAddress}`);

        console.log("\n📦 Loading compiled Semaphore logic...");
        const semSierra = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Semaphore.contract_class.json").toString("ascii"));
        const semCasm = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Semaphore.compiled_contract_class.json").toString("ascii"));

        console.log("🚀 Declaring and Deploying Semaphore... (this takes ~1 min)");
        // We pass the devAccount address as the initial owner to allow automated initialization!
        const userAddress = "0x042B9476550fAE25897cB9afd568f41Aa3ba9B48342Bf6d949d039565f7eed09";
        const deploySemResponse = await devAccount.declareAndDeploy({
            contract: semSierra,
            casm: semCasm,
            constructorCalldata: [devAccount.address]
        }, { version: 3 });

        await provider.waitForTransaction(deploySemResponse.deploy.transaction_hash);
        console.log(`\n🎉🎉 FINAL SEMAPHORE CONTRACT: ${deploySemResponse.deploy.contract_address} 🎉🎉`);

        console.log("\n🚀 Initializing Verifier configurations and handing over Ownership...");
        const initCall = await devAccount.execute([
            {
                contractAddress: deploySemResponse.deploy.contract_address,
                entrypoint: "set_verifier",
                calldata: [20, deployResponse.deploy.contract_address]
            },
            {
                contractAddress: deploySemResponse.deploy.contract_address,
                entrypoint: "transfer_ownership",
                calldata: [userAddress]
            }
        ], { version: 3 });

        await provider.waitForTransaction(initCall.transaction_hash);
        console.log("\n✅ Configuration applied & Ownership successfully transferred to user: " + userAddress);

    } catch (e) {
        console.error("❌ Contract deployment failed:", e);
    }
}

run();
