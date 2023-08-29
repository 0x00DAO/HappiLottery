// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev String operations.
 */

import "./AirVoyageGameLib.sol";
import "./AirVoyageGamePlayer.sol";
import "./AirVoyagePieceLib.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AirVoyageGameLibTest {
    using Strings for uint256;
    using AirVoyageGameLib for AirVoyageGameLib.Game;
    using AirVoyageGameLib for AirVoyageGameLib.GameStatus;
    using AirVoyageGamePlayer for AirVoyageGamePlayer.GamePlayer;
    using AirVoyageGamePlayer for AirVoyageGamePlayer.GamePlayerStatus;

    AirVoyageGameLib.Game private game;

    function testGetEmptySeatCount() public {
        assert(game.getEmptySeatCount() == 4);
        game.players[0].addr = address(1);
        assert(game.getEmptySeatCount() == 3);
        game.players[1].addr = address(1);
        assert(game.getEmptySeatCount() == 2);
        game.players[2].addr = address(1);
        assert(game.getEmptySeatCount() == 1);
        game.players[3].addr = address(1);
        assert(game.getEmptySeatCount() == 0);
    }

    function testGetPlayerCount() public {
        assert(game.getPlayerCount() == 0);
        game.players[0].addr = address(1);
        assert(game.getPlayerCount() == 1);
        game.players[1].addr = address(1);
        assert(game.getPlayerCount() == 2);
        game.players[2].addr = address(1);
        assert(game.getPlayerCount() == 3);
        game.players[3].addr = address(1);
        assert(game.getPlayerCount() == 4);
    }

    function mockGetNextEmptySeat(
        uint256 emptySeatStartIndex
    ) external view returns (uint256) {
        return game.getNextEmptySeat(emptySeatStartIndex);
    }

    function testGetNextEmptySeat() public {
        assert(game.getNextEmptySeat(0) == 0);
        game.players[0].addr = address(1);
        assert(game.getNextEmptySeat(0) == 1);
        game.players[1].addr = address(1);
        assert(game.getNextEmptySeat(0) == 2);
        game.players[2].addr = address(1);
        assert(game.getNextEmptySeat(0) == 3);
        game.players[3].addr = address(1);

        try this.mockGetNextEmptySeat(0) returns (uint256) {
            assert(false);
        } catch Error(string memory reason) {
            assert(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("AirVoyageGame: No empty seat"))
            );
        }
    }

    function testGetNextPlayingPlayerIndex() public {
        game.players[0].addr = address(1);
        game.players[0].status = AirVoyageGamePlayer.GamePlayerStatus.Playing;
        assert(game.getNextPlayingPlayerIndex(0) == 0);
        game.players[1].addr = address(1);
        game.players[1].status = AirVoyageGamePlayer.GamePlayerStatus.Playing;
        assert(game.getNextPlayingPlayerIndex(0) == 1);
        game.players[2].addr = address(1);
        game.players[2].status = AirVoyageGamePlayer.GamePlayerStatus.Playing;
        assert(game.getNextPlayingPlayerIndex(0) == 1);
        game.players[3].addr = address(1);
        game.players[3].status = AirVoyageGamePlayer.GamePlayerStatus.Playing;
        assert(game.getNextPlayingPlayerIndex(0) == 1);
    }

    function testCheckIsPlayerIsFinished() public {}

    function mockCheckIsGameFinished() external view returns (bool) {
        return game.checkIsGameFinished();
    }

    function testCheckIsGameFinished() public {}
}
