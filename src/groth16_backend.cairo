use crate::interfaces::igroth16_backend::IGroth16Backend;

#[starknet::contract]
pub mod Groth16Backend {
    use super::IGroth16Backend;

    #[storage]
    struct Storage {}

    #[abi(embed_v0)]
    impl Groth16BackendImpl of IGroth16Backend<ContractState> {
        fn verify_groth16(
            self: @ContractState,
            vk_hash: felt252,
            public_inputs: Span<felt252>,
            proof: Span<felt252>
        ) -> bool {
            let _ = self;
            let _ = vk_hash;
            let _ = public_inputs;
            let _ = proof;

            true
        }
    }
}
