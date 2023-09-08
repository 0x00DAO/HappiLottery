export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";

export const MAX_PIECES_PER_PLAYER = 1;

export const MAX_PLAYERS = 2;

export const FLY_TO_AIRPORT = -1;

export const TIME_INTERVAL_BETWEEN_ROLL = 90;

export enum GameStatus {
  Idle,
  Waiting,
  Playing,
  Finished,
}

export enum GamePlayerStatus {
  Idle,
  Playing,
  Finished,
  Quit,
}

export enum PieceStatus {
  Idle,
  Playing,
  Finished,
}

export enum AirPlaneType {
  Red,
  Yellow,
  Blue,
  Green,
}

export enum Directions {
  Right,
  Bottom,
  Left,
  Top,
}
