import { _getDotaEvents, setDotaFeatures } from './getDotaEvents';
import { _getLolEvents, setLoLFeatures } from './getLolEvents';

/*eslint-disable no-undef*/

let currentGame = null;

export const gameLaunched = (gameInfoResult) => {
    if (!gameInfoResult) {
        return undefined;
    }

    if (!gameInfoResult.gameInfo) {
        return undefined;
    }

    if (!gameInfoResult.runningChanged && !gameInfoResult.gameChanged) {
        return undefined;
    }

    if (!gameInfoResult.gameInfo.isRunning) {
        return undefined;
    }

    if (
        Math.floor(gameInfoResult.gameInfo.id / 10) != 7314 &&
        Math.floor(gameInfoResult.gameInfo.id / 10) != 5426
    ) {
        return undefined;
    }

    if (gameInfoResult.gameInfo.title) {
        currentGame = gameInfoResult.gameInfo.title;

        console.log(currentGame + ' Launched!');

        return currentGame;
    }

    return undefined;
};

export const gameRunning = (gameInfo) => {
    if (!gameInfo) {
        return undefined;
    }

    if (!gameInfo.isRunning) {
        return undefined;
    }

    if (
        Math.floor(gameInfo.id / 10) != 7314 &&
        Math.floor(gameInfo.id / 10) != 5426
    ) {
        return undefined;
    }

    if (gameInfo.title) {
        var currentGame = gameInfo.title;

        console.log(currentGame + ' Launched!');

        return currentGame;
    }

    return undefined;
};

export const _onGameInfoUpdated = () => {
    overwolf.games.onGameInfoUpdated.addListener(function(res) {
        console.log(
            'onGameInfoUpdated: ' +
                (res.gameInfo && res.gameInfo.title
                    ? res.gameInfo.title
                    : 'no title'),
        );
        var gameTitle = gameLaunched(res);

        currentGame = gameTitle ? gameTitle : currentGame;

        if (gameTitle) {
            if (gameTitle === 'Dota 2') {
                console.log('DOTA 2 GAME INFO UPDATED');
                _getDotaEvents();
                setTimeout(setDotaFeatures, 1000);
            } else if (gameTitle === 'League of Legends') {
                console.log('LOL GAME INFO UPDATED');
                _getLolEvents();
                setTimeout(setLoLFeatures, 1000);
            }
        }
    });
};

export const _getRunningGameInfo = () => {
    overwolf.games.getRunningGameInfo(function(res) {
        console.log(
            'getRunningGameInfo: ' +
                (res && res.title ? res.title : 'no title'),
        );
        var gameTitle = gameRunning(res);

        currentGame = gameTitle ? gameTitle : currentGame;

        if (gameTitle) {
            if (gameTitle === 'Dota 2') {
                console.log('DOTA 2 GAME RUNNING GAME INFO');
                _getDotaEvents();
                setTimeout(setDotaFeatures, 1000);
            } else if (gameTitle === 'League of Legends') {
                console.log('LOL GAME RUNNING GAME INFO');
                _getLolEvents();
                setTimeout(setLoLFeatures, 1000);
            }
        }
    });
};
