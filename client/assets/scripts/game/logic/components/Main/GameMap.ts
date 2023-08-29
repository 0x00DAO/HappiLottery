import { _decorator, math, Node } from 'cc';
import { AirPlaneType, FLY_TO_AIRPORT, MAX_PIECES_PER_PLAYER } from '../../../const/GameConst';
import { OnEvent } from '../../../core/event/decorators/OnEventDecorator';
import { GameObject } from '../../../core/game/GameObject';
import { PromiseUtil } from '../../../core/utils/PromiseUtil';
import { ViewUtil } from '../../../core/utils/ViewUtil';
import { GameEventContractAirVoyagePieceMoved } from '../../contracts/events/GameEventContractAirVoyagePieceMoved';
import { GameEventContractAirVoyagePlayerFinished } from '../../contracts/events/GameEventContractAirVoyagePlayerFinished';
import { gameAccountData } from '../../data/GameAccountData';
import { gameData } from '../../data/GameData';
import { Prefabs } from '../../enum/Prefabs';
import { GameEventGameOpened } from '../../events/GameEventGameOpened';
import { AirPlane } from '../AirPlane/AirPlane';
import { AirPort } from '../AirPort/AirPort';
import { Toast } from '../Toast/Toast';
const { menu, ccclass, property } = _decorator;

@ccclass('GameMap')
@menu('game/logic/components/Main/GameMap')
export class GameMap extends GameObject {
    static prefabName(): string {
        return 'GameMap';
    }

    static async createAsync(): Promise<GameMap | null> {
        const node: Node | null = await ViewUtil.createPrefabAsync(Prefabs.GameMap);
        if (!node) return null;
        return node.getComponent(GameMap)!;
    }

    @property(Node)
    public sky: Node = null!;

    load() {
        // this.scheduleOnce(() => this.testPlane(), 2);
    }

    public clearAllPlanes() {
        this.sky.removeAllChildren();
        AirPort.clearAllAirports();
    }

    public async clear() {
        this.clearAllPlanes();

        const game = gameData.currentGame;
        if (game) {
            const players = game!.playersInGame;
            players.forEach((player) => player.landAllPlanes());
        }
        gameData.endGame();

        return Promise.resolve();
    }

    @OnEvent(GameEventGameOpened.eventAsync)
    private async onGameOpened() {
        await this.refreshMap();

        await this.checkWhoseTurn();
    }

    private async refreshMap() {
        if (!gameData.currentGame) {
            return Promise.resolve();
        }
        const players = gameData.currentGame.playersInGame;
        // parking all planes in map
        players.forEach((player) => {
            player.myPieces.forEach((piece) => {
                piece.gotoInitPosition();
            });
        });
    }

    private async testPlane() {
        for (let i = 0; i < MAX_PIECES_PER_PLAYER; i++) {
            const red = AirPlane.create(AirPlaneType.Red);
            red.flyTo(FLY_TO_AIRPORT);

            const yellow = AirPlane.create(AirPlaneType.Yellow);
            yellow.flyTo(FLY_TO_AIRPORT);

            const blue = AirPlane.create(AirPlaneType.Blue);
            blue.flyTo(FLY_TO_AIRPORT);

            const green = AirPlane.create(AirPlaneType.Green);
            green.flyTo(FLY_TO_AIRPORT);

            for (let i = 0; i < 59; i++) {
                let indexRed = i + 0;
                let indexYellow = i + 13;
                let indexBlue = i + 26;
                let indexGreen = i + 39;
                await PromiseUtil.sleep(1);
                if (i === 49 || i === 50 || i === 51) {
                    continue;
                }

                red.flyTo(
                    i === 58
                        ? FLY_TO_AIRPORT
                        : i < 51
                        ? indexRed % 52
                        : red.getTargetPoint() + i - 52
                );

                yellow.flyTo(
                    i === 58
                        ? FLY_TO_AIRPORT
                        : i < 51
                        ? indexYellow % 52
                        : yellow.getTargetPoint() + i - 52
                );

                blue.flyTo(
                    i === 58
                        ? FLY_TO_AIRPORT
                        : i < 51
                        ? indexBlue % 52
                        : blue.getTargetPoint() + i - 52
                );

                green.flyTo(
                    i === 58
                        ? FLY_TO_AIRPORT
                        : i < 51
                        ? indexGreen % 52
                        : green.getTargetPoint() + i - 52
                );
            }
        }
    }

    private async checkWhoseTurn() {
        if (!gameData.currentGame || !gameData.currentGame.isPlaying) {
            return Promise.resolve();
        }

        const isMyTurn = await gameData.currentGame.isMyTurn();
        if (isMyTurn) {
            Toast.showMessage('Your turn, please roll the dice!');
        } else {
            Toast.showMessage('please wait for other player roll the dice!');
        }
    }

    @OnEvent(GameEventContractAirVoyagePieceMoved.eventAsync)
    private async onPieceMoved(gameId: any, player: string, pieceIndex: any, from: any, to: any) {
        const game = gameData.currentGame;
        if (!game) {
            return Promise.resolve();
        }
        const playerDto = game.getPlayerByAddress(player);
        if (!playerDto) {
            return Promise.resolve();
        }
        const index = parseInt(pieceIndex.toString());
        const piece = game.getPieceByIndex(index);
        if (!piece) {
            return Promise.resolve();
        }

        if (piece.player !== player) {
            return Promise.resolve();
        }

        const toPos = parseInt(to.toString());
        piece.airplane.flyTo(toPos);

        await this.checkWhoseTurn();
    }

    @OnEvent(GameEventContractAirVoyagePlayerFinished.eventAsync)
    private async onPlayerFinished(gameId: any, player: string) {
        const somebody = player === gameAccountData.address ? 'You' : player;
        Toast.showMessage(`${somebody} finished!`);
        return Promise.resolve();
    }

    public getPositionByIndex(index: number): math.Vec3 | null {
        const pointName = `runway_${index}`;
        const runwayNode: Node | null = ViewUtil.findNodeInChildren(this.node, pointName);
        if (!runwayNode) {
            return null;
        }
        const point = runwayNode.getChildByName('point');
        if (!point) {
            return null;
        }

        const pos = ViewUtil.calculateASpaceToBSpacePos(point, this.sky);
        return pos;
    }
}
