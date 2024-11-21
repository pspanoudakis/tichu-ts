import { PlayerKey } from "@tichu-ts/shared/game_logic/PlayerKeys";
import { BusinessError } from "./utils";

export class GameClient {
    readonly playerKey: PlayerKey;
    private _nickname = '';
    private _hasJoinedGame = false;
    private _hasPressedStart = false;

    constructor(playerKey: PlayerKey) {
        this.playerKey = playerKey;
    }

    get nickname() {
        return this._nickname;
    }
    
    get hasPressedStart() {
        return this._hasPressedStart;
    }

    set nickname(n: string) {
        if (!this._hasJoinedGame)
            throw new BusinessError(
                'Cannot set nickname before client joins.')
            ;
        if (this._nickname)
            throw new BusinessError(
                'Nickname has already been set.'
            );
        this._nickname = n;
    }
    
    set hasPressedStart(b: boolean) {
        if (b && this.hasPressedStart)
            throw new BusinessError(
                'This client has already pressed start.')
            ;
        else if (!b && !this._hasPressedStart)
            throw new BusinessError(
                'This client has not pressed start.'
            );
        this._hasPressedStart = b;
    }

    get hasJoinedGame() {
        return this._hasJoinedGame;
    }

    joinGame() {
        if (this._hasJoinedGame)
            throw new BusinessError('This client has already joined.');
        this._hasJoinedGame = true;
    }
};
