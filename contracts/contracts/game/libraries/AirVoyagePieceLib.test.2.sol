// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev String operations.
 */

import "./AirVoyagePieceLib.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TestAirVoyagePiece2 {
    using AirVoyagePieceLib for AirVoyagePieceLib.Piece;
    using Strings for uint256;

    AirVoyagePieceLib.Piece private piece;

    function testMoveForward() public {
        piece.initial(address(0x1234), 1, 1);
        piece.moveForward(1);
        require(piece.localPosition == 2, "localPosition should be 2");
        require(piece.globalPosition == 15, "globalPosition should be 15");

        piece.moveForward(6);
        require(piece.localPosition == 8, "localPosition should be 8");
        require(piece.globalPosition == 21, "globalPosition should be 21");

        piece.setLocalPosition(47);
        piece.moveForward(1);
        require(piece.localPosition == 48, "localPosition should be 48");
        require(piece.globalPosition == 9, "globalPosition should be 9");

        piece.moveForward(1);
        require(piece.localPosition == 49, "localPosition should be 49");
        require(piece.globalPosition == 58, "globalPosition should be 58");

        piece.moveForward(4);
        require(piece.localPosition == 53, "localPosition should be 53");
        require(piece.globalPosition == 62, "globalPosition should be 62");

        piece.moveForward(4);
        require(
            piece.localPosition == 51,
            string(
                abi.encodePacked(
                    "localPosition should be 51, but got ",
                    Strings.toString(piece.localPosition)
                )
            )
        );
        require(piece.globalPosition == 60, "globalPosition should be 60");

        piece.moveForward(1);
        require(piece.localPosition == 52, "localPosition should be 52");
        require(piece.globalPosition == 61, "globalPosition should be 61");

        piece.moveForward(1);
        require(piece.localPosition == 53, "localPosition should be 53");
        require(piece.globalPosition == 62, "globalPosition should be 62");

        piece.moveForward(1);
        require(piece.localPosition == 54, "localPosition should be 54");
        require(piece.globalPosition == 63, "globalPosition should be 63");

        piece.moveForward(1);
        require(piece.localPosition == 53, "localPosition should be 55");
        require(piece.globalPosition == 62, "globalPosition should be 62");
    }
}
