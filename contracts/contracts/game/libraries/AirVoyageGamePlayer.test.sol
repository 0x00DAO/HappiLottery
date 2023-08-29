// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev String operations.
 */

import "./AirVoyageGamePlayer.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AirVoyageGamePlayerTest {
    using Strings for uint256;
    using AirVoyageGamePlayer for AirVoyageGamePlayer.GamePlayer;
    using AirVoyageGamePlayer for AirVoyageGamePlayer.GamePlayerStatus;

    AirVoyageGamePlayer.GamePlayer private instance;
}
