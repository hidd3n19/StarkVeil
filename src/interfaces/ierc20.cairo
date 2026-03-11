#[starknet::interface]
pub trait IERC20<TContractState> {
    fn mint(ref self: TContractState, recipient: starknet::ContractAddress, amount: u256);
    fn transfer(ref self: TContractState, recipient: starknet::ContractAddress, amount: u256);
    fn transfer_from(
        ref self: TContractState,
        sender: starknet::ContractAddress,
        recipient: starknet::ContractAddress,
        amount: u256
    );
    fn approve(ref self: TContractState, spender: starknet::ContractAddress, amount: u256);
    fn balance_of(self: @TContractState, account: starknet::ContractAddress) -> u256;
    fn allowance(
        self: @TContractState,
        owner: starknet::ContractAddress,
        spender: starknet::ContractAddress
    ) -> u256;
}
