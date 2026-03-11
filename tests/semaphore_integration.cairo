use semaphore_starknet::interfaces::isemaphore::{ISemaphoreDispatcher, ISemaphoreDispatcherTrait};

use snforge_std::{
    ContractClassTrait,
    DeclareResultTrait,
    declare,
    start_cheat_caller_address,
    stop_cheat_caller_address
};

const DEPTH_20: u8 = 20;
const GROUP_ID: felt252 = 1;
const VK_HASH: felt252 = 777;
const PROOF_MAGIC: felt252 = 42;

fn owner() -> starknet::ContractAddress {
    111.try_into().unwrap()
}

fn admin() -> starknet::ContractAddress {
    222.try_into().unwrap()
}

fn deploy_stack() -> (ISemaphoreDispatcher, starknet::ContractAddress) {
    let owner = owner();
    let admin = admin();

    let backend_class = declare("TestGroth16Backend").unwrap().contract_class();
    let mut backend_args = array![];
    backend_args.append(VK_HASH);
    backend_args.append(PROOF_MAGIC);
    let (backend_addr, _) = backend_class.deploy(@backend_args).unwrap();

    let adapter_class = declare("Groth16VerifierAdapter").unwrap().contract_class();
    let mut adapter_args = array![];
    adapter_args.append(backend_addr.into());
    adapter_args.append(VK_HASH);
    let (adapter_addr, _) = adapter_class.deploy(@adapter_args).unwrap();

    let semaphore_class = declare("Semaphore").unwrap().contract_class();
    let mut semaphore_args = array![];
    semaphore_args.append(owner.into());
    let (semaphore_addr, _) = semaphore_class.deploy(@semaphore_args).unwrap();
    let semaphore = ISemaphoreDispatcher { contract_address: semaphore_addr };

    start_cheat_caller_address(semaphore_addr, owner);
    semaphore.set_verifier(DEPTH_20, adapter_addr);
    semaphore.create_group(GROUP_ID, admin, DEPTH_20);
    stop_cheat_caller_address(semaphore_addr);

    (semaphore, semaphore_addr)
}

#[test]
#[should_panic(expected: 'NULLIFIER_ALREADY_USED')]
fn replay_failure_rejects_same_nullifier() {
    let (semaphore, semaphore_addr) = deploy_stack();
    let admin = admin();

    start_cheat_caller_address(semaphore_addr, admin);
    semaphore.add_member(GROUP_ID, 123);
    stop_cheat_caller_address(semaphore_addr);

    let root = semaphore.get_root(GROUP_ID);

    let mut proof = array![];
    proof.append(PROOF_MAGIC);

    semaphore.validate_proof(GROUP_ID, DEPTH_20, root, 999, 11, 22, 33, 44, proof.span());
    semaphore.validate_proof(GROUP_ID, DEPTH_20, root, 999, 11, 22, 33, 44, proof.span());
}

#[test]
#[should_panic(expected: 'ROOT_NOT_IN_GROUP')]
fn wrong_root_is_rejected() {
    let (semaphore, semaphore_addr) = deploy_stack();
    let admin = admin();

    start_cheat_caller_address(semaphore_addr, admin);
    semaphore.add_member(GROUP_ID, 456);
    stop_cheat_caller_address(semaphore_addr);

    let mut proof = array![];
    proof.append(PROOF_MAGIC);

    semaphore.validate_proof(GROUP_ID, DEPTH_20, 999999, 1001, 11, 22, 33, 44, proof.span());
}

#[test]
#[should_panic(expected: 'DEPTH_MISMATCH')]
fn wrong_depth_is_rejected() {
    let (semaphore, semaphore_addr) = deploy_stack();
    let admin = admin();

    start_cheat_caller_address(semaphore_addr, admin);
    semaphore.add_member(GROUP_ID, 789);
    stop_cheat_caller_address(semaphore_addr);

    let root = semaphore.get_root(GROUP_ID);
    let mut proof = array![];
    proof.append(PROOF_MAGIC);

    semaphore.validate_proof(GROUP_ID, 16, root, 1002, 11, 22, 33, 44, proof.span());
}

#[test]
#[should_panic(expected: 'INVALID_PROOF')]
fn invalid_proof_is_rejected() {
    let (semaphore, semaphore_addr) = deploy_stack();
    let admin = admin();

    start_cheat_caller_address(semaphore_addr, admin);
    semaphore.add_member(GROUP_ID, 321);
    stop_cheat_caller_address(semaphore_addr);

    let root = semaphore.get_root(GROUP_ID);

    let mut bad_proof = array![];
    bad_proof.append(9999);

    semaphore.validate_proof(GROUP_ID, DEPTH_20, root, 1003, 11, 22, 33, 44, bad_proof.span());
}

#[test]
#[should_panic(expected: 'GROUP_HAS_NO_MEMBERS')]
fn empty_group_is_rejected() {
    let (semaphore, _) = deploy_stack();

    let mut proof = array![];
    proof.append(PROOF_MAGIC);

    semaphore.validate_proof(GROUP_ID, DEPTH_20, 0, 1004, 11, 22, 33, 44, proof.span());
}
