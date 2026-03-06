#[starknet::interface]
pub trait ISemaphore<TContractState> {
    fn initialize(ref self: TContractState, owner: starknet::ContractAddress);
    fn transfer_ownership(ref self: TContractState, new_owner: starknet::ContractAddress);
    fn set_verifier(
        ref self: TContractState, merkle_tree_depth: u8, verifier: starknet::ContractAddress
    );

    fn create_group(
        ref self: TContractState,
        group_id: felt252,
        admin: starknet::ContractAddress,
        merkle_tree_depth: u8
    );
    fn set_group_admin(
        ref self: TContractState, group_id: felt252, admin: starknet::ContractAddress
    );

    fn add_member(ref self: TContractState, group_id: felt252, identity_commitment: felt252);
    fn add_members(
        ref self: TContractState, group_id: felt252, identity_commitments: Span<felt252>
    );

    fn update_member(
        ref self: TContractState,
        group_id: felt252,
        leaf_index: u64,
        old_identity_commitment: felt252,
        new_identity_commitment: felt252,
        siblings: Span<felt252>
    );

    fn remove_member(
        ref self: TContractState,
        group_id: felt252,
        leaf_index: u64,
        identity_commitment: felt252,
        siblings: Span<felt252>
    );

    fn validate_proof(
        ref self: TContractState,
        group_id: felt252,
        merkle_tree_depth: u8,
        merkle_tree_root: felt252,
        nullifier: felt252,
        message: felt252,
        scope: felt252,
        message_hash: felt252,
        proof_points: Span<felt252>
    );

    fn get_root(self: @TContractState, group_id: felt252) -> felt252;
    fn get_depth(self: @TContractState, group_id: felt252) -> u8;
    fn get_size(self: @TContractState, group_id: felt252) -> u64;
    fn get_member(self: @TContractState, group_id: felt252, leaf_index: u64) -> felt252;
    fn is_root(self: @TContractState, group_id: felt252, root: felt252) -> bool;
    fn is_nullifier_used(self: @TContractState, nullifier: felt252) -> bool;
}
