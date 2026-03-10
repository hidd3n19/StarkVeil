use starkveil_e2e::interfaces::isemaphore::{ISemaphoreDispatcher, ISemaphoreDispatcherTrait};
use snforge_std::fs::{FileTrait, read_txt};
use snforge_std::{
    ContractClassTrait,
    DeclareResultTrait,
    declare,
    map_entry_address,
    store,
    start_cheat_caller_address,
    stop_cheat_caller_address,
};

const GROUP_ID: felt252 = 1;
const DEPTH_20: u8 = 20;
const VK_HASH: felt252 = 777;

fn owner() -> starknet::ContractAddress {
    111.try_into().unwrap()
}

fn admin() -> starknet::ContractAddress {
    222.try_into().unwrap()
}

fn load_full_calldata() -> Array<felt252> {
    let file = FileTrait::new("tests/point_31_full_calldata.txt");
    read_txt(@file)
}

fn load_metadata() -> Array<felt252> {
    let file = FileTrait::new("tests/point_31_metadata.txt");
    read_txt(@file)
}

fn seed_upstream_root(semaphore_addr: starknet::ContractAddress, root: felt252) {
    let group_root_addr = map_entry_address(selector!("group_root"), array![GROUP_ID].span());
    let group_root_exists_addr = map_entry_address(
        selector!("group_root_exists"), array![GROUP_ID, root].span(),
    );
    let group_root_created_at_addr = map_entry_address(
        selector!("group_root_created_at"), array![GROUP_ID, root].span(),
    );

    store(semaphore_addr, group_root_addr, array![root].span());
    store(semaphore_addr, group_root_exists_addr, array![1].span());
    store(semaphore_addr, group_root_created_at_addr, array![1].span());
}

#[test]
#[fork(url: "https://rpc.starknet-testnet.lava.build:443", block_tag: latest)]
fn point_31_full_upstream_flow_is_accepted_by_starkveil() {
    let metadata = load_metadata();
    assert(metadata.len() == 14, 'POINT31_META_LEN');

    let root = *metadata.at(0);
    let nullifier = *metadata.at(1);
    let message = *metadata.at(2);
    let scope = *metadata.at(3);
    let message_hash = *metadata.at(4);
    let scope_hash = *metadata.at(5);

    let verifier_class = declare("Groth16VerifierBN254").unwrap().contract_class();
    let empty_args = array![];
    let (verifier_addr, _) = verifier_class.deploy(@empty_args).unwrap();

    let bridge_class = declare("RealGroth16BridgeBackend").unwrap().contract_class();
    let mut bridge_args = array![];
    bridge_args.append(verifier_addr.into());
    bridge_args.append(VK_HASH);
    bridge_args.append(root);
    bridge_args.append(nullifier);
    bridge_args.append(message_hash);
    bridge_args.append(scope_hash);
    bridge_args.append(*metadata.at(6));
    bridge_args.append(*metadata.at(7));
    bridge_args.append(*metadata.at(8));
    bridge_args.append(*metadata.at(9));
    bridge_args.append(*metadata.at(10));
    bridge_args.append(*metadata.at(11));
    bridge_args.append(*metadata.at(12));
    bridge_args.append(*metadata.at(13));
    let (bridge_addr, _) = bridge_class.deploy(@bridge_args).unwrap();

    let adapter_class = declare("Groth16VerifierAdapter").unwrap().contract_class();
    let mut adapter_args = array![];
    adapter_args.append(bridge_addr.into());
    adapter_args.append(VK_HASH);
    let (adapter_addr, _) = adapter_class.deploy(@adapter_args).unwrap();

    let semaphore_class = declare("Semaphore").unwrap().contract_class();
    let mut semaphore_args = array![];
    semaphore_args.append(owner().into());
    let (semaphore_addr, _) = semaphore_class.deploy(@semaphore_args).unwrap();
    let semaphore = ISemaphoreDispatcher { contract_address: semaphore_addr };

    semaphore.create_group(GROUP_ID, admin(), DEPTH_20);
    seed_upstream_root(semaphore_addr, root);

    start_cheat_caller_address(semaphore_addr, owner());
    semaphore.set_verifier(DEPTH_20, adapter_addr);
    stop_cheat_caller_address(semaphore_addr);

    assert(!semaphore.is_nullifier_used(nullifier), 'POINT31_NULL_PRE');

    let calldata = load_full_calldata();
    semaphore.validate_proof(
        GROUP_ID,
        DEPTH_20,
        root,
        nullifier,
        message,
        scope,
        message_hash,
        scope_hash,
        calldata.span(),
    );

    assert(semaphore.is_nullifier_used(nullifier), 'POINT31_NULL_POST');
}
