// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "../core/contract-upgradeable/VersionUpgradeable.sol";

import {System} from "../core/game/System.sol";

import "./libraries/AirVoyagePieceLib.sol";
import "./libraries/AirVoyageGameLib.sol";
import "./libraries/AirVoyageGamePlayer.sol";

import {AirVoyageGameEntity, ID as AirVoyageGameEntityID} from "./entities/AirVoyageGameEntity.sol";
import {AirVoyageGameMoveSystem, ID as AirVoyageGameMoveSystemID} from "./systems/AirVoyageGameMoveSystem.sol";
import {AirVoyageGameBonusSystem, ID as AirVoyageGameBonusSystemID} from "./systems/AirVoyageGameBonusSystem.sol";

uint256 constant ID = uint256(keccak256("game.AirVoyage"));

contract AirVoyage is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    VersionUpgradeable,
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

        __initialize();
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

    function _version() internal pure override returns (uint256) {
        return 1;
    }

    function __initialize() private {
        _gameIdCounter._value = 1000000000;
    }

    using AirVoyagePieceLib for AirVoyagePieceLib.Piece;

    using AirVoyageGameLib for AirVoyageGameLib.Game;
    using AirVoyageGameLib for AirVoyageGameLib.GameStatus;
    using AirVoyageGamePlayer for AirVoyageGamePlayer.GamePlayer;
    using AirVoyageGamePlayer for AirVoyageGamePlayer.GamePlayerStatus;

    using CountersUpgradeable for CountersUpgradeable.Counter;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.UintSet;

    CountersUpgradeable.Counter private _gameIdCounter;

    event GameCreated(uint256 indexed gameId, address indexed player);
    event GameJoined(uint256 indexed gameId, address indexed player);
    event GameStarted(uint256 indexed gameId);
    event DiceRolled(
        uint256 indexed gameId,
        address indexed player,
        uint256 dice
    );
    event PieceMoved(
        uint256 indexed gameId,
        address indexed player,
        uint256 pieceIndex,
        uint256 from,
        uint256 to
    );
    event PieceFinished(
        uint256 indexed gameId,
        address indexed player,
        uint256 pieceIndex
    );

    event PlayerFinished(uint256 indexed gameId, address indexed player);
    event GameFinished(uint256 indexed gameId, address indexed winner);

    //Maximum number of players in a game
    uint8 public constant MAX_PLAYERS = 4;

    //The number of pieces each person has
    uint8 public constant MAX_PIECES_PER_PLAYER = 1;

    // Define a structure to represent players who participate in the game
    struct Player {
        uint256 gameId; // The ID of the game the player is currently participating in
        uint8 seatIndex; // The seat number of the player in the game
    }

    // Define a mapping table to store all games
    mapping(uint256 => AirVoyageGameLib.Game) public games;
    // Define a mapping table to store all players
    mapping(address => Player) public players;
    // Waiting for the game to start
    EnumerableSetUpgradeable.UintSet internal _waitingGames;

    function getAirVoyageGameEntity()
        private
        view
        returns (AirVoyageGameEntity)
    {
        return
            AirVoyageGameEntity(root.getSystemAddress(AirVoyageGameEntityID));
    }

    function getAirVoyageGameMoveSystem()
        private
        view
        returns (AirVoyageGameMoveSystem)
    {
        return
            AirVoyageGameMoveSystem(
                root.getSystemAddress(AirVoyageGameMoveSystemID)
            );
    }

    modifier playerNotInGame() {
        require(
            players[msg.sender].gameId == 0,
            "You have already participated in the game"
        );
        _;
    }

    modifier playerInGame() {
        require(
            players[msg.sender].gameId != 0,
            "You have not participated in the game"
        );
        _;
    }

    function randomByGameId(uint256 gameId) private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.difficulty,
                        block.number,
                        msg.sender,
                        gameId
                    )
                )
            );
    }

    // Define a function to create a new game
    function createGame()
        public
        payable
        whenNotPaused
        nonReentrant
        playerNotInGame
        returns (uint256)
    {
        // Create a new game
        uint256 gameId = _gameIdCounter.current();
        _gameIdCounter.increment();
        address owner = _msgSender();
        getAirVoyageGameEntity().createGame(gameId, owner);

        require(_waitingGames.length() == 0, "There are games waiting");
        // Add the game to the waiting list
        _waitingGames.add(gameId);

        // Emit the event
        emit GameCreated(gameId, _msgSender());

        // Join the game
        _joinGame(gameId);

        // Return the game ID
        return gameId;
    }

    function getWaitingGames() public view returns (uint256[] memory) {
        return _waitingGames.values();
    }

    function getGame(
        uint256 gameId
    ) internal view returns (AirVoyageGameLib.Game memory) {
        AirVoyageGameLib.Game memory _game = getAirVoyageGameEntity().getGame(
            gameId
        );
        require(_game.gameId != 0, "Game does not exist");
        return _game;
    }

    function getPlayerCount(uint256 gameId) public view returns (uint256) {
        AirVoyageGameLib.Game memory _game = getGame(gameId);
        return _game.getPlayerCount();
    }

    function getEmptySeatCount(uint256 gameId) public view returns (uint256) {
        AirVoyageGameLib.Game memory _game = getGame(gameId);
        return _game.getEmptySeatCount();
    }

    function _joinGame(uint256 gameId) internal whenNotPaused playerNotInGame {
        AirVoyageGameLib.Game memory _game = getGame(gameId);
        address _player = _msgSender();
        // Check whether the game is waiting for players
        require(
            _game.status == AirVoyageGameLib.GameStatus.Waiting,
            "Game is not waiting for players"
        );
        // Check whether the game is full
        require(_game.getEmptySeatCount() > 0, "Game is full");

        uint256 emptySeat = getRandomEmptySeat(gameId, randomByGameId(gameId));
        // Join the game
        getAirVoyageGameEntity().joinGame(gameId, _player, emptySeat);

        // Deposit the game bonus
        AirVoyageGameBonusSystem bonusSystem = AirVoyageGameBonusSystem(
            getSystemAddress(AirVoyageGameBonusSystemID)
        );
        bonusSystem.deposit{value: msg.value}(_player);

        // Initialize the player
        Player storage player = players[_player];
        player.gameId = gameId;
        player.seatIndex = uint8(emptySeat);

        // Emit Join event
        emit GameJoined(gameId, _player);

        // Check whether the game player is gte 2
        if (getPlayerCount(gameId) >= 2) {
            // Remove the game from the waiting list
            _waitingGames.remove(gameId);
            // Start the game
            startGame(gameId);
        }
    }

    function joinGame(
        uint256 gameId
    ) external payable whenNotPaused nonReentrant playerNotInGame {
        _joinGame(gameId);
    }

    /// @dev Get a random empty seat
    /// @param gameId The ID of the game
    /// @return The index of the empty seat
    function getRandomEmptySeat(
        uint256 gameId,
        uint256 emptySeatStartIndex
    ) internal view returns (uint256) {
        uint256 randomIndex = emptySeatStartIndex % MAX_PLAYERS;
        AirVoyageGameLib.Game memory _game = getGame(gameId);
        return _game.getNextEmptySeat(randomIndex);
    }

    function startGame(uint256 gameId) internal {
        AirVoyageGameLib.Game memory game = getGame(gameId);
        // Check whether the game is waiting for players
        require(
            game.status == AirVoyageGameLib.GameStatus.Waiting,
            "Game is not waiting for players"
        );
        // Check whether the player is gte 2
        require(
            getPlayerCount(gameId) >= 2,
            "The number of players is less than 2"
        );

        getAirVoyageGameEntity().startGame(gameId);

        // Initialize the game
        game = getGame(gameId);
        uint256 nextPlayer = game.getNextPlayingPlayerIndex(3);
        getAirVoyageGameEntity().setNextPlayer(gameId, nextPlayer);

        // Emit the event
        emit GameStarted(gameId);
    }

    function rollDiceAndMovePiece(
        uint8 playerPieceIndex
    ) public whenNotPaused nonReentrant playerInGame {
        address _player = _msgSender();
        // Get the game ID
        uint256 _gameId = players[_player].gameId;

        // Roll the dice (1-6)
        uint8 _dice = uint8((randomByGameId(_gameId) % 6) + 1);
        getAirVoyageGameEntity().setRollDice(_gameId, _player, _dice);

        // Emit the event
        emit DiceRolled(_gameId, _player, _dice);

        (
            uint256 pieceIndex,
            uint256 fromPosition,
            uint256 toPosition
        ) = getAirVoyageGameMoveSystem().movePiece(
                _gameId,
                _player,
                playerPieceIndex
            );
        // Emit the event
        emit PieceMoved(_gameId, _player, pieceIndex, fromPosition, toPosition);

        AirVoyagePieceLib.Piece memory piece = getAirVoyageGameEntity()
            .getPiece(_gameId, pieceIndex);

        // Check whether the piece is finished
        if (piece.getFinished()) {
            // Emit the event
            emit PieceFinished(_gameId, _player, pieceIndex);
        }

        // Check whether the player is finished
        processWhenCurrentPlayerIsFinish(_gameId);
        // Check whether the game is finished
        bool isTurnedNextPlayer = getAirVoyageGameMoveSystem().turnToNextPlayer(
            _gameId
        );
        if (!isTurnedNextPlayer) {
            endGame(_gameId);
        }
    }

    function processWhenCurrentPlayerIsFinish(uint256 gameId_) internal {
        AirVoyageGameLib.Game memory _game = getGame(gameId_);
        AirVoyageGamePlayer.GamePlayer memory _player = _game.players[
            _game.currentPlayer
        ];
        uint256 _playerIndex = _game.currentPlayer;

        if (_game.checkIsPlayerIsFinished(_playerIndex)) {
            getAirVoyageGameEntity().setGamePlayerStatus(
                _game.gameId,
                _playerIndex,
                AirVoyageGamePlayer.GamePlayerStatus.Finished
            );

            // Emit the event
            emit PlayerFinished(_game.gameId, _player.addr);
        }
    }

    function endGame(uint256 gameId) internal {
        AirVoyageGameLib.Game memory _game = getGame(gameId);
        // Set the game status to finished
        getAirVoyageGameEntity().endGame(gameId);

        getAirVoyageGameEntity().setWinner(gameId, _game.currentPlayer);
        _game = getGame(gameId);
        // Emit the event
        address _winner = _game.winner;
        emit GameFinished(gameId, _winner);

        // Transfer the game bonus
        AirVoyageGameBonusSystem bonusSystem = AirVoyageGameBonusSystem(
            getSystemAddress(AirVoyageGameBonusSystemID)
        );
        bonusSystem.winBonus(
            _winner,
            bonusSystem.depositAmountOnce() * _game.getPlayerCount()
        );

        //remove player from game
        for (uint256 i = 0; i < _game.players.length; i++) {
            address _player = _game.players[i].addr;
            if (_player == address(0)) {
                continue;
            }
            players[_player].gameId = 0;
            players[_player].seatIndex = 0;
        }
    }
}
