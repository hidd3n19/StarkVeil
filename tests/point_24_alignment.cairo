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
const ROOT: felt252 = 1915826951860152537973846421180435708428200415375148218822513943503006881772;
const NULLIFIER: felt252 = 3458865867026562423864128494600834396845418179367624501223719005479595891815;
const MESSAGE: felt252 = 11;
const SCOPE: felt252 = 22;
const MESSAGE_HASH: felt252 = 2579302562577254625442564198428206326386786986498533264305983357867499549;
const SCOPE_HASH: felt252 = 381991507470523043981536760298699211324388782897715347961370496096313610818;
const PROOF_LEN: u32 = 1;
const PROOF_MAGIC: felt252 = 42;

fn owner() -> starknet::ContractAddress {
    111.try_into().unwrap()
}

fn admin() -> starknet::ContractAddress {
    222.try_into().unwrap()
}

fn build_alignment_test_proof() -> Array<felt252> {
    let mut proof = array![];
    proof.append(PROOF_MAGIC);
    proof
}

fn seed_upstream_root(semaphore_addr: starknet::ContractAddress) {
    let group_root_addr = map_entry_address(selector!("group_root"), array![GROUP_ID].span());
    let group_root_exists_addr = map_entry_address(
        selector!("group_root_exists"), array![GROUP_ID, ROOT].span()
    );
    let group_root_created_at_addr = map_entry_address(
        selector!("group_root_created_at"), array![GROUP_ID, ROOT].span()
    );

    store(semaphore_addr, group_root_addr, array![ROOT].span());
    store(semaphore_addr, group_root_exists_addr, array![1].span());
    store(semaphore_addr, group_root_created_at_addr, array![1].span());
}

fn deploy_alignment_stack() -> (ISemaphoreDispatcher, starknet::ContractAddress) {
    let backend_class = declare("TestPublicInputAlignmentBackend").unwrap().contract_class();
    let mut backend_args = array![];
    backend_args.append(VK_HASH);
    backend_args.append(ROOT);
    backend_args.append(NULLIFIER);
    backend_args.append(MESSAGE_HASH);
    backend_args.append(SCOPE_HASH);
    backend_args.append(PROOF_MAGIC);
    backend_args.append(PROOF_LEN.into());
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
    seed_upstream_root(semaphore_addr);

    start_cheat_caller_address(semaphore_addr, owner());
    semaphore.set_verifier(DEPTH_20, adapter_addr);
    stop_cheat_caller_address(semaphore_addr);

    (semaphore, semaphore_addr)
}

#[test]
fn point_24_upstream_aligned_public_inputs_verify_successfully() {
    let (semaphore, _) = deploy_alignment_stack();
    let proof = build_alignment_test_proof();

    semaphore.validate_proof(
        GROUP_ID,
        DEPTH_20,
        ROOT,
        NULLIFIER,
        MESSAGE,
        SCOPE,
        MESSAGE_HASH,
        SCOPE_HASH,
        proof.span(),
    );

    assert(semaphore.is_nullifier_used(NULLIFIER), 'POINT24_VALID_FAIL');
}

#[test]
#[should_panic(expected: 'INVALID_PROOF')]
fn point_24_altered_scope_hash_is_rejected() {
    let (semaphore, _) = deploy_alignment_stack();
    let proof = build_alignment_test_proof();

    semaphore.validate_proof(
        GROUP_ID,
        DEPTH_20,
        ROOT,
        NULLIFIER,
        MESSAGE,
        SCOPE,
        MESSAGE_HASH,
        SCOPE,
        proof.span(),
    );
}
