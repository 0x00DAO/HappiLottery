// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./AirVoyagePieceLib.sol";
import "./AirVoyageGamePlayer.sol";

/**
 * @dev String operations.
 */
library AirVoyageGameLib {
    using AirVoyagePieceLib for AirVoyagePieceLib.Piece;
    //Maximum number of players in a game
    uint8 public constant MAX_PLAYERS = 4;

    //The number of pieces each person has
    uint8 public constant MAX_PIECES_PER_PLAYER = 1;

    enum GameStatus {
        Idle,
        Waiting,
        Playing,
        Finished
    }

    //Define a structure to represent the game
    struct Game {
        uint256 gameId; // The ID of the game
        address owner; // The wallet address of the player who created the game
        AirVoyageGamePlayer.GamePlayer[MAX_PLAYERS] players; // The wallet address of all players participating in the game
        AirVoyagePieceLib.Piece[MAX_PLAYERS * MAX_PIECES_PER_PLAYER] pieces; //All pieces in the game
        uint256 currentPlayer; // The index of the player who is currently playing
        address winner; // The wallet address of the winner
        GameStatus status; // The status of the game
        uint256 currentPlayerLastOperationTime; // The last operation time of the current player
    }

    function getGamePiece(
        Game storage game,
        uint8 pieceIndex
    ) internal view returns (AirVoyagePieceLib.Piece storage) {
        return game.pieces[pieceIndex];
    }

    function getCurrentPlayer(
        Game storage game
    ) internal view returns (AirVoyageGamePlayer.GamePlayer storage) {
        return game.players[game.currentPlayer];
    }

    function getPlayerCount(Game memory game) internal pure returns (uint256) {
        return MAX_PLAYERS - getEmptySeatCount(game);
    }

    /// @dev getEmptySeatCount
    function getEmptySeatCount(
        Game memory game
    ) internal pure returns (uint256) {
        uint256 emptySeatCount = 0;
        for (uint256 i = 0; i < MAX_PLAYERS; i++) {
            if (game.players[i].addr == address(0)) {
                emptySeatCount++;
            }
        }
        return emptySeatCount;
    }

    function getNextEmptySeat(
        Game memory game,
        uint256 emptySeatStartIndex
    ) internal pure returns (uint256) {
        uint256 emptySeat = emptySeatStartIndex;
        uint256 emptySeatCount = getEmptySeatCount(game);
        require(emptySeatCount > 0, "AirVoyageGame: No empty seat");

        for (uint256 i = 0; i < MAX_PLAYERS; i++) {
            if (game.players[emptySeat].addr == address(0)) {
                break;
            }
            emptySeat = (emptySeat + 1) % MAX_PLAYERS;
        }
        return emptySeat;
    }

    function getNextPlayingPlayerIndex(
        Game memory game,
        uint256 currentPlayerIndex
    ) internal pure returns (uint256) {
        uint256 nextPlayerIndex = currentPlayerIndex;
        uint256 playerCount = getPlayerCount(game);
        require(playerCount > 0, "AirVoyageGame: No player");

        for (uint256 i = 0; i < MAX_PLAYERS; i++) {
            nextPlayerIndex = (nextPlayerIndex + 1) % MAX_PLAYERS;

            AirVoyageGamePlayer.GamePlayer memory _nextGamePlayer = game
                .players[nextPlayerIndex];
            if (
                _nextGamePlayer.addr != address(0) &&
                _nextGamePlayer.status ==
                AirVoyageGamePlayer.GamePlayerStatus.Playing
            ) {
                break;
            }
            // break if the next player is the current player
            if (nextPlayerIndex == currentPlayerIndex) {
                break;
            }
        }
        return nextPlayerIndex;
    }

    function checkIsPlayerIsFinished(
        Game memory game,
        uint256 playerIndex
    ) internal pure returns (bool) {
        AirVoyageGamePlayer.GamePlayer memory _gamePlayer = game.players[
            playerIndex
        ];

        if (_gamePlayer.addr != address(0)) {
            if (
                _gamePlayer.status ==
                AirVoyageGamePlayer.GamePlayerStatus.Finished
            ) {
                return true;
            }

            // check if the player has quit: timeout or quit
            if (
                _gamePlayer.status == AirVoyageGamePlayer.GamePlayerStatus.Quit
            ) {
                return true;
            }

            // check all pieces of the player are finished
            if (
                _gamePlayer.status ==
                AirVoyageGamePlayer.GamePlayerStatus.Playing
            ) {
                for (uint256 i = 0; i < MAX_PIECES_PER_PLAYER; i++) {
                    AirVoyagePieceLib.Piece memory _piece = game.pieces[
                        playerIndex * MAX_PIECES_PER_PLAYER + i
                    ];

                    if (!_piece.getFinished()) {
                        return false;
                    }
                }
                return true;
            }
        }

        return false;
    }

    function checkIsGameFinished(
        Game memory game
    ) internal pure returns (bool) {
        if (game.status == GameStatus.Finished) {
            return true;
        }
        uint256 playerCount = getPlayerCount(game);
        require(playerCount > 0, "AirVoyageGame: No player");

        for (uint256 i = 0; i < MAX_PLAYERS; i++) {
            if (checkIsPlayerIsFinished(game, i)) {
                playerCount--;
            }
        }
        return playerCount <= 1;
    }
}
