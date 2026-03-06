import asyncio
from starknet_py.net.account.account import Account
from starknet_py.net.full_node_client import FullNodeClient
from starknet_py.net.models.chains import StarknetChainId
from starknet_py.net.signer.stark_curve_signer import KeyPair
from starknet_py.contract import Contract
import json
import os

async def main():
    print("🚀 Starting Starknet Python Deployer")
    
    # Cartridge Sepolia node
    node_url = "https://api.cartridge.gg/x/starknet/sepolia"
    client = FullNodeClient(node_url=node_url)

    account_address = "0x042B9476550fAE25897cB9afd568f41Aa3ba9B48342Bf6d949d039565f7eed09"
    private_key = input(f"Please enter the Private Key for {account_address}: ")
    
    key_pair = KeyPair.from_private_key(int(private_key, 16))
    
    # starknet_py handles specific account flavors much more reliably than starknet.js
    account = Account(
        address=account_address,
        client=client,
        key_pair=key_pair,
        chain=StarknetChainId.SEPOLIA,
    )
    
    print(f"\n✅ Account initialized: {hex(account.address)}")

    # 1. Load Verifier
    print("\n📦 Loading compiled Groth16 Verifier...")
    with open("../target/dev/semaphore_starknet_Groth16Backend.contract_class.json", "r") as f:
        verifier_sierra = f.read()
    with open("../target/dev/semaphore_starknet_Groth16Backend.compiled_contract_class.json", "r") as f:
        verifier_casm = f.read()

    print("🚀 Declaring Verifier...")
    declare_result = await Contract.declare_v3(
        account=account,
        compiled_contract=verifier_casm,
        compiled_contract_casm=verifier_casm, # This param in sn_py expects casm
        contract_class=verifier_sierra, # No need for casm in V3 declare if we provide both
    )
    await declare_result.wait_for_acceptance()
    print("✅ Declared.")

if __name__ == "__main__":
    asyncio.run(main())
