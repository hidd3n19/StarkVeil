import { RpcProvider, Contract } from 'starknet';

async function main() {
    const rpc = new RpcProvider({ nodeUrl: "https://starknet-mainnet.public.cartridge.gg" });
    const strkAddress = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

    try {
        const { abi } = await rpc.getClassAt(strkAddress);
        const contract = new Contract(abi, strkAddress, rpc);
        
        let targetAddr = "0x042b781da6ebEdfa1936c3eeD76ea24A9bFafE4Cb1AE589a1Dea89DCDeed09";
        
        const res = await contract.balanceOf(targetAddr);
        console.log("Balance array:", res);
        console.log("Balance String:", typeof res === 'bigint' ? res.toString() : res);
    } catch(e) {
        console.error("Failed:", e);
    }
}
main();
