// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/**
 * @dev String operations.
 */
library AirVoyagePieceLib {
    enum PieceStatus {
        Idle,
        Playing,
        Finished
    }

    struct Piece {
        address player; // The wallet address of the player to which the piece belongs
        uint8 seatIndex; // The seat number of the piece 0-3
        uint16 localPosition; // The current position of the piece
        uint16 globalPosition; // The global position of the piece
        PieceStatus status; // The status of the piece
    }

    uint8 public constant MAX_LOCAL_POSITION = 55;

    function createEmptyPiece() internal pure returns (Piece memory) {
        return Piece(address(0), 0, 0, 0, PieceStatus.Idle);
    }

    function initial(
        Piece storage piece,
        address player,
        uint8 seatIndex,
        uint16 localPosition
    ) internal {
        setPlayer(piece, player);
        setSeatIndex(piece, seatIndex);
        setLocalPosition(piece, localPosition);
        setStatus(piece, PieceStatus.Idle);
    }

    function setPlayer(Piece storage piece, address player) internal {
        piece.player = player;
    }

    function getPlayer(Piece storage piece) internal view returns (address) {
        return piece.player;
    }

    function setSeatIndex(Piece storage piece, uint8 seatIndex) internal {
        piece.seatIndex = seatIndex;
    }

    function setStatus(Piece storage piece, PieceStatus status) internal {
        piece.status = status;
    }

    /// @dev convertLocalToGlobalPosition
    function convertLocalToGlobalPosition(
        uint8 seatIndex,
        uint16 localPosition
    ) internal pure returns (uint16) {
        // 49 valid area
        uint16 validAreaQuantity = 49;
        // 52 public grid
        uint16 publicGridQuantity = 52;
        // 6 final grid
        uint16 finalGridQuantity = 6;

        if (localPosition < validAreaQuantity) {
            return (localPosition + seatIndex * 13) % publicGridQuantity;
        } else {
            return
                ((localPosition - validAreaQuantity) % finalGridQuantity) +
                seatIndex *
                finalGridQuantity +
                publicGridQuantity;
        }
    }

    function convertGlobalToLocalPosition(
        uint8 seatIndex,
        uint16 globalPosition
    ) internal pure returns (uint16) {
        // 49 valid area
        uint16 validAreaQuantity = 49;
        // 52 public grid
        uint16 publicGridQuantity = 52;
        // 6 final grid
        uint16 finalGridQuantity = 6;

        if (globalPosition < publicGridQuantity) {
            uint16 localPosition = (globalPosition +
                publicGridQuantity -
                seatIndex *
                13) % publicGridQuantity;
            require(
                localPosition < validAreaQuantity,
                "invalid globalPosition"
            );
            return localPosition;
        } else {
            require(
                globalPosition >=
                    publicGridQuantity + finalGridQuantity * seatIndex,
                "invalid globalPosition"
            );

            require(
                globalPosition <
                    publicGridQuantity + finalGridQuantity * (seatIndex + 1),
                "invalid globalPosition"
            );

            return
                ((globalPosition - publicGridQuantity) % finalGridQuantity) +
                validAreaQuantity;
        }
    }

    function setLocalPosition(
        Piece storage piece,
        uint16 localPosition
    ) internal {
        require(localPosition < MAX_LOCAL_POSITION, "invalid localPosition");
        piece.localPosition = localPosition;
        piece.globalPosition = convertLocalToGlobalPosition(
            piece.seatIndex,
            localPosition
        );
    }

    function getLocalPosition(
        Piece memory piece
    ) internal pure returns (uint16) {
        return piece.localPosition;
    }

    function setGlobalPosition(
        Piece storage piece,
        uint16 globalPosition
    ) internal {
        piece.globalPosition = globalPosition;
        piece.localPosition = convertGlobalToLocalPosition(
            piece.seatIndex,
            globalPosition
        );
    }

    function getGlobalPosition(
        Piece memory piece
    ) internal pure returns (uint16) {
        return piece.globalPosition;
    }

    function setFinished(Piece storage piece) internal {
        piece.status = PieceStatus.Finished;
    }

    function getFinished(Piece memory piece) internal pure returns (bool) {
        return piece.status == PieceStatus.Finished;
    }

    function setIsInGame(Piece storage piece) internal {
        piece.status = PieceStatus.Playing;
    }

    function getIsInGame(Piece memory piece) internal pure returns (bool) {
        return piece.status == PieceStatus.Playing;
    }

    function moveForward(Piece storage piece, uint16 step) internal {
        require(step <= 6, "invalid step");
        uint16 nextLocalPosition = getLocalPosition(piece) + step;
        if (nextLocalPosition >= MAX_LOCAL_POSITION) {
            // The number of steps to retreat back
            // final grid 6 (49, 50, 51, 52, 53, 54)
            // MAX_LOCAL_POSITION 55
            // so backStep = nextLocalPosition - MAX_LOCAL_POSITION + 1
            // eg: 55 - 55 + 1 = 1
            // 1.uint16 backStep = nextLocalPosition - MAX_LOCAL_POSITION + 1;

            // 2.nextLocalPosition =
            //     MAX_LOCAL_POSITION -
            //     1 -
            //     (nextLocalPosition - MAX_LOCAL_POSITION + 1);

            // 3.
            // nextLocalPosition =
            //     MAX_LOCAL_POSITION -
            //     1 -
            //     nextLocalPosition +
            //     MAX_LOCAL_POSITION -
            //     1;

            nextLocalPosition = 2 * MAX_LOCAL_POSITION - nextLocalPosition - 2;
        }

        setLocalPosition(piece, nextLocalPosition);

        // If the piece reaches the end, set isFinished to true
        if (nextLocalPosition == MAX_LOCAL_POSITION - 1) {
            setFinished(piece);
        }
    }
}
