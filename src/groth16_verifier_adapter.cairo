use crate::interfaces::igroth16_backend::{IGroth16BackendDispatcher, IGroth16BackendDispatcherTrait};
use crate::interfaces::iverifier::IVerifier;

#[starknet::contract]
pub mod Groth16VerifierAdapter {
    use starknet::ContractAddress;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    use super::{IGroth16BackendDispatcher, IGroth16BackendDispatcherTrait, IVerifier};

    #[storage]
    struct Storage {
        backend: ContractAddress,
        vk_hash: felt252
    }

    #[constructor]
    fn constructor(ref self: ContractState, backend: ContractAddress, vk_hash: felt252) {
        self.backend.write(backend);
        self.vk_hash.write(vk_hash);
    }

    #[abi(embed_v0)]
    impl VerifierImpl of IVerifier<ContractState> {
        fn verify(
            self: @ContractState, public_inputs: Span<felt252>, proof: Span<felt252>
        ) -> bool {
            let backend = self.backend.read();
            let vk_hash = self.vk_hash.read();
            let dispatcher = IGroth16BackendDispatcher { contract_address: backend };
            dispatcher.verify_groth16(vk_hash, public_inputs, proof)
        }
    }
}
