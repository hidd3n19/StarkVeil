use crate::interfaces::igroth16_backend::IGroth16Backend;

#[starknet::contract]
pub mod TestGroth16Backend {
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use super::IGroth16Backend;

    #[storage]
    struct Storage {
        expected_vk_hash: felt252,
        expected_magic: felt252
    }

    #[constructor]
    fn constructor(ref self: ContractState, expected_vk_hash: felt252, expected_magic: felt252) {
        self.expected_vk_hash.write(expected_vk_hash);
        self.expected_magic.write(expected_magic);
    }

    #[abi(embed_v0)]
    impl Groth16BackendImpl of IGroth16Backend<ContractState> {
        fn verify_groth16(
            self: @ContractState,
            vk_hash: felt252,
            public_inputs: Span<felt252>,
            proof: Span<felt252>
        ) -> bool {
            if vk_hash != self.expected_vk_hash.read() {
                return false;
            }
            if public_inputs.len() != 4 {
                return false;
            }
            if proof.len() == 0 {
                return false;
            }

            let magic = *proof.at(0);
            magic == self.expected_magic.read()
        }
    }
}
