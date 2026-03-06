import { RpcProvider } from 'starknet';
const provider = new RpcProvider({ nodeUrl: "https://api.cartridge.gg/x/starknet/sepolia" });
const addr = "0x52d5dce6aa7f7fdffbfe662b614cf82e1b07aafede0471c921f44535f628883";
const strk = "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6ab07201858f4287c938D";
provider.callContract({ contractAddress: strk, entrypoint: "balanceOf", calldata: [addr] })
  .then(r => console.log("Balance Hex:", r.result[0]))
  .catch(console.error);
