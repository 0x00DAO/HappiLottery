// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev String operations.
 */
library AirVoyageGamePlayer {
    enum GamePlayerStatus {
        Idle,
        Playing,
        Finished,
        Quit
    }

    struct GamePlayer {
        address addr;
        uint8 dice;
        GamePlayerStatus status;
        uint256 score;
        uint256 lastOperationTime;
    }

    function init(GamePlayer storage self, address addr) internal {
        self.addr = addr;
        self.dice = 0;
        self.status = GamePlayerStatus.Idle;
        self.score = 0;
    }

    function getDice(GamePlayer memory self) internal pure returns (uint8) {
        return self.dice;
    }

    function setDice(GamePlayer storage self, uint8 dice) internal {
        self.dice = dice;
    }

    function getStatus(
        GamePlayer storage self
    ) internal view returns (GamePlayerStatus) {
        return self.status;
    }

    function setStatus(
        GamePlayer storage self,
        GamePlayerStatus status
    ) internal {
        self.status = status;
    }

    function setLastOperationTimeAsBlockTime(GamePlayer storage self) internal {
        self.lastOperationTime = block.timestamp;
    }

    function setLastOperationTime(
        GamePlayer storage self,
        uint256 lastOperationTime
    ) internal {
        self.lastOperationTime = lastOperationTime;
    }

    function getLastOperationTime(
        GamePlayer memory self
    ) internal pure returns (uint256) {
        return self.lastOperationTime;
    }
}
