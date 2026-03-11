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
const ROOT: felt252 = 1915826951860152537973846421180435708428200415375148218822513943503006881772;
const NULLIFIER: felt252 = 3458865867026562423864128494600834396845418179367624501223719005479595891815;
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

#[test]
fn point_30_fresh_deployment_registers_supported_depth_and_validates_proof() {
    let backend_class = declare("TestPublicInputAlignmentBackend").unwrap().contract_class();
    let mut backend_args = array![];
    backend_args.append(VK_HASH);
    backend_args.append(ROOT);
    backend_args.append(NULLIFIER);
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

    start_cheat_caller_address(semaphore_addr, owner());
    semaphore.set_verifier(DEPTH_20, adapter_addr);
    stop_cheat_caller_address(semaphore_addr);

    start_cheat_caller_address(semaphore_addr, admin());
    semaphore.add_member(GROUP_ID, ROOT);
    stop_cheat_caller_address(semaphore_addr);

    assert(semaphore.get_depth(GROUP_ID) == DEPTH_20, 'POINT30_DEPTH_BAD');
    assert(semaphore.is_root(GROUP_ID, ROOT), 'POINT30_ROOT_BAD');

    let proof = build_submission_proof();
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

    assert(semaphore.is_nullifier_used(NULLIFIER), 'POINT30_VALID_FAIL');
}
