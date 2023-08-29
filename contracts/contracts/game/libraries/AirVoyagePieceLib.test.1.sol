// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev String operations.
 */

import "./AirVoyagePieceLib.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TestAirVoyagePiece {
    using AirVoyagePieceLib for AirVoyagePieceLib.Piece;
    using Strings for uint256;

    AirVoyagePieceLib.Piece private piece;

    function testSetPlayer() public {
        piece.setPlayer(address(0x1234));
        assert(piece.player == address(0x1234));
    }

    function testConvertLocalToGlobalPosition() public pure {
        uint16 globalPosition = 0;
        uint16 localPosition = 0;
        uint8 seatIndex = 0;

        // 1st seat
        seatIndex = 0;
        localPosition = 0;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(globalPosition == 0, "globalPosition should be 0");

        localPosition = 48;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(globalPosition == 48, "globalPosition should be 48");

        localPosition = 48 + 1;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(globalPosition == 51 + 1, "globalPosition should be 52");

        localPosition = 48 + 6;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(
            globalPosition == 51 + 6,
            string(
                abi.encodePacked(
                    "globalPosition should be 52 + 6, but got ",
                    Strings.toString(globalPosition)
                )
            )
        );

        // 2nd seat
        seatIndex = 1;
        localPosition = 0;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(
            globalPosition == 13,
            "seatIndex: 1, globalPosition should be 13"
        );
        localPosition = 48;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(
            globalPosition == 9,
            "seatIndex: 1, globalPosition should be 9"
        );

        localPosition = 48 + 1;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(
            globalPosition == 57 + 1,
            "seatIndex: 1, globalPosition should be 57 + 1"
        );

        localPosition = 48 + 6;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(
            globalPosition == 57 + 6,
            "seatIndex: 1, globalPosition should be 57 + 6"
        );

        // 3rd seat
        seatIndex = 2;
        localPosition = 0;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(
            globalPosition == 26,
            "seatIndex: 2, globalPosition should be 26"
        );

        localPosition = 48;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(
            globalPosition == 22,
            "seatIndex: 2, globalPosition should be 22"
        );

        localPosition = 48 + 1;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(
            globalPosition == 63 + 1,
            "seatIndex: 2, globalPosition should be 63 + 1"
        );

        localPosition = 48 + 6;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(
            globalPosition == 63 + 6,
            "seatIndex: 2, globalPosition should be 63 + 6"
        );

        // 4th seat
        seatIndex = 3;
        localPosition = 0;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(
            globalPosition == 39,
            "seatIndex: 3, globalPosition should be 39"
        );

        localPosition = 48;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(
            globalPosition == 35,
            "seatIndex: 3, globalPosition should be 35"
        );

        localPosition = 48 + 1;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );

        require(
            globalPosition == 69 + 1,
            "seatIndex: 3, globalPosition should be 69 + 1"
        );

        localPosition = 48 + 6;
        globalPosition = AirVoyagePieceLib.convertLocalToGlobalPosition(
            seatIndex,
            localPosition
        );
        require(
            globalPosition == 69 + 6,
            "seatIndex: 3, globalPosition should be 69 + 6"
        );
    }

    function libConvertGlobalToLocalPosition(
        uint8 seatIndex,
        uint16 globalPosition
    ) external pure returns (uint16) {
        return
            AirVoyagePieceLib.convertGlobalToLocalPosition(
                seatIndex,
                globalPosition
            );
    }

    function testConvertGlobalToLocalPositionInvalid() external view {
        uint16 globalPosition = 0;
        uint8 seatIndex = 0;

        // 1st seat,invalid globalPosition
        globalPosition = 48 + 1;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 0, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        globalPosition = 48 + 3;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 0, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        globalPosition = 57 + 1;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 0, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        // 2nd seat,invalid globalPosition
        seatIndex = 1;
        globalPosition = 9 + 1;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 1, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        globalPosition = 9 + 3;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 1, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        globalPosition = 58 - 1;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 1, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        globalPosition = 63 + 1;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 1, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        // 3rd seat,invalid globalPosition
        seatIndex = 2;
        globalPosition = 22 + 1;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 2, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        globalPosition = 22 + 3;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 2, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        globalPosition = 64 - 1;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 2, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        globalPosition = 69 + 1;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 2, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        // 4th seat,invalid globalPosition
        seatIndex = 3;
        globalPosition = 35 + 1;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 3, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        globalPosition = 35 + 3;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 3, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        globalPosition = 70 - 1;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 3, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }

        globalPosition = 75 + 1;
        try
            this.libConvertGlobalToLocalPosition(seatIndex, globalPosition)
        returns (uint16) {
            require(false, "should throw error");
        } catch Error(string memory reason) {
            //reason should be invalid globalPosition
            require(
                keccak256(abi.encodePacked(reason)) ==
                    keccak256(abi.encodePacked("invalid globalPosition")),
                string(
                    abi.encodePacked(
                        "seatIndex: 3, reason should be invalid globalPosition, but got ",
                        reason
                    )
                )
            );
        } catch (bytes memory /*lowLevelData*/) {
            require(false, "should throw error");
        }
    }

    function testConvertGlobalToLocalPosition() public pure {
        uint16 globalPosition = 0;
        uint16 localPosition = 0;
        uint8 seatIndex = 0;

        // 1st seat
        seatIndex = 0;
        globalPosition = 0;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(localPosition == 0, "seatIndex: 0, localPosition should be 0");

        globalPosition = 48;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(
            localPosition == 48,
            "seatIndex: 0, localPosition should be 48"
        );

        globalPosition = 51 + 1;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(
            localPosition == 48 + 1,
            string(
                abi.encodePacked(
                    "localPosition should be 49, but got ",
                    Strings.toString(localPosition)
                )
            )
        );

        globalPosition = 51 + 6;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(
            localPosition == 48 + 6,
            string(
                abi.encodePacked(
                    "localPosition should be 54, but got ",
                    Strings.toString(localPosition)
                )
            )
        );

        // 2nd seat
        seatIndex = 1;
        globalPosition = 13;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(localPosition == 0, "seatIndex: 1, localPosition should be 0");

        globalPosition = 9;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(
            localPosition == 48,
            "seatIndex: 1, localPosition should be 48"
        );

        globalPosition = 57 + 1;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(
            localPosition == 48 + 1,
            string(
                abi.encodePacked(
                    "seatIndex: 1, localPosition should be 49, but got ",
                    Strings.toString(localPosition)
                )
            )
        );

        globalPosition = 57 + 6;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(
            localPosition == 48 + 6,
            string(
                abi.encodePacked(
                    "seatIndex: 1, localPosition should be 54, but got ",
                    Strings.toString(localPosition)
                )
            )
        );

        // 3rd seat
        seatIndex = 2;
        globalPosition = 26;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(localPosition == 0, "seatIndex: 2, localPosition should be 0");

        globalPosition = 22;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );

        require(
            localPosition == 48,
            "seatIndex: 2, localPosition should be 48"
        );

        globalPosition = 63 + 1;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(
            localPosition == 48 + 1,
            string(
                abi.encodePacked(
                    "seatIndex: 2, localPosition should be 49, but got ",
                    Strings.toString(localPosition)
                )
            )
        );

        globalPosition = 63 + 6;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(
            localPosition == 48 + 6,
            string(
                abi.encodePacked(
                    "seatIndex: 2, localPosition should be 54, but got ",
                    Strings.toString(localPosition)
                )
            )
        );

        // 4th seat
        seatIndex = 3;
        globalPosition = 39;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(localPosition == 0, "seatIndex: 3, localPosition should be 0");

        globalPosition = 35;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(
            localPosition == 48,
            "seatIndex: 3, localPosition should be 48"
        );

        globalPosition = 69 + 1;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(
            localPosition == 48 + 1,
            string(
                abi.encodePacked(
                    "seatIndex: 3, localPosition should be 49, but got ",
                    Strings.toString(localPosition)
                )
            )
        );

        globalPosition = 69 + 6;
        localPosition = AirVoyagePieceLib.convertGlobalToLocalPosition(
            seatIndex,
            globalPosition
        );
        require(
            localPosition == 48 + 6,
            string(
                abi.encodePacked(
                    "seatIndex: 3, localPosition should be 54, but got ",
                    Strings.toString(localPosition)
                )
            )
        );
    }

    function testSetLocalPosition() public {
        uint16 localPosition = 0;
        uint8 seatIndex = 0;
        piece.setPlayer(address(0x1234));
        assert(piece.player == address(0x1234));

        // 2nd seat
        seatIndex = 1;
        piece.setSeatIndex(seatIndex);
        require(piece.seatIndex == seatIndex, "seatIndex should be 0");

        localPosition = 0;
        piece.setLocalPosition(localPosition);
        require(
            piece.localPosition == localPosition,
            "localPosition should be 0"
        );
        require(piece.globalPosition == 13, "globalPosition should be 0");
    }

    function testSetGlobalPosition() public {
        uint16 globalPosition = 0;
        uint8 seatIndex = 0;
        piece.setPlayer(address(0x1234));
        assert(piece.player == address(0x1234));

        // 2nd seat
        seatIndex = 1;
        piece.setSeatIndex(seatIndex);
        require(piece.seatIndex == seatIndex, "seatIndex should be 0");

        globalPosition = 9;
        piece.setGlobalPosition(globalPosition);
        require(
            piece.globalPosition == globalPosition,
            "globalPosition should be 0"
        );
        require(piece.localPosition == 48, "localPosition should be 48");
    }

    function testInitial() public {
        assert(piece.player == address(0x0));
        assert(piece.seatIndex == 0);
        assert(piece.localPosition == 0);
        assert(piece.globalPosition == 0);

        piece.initial(address(0x1234), 1, 1);

        assert(piece.player == address(0x1234));
        assert(piece.seatIndex == 1);
        assert(piece.localPosition == 1);
        assert(piece.globalPosition == 14);
    }
}
