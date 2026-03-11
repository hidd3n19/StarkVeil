#[derive(Drop, Serde)]
pub struct CommunityView {
    pub id: u64,
    pub name: felt252,
    pub group_id: felt252,
    pub merkle_tree_depth: u8,
    pub treasury_admin: starknet::ContractAddress,
    pub quorum: u32,
    pub yes_threshold_bps: u16,
    pub max_ask_bps: u16,
    pub treasury_balance: u128,
}

#[derive(Drop, Serde)]
pub struct ProposalView {
    pub id: u64,
    pub community_id: u64,
    pub creator: starknet::ContractAddress,
    pub title: felt252,
    pub summary: felt252,
    pub recipient: starknet::ContractAddress,
    pub ask_amount: u128,
    pub scope: felt252,
    pub voting_start: u64,
    pub voting_end: u64,
    pub status: u8,
    pub yes_votes: u32,
    pub no_votes: u32,
    pub total_votes: u32,
}

#[starknet::interface]
pub trait IStarkVeilGrants<TContractState> {
    fn transfer_ownership(ref self: TContractState, new_owner: starknet::ContractAddress);

    fn create_community(
        ref self: TContractState,
        name: felt252,
        treasury_admin: starknet::ContractAddress,
        merkle_tree_depth: u8,
        quorum: u32,
        yes_threshold_bps: u16,
        max_ask_bps: u16
    ) -> u64;
    fn fund_community(ref self: TContractState, community_id: u64, amount: u128);
    fn add_community_member(ref self: TContractState, community_id: u64, identity_commitment: felt252);

    fn submit_proposal(
        ref self: TContractState,
        community_id: u64,
        title: felt252,
        summary: felt252,
        recipient: starknet::ContractAddress,
        ask_amount: u128,
        voting_start: u64,
        voting_end: u64
    ) -> u64;

    fn cast_vote(
        ref self: TContractState,
        proposal_id: u64,
        vote_for: bool,
        merkle_tree_depth: u8,
        merkle_tree_root: felt252,
        nullifier: felt252,
        message_hash: felt252,
        scope_hash: felt252,
        proof_points: Span<felt252>
    );

    fn finalize_proposal(ref self: TContractState, proposal_id: u64);
    fn execute_proposal(ref self: TContractState, proposal_id: u64);

    fn get_owner(self: @TContractState) -> starknet::ContractAddress;
    fn get_semaphore(self: @TContractState) -> starknet::ContractAddress;
    fn get_token(self: @TContractState) -> starknet::ContractAddress;
    fn get_community(self: @TContractState, community_id: u64) -> CommunityView;
    fn get_proposal(self: @TContractState, proposal_id: u64) -> ProposalView;
}
