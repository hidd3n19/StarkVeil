#[starknet::interface]
pub trait IGroth16Backend<TContractState> {
    fn verify_groth16(
        self: @TContractState,
        vk_hash: felt252,
        public_inputs: Span<felt252>,
        proof: Span<felt252>
    ) -> bool;
}
