use snforge_std::fs::{FileTrait, read_txt};
use snforge_std::{DeclareResultTrait, declare};
use starknet::ClassHash;
use starkveil_groth16_backend::groth16_verifier::{
    IGroth16VerifierBN254DispatcherTrait, IGroth16VerifierBN254LibraryDispatcher,
};

fn declare_contract(name: ByteArray) -> ClassHash {
    let class_hash = *declare(name).unwrap().contract_class().class_hash;
    class_hash
}

#[test]
#[fork(url: "https://rpc.starknet-testnet.lava.build:443", block_tag: latest)]
fn point_29_valid_control_proof_verifies_successfully() {
    let class_hash = declare_contract("Groth16VerifierBN254");
    let dispatcher = IGroth16VerifierBN254LibraryDispatcher { class_hash };

    let file = FileTrait::new("tests/point_22_valid_proof_calldata.txt");
    let calldata = read_txt(@file).span();

    let result = dispatcher.verify_groth16_proof_bn254(calldata);
    assert(result.is_ok(), 'POINT29_VALID_CTRL_FAIL');
}

#[test]
#[fork(url: "https://rpc.starknet-testnet.lava.build:443", block_tag: latest)]
#[should_panic]
fn point_29_tampered_proof_points_are_rejected() {
    let class_hash = declare_contract("Groth16VerifierBN254");
    let dispatcher = IGroth16VerifierBN254LibraryDispatcher { class_hash };

    let file = FileTrait::new("tests/point_29_invalid_proof_points_calldata.txt");
    let calldata = read_txt(@file).span();

    let _ = dispatcher.verify_groth16_proof_bn254(calldata);
}

#[test]
#[fork(url: "https://rpc.starknet-testnet.lava.build:443", block_tag: latest)]
#[should_panic]
fn point_29_tampered_public_inputs_are_rejected() {
    let class_hash = declare_contract("Groth16VerifierBN254");
    let dispatcher = IGroth16VerifierBN254LibraryDispatcher { class_hash };

    let file = FileTrait::new("tests/point_29_invalid_public_inputs_calldata.txt");
    let calldata = read_txt(@file).span();

    let _ = dispatcher.verify_groth16_proof_bn254(calldata);
}
