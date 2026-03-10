use semaphore_starknet::interfaces::isemaphore::{ISemaphoreDispatcher, ISemaphoreDispatcherTrait};

use snforge_std::{
    ContractClassTrait,
    DeclareResultTrait,
    declare,
    start_cheat_caller_address,
    stop_cheat_caller_address,
};

const GROUP_ID: felt252 = 1;
const DEPTH_20: u8 = 20;
const VK_HASH: felt252 = 777;
const PROOF_MAGIC: felt252 = 42;
const NULLIFIER: felt252 = 999;

fn owner() -> starknet::ContractAddress {
    111.try_into().unwrap()
}

fn admin() -> starknet::ContractAddress {
    222.try_into().unwrap()
}

fn deploy_stack_with_verifier(depth: u8) -> (ISemaphoreDispatcher, starknet::ContractAddress) {
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
    semaphore_args.append(owner().into());
    let (semaphore_addr, _) = semaphore_class.deploy(@semaphore_args).unwrap();
    let semaphore = ISemaphoreDispatcher { contract_address: semaphore_addr };

    start_cheat_caller_address(semaphore_addr, owner());
    semaphore.set_verifier(depth, adapter_addr);
    stop_cheat_caller_address(semaphore_addr);

    semaphore.create_group(GROUP_ID, admin(), DEPTH_20);

    (semaphore, semaphore_addr)
}

fn build_valid_test_proof() -> Array<felt252> {
    let mut proof = array![];
    proof.append(PROOF_MAGIC);
    proof
}

#[test]
fn point_23_validate_proof_reaches_configured_verifier_path() {
    let (semaphore, semaphore_addr) = deploy_stack_with_verifier(DEPTH_20);

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 123);
    stop_cheat_caller_address(semaphore_addr);

    let root = semaphore.get_root(GROUP_ID);
    let proof = build_valid_test_proof();

    semaphore.validate_proof(GROUP_ID, DEPTH_20, root, NULLIFIER, 11, 22, 33, 44, proof.span());

    assert(semaphore.is_nullifier_used(NULLIFIER), 'ROUTE_DID_NOT_VALIDATE');
}

#[test]
#[should_panic(expected: 'UNSUPPORTED_DEPTH')]
fn point_23_unsupported_depth_is_rejected() {
    let (semaphore, semaphore_addr) = deploy_stack_with_verifier(16);

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, 456);
    stop_cheat_caller_address(semaphore_addr);

    let root = semaphore.get_root(GROUP_ID);
    let proof = build_valid_test_proof();

    semaphore.validate_proof(GROUP_ID, DEPTH_20, root, 1001, 11, 22, 33, 44, proof.span());
}
