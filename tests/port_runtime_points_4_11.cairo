use semaphore_starknet::interfaces::isemaphore::{ISemaphoreDispatcher, ISemaphoreDispatcherTrait};

use snforge_std::{
    ContractClassTrait,
    DeclareResultTrait,
    EventSpyTrait,
    EventsFilterTrait,
    declare,
    load,
    map_entry_address,
    spy_events,
    start_cheat_block_timestamp_global,
    start_cheat_caller_address,
    stop_cheat_block_timestamp_global,
    stop_cheat_caller_address,
};

const DEPTH_1: u8 = 1;
const DEPTH_2: u8 = 2;
const DEPTH_20: u8 = 20;
const GROUP_ID: felt252 = 1;
const POINT_16_COMMITMENT: felt252 = 123456789;

fn owner() -> starknet::ContractAddress {
    111.try_into().unwrap()
}

fn admin() -> starknet::ContractAddress {
    222.try_into().unwrap()
}

fn outsider() -> starknet::ContractAddress {
    333.try_into().unwrap()
}

fn new_owner() -> starknet::ContractAddress {
    444.try_into().unwrap()
}

fn new_admin() -> starknet::ContractAddress {
    555.try_into().unwrap()
}

fn verifier_address() -> starknet::ContractAddress {
    777.try_into().unwrap()
}

fn deploy_semaphore() -> (ISemaphoreDispatcher, starknet::ContractAddress) {
    let semaphore_class = declare("Semaphore").unwrap().contract_class();
    let mut args = array![];
    args.append(owner().into());
    let (address, _) = semaphore_class.deploy(@args).unwrap();
    (ISemaphoreDispatcher { contract_address: address }, address)
}

fn deploy_initialized_stack(depth: u8) -> (ISemaphoreDispatcher, starknet::ContractAddress) {
    let (semaphore, semaphore_addr) = deploy_semaphore();

    start_cheat_caller_address(semaphore_addr, owner());
    semaphore.set_verifier(depth, verifier_address());
    stop_cheat_caller_address(semaphore_addr);

    semaphore.create_group(GROUP_ID, admin(), depth);

    (semaphore, semaphore_addr)
}

fn load_single(target: starknet::ContractAddress, address: felt252) -> felt252 {
    *load(target, address, 1).at(0)
}

fn assert_contract_emitted_any_event(
    ref spy: snforge_std::EventSpy, contract_address: starknet::ContractAddress,
) {
    let events = spy.get_events().emitted_by(contract_address);
    assert(events.events.len() > 0, 'EVENT_NOT_EMITTED');
}

#[test]
fn point_4_constructor_sets_owner_and_initialized_state() {
    let (semaphore, semaphore_addr) = deploy_semaphore();

    let owner_storage = load_single(semaphore_addr, selector!("owner"));
    let initialized_storage = load_single(semaphore_addr, selector!("initialized"));

    let expected_owner: felt252 = owner().into();
    assert(owner_storage == expected_owner, 'OWNER_NOT_SET');
    assert(initialized_storage == 1, 'NOT_INITIALIZED');

    start_cheat_caller_address(semaphore_addr, owner());
    semaphore.set_verifier(DEPTH_20, verifier_address());
    stop_cheat_caller_address(semaphore_addr);
}

#[test]
#[should_panic(expected: 'ALREADY_INITIALIZED')]
fn point_4_initialize_cannot_be_called_more_than_once() {
    let (semaphore, _) = deploy_semaphore();
    semaphore.initialize(new_owner());
}

#[test]
fn point_5_owner_can_transfer_ownership_and_event_is_emitted() {
    let (semaphore, semaphore_addr) = deploy_semaphore();
    let mut spy = spy_events();

    start_cheat_caller_address(semaphore_addr, owner());
    semaphore.transfer_ownership(new_owner());
    stop_cheat_caller_address(semaphore_addr);

    let owner_storage = load_single(semaphore_addr, selector!("owner"));
    let expected_owner: felt252 = new_owner().into();
    assert(owner_storage == expected_owner, 'OWNER_NOT_UPDATED');
    assert_contract_emitted_any_event(ref spy, semaphore_addr);

    start_cheat_caller_address(semaphore_addr, new_owner());
    semaphore.set_verifier(DEPTH_20, verifier_address());
    stop_cheat_caller_address(semaphore_addr);
}

#[test]
#[should_panic(expected: 'NOT_OWNER')]
fn point_5_non_owner_cannot_transfer_ownership() {
    let (semaphore, semaphore_addr) = deploy_semaphore();
    start_cheat_caller_address(semaphore_addr, outsider());
    semaphore.transfer_ownership(new_owner());
}

#[test]
fn point_6_owner_can_register_verifier_for_valid_depth_and_event_is_emitted() {
    let (semaphore, semaphore_addr) = deploy_semaphore();
    let mut spy = spy_events();

    start_cheat_caller_address(semaphore_addr, owner());
    semaphore.set_verifier(DEPTH_20, verifier_address());
    stop_cheat_caller_address(semaphore_addr);

    let verifier_for_depth_addr = map_entry_address(
        selector!("verifier_for_depth"), array![DEPTH_20.into()].span()
    );
    let verifier_is_set_addr = map_entry_address(
        selector!("verifier_is_set"), array![DEPTH_20.into()].span()
    );

    let stored_verifier = load_single(semaphore_addr, verifier_for_depth_addr);
    let stored_flag = load_single(semaphore_addr, verifier_is_set_addr);
    let expected_verifier: felt252 = verifier_address().into();

    assert(stored_verifier == expected_verifier, 'VERIFIER_NOT_STORED');
    assert(stored_flag == 1, 'VERIFIER_FLAG_NOT_SET');
    assert_contract_emitted_any_event(ref spy, semaphore_addr);
}

#[test]
#[should_panic(expected: 'NOT_OWNER')]
fn point_6_non_owner_cannot_register_verifier() {
    let (semaphore, semaphore_addr) = deploy_semaphore();
    start_cheat_caller_address(semaphore_addr, outsider());
    semaphore.set_verifier(DEPTH_20, verifier_address());
}

#[test]
#[should_panic(expected: 'INVALID_DEPTH')]
fn point_6_invalid_depth_verifier_registration_is_rejected() {
    let (semaphore, semaphore_addr) = deploy_semaphore();
    start_cheat_caller_address(semaphore_addr, owner());
    semaphore.set_verifier(0, verifier_address());
}

#[test]
fn point_7_group_creation_initializes_state_and_emits_event() {
    let (semaphore, semaphore_addr) = deploy_semaphore();
    let mut spy = spy_events();
    start_cheat_block_timestamp_global(123);

    semaphore.create_group(GROUP_ID, admin(), DEPTH_2);

    assert(semaphore.get_depth(GROUP_ID) == DEPTH_2, 'DEPTH_NOT_SET');
    assert(semaphore.get_size(GROUP_ID) == 0, 'SIZE_NOT_ZERO');

    let admin_storage_addr = map_entry_address(selector!("group_admin"), array![GROUP_ID].span());
    let exists_storage_addr = map_entry_address(selector!("group_exists"), array![GROUP_ID].span());
    let depth_storage_addr = map_entry_address(selector!("group_depth"), array![GROUP_ID].span());
    let size_storage_addr = map_entry_address(selector!("group_size"), array![GROUP_ID].span());

    let stored_admin = load_single(semaphore_addr, admin_storage_addr);
    let stored_exists = load_single(semaphore_addr, exists_storage_addr);
    let stored_depth = load_single(semaphore_addr, depth_storage_addr);
    let stored_size = load_single(semaphore_addr, size_storage_addr);
    let root = semaphore.get_root(GROUP_ID);
    let root_exists = semaphore.is_root(GROUP_ID, root);
    let root_created_addr = map_entry_address(
        selector!("group_root_created_at"), array![GROUP_ID, root].span()
    );
    let root_created_at = load_single(semaphore_addr, root_created_addr);

    assert(stored_admin == admin().into(), 'ADMIN_NOT_SET');
    assert(stored_exists == 1, 'GROUP_NOT_MARKED_EXISTS');
    assert(stored_depth == DEPTH_2.into(), 'DEPTH_STORAGE_NOT_SET');
    assert(stored_size == 0, 'SIZE_STORAGE_NOT_ZERO');
    assert(root_exists, 'ROOT_HISTORY_NOT_SET');
    assert(root_created_at == 123, 'ROOT_TIMESTAMP_NOT_SET');
    assert_contract_emitted_any_event(ref spy, semaphore_addr);
    stop_cheat_block_timestamp_global();
}

#[test]
#[should_panic(expected: 'GROUP_EXISTS')]
fn point_7_duplicate_group_creation_is_rejected() {
    let (semaphore, _) = deploy_semaphore();
    semaphore.create_group(GROUP_ID, admin(), DEPTH_2);
    semaphore.create_group(GROUP_ID, admin(), DEPTH_2);
}

#[test]
#[should_panic(expected: 'INVALID_DEPTH')]
fn point_7_invalid_group_depth_is_rejected() {
    let (semaphore, _) = deploy_semaphore();
    semaphore.create_group(GROUP_ID, admin(), 0);
}

#[test]
fn point_8_current_admin_can_update_admin_and_event_is_emitted() {
    let (semaphore, semaphore_addr) = deploy_initialized_stack(DEPTH_2);
    let mut spy = spy_events();

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.set_group_admin(GROUP_ID, new_admin());
    stop_cheat_caller_address(semaphore_addr);

    let admin_storage_addr = map_entry_address(selector!("group_admin"), array![GROUP_ID].span());
    let stored_admin = load_single(semaphore_addr, admin_storage_addr);
    assert(stored_admin == new_admin().into(), 'GROUP_ADMIN_NOT_UPDATED');
    assert_contract_emitted_any_event(ref spy, semaphore_addr);
}

#[test]
#[should_panic(expected: 'NOT_GROUP_ADMIN')]
fn point_8_non_admin_cannot_update_admin() {
    let (semaphore, semaphore_addr) = deploy_initialized_stack(DEPTH_2);

    start_cheat_caller_address(semaphore_addr, outsider());
    semaphore.set_group_admin(GROUP_ID, new_admin());
}

#[test]
fn point_9_add_member_updates_state_and_emits_event() {
    let (semaphore, semaphore_addr) = deploy_initialized_stack(DEPTH_2);
    let mut spy = spy_events();

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 1111);
    stop_cheat_caller_address(semaphore_addr);

    assert(semaphore.get_size(GROUP_ID) == 1, 'SIZE_NOT_INCREMENTED');
    assert(semaphore.get_member(GROUP_ID, 0) == 1111, 'LEAF_NOT_STORED');

    let root = semaphore.get_root(GROUP_ID);
    assert(semaphore.is_root(GROUP_ID, root), 'ROOT_HISTORY_NOT_UPDATED');
    assert_contract_emitted_any_event(ref spy, semaphore_addr);
}

#[test]
fn point_9_add_members_batches_insertions() {
    let (semaphore, semaphore_addr) = deploy_initialized_stack(DEPTH_2);

    let commitments = array![1111, 2222];

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_members(GROUP_ID, commitments.span());
    stop_cheat_caller_address(semaphore_addr);

    assert(semaphore.get_size(GROUP_ID) == 2, 'BATCH_SIZE_NOT_UPDATED');
    assert(semaphore.get_member(GROUP_ID, 0) == 1111, 'FIRST_MEMBER_NOT_STORED');
    assert(semaphore.get_member(GROUP_ID, 1) == 2222, 'SECOND_MEMBER_NOT_STORED');
    let root = semaphore.get_root(GROUP_ID);
    assert(semaphore.is_root(GROUP_ID, root), 'BATCH_ROOT_NOT_RECORDED');
}

#[test]
#[should_panic(expected: 'GROUP_FULL')]
fn point_9_insert_beyond_capacity_is_rejected() {
    let (semaphore, semaphore_addr) = deploy_initialized_stack(DEPTH_1);

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 1111);
    semaphore.add_member(GROUP_ID, 2222);
    semaphore.add_member(GROUP_ID, 3333);
}

#[test]
fn point_10_valid_member_update_replaces_leaf_root_and_emits_event() {
    let (semaphore, semaphore_addr) = deploy_initialized_stack(DEPTH_1);

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 1111);
    semaphore.add_member(GROUP_ID, 2222);
    stop_cheat_caller_address(semaphore_addr);

    let old_root = semaphore.get_root(GROUP_ID);
    let mut spy = spy_events();
    let siblings = array![2222];

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.update_member(GROUP_ID, 0, 1111, 3333, siblings.span());
    stop_cheat_caller_address(semaphore_addr);

    let new_root = semaphore.get_root(GROUP_ID);
    assert(semaphore.get_member(GROUP_ID, 0) == 3333, 'UPDATED_MEMBER_NOT_STORED');
    assert(new_root != old_root, 'ROOT_NOT_UPDATED');
    assert(semaphore.is_root(GROUP_ID, new_root), 'UPDATED_ROOT_NOT_RECORDED');
    assert_contract_emitted_any_event(ref spy, semaphore_addr);
}

#[test]
#[should_panic(expected: 'INVALID_SIBLINGS_LEN')]
fn point_10_invalid_siblings_length_is_rejected() {
    let (semaphore, semaphore_addr) = deploy_initialized_stack(DEPTH_1);

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 1111);
    semaphore.add_member(GROUP_ID, 2222);
    semaphore.update_member(GROUP_ID, 0, 1111, 3333, array![].span());
}

#[test]
#[should_panic(expected: 'INVALID_MERKLE_PROOF')]
fn point_10_invalid_inclusion_data_is_rejected() {
    let (semaphore, semaphore_addr) = deploy_initialized_stack(DEPTH_1);

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 1111);
    semaphore.add_member(GROUP_ID, 2222);
    semaphore.update_member(GROUP_ID, 0, 1111, 3333, array![9999].span());
}

#[test]
fn point_11_valid_member_removal_clears_leaf_updates_root_and_emits_event() {
    let (semaphore, semaphore_addr) = deploy_initialized_stack(DEPTH_1);

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 1111);
    semaphore.add_member(GROUP_ID, 2222);
    stop_cheat_caller_address(semaphore_addr);

    let old_root = semaphore.get_root(GROUP_ID);
    let mut spy = spy_events();
    let siblings = array![2222];

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.remove_member(GROUP_ID, 0, 1111, siblings.span());
    stop_cheat_caller_address(semaphore_addr);

    let new_root = semaphore.get_root(GROUP_ID);
    assert(semaphore.get_member(GROUP_ID, 0) == 0, 'REMOVED_MEMBER_NOT_CLEARED');
    assert(new_root != old_root, 'ROOT_NOT_UPDATED');
    assert(semaphore.is_root(GROUP_ID, new_root), 'REMOVED_ROOT_NOT_RECORDED');
    assert_contract_emitted_any_event(ref spy, semaphore_addr);
}

#[test]
#[should_panic(expected: 'MEMBER_ALREADY_REMOVED')]
fn point_11_removing_already_removed_member_is_rejected() {
    let (semaphore, semaphore_addr) = deploy_initialized_stack(DEPTH_1);

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 1111);
    semaphore.add_member(GROUP_ID, 2222);
    semaphore.remove_member(GROUP_ID, 0, 1111, array![2222].span());
    semaphore.remove_member(GROUP_ID, 0, 0, array![2222].span());
}

#[test]
#[should_panic(expected: 'INVALID_MERKLE_PROOF')]
fn point_11_wrong_inclusion_data_is_rejected() {
    let (semaphore, semaphore_addr) = deploy_initialized_stack(DEPTH_1);

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 1111);
    semaphore.add_member(GROUP_ID, 2222);
    semaphore.remove_member(GROUP_ID, 0, 1111, array![9999].span());
}

#[test]
fn point_12_root_history_tracks_all_membership_state_transitions() {
    let (semaphore, semaphore_addr) = deploy_semaphore();

    start_cheat_caller_address(semaphore_addr, owner());
    semaphore.set_verifier(DEPTH_1, verifier_address());
    stop_cheat_caller_address(semaphore_addr);

    start_cheat_block_timestamp_global(10);
    semaphore.create_group(GROUP_ID, admin(), DEPTH_1);
    let create_root = semaphore.get_root(GROUP_ID);
    let create_root_timestamp = load_single(
        semaphore_addr,
        map_entry_address(selector!("group_root_created_at"), array![GROUP_ID, create_root].span()),
    );
    assert(semaphore.is_root(GROUP_ID, create_root), 'CREATE_ROOT_NOT_RECORDED');
    assert(create_root_timestamp == 10, 'CREATE_ROOT_TIMESTAMP_INCORRECT');
    stop_cheat_block_timestamp_global();

    start_cheat_block_timestamp_global(20);
    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 1111);
    stop_cheat_caller_address(semaphore_addr);
    let add_root = semaphore.get_root(GROUP_ID);
    let add_root_timestamp = load_single(
        semaphore_addr,
        map_entry_address(selector!("group_root_created_at"), array![GROUP_ID, add_root].span()),
    );
    assert(add_root != create_root, 'ADD_ROOT_NOT_UPDATED');
    assert(semaphore.is_root(GROUP_ID, create_root), 'CREATE_ROOT_SHOULD_REMAIN_VALID');
    assert(semaphore.is_root(GROUP_ID, add_root), 'ADD_ROOT_NOT_RECORDED');
    assert(add_root_timestamp == 20, 'ADD_ROOT_TIMESTAMP_INCORRECT');
    stop_cheat_block_timestamp_global();

    start_cheat_block_timestamp_global(30);
    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 2222);
    stop_cheat_caller_address(semaphore_addr);
    let pre_update_root = semaphore.get_root(GROUP_ID);
    let pre_update_root_timestamp = load_single(
        semaphore_addr,
        map_entry_address(
            selector!("group_root_created_at"), array![GROUP_ID, pre_update_root].span()
        ),
    );
    assert(pre_update_root != add_root, 'SECOND_INSERT_ROOT_NOT_UPDATED');
    assert(semaphore.is_root(GROUP_ID, create_root), 'CREATE_ROOT_SHOULD_STAY_VALID');
    assert(semaphore.is_root(GROUP_ID, add_root), 'ADD_ROOT_SHOULD_STAY_VALID');
    assert(semaphore.is_root(GROUP_ID, pre_update_root), 'PRE_UPDATE_ROOT_NOT_RECORDED');
    assert(pre_update_root_timestamp == 30, 'PRE_UPD_ROOT_TS_BAD');
    stop_cheat_block_timestamp_global();

    start_cheat_block_timestamp_global(40);
    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.update_member(GROUP_ID, 0, 1111, 3333, array![2222].span());
    stop_cheat_caller_address(semaphore_addr);
    let update_root = semaphore.get_root(GROUP_ID);
    let update_root_timestamp = load_single(
        semaphore_addr,
        map_entry_address(selector!("group_root_created_at"), array![GROUP_ID, update_root].span()),
    );
    assert(update_root != pre_update_root, 'UPDATE_ROOT_NOT_UPDATED');
    assert(semaphore.is_root(GROUP_ID, create_root), 'CREATE_ROOT_STILL_VALID');
    assert(semaphore.is_root(GROUP_ID, add_root), 'ADD_ROOT_STILL_VALID');
    assert(
        semaphore.is_root(GROUP_ID, pre_update_root), 'PRE_UPD_ROOT_STILL_VALID'
    );
    assert(semaphore.is_root(GROUP_ID, update_root), 'UPDATE_ROOT_NOT_RECORDED');
    assert(update_root_timestamp == 40, 'UPDATE_ROOT_TIMESTAMP_INCORRECT');
    stop_cheat_block_timestamp_global();

    start_cheat_block_timestamp_global(50);
    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.remove_member(GROUP_ID, 0, 3333, array![2222].span());
    stop_cheat_caller_address(semaphore_addr);
    let remove_root = semaphore.get_root(GROUP_ID);
    let remove_root_timestamp = load_single(
        semaphore_addr,
        map_entry_address(selector!("group_root_created_at"), array![GROUP_ID, remove_root].span()),
    );
    assert(remove_root != update_root, 'REMOVE_ROOT_NOT_UPDATED');
    assert(semaphore.is_root(GROUP_ID, create_root), 'CREATE_ROOT_VALID_REM');
    assert(semaphore.is_root(GROUP_ID, add_root), 'ADD_ROOT_VALID_REM');
    assert(
        semaphore.is_root(GROUP_ID, pre_update_root),
        'PRE_UPD_ROOT_VALID_REM',
    );
    assert(semaphore.is_root(GROUP_ID, update_root), 'UPDATE_ROOT_VALID_REM');
    assert(semaphore.is_root(GROUP_ID, remove_root), 'REMOVE_ROOT_NOT_RECORDED');
    assert(remove_root_timestamp == 50, 'REMOVE_ROOT_TIMESTAMP_INCORRECT');
    stop_cheat_block_timestamp_global();

    assert(!semaphore.is_root(GROUP_ID, 999999), 'UNKNOWN_ROOT_INVALID');
}

#[test]
fn point_13_group_state_queries_match_state_snapshots() {
    let (semaphore, semaphore_addr) = deploy_semaphore();

    start_cheat_caller_address(semaphore_addr, owner());
    semaphore.set_verifier(DEPTH_1, verifier_address());
    stop_cheat_caller_address(semaphore_addr);

    semaphore.create_group(GROUP_ID, admin(), DEPTH_1);
    let create_root = semaphore.get_root(GROUP_ID);

    assert(semaphore.get_depth(GROUP_ID) == DEPTH_1, 'BAD_DEPTH_CREATE');
    assert(semaphore.get_size(GROUP_ID) == 0, 'BAD_SIZE_CREATE');
    assert(semaphore.get_member(GROUP_ID, 0) == 0, 'BAD_MEMBER0_CREATE');
    assert(semaphore.get_member(GROUP_ID, 1) == 0, 'BAD_MEMBER1_CREATE');
    assert(semaphore.is_root(GROUP_ID, create_root), 'BAD_ROOT_CREATE');

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 1111);
    stop_cheat_caller_address(semaphore_addr);
    let add_root = semaphore.get_root(GROUP_ID);

    assert(semaphore.get_depth(GROUP_ID) == DEPTH_1, 'BAD_DEPTH_ADD');
    assert(semaphore.get_size(GROUP_ID) == 1, 'BAD_SIZE_ADD');
    assert(semaphore.get_member(GROUP_ID, 0) == 1111, 'BAD_MEMBER0_ADD');
    assert(semaphore.get_member(GROUP_ID, 1) == 0, 'BAD_MEMBER1_ADD');
    assert(semaphore.is_root(GROUP_ID, add_root), 'BAD_ROOT_ADD');
    assert(semaphore.is_root(GROUP_ID, create_root), 'OLD_ROOT_BAD_ADD');

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 2222);
    stop_cheat_caller_address(semaphore_addr);
    let pre_update_root = semaphore.get_root(GROUP_ID);

    assert(semaphore.get_depth(GROUP_ID) == DEPTH_1, 'BAD_DEPTH_ADD2');
    assert(semaphore.get_size(GROUP_ID) == 2, 'BAD_SIZE_ADD2');
    assert(semaphore.get_member(GROUP_ID, 0) == 1111, 'BAD_MEMBER0_ADD2');
    assert(semaphore.get_member(GROUP_ID, 1) == 2222, 'BAD_MEMBER1_ADD2');
    assert(semaphore.is_root(GROUP_ID, pre_update_root), 'BAD_ROOT_ADD2');

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.update_member(GROUP_ID, 0, 1111, 3333, array![2222].span());
    stop_cheat_caller_address(semaphore_addr);
    let update_root = semaphore.get_root(GROUP_ID);

    assert(semaphore.get_depth(GROUP_ID) == DEPTH_1, 'BAD_DEPTH_UPD');
    assert(semaphore.get_size(GROUP_ID) == 2, 'BAD_SIZE_UPD');
    assert(semaphore.get_member(GROUP_ID, 0) == 3333, 'BAD_MEMBER0_UPD');
    assert(semaphore.get_member(GROUP_ID, 1) == 2222, 'BAD_MEMBER1_UPD');
    assert(semaphore.is_root(GROUP_ID, update_root), 'BAD_ROOT_UPD');
    assert(semaphore.is_root(GROUP_ID, pre_update_root), 'OLD_ROOT_BAD_UPD');

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.remove_member(GROUP_ID, 0, 3333, array![2222].span());
    stop_cheat_caller_address(semaphore_addr);
    let remove_root = semaphore.get_root(GROUP_ID);

    assert(semaphore.get_depth(GROUP_ID) == DEPTH_1, 'BAD_DEPTH_REM');
    assert(semaphore.get_size(GROUP_ID) == 2, 'BAD_SIZE_REM');
    assert(semaphore.get_member(GROUP_ID, 0) == 0, 'BAD_MEMBER0_REM');
    assert(semaphore.get_member(GROUP_ID, 1) == 2222, 'BAD_MEMBER1_REM');
    assert(semaphore.is_root(GROUP_ID, remove_root), 'BAD_ROOT_REM');
    assert(semaphore.is_root(GROUP_ID, update_root), 'OLD_ROOT_BAD_REM');
}

#[test]
fn point_16_joined_commitment_is_inserted_onchain() {
    let (semaphore, semaphore_addr) = deploy_initialized_stack(DEPTH_2);
    let mut spy = spy_events();

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, POINT_16_COMMITMENT);
    stop_cheat_caller_address(semaphore_addr);

    assert(semaphore.get_size(GROUP_ID) == 1, 'JOIN_SIZE_BAD');
    assert(semaphore.get_member(GROUP_ID, 0) == POINT_16_COMMITMENT, 'JOIN_MEMBER_BAD');

    let root = semaphore.get_root(GROUP_ID);
    assert(root != 0, 'JOIN_ROOT_ZERO');
    assert(semaphore.is_root(GROUP_ID, root), 'JOIN_ROOT_BAD');
    assert_contract_emitted_any_event(ref spy, semaphore_addr);
}
