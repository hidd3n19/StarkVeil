use crate::interfaces::ierc20::{IERC20Dispatcher, IERC20DispatcherTrait};
use crate::interfaces::isemaphore::{ISemaphoreDispatcher, ISemaphoreDispatcherTrait};
use crate::interfaces::istarkveil_grants::{CommunityView, IStarkVeilGrants, ProposalView};

const STATUS_DRAFT: u8 = 0;
const STATUS_ACTIVE: u8 = 1;
const STATUS_PASSED: u8 = 2;
const STATUS_REJECTED: u8 = 3;
const STATUS_EXECUTED: u8 = 4;
const STATUS_EXPIRED: u8 = 5;
const BPS_DENOMINATOR: u128 = 10_000;

#[starknet::contract]
pub mod StarkVeilGrants {
    use starknet::ContractAddress;
    use starknet::get_block_timestamp;
    use starknet::get_caller_address;
    use starknet::get_contract_address;
    use starknet::storage::{
        Map,
        StorageMapReadAccess,
        StorageMapWriteAccess,
        StoragePointerReadAccess,
        StoragePointerWriteAccess
    };

    use super::{
        BPS_DENOMINATOR,
        CommunityView,
        IERC20Dispatcher,
        IERC20DispatcherTrait,
        ISemaphoreDispatcher,
        ISemaphoreDispatcherTrait,
        IStarkVeilGrants,
        ProposalView,
        STATUS_ACTIVE,
        STATUS_DRAFT,
        STATUS_EXECUTED,
        STATUS_EXPIRED,
        STATUS_PASSED,
        STATUS_REJECTED,
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        semaphore: ContractAddress,
        token: ContractAddress,
        community_count: u64,
        proposal_count: u64,

        community_exists: Map<u64, bool>,
        community_name: Map<u64, felt252>,
        community_group_id: Map<u64, felt252>,
        community_depth: Map<u64, u8>,
        community_treasury_admin: Map<u64, ContractAddress>,
        community_quorum: Map<u64, u32>,
        community_yes_threshold_bps: Map<u64, u16>,
        community_max_ask_bps: Map<u64, u16>,
        community_treasury_balance: Map<u64, u128>,

        proposal_exists: Map<u64, bool>,
        proposal_community_id: Map<u64, u64>,
        proposal_creator: Map<u64, ContractAddress>,
        proposal_title: Map<u64, felt252>,
        proposal_summary: Map<u64, felt252>,
        proposal_recipient: Map<u64, ContractAddress>,
        proposal_ask_amount: Map<u64, u128>,
        proposal_scope: Map<u64, felt252>,
        proposal_voting_start: Map<u64, u64>,
        proposal_voting_end: Map<u64, u64>,
        proposal_status: Map<u64, u8>,
        proposal_yes_votes: Map<u64, u32>,
        proposal_no_votes: Map<u64, u32>,
        proposal_total_votes: Map<u64, u32>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        OwnershipTransferred: OwnershipTransferred,
        CommunityCreated: CommunityCreated,
        CommunityFunded: CommunityFunded,
        CommunityMemberAdded: CommunityMemberAdded,
        ProposalSubmitted: ProposalSubmitted,
        VoteRecorded: VoteRecorded,
        ProposalFinalized: ProposalFinalized,
        ProposalExecuted: ProposalExecuted,
    }

    #[derive(Drop, starknet::Event)]
    struct OwnershipTransferred {
        previous_owner: ContractAddress,
        new_owner: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct CommunityCreated {
        community_id: u64,
        group_id: felt252,
        treasury_admin: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    struct CommunityFunded {
        community_id: u64,
        amount: u128,
        new_balance: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct CommunityMemberAdded {
        community_id: u64,
        identity_commitment: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct ProposalSubmitted {
        proposal_id: u64,
        community_id: u64,
        scope: felt252,
        ask_amount: u128,
    }

    #[derive(Drop, starknet::Event)]
    struct VoteRecorded {
        proposal_id: u64,
        vote_for: bool,
        nullifier: felt252,
        total_votes: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct ProposalFinalized {
        proposal_id: u64,
        status: u8,
    }

    #[derive(Drop, starknet::Event)]
    struct ProposalExecuted {
        proposal_id: u64,
        recipient: ContractAddress,
        ask_amount: u128,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState, owner: ContractAddress, semaphore: ContractAddress, token: ContractAddress
    ) {
        self.owner.write(owner);
        self.semaphore.write(semaphore);
        self.token.write(token);
    }

    #[abi(embed_v0)]
    impl StarkVeilGrantsImpl of IStarkVeilGrants<ContractState> {
        fn transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
            assert_owner(@self);
            let previous_owner = self.owner.read();
            self.owner.write(new_owner);
            self
                .emit(Event::OwnershipTransferred(OwnershipTransferred { previous_owner, new_owner }));
        }

        fn create_community(
            ref self: ContractState,
            name: felt252,
            treasury_admin: ContractAddress,
            merkle_tree_depth: u8,
            quorum: u32,
            yes_threshold_bps: u16,
            max_ask_bps: u16
        ) -> u64 {
            assert_owner(@self);
            assert(quorum > 0_u32, 'INVALID_QUORUM');
            assert(yes_threshold_bps > 0_u16, 'INVALID_THRESHOLD');
            assert(yes_threshold_bps <= 10_000_u16, 'INVALID_THRESHOLD');
            assert(max_ask_bps > 0_u16, 'INVALID_MAX_ASK');
            assert(max_ask_bps <= 10_000_u16, 'INVALID_MAX_ASK');

            let community_id = self.community_count.read() + 1_u64;
            let group_id: felt252 = community_id.into();
            let semaphore = semaphore_dispatcher(@self);

            semaphore.create_group(group_id, get_contract_address(), merkle_tree_depth);

            self.community_count.write(community_id);
            self.community_exists.write(community_id, true);
            self.community_name.write(community_id, name);
            self.community_group_id.write(community_id, group_id);
            self.community_depth.write(community_id, merkle_tree_depth);
            self.community_treasury_admin.write(community_id, treasury_admin);
            self.community_quorum.write(community_id, quorum);
            self.community_yes_threshold_bps.write(community_id, yes_threshold_bps);
            self.community_max_ask_bps.write(community_id, max_ask_bps);
            self.community_treasury_balance.write(community_id, 0_u128);

            self.emit(Event::CommunityCreated(CommunityCreated { community_id, group_id, treasury_admin }));
            community_id
        }

        fn fund_community(ref self: ContractState, community_id: u64, amount: u128) {
            assert_community_exists(@self, community_id);
            assert(amount > 0_u128, 'INVALID_AMOUNT');

            let token = token_dispatcher(@self);
            let caller = get_caller_address();
            token.transfer_from(caller, get_contract_address(), u256_from_u128(amount));

            let next_balance = self.community_treasury_balance.read(community_id) + amount;
            self.community_treasury_balance.write(community_id, next_balance);
            self.emit(Event::CommunityFunded(CommunityFunded { community_id, amount, new_balance: next_balance }));
        }

        fn add_community_member(ref self: ContractState, community_id: u64, identity_commitment: felt252) {
            assert_community_exists(@self, community_id);
            assert_community_operator(@self, community_id);

            let semaphore = semaphore_dispatcher(@self);
            let group_id = self.community_group_id.read(community_id);
            semaphore.add_member(group_id, identity_commitment);

            self.emit(Event::CommunityMemberAdded(CommunityMemberAdded { community_id, identity_commitment }));
        }

        fn submit_proposal(
            ref self: ContractState,
            community_id: u64,
            title: felt252,
            summary: felt252,
            recipient: ContractAddress,
            ask_amount: u128,
            voting_start: u64,
            voting_end: u64
        ) -> u64 {
            assert_community_exists(@self, community_id);
            assert(ask_amount > 0_u128, 'INVALID_AMOUNT');
            assert(voting_end > voting_start, 'INVALID_WINDOW');

            let treasury_balance = self.community_treasury_balance.read(community_id);
            assert(treasury_balance > 0_u128, 'EMPTY_TREASURY');

            let max_ask_bps: u128 = self.community_max_ask_bps.read(community_id).into();
            let max_ask = treasury_balance * max_ask_bps / BPS_DENOMINATOR;
            assert(ask_amount <= max_ask, 'ASK_TOO_LARGE');

            let proposal_id = self.proposal_count.read() + 1_u64;
            let scope: felt252 = proposal_id.into();
            let status = initial_status(voting_start);

            self.proposal_count.write(proposal_id);
            self.proposal_exists.write(proposal_id, true);
            self.proposal_community_id.write(proposal_id, community_id);
            self.proposal_creator.write(proposal_id, get_caller_address());
            self.proposal_title.write(proposal_id, title);
            self.proposal_summary.write(proposal_id, summary);
            self.proposal_recipient.write(proposal_id, recipient);
            self.proposal_ask_amount.write(proposal_id, ask_amount);
            self.proposal_scope.write(proposal_id, scope);
            self.proposal_voting_start.write(proposal_id, voting_start);
            self.proposal_voting_end.write(proposal_id, voting_end);
            self.proposal_status.write(proposal_id, status);
            self.proposal_yes_votes.write(proposal_id, 0_u32);
            self.proposal_no_votes.write(proposal_id, 0_u32);
            self.proposal_total_votes.write(proposal_id, 0_u32);

            self.emit(Event::ProposalSubmitted(ProposalSubmitted {
                proposal_id,
                community_id,
                scope,
                ask_amount,
            }));
            proposal_id
        }

        fn cast_vote(
            ref self: ContractState,
            proposal_id: u64,
            vote_for: bool,
            merkle_tree_depth: u8,
            merkle_tree_root: felt252,
            nullifier: felt252,
            message_hash: felt252,
            scope_hash: felt252,
            proof_points: Span<felt252>
        ) {
            assert_proposal_exists(@self, proposal_id);
            sync_active_status(ref self, proposal_id);
            assert(self.proposal_status.read(proposal_id) == STATUS_ACTIVE, 'PROPOSAL_NOT_ACTIVE');

            let community_id = self.proposal_community_id.read(proposal_id);
            let scope = self.proposal_scope.read(proposal_id);
            let group_id = self.community_group_id.read(community_id);
            let message = bool_to_felt(vote_for);
            let semaphore = semaphore_dispatcher(@self);

            semaphore.validate_proof(
                group_id,
                merkle_tree_depth,
                merkle_tree_root,
                nullifier,
                message,
                scope,
                message_hash,
                scope_hash,
                proof_points,
            );

            if vote_for {
                let yes_votes = self.proposal_yes_votes.read(proposal_id) + 1_u32;
                self.proposal_yes_votes.write(proposal_id, yes_votes);
            } else {
                let no_votes = self.proposal_no_votes.read(proposal_id) + 1_u32;
                self.proposal_no_votes.write(proposal_id, no_votes);
            }

            let total_votes = self.proposal_total_votes.read(proposal_id) + 1_u32;
            self.proposal_total_votes.write(proposal_id, total_votes);

            self.emit(Event::VoteRecorded(VoteRecorded { proposal_id, vote_for, nullifier, total_votes }));
        }

        fn finalize_proposal(ref self: ContractState, proposal_id: u64) {
            assert_proposal_exists(@self, proposal_id);
            let current_status = self.proposal_status.read(proposal_id);
            assert(current_status != STATUS_EXECUTED, 'ALREADY_EXECUTED');
            assert(current_status != STATUS_PASSED, 'ALREADY_FINALIZED');
            assert(current_status != STATUS_REJECTED, 'ALREADY_FINALIZED');
            assert(current_status != STATUS_EXPIRED, 'ALREADY_FINALIZED');

            sync_active_status(ref self, proposal_id);

            let community_id = self.proposal_community_id.read(proposal_id);
            let quorum = self.community_quorum.read(community_id);
            let yes_votes = self.proposal_yes_votes.read(proposal_id);
            let no_votes = self.proposal_no_votes.read(proposal_id);
            let total_votes = self.proposal_total_votes.read(proposal_id);
            let now = get_block_timestamp();
            let voting_end = self.proposal_voting_end.read(proposal_id);

            let status = if total_votes < quorum {
                assert(now >= voting_end, 'VOTING_OPEN');
                STATUS_EXPIRED
            } else if threshold_met(yes_votes, no_votes, self.community_yes_threshold_bps.read(community_id)) {
                STATUS_PASSED
            } else {
                assert(now >= voting_end, 'VOTING_OPEN');
                STATUS_REJECTED
            };

            self.proposal_status.write(proposal_id, status);
            self.emit(Event::ProposalFinalized(ProposalFinalized { proposal_id, status }));
        }

        fn execute_proposal(ref self: ContractState, proposal_id: u64) {
            assert_proposal_exists(@self, proposal_id);
            assert(self.proposal_status.read(proposal_id) == STATUS_PASSED, 'PROPOSAL_NOT_PASSED');

            let community_id = self.proposal_community_id.read(proposal_id);
            let ask_amount = self.proposal_ask_amount.read(proposal_id);
            let treasury_balance = self.community_treasury_balance.read(community_id);
            assert(treasury_balance >= ask_amount, 'INSUFFICIENT_TREASURY');

            let recipient = self.proposal_recipient.read(proposal_id);
            let token = token_dispatcher(@self);
            token.transfer(recipient, u256_from_u128(ask_amount));

            self.community_treasury_balance.write(community_id, treasury_balance - ask_amount);
            self.proposal_status.write(proposal_id, STATUS_EXECUTED);

            self.emit(Event::ProposalExecuted(ProposalExecuted { proposal_id, recipient, ask_amount }));
        }

        fn get_owner(self: @ContractState) -> ContractAddress {
            self.owner.read()
        }

        fn get_semaphore(self: @ContractState) -> ContractAddress {
            self.semaphore.read()
        }

        fn get_token(self: @ContractState) -> ContractAddress {
            self.token.read()
        }

        fn get_community(self: @ContractState, community_id: u64) -> CommunityView {
            assert_community_exists(self, community_id);
            CommunityView {
                id: community_id,
                name: self.community_name.read(community_id),
                group_id: self.community_group_id.read(community_id),
                merkle_tree_depth: self.community_depth.read(community_id),
                treasury_admin: self.community_treasury_admin.read(community_id),
                quorum: self.community_quorum.read(community_id),
                yes_threshold_bps: self.community_yes_threshold_bps.read(community_id),
                max_ask_bps: self.community_max_ask_bps.read(community_id),
                treasury_balance: self.community_treasury_balance.read(community_id),
            }
        }

        fn get_proposal(self: @ContractState, proposal_id: u64) -> ProposalView {
            assert_proposal_exists(self, proposal_id);
            ProposalView {
                id: proposal_id,
                community_id: self.proposal_community_id.read(proposal_id),
                creator: self.proposal_creator.read(proposal_id),
                title: self.proposal_title.read(proposal_id),
                summary: self.proposal_summary.read(proposal_id),
                recipient: self.proposal_recipient.read(proposal_id),
                ask_amount: self.proposal_ask_amount.read(proposal_id),
                scope: self.proposal_scope.read(proposal_id),
                voting_start: self.proposal_voting_start.read(proposal_id),
                voting_end: self.proposal_voting_end.read(proposal_id),
                status: self.proposal_status.read(proposal_id),
                yes_votes: self.proposal_yes_votes.read(proposal_id),
                no_votes: self.proposal_no_votes.read(proposal_id),
                total_votes: self.proposal_total_votes.read(proposal_id),
            }
        }
    }

    fn assert_owner(self: @ContractState) {
        assert(get_caller_address() == self.owner.read(), 'NOT_OWNER');
    }

    fn assert_community_exists(self: @ContractState, community_id: u64) {
        assert(self.community_exists.read(community_id), 'UNKNOWN_COMMUNITY');
    }

    fn assert_proposal_exists(self: @ContractState, proposal_id: u64) {
        assert(self.proposal_exists.read(proposal_id), 'UNKNOWN_PROPOSAL');
    }

    fn assert_community_operator(self: @ContractState, community_id: u64) {
        let caller = get_caller_address();
        let is_owner = caller == self.owner.read();
        let is_admin = caller == self.community_treasury_admin.read(community_id);
        assert(is_owner || is_admin, 'NOT_COMMUNITY_OPERATOR');
    }

    fn semaphore_dispatcher(self: @ContractState) -> ISemaphoreDispatcher {
        ISemaphoreDispatcher { contract_address: self.semaphore.read() }
    }

    fn token_dispatcher(self: @ContractState) -> IERC20Dispatcher {
        IERC20Dispatcher { contract_address: self.token.read() }
    }

    fn u256_from_u128(value: u128) -> u256 {
        u256 { low: value.into(), high: 0_u128 }
    }

    fn bool_to_felt(value: bool) -> felt252 {
        if value { 1 } else { 0 }
    }

    fn initial_status(voting_start: u64) -> u8 {
        if get_block_timestamp() >= voting_start { STATUS_ACTIVE } else { STATUS_DRAFT }
    }

    fn sync_active_status(ref self: ContractState, proposal_id: u64) {
        let status = self.proposal_status.read(proposal_id);
        if status != STATUS_DRAFT && status != STATUS_ACTIVE {
            return;
        }

        let now = get_block_timestamp();
        let voting_start = self.proposal_voting_start.read(proposal_id);
        let voting_end = self.proposal_voting_end.read(proposal_id);

        if now < voting_start {
            self.proposal_status.write(proposal_id, STATUS_DRAFT);
        } else if now <= voting_end {
            self.proposal_status.write(proposal_id, STATUS_ACTIVE);
        }
    }

    fn threshold_met(yes_votes: u32, no_votes: u32, threshold_bps: u16) -> bool {
        let total_votes: u128 = (yes_votes + no_votes).into();
        if total_votes == 0_u128 {
            return false;
        }
        let yes_votes_u128: u128 = yes_votes.into();
        yes_votes_u128 * BPS_DENOMINATOR >= total_votes * threshold_bps.into()
    }
}
