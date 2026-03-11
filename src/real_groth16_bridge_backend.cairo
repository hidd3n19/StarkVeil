use crate::interfaces::igroth16_backend::IGroth16Backend;

#[starknet::interface]
pub trait IRealGroth16VerifierBN254<TContractState> {
    fn verify_groth16_proof_bn254(
        self: @TContractState, full_proof_with_hints: Span<felt252>,
    ) -> Result<Span<u256>, felt252>;
}

#[starknet::contract]
pub mod RealGroth16BridgeBackend {
    use starknet::ClassHash;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use super::{
        IGroth16Backend,
        IRealGroth16VerifierBN254DispatcherTrait,
        IRealGroth16VerifierBN254LibraryDispatcher,
    };

    #[storage]
    struct Storage {
        verifier_class_hash: ClassHash,
        expected_vk_hash: felt252,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        verifier_class_hash: ClassHash,
        expected_vk_hash: felt252,
    ) {
        self.verifier_class_hash.write(verifier_class_hash);
        self.expected_vk_hash.write(expected_vk_hash);
    }

    #[abi(embed_v0)]
    impl Groth16BackendImpl of IGroth16Backend<ContractState> {
        fn verify_groth16(
            self: @ContractState,
            vk_hash: felt252,
            public_inputs: Span<felt252>,
            proof: Span<felt252>
        ) -> bool {
            if vk_hash != self.expected_vk_hash.read() {
                return false;
            }

            if public_inputs.len() != 4 {
                return false;
            }

            let verifier_class_hash = self.verifier_class_hash.read();
            let dispatcher = IRealGroth16VerifierBN254LibraryDispatcher { class_hash: verifier_class_hash };

            match dispatcher.verify_groth16_proof_bn254(proof) {
                Result::Err(_) => false,
                Result::Ok(returned_public_inputs) => {
                    if returned_public_inputs.len() != 4 {
                        return false;
                    }

                    let mut index: usize = 0;
                    loop {
                        if index == 4 {
                            break;
                        }

                        let returned_input = *returned_public_inputs.at(index);
                        let expected_input = *public_inputs.at(index);
                        if !returned_input_matches_expected(returned_input, expected_input) {
                            return false;
                        }

                        index += 1;
                    };

                    true
                }
            }
        }
    }

    fn returned_input_matches_expected(returned_input: u256, expected_input: felt252) -> bool {
        match returned_input.try_into() {
            Option::Some(value) => value == expected_input,
            Option::None => false,
        }
    }
}
