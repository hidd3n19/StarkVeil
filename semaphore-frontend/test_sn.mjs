import { RpcProvider, Account } from "starknet";
const provider = new RpcProvider({ nodeUrl: "https://free-rpc.nethermind.io/sepolia-juno" });
console.log("Provider instantiated");
const account = new Account(provider, "0x123", "0x456");
console.log("Account instantiated");
