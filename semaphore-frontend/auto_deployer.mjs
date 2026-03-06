import fs from "fs";
import { Account, CallData, RpcProvider, cairo, ec, hash, stark } from "starknet";

const RPC_URL = "https://api.cartridge.gg/x/starknet/sepolia";
const provider = new RpcProvider({ nodeUrl: RPC_URL });

const argentAddress = "0x042B9476550fAE25897cB9afd568f41Aa3ba9B48342Bf6d949d039565f7eed09";
const argentPriv = "0x03d7441fdaf5b902ea07cfa3980a8ecf888df134657bda9b807f44b629ba86a7";

// Native cairoVersion: "1" handles INVOKES accurately for Argent
const argentAccount = new Account({ provider, address: argentAddress, signer: argentPriv, cairoVersion: "1" });

// Known OZ Class Hash on Sepolia natively supported by Starknet.js
const OZ_ACCOUNT_CLASS_HASH = "0x061dac032f228abef9b66240f47f0f608b65f7058be5f206132bc4ea19412148"; // OZ v0.8.1

async function run() {
    console.log("🚀 Starting OpenZeppelin Bypasser...");

    // 1. Generate new keys
    const privateKey = stark.randomAddress();
    const publicKey = ec.starkCurve.getStarkKey(privateKey);
    const OZaccountConstructorCallData = CallData.compile({ publicKey });

    // 2. Pre-compute OZ address
    const OZcontractAddress = hash.calculateContractAddressFromHash(
        publicKey, OZ_ACCOUNT_CLASS_HASH, OZaccountConstructorCallData, 0
    );
    console.log(`\n🆕 Designed new OZ deployer account: ${OZcontractAddress}`);

    // 3. Fund it with STRK from Argent
    const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
    console.log("💸 Funding new wallet with 10 STRK from main wallet...");
    try {
        const transferResponse = await argentAccount.execute([
            {
                contractAddress: STRK_ADDRESS,
                entrypoint: "transfer",
                calldata: {
                    recipient: OZcontractAddress,
                    amount: cairo.uint256("10000000000000000000") // 10 STRK
                }
            }
        ]);

        console.log(`⏳ Transfer Tx: ${transferResponse.transaction_hash}`);
        await provider.waitForTransaction(transferResponse.transaction_hash);
        console.log("✅ Funded correctly!");
    } catch (e) {
        console.log("Transfer failed!", e.stack);
        return;
    }

    // 4. Actually deploy the new OZ account
    const ozAccount = new Account({ provider, address: OZcontractAddress, signer: privateKey, cairoVersion: "1" });

    console.log("🚀 Deploying new OZ Account physically to chain...");
    try {
        const deployAccountPayload = {
            classHash: OZ_ACCOUNT_CLASS_HASH,
            constructorCalldata: OZaccountConstructorCallData,
            contractAddress: OZcontractAddress,
            addressSalt: publicKey
        };
        const { transaction_hash, contract_address } = await ozAccount.deployAccount(deployAccountPayload, { version: 3 });
        console.log(`⏳ Deploy Tx: ${transaction_hash}`);
        await provider.waitForTransaction(transaction_hash);
        console.log(`✅ OZ Account permanently deployed at ${contract_address}`);
    } catch (e) {
        console.log("Deployment failed!", e.stack);
        return;
    }

    // 5. Deploy Contracts via the new clean OZ Account natively
    console.log("\n📦 Loading compiled Groth16 Verifier...");
    const verifierSierra = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Groth16Backend.contract_class.json").toString("ascii"));
    const verifierCasm = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Groth16Backend.compiled_contract_class.json").toString("ascii"));

    console.log("🚀 Declaring and Deploying Verifier... (this takes ~1 min)");
    const deployResponse = await ozAccount.declareAndDeploy({
        contract: verifierSierra,
        casm: verifierCasm,
    }, { version: 3 });

    console.log(`Verifier Tx Hash: ${deployResponse.deploy.transaction_hash}`);
    await provider.waitForTransaction(deployResponse.deploy.transaction_hash);
    const verifierAddress = deployResponse.deploy.contract_address;
    console.log(`✅ Verifier deployed at: ${verifierAddress}`);

    console.log("\n📦 Loading compiled Semaphore logic...");
    const semSierra = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Semaphore.contract_class.json").toString("ascii"));
    const semCasm = json.parse(fs.readFileSync("../target/dev/semaphore_starknet_Semaphore.compiled_contract_class.json").toString("ascii"));

    console.log("🚀 Declaring and Deploying Semaphore... (this takes ~1 min)");
    const deploySemResponse = await ozAccount.declareAndDeploy({
        contract: semSierra,
        casm: semCasm,
        constructorCalldata: [verifierAddress, argentAddress]
    }, { version: 3 });

    await provider.waitForTransaction(deploySemResponse.deploy.transaction_hash);
    console.log(`\n🎉🎉 FINAL SEMAPHORE CONTRACT: ${deploySemResponse.deploy.contract_address} 🎉🎉`);
}

run();
