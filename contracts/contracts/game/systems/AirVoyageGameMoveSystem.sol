// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../libraries/AirVoyageGamePlayer.sol";
import "../libraries/AirVoyageGameLib.sol";
import "../libraries/AirVoyagePieceLib.sol";

import {System} from "../../core/game/System.sol";
import {AirVoyageGameEntity, ID as AirVoyageGameEntityID} from "../entities/AirVoyageGameEntity.sol";

uint256 constant ID = uint256(keccak256("game.system.AirVoyageGameMoveSystem"));

contract AirVoyageGameMoveSystem is
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

    function getAirVoyageGameEntity()
        internal
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

    function movePiece(
        uint256 gameId_,
        address player_,
        uint8 playerPieceIndex_
    )
        public
        whenNotPaused
        onlyRole(SYSTEM_INTERNAL_ROLE)
        returns (uint256, uint256, uint256)
    {
        // Get the game
        AirVoyageGameLib.Game memory _game = getGame(gameId_);

        // Check whether the game is playing
        require(
            _game.status == AirVoyageGameLib.GameStatus.Playing,
            "Game is not playing"
        );
        AirVoyageGamePlayer.GamePlayer memory _gamePlayer = _game.players[
            _game.currentPlayer
        ];
        // Check whether the player is playing
        require(_gamePlayer.addr == player_, "Player is not playing");
        // Check whether the player is playing
        require(
            _gamePlayer.status == AirVoyageGamePlayer.GamePlayerStatus.Playing
        );

        // Get the piece
        require(playerPieceIndex_ < MAX_PIECES_PER_PLAYER, "Piece index error");
        uint256 pieceIndex = _game.currentPlayer *
            MAX_PIECES_PER_PLAYER +
            playerPieceIndex_;

        AirVoyagePieceLib.Piece memory piece = getAirVoyageGameEntity()
            .getPiece(gameId_, pieceIndex);

        require(piece.player != address(0), "The piece does not exist");
        // Check whether the piece is in the game
        require(piece.getIsInGame(), "The piece is not in the game");
        // Check whether the piece is finished
        require(piece.getFinished() == false, "The piece is finished");
        // Check whether the piece is the current player
        require(piece.player == player_, "You are not the owner of the piece");

        require(_gamePlayer.getDice() > 0, "You have not rolled the dice");

        // Move the piece
        uint16 fromPosition = 0;
        uint16 toPosition = 0;
        (fromPosition, toPosition) = getAirVoyageGameEntity().movePiece(
            gameId_,
            pieceIndex,
            _gamePlayer.getDice()
        );

        //clear the dice
        getAirVoyageGameEntity().setRollDice(gameId_, player_, 0);

        // Check whether the piece is collided
        pieceCollided(gameId_, player_, toPosition);

        piece = getAirVoyageGameEntity().getPiece(gameId_, pieceIndex);
        // Check whether the piece location is the quick path
        if (piece.localPosition == 16) {
            // Set the piece to the finished state
            (, toPosition) = getAirVoyageGameEntity().setPieceLocalPosition(
                gameId_,
                pieceIndex,
                28
            );

            pieceCollided(gameId_, player_, toPosition);
        }

        // Emit the event
        emit PieceMoved(gameId_, player_, pieceIndex, fromPosition, toPosition);

        return (pieceIndex, fromPosition, toPosition);
    }

    function pieceCollided(
        uint256 gameId_,
        address player_,
        uint16 pieceGlobalPosition_
    ) internal {
        // Get the game
        AirVoyageGameLib.Game memory _game = getGame(gameId_);

        for (uint256 i = 0; i < _game.pieces.length; i++) {
            AirVoyagePieceLib.Piece memory otherPiece = _game.pieces[i];
            if (otherPiece.player == address(0)) {
                continue;
            }
            if (otherPiece.getFinished() == false) {
                continue;
            }
            if (otherPiece.player == player_) {
                continue;
            }
            if (otherPiece.globalPosition == pieceGlobalPosition_) {
                // Set the piece to the start position
                getAirVoyageGameEntity().setPieceLocalPosition(gameId_, i, 0);
            }
        }
    }

    function turnToNextPlayer(
        uint256 gameId_
    ) public whenNotPaused onlyRole(SYSTEM_INTERNAL_ROLE) returns (bool) {
        // Get the game
        AirVoyageGameLib.Game memory _game = getGame(gameId_);
        // Check whether the game is playing
        require(
            _game.status == AirVoyageGameLib.GameStatus.Playing,
            "Game is not playing"
        );

        // // Check whether the game is finished
        if (_game.checkIsGameFinished()) {
            // End the game
            return false;
        } else {
            // next
            uint256 nextPlayer = _game.getNextPlayingPlayerIndex(
                _game.currentPlayer
            );
            getAirVoyageGameEntity().setNextPlayer(gameId_, nextPlayer);
            return true;
        }
    }

    function turnToNextPlayerIfCurrentPlayerTimeout(
        uint256 gameId_,
        address player_
    ) public whenNotPaused onlyRole(SYSTEM_INTERNAL_ROLE) returns (bool) {
        // Get the game
        AirVoyageGameLib.Game memory _game = getGame(gameId_);
        if (_game.status != AirVoyageGameLib.GameStatus.Playing) {
            return false;
        }
        AirVoyageGamePlayer.GamePlayer memory _currentGamePlayer = _game
            .players[_game.currentPlayer];

        // Check whether the player is playing
        if (_currentGamePlayer.addr == player_) {
            return false;
        }
        // 60 seconds timeout
        if (_currentGamePlayer.getLastOperationTime() + 60 > block.timestamp) {
            return false;
        }

        return turnToNextPlayer(gameId_);
    }
}
