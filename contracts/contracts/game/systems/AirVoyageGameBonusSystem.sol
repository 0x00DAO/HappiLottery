// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import {AirVoyageGameBonusEntity, ID as AirVoyageGameBonusEntityID} from "../entities/AirVoyageGameBonusEntity.sol";
import {AirVoyageGameBonusSystemEntity, ID as AirVoyageGameBonusSystemEntityID} from "../entities/AirVoyageGameBonusSystemEntity.sol";
import {addressToEntity, entityToAddress} from "../../core/game/utils.sol";

import {System} from "../../core/game/System.sol";

uint256 constant ID = uint256(
    keccak256("game.system.AirVoyageGameBonusSystem")
);

contract AirVoyageGameBonusSystem is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    System,
    ReentrancyGuardUpgradeable
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address root_) public initializer {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
        __System_init(ID, root_);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}

    /// custom logic here

    event Deposit(address indexed from, uint256 amount);
    event WinBonus(address indexed from, uint256 amount);
    event RewardBonus(address indexed from, uint256 amount);

    uint256 public constant depositAmountOnce = 0.005 ether;
    // can be withdrawed by owner
    uint256 public constant keyAvailableAmount =
        uint256(keccak256("AirVoyageGameBonusSystem.availableAmount"));

    // can not be withdrawed by owner
    uint256 public constant keyWaitingForRewardAmount =
        uint256(keccak256("AirVoyageGameBonusSystem.waitingForRewardAmount"));

    function availableAmount() public view returns (uint256) {
        return
            AirVoyageGameBonusSystemEntity(
                getSystemAddress(AirVoyageGameBonusSystemEntityID)
            ).getValue(keyAvailableAmount);
    }

    function setAvailableAmount(uint256 amount) private {
        AirVoyageGameBonusSystemEntity(
            getSystemAddress(AirVoyageGameBonusSystemEntityID)
        ).set(keyAvailableAmount, amount);
    }

    function waitingForRewardAmount() public view returns (uint256) {
        return
            AirVoyageGameBonusSystemEntity(
                getSystemAddress(AirVoyageGameBonusSystemEntityID)
            ).getValue(keyWaitingForRewardAmount);
    }

    function setWaitingForRewardAmount(uint256 amount) private {
        AirVoyageGameBonusSystemEntity(
            getSystemAddress(AirVoyageGameBonusSystemEntityID)
        ).set(keyWaitingForRewardAmount, amount);
    }

    function winBonus(
        address from,
        uint256 amount
    ) public onlyRole(SYSTEM_INTERNAL_ROLE) {
        uint256 _availableAmount = availableAmount();
        require(
            from != address(0),
            "AirVoyageGameBonusSystem: from is zero address"
        );
        require(amount > 0, "AirVoyageGameBonusSystem: amount is zero");
        require(
            _availableAmount >= amount,
            "AirVoyageGameBonusSystem: availableAmount is not enough"
        );

        AirVoyageGameBonusEntity bonusEntity = AirVoyageGameBonusEntity(
            root.getSystemAddress(AirVoyageGameBonusEntityID)
        );

        uint256 bonus = bonusEntity.getValue(addressToEntity(from));
        bonusEntity.set(addressToEntity(from), bonus + amount);

        _availableAmount -= amount;
        setAvailableAmount(_availableAmount);

        uint256 _waitingForRewardAmount = waitingForRewardAmount();
        _waitingForRewardAmount += amount;
        setWaitingForRewardAmount(_waitingForRewardAmount);

        emit WinBonus(from, amount);
    }

    function getBonus() public view returns (uint256) {
        address from = _msgSender();
        return getBonusByAdddress(from);
    }

    function bonusOf(address from) public view returns (uint256) {
        return getBonusByAdddress(from);
    }

    function getBonusByAdddress(address from) internal view returns (uint256) {
        AirVoyageGameBonusEntity bonusEntity = AirVoyageGameBonusEntity(
            root.getSystemAddress(AirVoyageGameBonusEntityID)
        );
        return bonusEntity.getValue(addressToEntity(from));
    }

    function rewardBonus() external nonReentrant {
        address from = _msgSender();

        uint256 bonus = getBonusByAdddress(from);
        require(bonus > 0, "AirVoyageGameBonusSystem: bonus is zero");

        AirVoyageGameBonusEntity bonusEntity = AirVoyageGameBonusEntity(
            root.getSystemAddress(AirVoyageGameBonusEntityID)
        );
        bonusEntity.set(addressToEntity(from), 0);

        uint256 _waitingForRewardAmount = waitingForRewardAmount();
        require(
            _waitingForRewardAmount >= bonus,
            "AirVoyageGameBonusSystem: waitingForRewardAmount is not enough"
        );
        _waitingForRewardAmount -= bonus;
        setWaitingForRewardAmount(_waitingForRewardAmount);

        AddressUpgradeable.sendValue(payable(from), bonus);

        emit RewardBonus(from, bonus);
    }

    function deposit(
        address from
    ) public payable onlyRole(SYSTEM_INTERNAL_ROLE) {
        require(
            msg.value == depositAmountOnce,
            "AirVoyageGameBonusSystem: deposit amount is not correct"
        );

        uint256 _availableAmount = availableAmount();
        _availableAmount += msg.value;
        setAvailableAmount(_availableAmount);

        //emit Deposit(from, msg.value);
        emit Deposit(from, msg.value);
    }
}
