// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../libraries/AirVoyageGamePlayer.sol";
import "../libraries/AirVoyageGameLib.sol";

import {System} from "../../core/game/System.sol";
import {AirVoyageGameEntity, ID as AirVoyageGameEntityID} from "../entities/AirVoyageGameEntity.sol";

uint256 constant ID = uint256(keccak256("game.system.AirVoyageGameViewSystem"));

contract AirVoyageGameViewSystem is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    System
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

    using AirVoyageGameLib for AirVoyageGameLib.Game;
    using AirVoyageGameLib for AirVoyageGameLib.GameStatus;
    using AirVoyageGamePlayer for AirVoyageGamePlayer.GamePlayer;
    using AirVoyageGamePlayer for AirVoyageGamePlayer.GamePlayerStatus;

    function getAirVoyageGameEntity()
        private
        view
        returns (AirVoyageGameEntity)
    {
        return
            AirVoyageGameEntity(root.getSystemAddress(AirVoyageGameEntityID));
    }

    function getGame(
        uint256 gameId
    ) public view returns (AirVoyageGameLib.Game memory) {
        AirVoyageGameLib.Game memory _game = getAirVoyageGameEntity().getGame(
            gameId
        );

        require(_game.gameId != 0, "Game does not exist");
        return _game;
    }

    function isGameFinished(uint256 gameId) public view returns (bool) {
        AirVoyageGameLib.Game memory _game = getGame(gameId);
        return _game.checkIsGameFinished();
    }

    /// @dev Get the current player
    function getCurrentPlayer(uint256 gameId) public view returns (address) {
        AirVoyageGameLib.Game memory _game = getGame(gameId);
        // Check whether the game is playing
        require(
            _game.status == AirVoyageGameLib.GameStatus.Playing,
            "Game is not playing"
        );

        return _game.players[_game.currentPlayer].addr;
    }

    function getGamePiece(
        uint256 gameId,
        uint8 pieceIndex
    ) public view returns (AirVoyagePieceLib.Piece memory) {
        AirVoyageGameLib.Game memory _game = getGame(gameId);
        // Check whether the game is playing
        require(
            _game.status == AirVoyageGameLib.GameStatus.Playing,
            "Game is not playing"
        );

        return _game.pieces[pieceIndex];
    }
}
