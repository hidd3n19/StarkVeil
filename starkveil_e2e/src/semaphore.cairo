use crate::interfaces::isemaphore::ISemaphore;
use crate::interfaces::iverifier::{IVerifierDispatcher, IVerifierDispatcherTrait};

const MAX_DEPTH: u8 = 32;
const ZERO_FELT: felt252 = 0;
const DEFAULT_MERKLE_TREE_DURATION: u64 = 3600_u64;

#[starknet::contract]
pub mod Semaphore {
    use core::hash::HashStateTrait;
    use core::poseidon::PoseidonTrait;
    use starknet::ContractAddress;
    use starknet::storage::{
        Map,
        StorageMapReadAccess,
        StorageMapWriteAccess,
        StoragePointerReadAccess,
        StoragePointerWriteAccess
    };

    use super::{
        IVerifierDispatcher,
        IVerifierDispatcherTrait,
        ISemaphore,
        MAX_DEPTH,
        ZERO_FELT,
        DEFAULT_MERKLE_TREE_DURATION,
    };

    #[storage]
    struct Storage {
        owner: ContractAddress,
        initialized: bool,

        verifier_for_depth: Map<u8, ContractAddress>,
        verifier_is_set: Map<u8, bool>,

        group_exists: Map<felt252, bool>,
        group_admin: Map<felt252, ContractAddress>,
        group_depth: Map<felt252, u8>,
        group_merkle_tree_duration: Map<felt252, u64>,
        // number of inserted leaves (append index cursor)
        group_size: Map<felt252, u64>,
        group_root: Map<felt252, felt252>,

        // (group_id, leaf_index) -> leaf commitment
        group_leaf: Map<(felt252, u64), felt252>,

        // (group_id, root) -> exists / timestamp
        group_root_exists: Map<(felt252, felt252), bool>,
        group_root_created_at: Map<(felt252, felt252), u64>,

        // (group_id, level, index) -> hash / exists
        group_node_hash: Map<(felt252, u8, u64), felt252>,
        group_node_exists: Map<(felt252, u8, u64), bool>,

        nullifier_used: Map<felt252, bool>
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        OwnershipTransferred: OwnershipTransferred,
        VerifierSet: VerifierSet,
        GroupCreated: GroupCreated,
        GroupAdminUpdated: GroupAdminUpdated,
        GroupMerkleTreeDurationUpdated: GroupMerkleTreeDurationUpdated,
        MemberAdded: MemberAdded,
        MemberUpdated: MemberUpdated,
        MemberRemoved: MemberRemoved,
        ProofValidated: ProofValidated
    }

    #[derive(Drop, starknet::Event)]
    struct OwnershipTransferred {
        previous_owner: ContractAddress,
        new_owner: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct VerifierSet {
        merkle_tree_depth: u8,
        verifier: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct GroupCreated {
        group_id: felt252,
        admin: ContractAddress,
        merkle_tree_depth: u8,
        root: felt252
    }

    #[derive(Drop, starknet::Event)]
    struct GroupAdminUpdated {
        group_id: felt252,
        previous_admin: ContractAddress,
        new_admin: ContractAddress
    }

    #[derive(Drop, starknet::Event)]
    struct GroupMerkleTreeDurationUpdated {
        group_id: felt252,
        previous_merkle_tree_duration: u64,
        new_merkle_tree_duration: u64
    }

    #[derive(Drop, starknet::Event)]
    struct MemberAdded {
        group_id: felt252,
        identity_commitment: felt252,
        leaf_index: u64,
        new_root: felt252
    }

    #[derive(Drop, starknet::Event)]
    struct MemberUpdated {
        group_id: felt252,
        leaf_index: u64,
        old_identity_commitment: felt252,
        new_identity_commitment: felt252,
        new_root: felt252
    }

    #[derive(Drop, starknet::Event)]
    struct MemberRemoved {
        group_id: felt252,
        leaf_index: u64,
        identity_commitment: felt252,
        new_root: felt252
    }

    #[derive(Drop, starknet::Event)]
    struct ProofValidated {
        group_id: felt252,
        merkle_tree_root: felt252,
        nullifier: felt252,
        message: felt252,
        scope: felt252
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.initialized.write(true);
    }

    #[abi(embed_v0)]
    impl SemaphoreImpl of ISemaphore<ContractState> {
        fn initialize(ref self: ContractState, owner: ContractAddress) {
            let initialized = self.initialized.read();
            assert(!initialized, 'ALREADY_INITIALIZED');
            let previous_owner = self.owner.read();
            self.owner.write(owner);
            self.initialized.write(true);
            self
                .emit(
                    Event::OwnershipTransferred(
                        OwnershipTransferred { previous_owner, new_owner: owner }
                    )
                );
        }

        fn transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
            assert_initialized(@self);
            assert_owner(@self);
            let previous_owner = self.owner.read();
            self.owner.write(new_owner);
            self
                .emit(
                    Event::OwnershipTransferred(
                        OwnershipTransferred { previous_owner, new_owner }
                    )
                );
        }

        fn set_verifier(ref self: ContractState, merkle_tree_depth: u8, verifier: ContractAddress) {
            assert_initialized(@self);
            assert_owner(@self);
            assert(merkle_tree_depth >= 1_u8, 'INVALID_DEPTH');
            assert(merkle_tree_depth <= MAX_DEPTH, 'INVALID_DEPTH');

            self.verifier_for_depth.write(merkle_tree_depth, verifier);
            self.verifier_is_set.write(merkle_tree_depth, true);
            self.emit(Event::VerifierSet(VerifierSet { merkle_tree_depth, verifier }));
        }

        fn create_group(
            ref self: ContractState,
            group_id: felt252,
            admin: ContractAddress,
            merkle_tree_depth: u8
        ) {
            assert_initialized(@self);
            // assert_owner(@self); // REMOVED: Allow anyone to create a group
            assert(merkle_tree_depth >= 1_u8, 'INVALID_DEPTH');
            assert(merkle_tree_depth <= MAX_DEPTH, 'INVALID_DEPTH');

            let exists = self.group_exists.read(group_id);
            assert(!exists, 'GROUP_EXISTS');

            self.group_exists.write(group_id, true);
            self.group_admin.write(group_id, admin);
            self.group_depth.write(group_id, merkle_tree_depth);
            self.group_merkle_tree_duration.write(group_id, DEFAULT_MERKLE_TREE_DURATION);
            self.group_size.write(group_id, 0_u64);

            let root = ZERO_FELT;
            self.group_root.write(group_id, root);
            self.group_root_exists.write((group_id, root), true);
            self
                .group_root_created_at
                .write((group_id, root), starknet::get_block_timestamp());

            self
                .emit(
                    Event::GroupCreated(GroupCreated {
                        group_id,
                        admin,
                        merkle_tree_depth,
                        root
                    })
                );
        }

        fn set_group_admin(ref self: ContractState, group_id: felt252, admin: ContractAddress) {
            assert_initialized(@self);
            assert_group_exists(@self, group_id);
            assert_group_admin(@self, group_id);

            let previous_admin = self.group_admin.read(group_id);
            self.group_admin.write(group_id, admin);
            self
                .emit(
                    Event::GroupAdminUpdated(
                        GroupAdminUpdated { group_id, previous_admin, new_admin: admin }
                    )
                );
        }

        fn update_group_merkle_tree_duration(
            ref self: ContractState, group_id: felt252, new_merkle_tree_duration: u64
        ) {
            assert_initialized(@self);
            assert_group_exists(@self, group_id);
            assert_group_admin(@self, group_id);

            let previous_merkle_tree_duration = self.group_merkle_tree_duration.read(group_id);
            self.group_merkle_tree_duration.write(group_id, new_merkle_tree_duration);
            self
                .emit(
                    Event::GroupMerkleTreeDurationUpdated(
                        GroupMerkleTreeDurationUpdated {
                            group_id,
                            previous_merkle_tree_duration,
                            new_merkle_tree_duration,
                        }
                    )
                );
        }

        fn add_member(ref self: ContractState, group_id: felt252, identity_commitment: felt252) {
            assert_initialized(@self);
            assert_group_exists(@self, group_id);
            assert_group_admin(@self, group_id);
            assert(identity_commitment != ZERO_FELT, 'INVALID_MEMBER');

            let depth = self.group_depth.read(group_id);
            let capacity = tree_capacity(depth);
            let leaf_index = self.group_size.read(group_id);
            assert(leaf_index < capacity, 'GROUP_FULL');

            let new_root = recompute_and_store_path_append(
                ref self, group_id, depth, leaf_index, identity_commitment
            );

            self.group_leaf.write((group_id, leaf_index), identity_commitment);
            self.group_size.write(group_id, leaf_index + 1_u64);
            set_new_root(ref self, group_id, new_root);

            self
                .emit(
                    Event::MemberAdded(
                        MemberAdded {
                            group_id,
                            identity_commitment,
                            leaf_index,
                            new_root
                        }
                    )
                );
        }

        fn add_members(ref self: ContractState, group_id: felt252, identity_commitments: Span<felt252>) {
            assert_initialized(@self);
            assert_group_exists(@self, group_id);
            assert_group_admin(@self, group_id);

            let mut idx: usize = 0;
            loop {
                if idx >= identity_commitments.len() {
                    break;
                }

                let commitment = *identity_commitments.at(idx);
                self.add_member(group_id, commitment);
                idx += 1;
            };
        }

        fn update_member(
            ref self: ContractState,
            group_id: felt252,
            leaf_index: u64,
            old_identity_commitment: felt252,
            new_identity_commitment: felt252,
            siblings: Span<felt252>
        ) {
            assert_initialized(@self);
            assert_group_exists(@self, group_id);
            assert_group_admin(@self, group_id);
            assert(new_identity_commitment != ZERO_FELT, 'INVALID_NEW_MEMBER');
            let depth = self.group_depth.read(group_id);

            assert_leaf_matches(@self, group_id, leaf_index, old_identity_commitment);
            assert_inclusion(@self, group_id, depth, leaf_index, old_identity_commitment, siblings);

            let new_root = recompute_and_store_path_with_siblings(
                ref self,
                group_id,
                depth,
                leaf_index,
                new_identity_commitment,
                siblings
            );

            self.group_leaf.write((group_id, leaf_index), new_identity_commitment);
            set_new_root(ref self, group_id, new_root);

            self
                .emit(
                    Event::MemberUpdated(
                        MemberUpdated {
                            group_id,
                            leaf_index,
                            old_identity_commitment,
                            new_identity_commitment,
                            new_root
                        }
                    )
                );
        }

        fn remove_member(
            ref self: ContractState,
            group_id: felt252,
            leaf_index: u64,
            identity_commitment: felt252,
            siblings: Span<felt252>
        ) {
            assert_initialized(@self);
            assert_group_exists(@self, group_id);
            assert_group_admin(@self, group_id);
            let depth = self.group_depth.read(group_id);

            assert_leaf_matches(@self, group_id, leaf_index, identity_commitment);
            assert(identity_commitment != ZERO_FELT, 'MEMBER_ALREADY_REMOVED');
            assert_inclusion(@self, group_id, depth, leaf_index, identity_commitment, siblings);

            let new_root = recompute_and_store_path_with_siblings(
                ref self,
                group_id,
                depth,
                leaf_index,
                ZERO_FELT,
                siblings
            );

            self.group_leaf.write((group_id, leaf_index), ZERO_FELT);
            set_new_root(ref self, group_id, new_root);

            self
                .emit(
                    Event::MemberRemoved(
                        MemberRemoved { group_id, leaf_index, identity_commitment, new_root }
                    )
                );
        }

        fn validate_proof(
            ref self: ContractState,
            group_id: felt252,
            merkle_tree_depth: u8,
            merkle_tree_root: felt252,
            nullifier: felt252,
            message: felt252,
            scope: felt252,
            message_hash: felt252,
            scope_hash: felt252,
            proof_points: Span<felt252>
        ) {
            assert_initialized(@self);
            assert_group_exists(@self, group_id);

            let stored_depth = self.group_depth.read(group_id);
            assert(stored_depth == merkle_tree_depth, 'DEPTH_MISMATCH');

            let group_size = self.group_size.read(group_id);
            assert(group_size > 0_u64, 'GROUP_HAS_NO_MEMBERS');

            let current_root = self.group_root.read(group_id);
            if merkle_tree_root != current_root {
                let root_exists = self.group_root_exists.read((group_id, merkle_tree_root));
                assert(root_exists, 'ROOT_NOT_IN_GROUP');

                let root_created_at = self.group_root_created_at.read((group_id, merkle_tree_root));
                let merkle_tree_duration = self.group_merkle_tree_duration.read(group_id);
                let expires_at = root_created_at + merkle_tree_duration;
                assert(starknet::get_block_timestamp() <= expires_at, 'ROOT_EXPIRED');
            }

            let used = self.nullifier_used.read(nullifier);
            assert(!used, 'NULLIFIER_ALREADY_USED');

            let verifier_exists = self.verifier_is_set.read(merkle_tree_depth);
            assert(verifier_exists, 'UNSUPPORTED_DEPTH');
            let verifier = self.verifier_for_depth.read(merkle_tree_depth);

            let mut public_inputs = array![];
            public_inputs.append(merkle_tree_root);
            public_inputs.append(nullifier);
            public_inputs.append(message_hash);
            public_inputs.append(scope_hash);

            let verifier_dispatcher = IVerifierDispatcher { contract_address: verifier };
            let ok = verifier_dispatcher.verify(public_inputs.span(), proof_points);
            assert(ok, 'INVALID_PROOF');

            self.nullifier_used.write(nullifier, true);
            self
                .emit(
                    Event::ProofValidated(
                        ProofValidated {
                            group_id,
                            merkle_tree_root,
                            nullifier,
                            message,
                            scope
                        }
                    )
                );
        }

        fn get_root(self: @ContractState, group_id: felt252) -> felt252 {
            self.group_root.read(group_id)
        }

        fn get_depth(self: @ContractState, group_id: felt252) -> u8 {
            self.group_depth.read(group_id)
        }

        fn get_size(self: @ContractState, group_id: felt252) -> u64 {
            self.group_size.read(group_id)
        }

        fn get_member(self: @ContractState, group_id: felt252, leaf_index: u64) -> felt252 {
            self.group_leaf.read((group_id, leaf_index))
        }

        fn is_root(self: @ContractState, group_id: felt252, root: felt252) -> bool {
            self.group_root_exists.read((group_id, root))
        }

        fn is_nullifier_used(self: @ContractState, nullifier: felt252) -> bool {
            self.nullifier_used.read(nullifier)
        }
    }

    fn assert_owner(self: @ContractState) {
        let caller = starknet::get_caller_address();
        let owner = self.owner.read();
        assert(caller == owner, 'NOT_OWNER');
    }

    fn assert_initialized(self: @ContractState) {
        let initialized = self.initialized.read();
        assert(initialized, 'NOT_INITIALIZED');
    }

    fn assert_group_exists(self: @ContractState, group_id: felt252) {
        let exists = self.group_exists.read(group_id);
        assert(exists, 'GROUP_NOT_FOUND');
    }

    fn assert_group_admin(self: @ContractState, group_id: felt252) {
        let caller = starknet::get_caller_address();
        let admin = self.group_admin.read(group_id);
        assert(caller == admin, 'NOT_GROUP_ADMIN');
    }

    fn assert_leaf_matches(
        self: @ContractState, group_id: felt252, leaf_index: u64, identity_commitment: felt252
    ) {
        let stored = self.group_leaf.read((group_id, leaf_index));
        assert(stored == identity_commitment, 'LEAF_MISMATCH');
    }

    fn assert_inclusion(
        self: @ContractState,
        group_id: felt252,
        depth: u8,
        leaf_index: u64,
        leaf: felt252,
        siblings: Span<felt252>
    ) {
        let _ = depth;
        let current_root = self.group_root.read(group_id);
        let size = self.group_size.read(group_id);
        let dynamic_depth = lean_tree_depth(size);
        let computed_root = compute_root_from_path(
            self, group_id, dynamic_depth, leaf_index, leaf, siblings
        );
        assert(computed_root == current_root, 'INVALID_MERKLE_PROOF');
    }

    fn set_new_root(ref self: ContractState, group_id: felt252, root: felt252) {
        self.group_root.write(group_id, root);
        self.group_root_exists.write((group_id, root), true);
        self
            .group_root_created_at
            .write((group_id, root), starknet::get_block_timestamp());
    }

    fn tree_capacity(depth: u8) -> u64 {
        let mut cap = 1_u64;
        let mut i = 0_u8;
        loop {
            if i == depth {
                break;
            }
            cap = cap * 2_u64;
            i = i + 1_u8;
        };
        cap
    }

    fn lean_tree_depth(size: u64) -> u8 {
        if size <= 1_u64 {
            return 0_u8;
        }

        let mut width = 1_u64;
        let mut depth = 0_u8;
        loop {
            if width >= size {
                break;
            }
            width = width * 2_u64;
            depth = depth + 1_u8;
        };
        depth
    }

    fn hash2(left: felt252, right: felt252) -> felt252 {
        let mut state = PoseidonTrait::new();
        state = state.update(left);
        state = state.update(right);
        state.finalize()
    }

    fn recompute_and_store_path_append(
        ref self: ContractState,
        group_id: felt252,
        depth: u8,
        leaf_index: u64,
        new_leaf: felt252
    ) -> felt252 {
        let _ = depth;
        let mut node = new_leaf;
        let mut index = leaf_index;
        let mut level = 0_u8;
        let dynamic_depth = lean_tree_depth(leaf_index + 1_u64);

        loop {
            if level == dynamic_depth {
                break;
            }

            self.group_node_hash.write((group_id, level, index), node);
            self.group_node_exists.write((group_id, level, index), true);

            if index % 2_u64 == 1_u64 {
                let sibling = self.group_node_hash.read((group_id, level, index - 1_u64));
                node = hash2(sibling, node);
            }

            index = index / 2_u64;
            level = level + 1_u8;
        };

        self.group_node_hash.write((group_id, dynamic_depth, 0_u64), node);
        self.group_node_exists.write((group_id, dynamic_depth, 0_u64), true);

        node
    }

    fn recompute_and_store_path_with_siblings(
        ref self: ContractState,
        group_id: felt252,
        depth: u8,
        leaf_index: u64,
        new_leaf: felt252,
        siblings: Span<felt252>
    ) -> felt252 {
        let _ = depth;
        let _ = siblings;
        let size = self.group_size.read(group_id);
        let dynamic_depth = lean_tree_depth(size);
        let mut node = new_leaf;
        let mut index = leaf_index;
        let mut level = 0_u8;

        loop {
            if level == dynamic_depth {
                break;
            }

            self.group_node_hash.write((group_id, level, index), node);
            self.group_node_exists.write((group_id, level, index), true);

            if index % 2_u64 == 1_u64 {
                let sibling = self.group_node_hash.read((group_id, level, index - 1_u64));
                node = hash2(sibling, node);
            } else {
                let sibling_exists = self.group_node_exists.read((group_id, level, index + 1_u64));
                if sibling_exists {
                    let sibling = self.group_node_hash.read((group_id, level, index + 1_u64));
                    node = hash2(node, sibling);
                }
            }

            index = index / 2_u64;
            level = level + 1_u8;
        };

        self.group_node_hash.write((group_id, dynamic_depth, 0_u64), node);
        self.group_node_exists.write((group_id, dynamic_depth, 0_u64), true);

        node
    }

    fn compute_root_from_path(
        self: @ContractState,
        group_id: felt252,
        depth: u8,
        leaf_index: u64,
        leaf: felt252,
        siblings: Span<felt252>
    ) -> felt252 {
        let mut node = leaf;
        let mut index = leaf_index;
        let mut level = 0_u8;
        let mut sibling_index: usize = 0;

        loop {
            if level == depth {
                break;
            }

            let has_sibling = if index % 2_u64 == 1_u64 {
                self.group_node_exists.read((group_id, level, index - 1_u64))
            } else {
                self.group_node_exists.read((group_id, level, index + 1_u64))
            };

            if has_sibling {
                assert(sibling_index < siblings.len(), 'INVALID_SIBLINGS_LEN');
                let sibling = *siblings.at(sibling_index);
                node = if index % 2_u64 == 0_u64 {
                    hash2(node, sibling)
                } else {
                    hash2(sibling, node)
                };
                sibling_index += 1;
            }

            index = index / 2_u64;
            level = level + 1_u8;
        };

        assert(sibling_index == siblings.len(), 'INVALID_SIBLINGS_LEN');
        node
    }
}
