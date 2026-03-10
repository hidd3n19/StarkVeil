use crate::interfaces::igroth16_backend::IGroth16Backend;

#[starknet::interface]
pub trait IRealGroth16VerifierBN254<TContractState> {
    fn verify_groth16_proof_bn254(
        self: @TContractState, full_proof_with_hints: Span<felt252>,
    ) -> Result<Span<u256>, felt252>;
}

#[starknet::contract]
pub mod RealGroth16BridgeBackend {
    use starknet::ContractAddress;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use super::{
        IGroth16Backend,
        IRealGroth16VerifierBN254DispatcherTrait,
        IRealGroth16VerifierBN254Dispatcher,
    };

    #[storage]
    struct Storage {
        verifier: ContractAddress,
        expected_vk_hash: felt252,
        input0: felt252,
        input1: felt252,
        input2: felt252,
        input3: felt252,
        input0_low: felt252,
        input0_high: felt252,
        input1_low: felt252,
        input1_high: felt252,
        input2_low: felt252,
        input2_high: felt252,
        input3_low: felt252,
        input3_high: felt252,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        verifier: ContractAddress,
        expected_vk_hash: felt252,
        input0: felt252,
        input1: felt252,
        input2: felt252,
        input3: felt252,
        input0_low: felt252,
        input0_high: felt252,
        input1_low: felt252,
        input1_high: felt252,
        input2_low: felt252,
        input2_high: felt252,
        input3_low: felt252,
        input3_high: felt252,
    ) {
        self.verifier.write(verifier);
        self.expected_vk_hash.write(expected_vk_hash);
        self.input0.write(input0);
        self.input1.write(input1);
        self.input2.write(input2);
        self.input3.write(input3);
        self.input0_low.write(input0_low);
        self.input0_high.write(input0_high);
        self.input1_low.write(input1_low);
        self.input1_high.write(input1_high);
        self.input2_low.write(input2_low);
        self.input2_high.write(input2_high);
        self.input3_low.write(input3_low);
        self.input3_high.write(input3_high);
    }

    #[abi(embed_v0)]
    impl Groth16BackendImpl of IGroth16Backend<ContractState> {
        fn verify_groth16(
            self: @ContractState,
            vk_hash: felt252,
            public_inputs: Span<felt252>,
            proof: Span<felt252>,
        ) -> bool {
            if vk_hash != self.expected_vk_hash.read() {
                return false;
            }

            if public_inputs.len() != 4 {
                return false;
            }

            if *public_inputs.at(0) != self.input0.read()
                || *public_inputs.at(1) != self.input1.read()
                || *public_inputs.at(2) != self.input2.read()
                || *public_inputs.at(3) != self.input3.read()
            {
                return false;
            }

            let verifier = self.verifier.read();
            let dispatcher = IRealGroth16VerifierBN254Dispatcher {
                contract_address: verifier,
            };

            match dispatcher.verify_groth16_proof_bn254(proof) {
                Result::Err(_) => false,
                Result::Ok(returned_public_inputs) => {
                    if returned_public_inputs.len() != 4 {
                        return false;
                    }

                    let input0 = *returned_public_inputs.at(0);
                    let input1 = *returned_public_inputs.at(1);
                    let input2 = *returned_public_inputs.at(2);
                    let input3 = *returned_public_inputs.at(3);

                    input0.low.into() == self.input0_low.read()
                        && input0.high.into() == self.input0_high.read()
                        && input1.low.into() == self.input1_low.read()
                        && input1.high.into() == self.input1_high.read()
                        && input2.low.into() == self.input2_low.read()
                        && input2.high.into() == self.input2_high.read()
                        && input3.low.into() == self.input3_low.read()
                        && input3.high.into() == self.input3_high.read()
                },
            }
        }
    }
}
