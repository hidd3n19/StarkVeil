use semaphore_starknet::interfaces::isemaphore::{ISemaphoreDispatcher, ISemaphoreDispatcherTrait};

use snforge_std::{
    ContractClassTrait,
    DeclareResultTrait,
    declare,
    map_entry_address,
    start_cheat_caller_address,
    store,
    stop_cheat_caller_address,
};

const GROUP_ID: felt252 = 1;
const DEPTH_20: u8 = 20;
const VK_HASH: felt252 = 777;
const ROOT_HISTORIC: felt252 = 1915826951860152537973846421180435708428200415375148218822513943503006881772;
const ROOT_CURRENT: felt252 = 1915826951860152537973846421180435708428200415375148218822513943503006881773;
const NULLIFIER_HISTORIC: felt252 = 3001;
const NULLIFIER_CURRENT: felt252 = 3002;
const MESSAGE: felt252 = 11;
const SCOPE: felt252 = 22;
const MESSAGE_HASH: felt252 = 2579302562577254625442564198428206326386786986498533264305983357867499549;
const SCOPE_HASH: felt252 = 381991507470523043981536760298699211324388782897715347961370496096313610818;

fn owner() -> starknet::ContractAddress {
    111.try_into().unwrap()
}

fn admin() -> starknet::ContractAddress {
    222.try_into().unwrap()
}

fn build_submission_proof() -> Array<felt252> {
    array![42, 43, 1, 44, 45, 46, 47, 1, 0, 48, 49, 1]
}

fn seed_root_history(semaphore_addr: starknet::ContractAddress) {
    let group_root_addr = map_entry_address(selector!("group_root"), array![GROUP_ID].span());

    let historic_exists_addr = map_entry_address(
        selector!("group_root_exists"), array![GROUP_ID, ROOT_HISTORIC].span()
    );
    let historic_created_addr = map_entry_address(
        selector!("group_root_created_at"), array![GROUP_ID, ROOT_HISTORIC].span()
    );

    let current_exists_addr = map_entry_address(
        selector!("group_root_exists"), array![GROUP_ID, ROOT_CURRENT].span()
    );
    let current_created_addr = map_entry_address(
        selector!("group_root_created_at"), array![GROUP_ID, ROOT_CURRENT].span()
    );

    store(semaphore_addr, group_root_addr, array![ROOT_CURRENT].span());
    store(semaphore_addr, historic_exists_addr, array![1].span());
    store(semaphore_addr, historic_created_addr, array![1].span());
    store(semaphore_addr, current_exists_addr, array![1].span());
    store(semaphore_addr, current_created_addr, array![2].span());
}

fn deploy_root_depth_stack(
    expected_root: felt252, expected_nullifier: felt252,
) -> ISemaphoreDispatcher {
    let backend_class = declare("TestPublicInputAlignmentBackend").unwrap().contract_class();
    let mut backend_args = array![];
    backend_args.append(VK_HASH);
    backend_args.append(expected_root);
    backend_args.append(expected_nullifier);
    backend_args.append(MESSAGE_HASH);
    backend_args.append(SCOPE_HASH);
    backend_args.append(42);
    backend_args.append(12);
    let (backend_addr, _) = backend_class.deploy(@backend_args).unwrap();

    let adapter_class = declare("Groth16VerifierAdapter").unwrap().contract_class();
    let mut adapter_args = array![];
    adapter_args.append(backend_addr.into());
    adapter_args.append(VK_HASH);
    let (adapter_addr, _) = adapter_class.deploy(@adapter_args).unwrap();

    let semaphore_class = declare("Semaphore").unwrap().contract_class();
    let mut semaphore_args = array![];
    semaphore_args.append(owner().into());
    let (semaphore_addr, _) = semaphore_class.deploy(@semaphore_args).unwrap();
    let semaphore = ISemaphoreDispatcher { contract_address: semaphore_addr };

    semaphore.create_group(GROUP_ID, admin(), DEPTH_20);
    seed_root_history(semaphore_addr);

    start_cheat_caller_address(semaphore_addr, owner());
    semaphore.set_verifier(DEPTH_20, adapter_addr);
    stop_cheat_caller_address(semaphore_addr);

    semaphore
}

#[test]
#[should_panic(expected: 'ROOT_NOT_IN_GROUP')]
fn point_28_wrong_root_is_rejected() {
    let semaphore = deploy_root_depth_stack(ROOT_HISTORIC, NULLIFIER_HISTORIC);
    let proof = build_submission_proof();

    semaphore.validate_proof(
        GROUP_ID,
        DEPTH_20,
        999999,
        NULLIFIER_HISTORIC,
        MESSAGE,
        SCOPE,
        MESSAGE_HASH,
        SCOPE_HASH,
        proof.span(),
    );
}

#[test]
#[should_panic(expected: 'DEPTH_MISMATCH')]
fn point_28_wrong_depth_is_rejected() {
    let semaphore = deploy_root_depth_stack(ROOT_CURRENT, NULLIFIER_CURRENT);
    let proof = build_submission_proof();

    semaphore.validate_proof(
        GROUP_ID,
        16,
        ROOT_CURRENT,
        NULLIFIER_CURRENT,
        MESSAGE,
        SCOPE,
        MESSAGE_HASH,
        SCOPE_HASH,
        proof.span(),
    );
}

#[test]
fn point_28_historic_root_is_accepted_when_present() {
    let semaphore = deploy_root_depth_stack(ROOT_HISTORIC, NULLIFIER_HISTORIC);
    let proof = build_submission_proof();

    semaphore.validate_proof(
        GROUP_ID,
        DEPTH_20,
        ROOT_HISTORIC,
        NULLIFIER_HISTORIC,
        MESSAGE,
        SCOPE,
        MESSAGE_HASH,
        SCOPE_HASH,
        proof.span(),
    );

    assert(semaphore.is_nullifier_used(NULLIFIER_HISTORIC), 'POINT28_HIST_FAIL');
}

#[test]
fn point_28_current_root_is_accepted_when_present() {
    let semaphore = deploy_root_depth_stack(ROOT_CURRENT, NULLIFIER_CURRENT);
    let proof = build_submission_proof();

    semaphore.validate_proof(
        GROUP_ID,
        DEPTH_20,
        ROOT_CURRENT,
        NULLIFIER_CURRENT,
        MESSAGE,
        SCOPE,
        MESSAGE_HASH,
        SCOPE_HASH,
        proof.span(),
    );

    assert(semaphore.is_nullifier_used(NULLIFIER_CURRENT), 'POINT28_CURR_FAIL');
}
