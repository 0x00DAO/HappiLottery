// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {IRoot} from "../../core/game/interface/IRoot.sol";
import {Component} from "../../core/game/Component.sol";
import "../../core/contract-upgradeable/VersionUpgradeable.sol";
import "../libraries/AirVoyageGamePlayer.sol";
import "../libraries/AirVoyageGameLib.sol";
import "../libraries/AirVoyagePieceLib.sol";

uint256 constant ID = uint256(keccak256("game.entities.AirVoyageGameEntity"));

contract AirVoyageGameEntity is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    Component
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
        __Component_init(ID, root_);

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

    //Maximum number of players in a game
    uint8 public constant MAX_PLAYERS = 4;

    //The number of pieces each person has
    uint8 public constant MAX_PIECES_PER_PLAYER = 1;

    using AirVoyagePieceLib for AirVoyagePieceLib.Piece;

    using AirVoyageGameLib for AirVoyageGameLib.Game;
    using AirVoyageGameLib for AirVoyageGameLib.GameStatus;
    using AirVoyageGamePlayer for AirVoyageGamePlayer.GamePlayer;
    using AirVoyageGamePlayer for AirVoyageGamePlayer.GamePlayerStatus;

    // Define a mapping table to store all games
    mapping(uint256 => AirVoyageGameLib.Game) internal games;

    error GameDoesNotExist();

    // Define a function to create a new game
    function createGame(
        uint256 gameId,
        address owner
    ) public whenNotPaused onlyRole(COMPONENT_WRITE_ROLE) returns (uint256) {
        // Create a new game
        AirVoyageGameLib.Game storage game = games[gameId];
        game.gameId = gameId;
        game.owner = owner;
        game.status = AirVoyageGameLib.GameStatus.Waiting;

        return gameId;
    }

    function getGame(
        uint256 gameId
    ) public view returns (AirVoyageGameLib.Game memory) {
        AirVoyageGameLib.Game memory _game = games[gameId];
        if (_game.gameId == 0) {
            revert GameDoesNotExist();
        }
        // require(_game.gameId != 0, "Game does not exist");
        return _game;
    }

    function _getGame(
        uint256 gameId
    ) internal view returns (AirVoyageGameLib.Game storage) {
        AirVoyageGameLib.Game storage _game = games[gameId];
        if (_game.gameId == 0) {
            revert GameDoesNotExist();
        }
        // require(_game.gameId != 0, "Game does not exist");
        return _game;
    }

    function joinGame(
        uint256 gameId,
        address player_,
        uint256 emptySeat
    ) public whenNotPaused onlyRole(COMPONENT_WRITE_ROLE) returns (uint256) {
        AirVoyageGameLib.Game storage _game = _getGame(gameId);
        address _player = player_;
        // Check whether the game is waiting for players
        require(_game.status == AirVoyageGameLib.GameStatus.Waiting);
        // Check whether the game is full
        require(_game.getEmptySeatCount() > 0);

        // Join the game
        AirVoyageGamePlayer.GamePlayer storage _gamePlayer = _game.players[
            emptySeat
        ];
        _gamePlayer.init(_player);

        // Initialize the piece
        uint256 pieceStartIndex = emptySeat * MAX_PIECES_PER_PLAYER;
        for (
            uint256 i = pieceStartIndex;
            i < pieceStartIndex + MAX_PIECES_PER_PLAYER;
            i++
        ) {
            AirVoyagePieceLib.Piece storage piece = _game.pieces[i];
            piece.initial(_gamePlayer.addr, uint8(emptySeat), 0);
        }

        return emptySeat;
    }

    function startGame(
        uint256 gameId
    ) public whenNotPaused onlyRole(COMPONENT_WRITE_ROLE) {
        AirVoyageGameLib.Game storage game = _getGame(gameId);
        // Check whether the game is waiting for players
        require(
            game.status == AirVoyageGameLib.GameStatus.Waiting,
            "Game is not waiting for players"
        );
        // Check whether the player is gte 2
        require(
            game.getPlayerCount() >= 2,
            "The number of players is less than 2"
        );
        // Start the game
        game.status = AirVoyageGameLib.GameStatus.Playing;
        // initialize the piece
        // Because each person currently only supports one plane, so there is this logic, if multiple planes are supported, this logic needs to be modified
        for (uint256 i = 0; i < game.pieces.length; i++) {
            AirVoyagePieceLib.Piece storage piece = game.pieces[i];
            if (piece.player == address(0)) {
                continue;
            }
            piece.setIsInGame();
        }

        // initialize the player
        for (uint256 i = 0; i < game.players.length; i++) {
            AirVoyageGamePlayer.GamePlayer storage _gamePlayer = game.players[
                i
            ];
            if (_gamePlayer.addr == address(0)) {
                continue;
            }
            _gamePlayer.status = AirVoyageGamePlayer.GamePlayerStatus.Playing;
        }
        // Set the current player is 3, because the first player is 0
        // uint256 nextPlayer = game.getNextPlayingPlayerIndex(3);
        // game.currentPlayer = nextPlayer;
        // Emit the event
    }

    function checkGameIsPlaying(uint256 gameId) internal view {
        AirVoyageGameLib.Game storage game = _getGame(gameId);
        // Check whether the game is playing
        require(
            game.status == AirVoyageGameLib.GameStatus.Playing,
            "Game is not playing"
        );
    }

    function setNextPlayer(
        uint256 gameId,
        uint256 nextPlayer
    ) public whenNotPaused onlyRole(COMPONENT_WRITE_ROLE) {
        AirVoyageGameLib.Game storage game = _getGame(gameId);
        // Check whether the game is playing
        checkGameIsPlaying(gameId);
        // Set the current player
        game.currentPlayer = nextPlayer;
        // update the player last operation time
        AirVoyageGamePlayer.GamePlayer storage _gamePlayer = game
            .getCurrentPlayer();
        _gamePlayer.setLastOperationTimeAsBlockTime();
    }

    function setRollDice(
        uint256 gameId_,
        address player_,
        uint8 dice_
    ) public whenNotPaused onlyRole(COMPONENT_WRITE_ROLE) {
        // Get the game
        AirVoyageGameLib.Game storage game = _getGame(gameId_);
        // Check whether the game is playing
        checkGameIsPlaying(gameId_);

        AirVoyageGamePlayer.GamePlayer storage _gamePlayer = game
            .getCurrentPlayer();
        // Check whether the player is playing
        require(_gamePlayer.addr == player_);
        // Check whether the player is playing
        require(
            _gamePlayer.status == AirVoyageGamePlayer.GamePlayerStatus.Playing
        );
        _gamePlayer.setDice(dice_);
    }

    function getPiece(
        uint256 gameId_,
        uint256 pieceIndex_
    ) public view returns (AirVoyagePieceLib.Piece memory) {
        // Get the game
        AirVoyageGameLib.Game storage game = _getGame(gameId_);
        AirVoyagePieceLib.Piece memory piece = game.pieces[uint8(pieceIndex_)];
        return piece;
    }

    function movePiece(
        uint256 gameId_,
        uint256 pieceIndex_,
        uint8 dice_
    )
        public
        whenNotPaused
        onlyRole(COMPONENT_WRITE_ROLE)
        returns (uint16, uint16)
    {
        // Get the game
        AirVoyageGameLib.Game storage game = _getGame(gameId_);
        AirVoyagePieceLib.Piece storage piece = game.pieces[uint8(pieceIndex_)];

        uint16 fromPosition = piece.getGlobalPosition();
        piece.moveForward(dice_);
        uint16 toPosition = piece.getGlobalPosition();

        return (fromPosition, toPosition);
    }

    function setPieceLocalPosition(
        uint256 gameId_,
        uint256 pieceIndex_,
        uint16 localPosition_
    )
        public
        whenNotPaused
        onlyRole(COMPONENT_WRITE_ROLE)
        returns (uint16, uint16)
    {
        // Get the game
        AirVoyageGameLib.Game storage game = _getGame(gameId_);
        AirVoyagePieceLib.Piece storage piece = game.pieces[uint8(pieceIndex_)];
        uint16 fromPosition = piece.getGlobalPosition();
        piece.setLocalPosition(localPosition_);
        uint16 toPosition = piece.getGlobalPosition();

        return (fromPosition, toPosition);
    }

    function setGamePlayerStatus(
        uint256 gameId_,
        uint256 playerIndex_,
        AirVoyageGamePlayer.GamePlayerStatus status_
    ) public whenNotPaused onlyRole(COMPONENT_WRITE_ROLE) {
        // Get the game
        AirVoyageGameLib.Game storage game = _getGame(gameId_);
        game.players[playerIndex_].status = status_;
    }

    function getGamePlayer(
        uint256 gameId_,
        uint256 playerIndex_
    ) public view returns (AirVoyageGamePlayer.GamePlayer memory) {
        // Get the game
        AirVoyageGameLib.Game storage game = _getGame(gameId_);
        return game.players[playerIndex_];
    }

    function endGame(
        uint256 gameId_
    ) public whenNotPaused onlyRole(COMPONENT_WRITE_ROLE) {
        // Get the game
        AirVoyageGameLib.Game storage game = _getGame(gameId_);
        // Check whether the game is playing
        checkGameIsPlaying(gameId_);
        // End the game
        game.status = AirVoyageGameLib.GameStatus.Finished;
    }

    function setWinner(
        uint256 gameId_,
        uint256 playerIndex_
    ) public whenNotPaused onlyRole(COMPONENT_WRITE_ROLE) {
        // Get the game
        AirVoyageGameLib.Game storage game = _getGame(gameId_);
        // Check whether the game is playing
        AirVoyageGamePlayer.GamePlayer memory _gamePlayer = game.players[
            playerIndex_
        ];
        // Set the winner
        game.winner = _gamePlayer.addr;
    }
}
