// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract ERC20Token is ERC20, ERC20Burnable, Ownable{

    address private _owner;
    bool private notOwner;

    constructor(string memory _name, string memory _symbol) ERC20 (_name, _symbol){
        _mint(msg.sender, 100 * 10 ** 18);
        _owner = msg.sender;
    }

    event MintMore(uint256, string);
    event BurnToken(uint256, string);
    event TransferFund(uint256, address, string);

    function mint(uint256 amount) public {
        _mint(_owner, amount);
        emit MintMore(totalSupply(), "Success! New token created");
    }

    function burn(uint256 amount) onlyOwner public override {
        _burn(_owner, amount);
        emit BurnToken(totalSupply(), "Success! Token destroyed");
    }

    function transferFunds(address _to, uint256 amount) public {
        require(balanceOf(_owner)  < amount);
        transfer(_to, amount);
        emit TransferFund(balanceOf(msg.sender), _to, "Success! Funds transfered");
    }

    function getBalance() public view returns(uint256) {
        return balanceOf(msg.sender);
    }

    function checkOwner() public view returns(bool){
        if(msg.sender == _owner){
            return true;
        }
        return notOwner;
    }
}