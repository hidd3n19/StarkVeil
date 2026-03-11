use crate::interfaces::ierc20::IERC20;

#[starknet::contract]
pub mod TestERC20 {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};

    use super::IERC20;

    #[storage]
    struct Storage {
        balances: Map<ContractAddress, u256>,
        allowances: Map<(ContractAddress, ContractAddress), u256>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Transfer: Transfer,
        Approval: Approval,
        Minted: Minted,
    }

    #[derive(Drop, starknet::Event)]
    struct Transfer {
        from: ContractAddress,
        to: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Approval {
        owner: ContractAddress,
        spender: ContractAddress,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Minted {
        recipient: ContractAddress,
        amount: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {}

    #[abi(embed_v0)]
    impl ERC20Impl of IERC20<ContractState> {
        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            let balance = self.balances.read(recipient);
            self.balances.write(recipient, balance + amount);
            self.emit(Event::Minted(Minted { recipient, amount }));
        }

        fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            transfer_internal(ref self, caller, recipient, amount);
        }

        fn transfer_from(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256
        ) {
            let caller = get_caller_address();
            let allowance = self.allowances.read((sender, caller));
            assert(allowance >= amount, 'INSUFFICIENT_ALLOWANCE');
            self.allowances.write((sender, caller), allowance - amount);
            transfer_internal(ref self, sender, recipient, amount);
        }

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            self.allowances.write((caller, spender), amount);
            self.emit(Event::Approval(Approval { owner: caller, spender, amount }));
        }

        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.balances.read(account)
        }

        fn allowance(
            self: @ContractState,
            owner: ContractAddress,
            spender: ContractAddress
        ) -> u256 {
            self.allowances.read((owner, spender))
        }
    }

    fn transfer_internal(
        ref self: ContractState,
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256
    ) {
        let sender_balance = self.balances.read(sender);
        assert(sender_balance >= amount, 'INSUFFICIENT_BALANCE');
        self.balances.write(sender, sender_balance - amount);

        let recipient_balance = self.balances.read(recipient);
        self.balances.write(recipient, recipient_balance + amount);

        self.emit(Event::Transfer(Transfer { from: sender, to: recipient, amount }));
    }
}
