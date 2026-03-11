use semaphore_starknet::interfaces::ierc20::{IERC20Dispatcher, IERC20DispatcherTrait};
use semaphore_starknet::interfaces::isemaphore::{ISemaphoreDispatcher, ISemaphoreDispatcherTrait};
use semaphore_starknet::interfaces::istarkveil_grants::{
    IStarkVeilGrantsDispatcher,
    IStarkVeilGrantsDispatcherTrait,
};

use snforge_std::{
    ContractClassTrait,
    DeclareResultTrait,
    declare,
    start_cheat_block_timestamp_global,
    start_cheat_caller_address,
    stop_cheat_block_timestamp_global,
    stop_cheat_caller_address,
};

const DEPTH_20: u8 = 20;
const VK_HASH: felt252 = 777;
const MESSAGE_HASH_YES: felt252 = 101;
const MESSAGE_HASH_NO: felt252 = 202;
const SCOPE_HASH: felt252 = 303;
const YES_NULLIFIER: felt252 = 9991;
const NO_NULLIFIER: felt252 = 9992;

fn owner() -> starknet::ContractAddress {
    111.try_into().unwrap()
}

fn admin() -> starknet::ContractAddress {
    222.try_into().unwrap()
}

fn funder() -> starknet::ContractAddress {
    333.try_into().unwrap()
}

fn recipient() -> starknet::ContractAddress {
    444.try_into().unwrap()
}

fn as_u256(value: u128) -> u256 {
    u256 { low: value.into(), high: 0_u128 }
}

fn deploy_grants_stack() -> (
    ISemaphoreDispatcher,
    IERC20Dispatcher,
    IStarkVeilGrantsDispatcher,
    starknet::ContractAddress,
    starknet::ContractAddress,
    starknet::ContractAddress,
) {
    let semaphore_class = declare("Semaphore").unwrap().contract_class();
    let mut semaphore_args = array![];
    semaphore_args.append(owner().into());
    let (semaphore_addr, _) = semaphore_class.deploy(@semaphore_args).unwrap();
    let semaphore = ISemaphoreDispatcher { contract_address: semaphore_addr };

    let token_class = declare("TestERC20").unwrap().contract_class();
    let token_args = array![];
    let (token_addr, _) = token_class.deploy(@token_args).unwrap();
    let token = IERC20Dispatcher { contract_address: token_addr };

    let grants_class = declare("StarkVeilGrants").unwrap().contract_class();
    let mut grants_args = array![];
    grants_args.append(owner().into());
    grants_args.append(semaphore_addr.into());
    grants_args.append(token_addr.into());
    let (grants_addr, _) = grants_class.deploy(@grants_args).unwrap();
    let grants = IStarkVeilGrantsDispatcher { contract_address: grants_addr };

    start_cheat_caller_address(grants_addr, owner());
    let community_id = grants.create_community('MAT_COMMONS', admin(), DEPTH_20, 1, 5_000, 8_000);
    stop_cheat_caller_address(grants_addr);
    assert(community_id == 1_u64, 'COMMUNITY_ID');

    start_cheat_caller_address(grants_addr, admin());
    grants.add_community_member(1_u64, 123456789);
    stop_cheat_caller_address(grants_addr);

    let root = semaphore.get_root(1);

    let backend_class = declare("TestPublicInputAlignmentBackend").unwrap().contract_class();
    let mut backend_args = array![];
    backend_args.append(VK_HASH);
    backend_args.append(root);
    backend_args.append(YES_NULLIFIER);
    backend_args.append(MESSAGE_HASH_YES);
    backend_args.append(SCOPE_HASH);
    backend_args.append(42);
    backend_args.append(3);
    let (backend_addr, _) = backend_class.deploy(@backend_args).unwrap();

    let adapter_class = declare("Groth16VerifierAdapter").unwrap().contract_class();
    let mut adapter_args = array![];
    adapter_args.append(backend_addr.into());
    adapter_args.append(VK_HASH);
    let (adapter_addr, _) = adapter_class.deploy(@adapter_args).unwrap();

    start_cheat_caller_address(semaphore_addr, owner());
    semaphore.set_verifier(DEPTH_20, adapter_addr);
    stop_cheat_caller_address(semaphore_addr);

    start_cheat_caller_address(token_addr, funder());
    token.mint(funder(), as_u256(25));
    token.approve(grants_addr, as_u256(25));
    stop_cheat_caller_address(token_addr);

    (semaphore, token, grants, semaphore_addr, token_addr, grants_addr)
}

#[test]
fn grants_flow_funds_votes_and_executes() {
    let (semaphore, token, grants, _, _, grants_addr) = deploy_grants_stack();

    start_cheat_caller_address(grants_addr, funder());
    grants.fund_community(1_u64, 10);
    stop_cheat_caller_address(grants_addr);

    let community = grants.get_community(1_u64);
    assert(community.group_id == 1, 'GROUP_ID');
    assert(community.treasury_balance == 10, 'TREASURY_BALANCE');

    let proposal_id = grants.submit_proposal(1_u64, 'RESIDENCY', 'OPEN_LAB', recipient(), 3, 0, 100);
    assert(proposal_id == 1_u64, 'PROPOSAL_ID');

    let proof = array![42, 99, 100];
    grants.cast_vote(1_u64, true, DEPTH_20, semaphore.get_root(1), YES_NULLIFIER, MESSAGE_HASH_YES, SCOPE_HASH, proof.span());

    let proposal_after_vote = grants.get_proposal(1_u64);
    assert(proposal_after_vote.yes_votes == 1_u32, 'YES_VOTES');
    assert(proposal_after_vote.total_votes == 1_u32, 'TOTAL_VOTES');
    assert(semaphore.is_nullifier_used(YES_NULLIFIER), 'NULLIFIER_USED');

    grants.finalize_proposal(1_u64);
    let proposal_after_finalize = grants.get_proposal(1_u64);
    assert(proposal_after_finalize.status == 2_u8, 'NOT_PASSED');

    grants.execute_proposal(1_u64);
    let proposal_after_execute = grants.get_proposal(1_u64);
    assert(proposal_after_execute.status == 4_u8, 'NOT_EXECUTED');
    assert(token.balance_of(recipient()) == as_u256(3), 'RECIPIENT_PAYOUT');

    let community_after_execute = grants.get_community(1_u64);
    assert(community_after_execute.treasury_balance == 7, 'BALANCE_AFTER_EXECUTE');
}

#[test]
#[should_panic(expected: 'NULLIFIER_ALREADY_USED')]
fn grants_rejects_duplicate_vote_via_starkveil() {
    let (semaphore, _, grants, _, _, _) = deploy_grants_stack();

    start_cheat_caller_address(grants.contract_address, funder());
    grants.fund_community(1_u64, 5);
    stop_cheat_caller_address(grants.contract_address);

    let proof = array![42, 99, 100];
    grants.submit_proposal(1_u64, 'RESIDENCY', 'OPEN_LAB', recipient(), 1, 0, 100);
    grants.cast_vote(1_u64, true, DEPTH_20, semaphore.get_root(1), YES_NULLIFIER, MESSAGE_HASH_YES, SCOPE_HASH, proof.span());
    grants.cast_vote(1_u64, true, DEPTH_20, semaphore.get_root(1), YES_NULLIFIER, MESSAGE_HASH_YES, SCOPE_HASH, proof.span());
}

#[test]
fn grants_rejects_vote_after_failed_threshold() {
    let (semaphore, _, grants, _, _, _) = deploy_grants_stack();

    start_cheat_caller_address(grants.contract_address, funder());
    grants.fund_community(1_u64, 5);
    stop_cheat_caller_address(grants.contract_address);

    let root = semaphore.get_root(1);
    let proposal_id = grants.submit_proposal(1_u64, 'RESIDENCY', 'OPEN_LAB', recipient(), 1, 0, 10);
    assert(proposal_id == 1_u64, 'PROPOSAL_ID_TWO');

    let backend_class = declare("TestPublicInputAlignmentBackend").unwrap().contract_class();
    let mut backend_args = array![];
    backend_args.append(VK_HASH);
    backend_args.append(root);
    backend_args.append(NO_NULLIFIER);
    backend_args.append(MESSAGE_HASH_NO);
    backend_args.append(SCOPE_HASH);
    backend_args.append(7);
    backend_args.append(2);
    let (backend_addr, _) = backend_class.deploy(@backend_args).unwrap();

    let adapter_class = declare("Groth16VerifierAdapter").unwrap().contract_class();
    let mut adapter_args = array![];
    adapter_args.append(backend_addr.into());
    adapter_args.append(VK_HASH);
    let (adapter_addr, _) = adapter_class.deploy(@adapter_args).unwrap();

    start_cheat_caller_address(semaphore.contract_address, owner());
    semaphore.set_verifier(DEPTH_20, adapter_addr);
    stop_cheat_caller_address(semaphore.contract_address);

    let proof = array![7, 8];
    grants.cast_vote(1_u64, false, DEPTH_20, root, NO_NULLIFIER, MESSAGE_HASH_NO, SCOPE_HASH, proof.span());

    start_cheat_block_timestamp_global(11);
    grants.finalize_proposal(1_u64);
    stop_cheat_block_timestamp_global();

    let proposal = grants.get_proposal(1_u64);
    assert(proposal.status == 3_u8, 'NOT_REJECTED');
}
