#[starknet::interface]
pub trait IVerifier<TContractState> {
    fn verify(
        self: @TContractState, public_inputs: Span<felt252>, proof: Span<felt252>
    ) -> bool;
}
