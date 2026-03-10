use crate::interfaces::igroth16_backend::IGroth16Backend;

#[starknet::contract]
pub mod TestPublicInputAlignmentBackend {
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use super::IGroth16Backend;

    #[storage]
    struct Storage {
        expected_vk_hash: felt252,
        input0: felt252,
        input1: felt252,
        input2: felt252,
        input3: felt252,
        expected_proof_0: felt252,
        expected_proof_len: u32
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        expected_vk_hash: felt252,
        input0: felt252,
        input1: felt252,
        input2: felt252,
        input3: felt252,
        expected_proof_0: felt252,
        expected_proof_len: u32
    ) {
        self.expected_vk_hash.write(expected_vk_hash);
        self.input0.write(input0);
        self.input1.write(input1);
        self.input2.write(input2);
        self.input3.write(input3);
        self.expected_proof_0.write(expected_proof_0);
        self.expected_proof_len.write(expected_proof_len);
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
            if proof.len() != self.expected_proof_len.read().into() {
                return false;
            }
            if proof.len() == 0 {
                return false;
            }

            let input0 = *public_inputs.at(0);
            let input1 = *public_inputs.at(1);
            let input2 = *public_inputs.at(2);
            let input3 = *public_inputs.at(3);
            let proof0 = *proof.at(0);

            input0 == self.input0.read()
                && input1 == self.input1.read()
                && input2 == self.input2.read()
                && input3 == self.input3.read()
                && proof0 == self.expected_proof_0.read()
        }
    }
}
