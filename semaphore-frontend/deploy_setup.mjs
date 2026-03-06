import fs from "fs";
import { CallData, ec, hash, stark } from "starknet";

const OZ_ACCOUNT_CLASS_HASH = "0x01d1777db36cdd06dd62cfde77b1b6ae06412af95d57a13dc40ac77b8a702381";

console.log("🚀 Step 1: Designing Sandbox Deployer Account...");

let privateKey;
if (fs.existsSync("oz_keys.json")) {
    privateKey = JSON.parse(fs.readFileSync("oz_keys.json")).privateKey;
    console.log("Found existing keys in oz_keys.json, reusing...");
} else {
    privateKey = stark.randomAddress();
    fs.writeFileSync("oz_keys.json", JSON.stringify({ privateKey }));
    console.log("Generated fresh keys, saved to oz_keys.json");
}

const publicKey = ec.starkCurve.getStarkKey(privateKey);
const OZaccountConstructorCallData = CallData.compile({ publicKey });
const OZcontractAddress = hash.calculateContractAddressFromHash(
    publicKey, OZ_ACCOUNT_CLASS_HASH, OZaccountConstructorCallData, 0
);

console.log(`\n======================================================`);
console.log(`✨ SECURE DEPLOYER ADDRESS ✨`);
console.log(`👉 ${OZcontractAddress}`);
console.log(`======================================================\n`);
console.log(`STOP! Open your Argent X browser wallet right now!`);
console.log(`Send EXACTLY 1 STRK to the address above on Sepolia testnet.`);
console.log(`Once the transfer confirms in your wallet, tell me so I can deploy the contracts!`);
