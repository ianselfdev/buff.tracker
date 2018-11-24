import { _sendStartGameTrs, _sendEndGameTrs } from './gamestats';

/*eslint-disable no-undef*/

let currentGame = null;
let matchId = 1;

const lolFeatures = [
    'summoner_info',
    'gameMode',
    'teams',
    'matchState',
    'kill',
    'death',
    'respawn',
    'assist',
    'minions',
    'level',
    'abilities',
    'announcer',
];

const lolParams = {
    gameStarted: undefined,
    gameEnded: undefined,
    gameInProcess: undefined,

    kills: 0,
    deaths: 0,
    assists: 0,

    minionKills: 0,

    level: 0,

    rankedGame: undefined,
    victory: undefined,

    matchId: undefined,
    allPlayers: undefined,
};

export const _getLolEvents = (senderId, passphrase) => {
    overwolf.games.events.onError.addListener(function(info) {
        if (currentGame == 'League of Legends') {
            console.log('Error: ' + JSON.stringify(info));
        }
    });

    overwolf.games.events.onInfoUpdates2.addListener(function(info) {
        if (currentGame == 'League of Legends') {
            var log = 'FEATURE: ' + JSON.stringify(info);

            var data_to_object = info;

            switch (data_to_object.feature) {
                case 'gameMode':
                    console.log('GAME MODE');
                    if (
                        data_to_object.info &&
                        data_to_object.game_info &&
                        data_to_object.info.game_info.gameMode
                    ) {
                        console.log(data_to_object.info.game_info.gameMode);
                        lolParams.rankedGame = true;
                    }

                case 'matchState':
                    if (
                        !lolParams.gameStarted &&
                        !lolParams.gameInProcess &&
                        data_to_object.info &&
                        data_to_object.info.game_info &&
                        data_to_object.info.game_info.matchStarted
                    ) {
                        console.log('MATCH STARTED');
                        lolParams.gameStarted = true;
                    }

                    if (
                        lolParams.gameStarted &&
                        lolParams.gameInProcess &&
                        data_to_object.info &&
                        data_to_object.info.game_info &&
                        data_to_object.info.game_info.matchOutcome
                    ) {
                        console.log('MATCH ENDED');
                        lolParams.victory =
                            data_to_object.info.game_info.matchOutcome;
                        lolParams.gameEnded = true;

                        if (lolParams.gameEnded && lolParams.gameInProcess) {
                            console.log('GAME END');

                            var isWinner;

                            if (lolParams.victory == 'win') {
                                isWinner = true;
                            } else {
                                isWinner = false;
                            }

                            lolParams.kills = parseInt(lolParams.kills)
                                ? parseInt(lolParams.kills)
                                : 0;
                            lolParams.assists = parseInt(lolParams.assists)
                                ? parseInt(lolParams.assists)
                                : 0;
                            lolParams.deaths = parseInt(lolParams.deaths)
                                ? parseInt(lolParams.deaths)
                                : 0;

                            lolParams.level = parseInt(lolParams.level)
                                ? parseInt(lolParams.level)
                                : 0;

                            lolParams.minionKills = parseInt(
                                lolParams.minionKills,
                            )
                                ? parseInt(lolParams.minionKills)
                                : 0;

                            var kda =
                                (lolParams.kills + lolParams.assists) /
                                (lolParams.deaths + 1);

                            var reward = 0;

                            if (kda >= 4.0) reward += 20;
                            if (kda >= 3.7 && kda <= 3.9) reward += 17;
                            if (kda >= 3.5 && kda <= 3.6) reward += 14;
                            if (kda >= 3.2 && kda <= 3.4) reward += 12;
                            if (kda >= 2.9 && kda <= 3.1) reward += 7;
                            if (kda >= 2.6 && kda <= 2.8) reward += 5;
                            if (kda >= 1.5 && kda <= 2.5) reward += 2;

                            if (lolParams.minionKills >= 300) reward += 20;
                            if (
                                lolParams.minionKills >= 276 &&
                                lolParams.minionKills <= 299
                            )
                                reward += 17;
                            if (
                                lolParams.minionKills >= 251 &&
                                lolParams.minionKills <= 275
                            )
                                reward += 14;
                            if (
                                lolParams.minionKills >= 226 &&
                                lolParams.minionKills <= 250
                            )
                                reward += 12;
                            if (
                                lolParams.minionKills >= 201 &&
                                lolParams.minionKills <= 225
                            )
                                reward += 10;
                            if (
                                lolParams.minionKills >= 176 &&
                                lolParams.minionKills <= 200
                            )
                                reward += 7;
                            if (
                                lolParams.minionKills >= 151 &&
                                lolParams.minionKills <= 175
                            )
                                reward += 4;
                            if (
                                lolParams.minionKills >= 126 &&
                                lolParams.minionKills <= 150
                            )
                                reward += 2;

                            if (lolParams.level >= 18) reward += 15;
                            if (lolParams.level >= 16 && lolParams.level <= 17)
                                reward += 12;
                            if (lolParams.level >= 14 && lolParams.level <= 15)
                                reward += 10;
                            if (lolParams.level >= 12 && lolParams.level <= 13)
                                reward += 8;
                            if (lolParams.level >= 10 && lolParams.level <= 11)
                                reward += 6;

                            if (isWinner) reward += 45;

                            var gamedata = {
                                matchId: 1,
                                gameId: 5426,
                                rankedGame: true,
                                kda: kda,
                                minion_kills: lolParams.minionKills,
                                level: lolParams.level,
                                victory: isWinner,
                                reward: reward,
                            };

                            var recipientId = senderId;
                            var secret = passphrase;

                            console.log('SENDING END GAME TRS');

                            var endGameTrs = JSON.stringify({
                                gamedata: gamedata,
                                recipientId: recipientId,
                                secret: secret,
                            });

                            console.log(endGameTrs);

                            _sendEndGameTrs(endGameTrs);

                            lolParams.gameInProcess = false;
                            lolParams.gameStarted = undefined;
                            lolParams.gameEnded = undefined;
                            lolParams.kills = 0;
                            lolParams.assists = 0;
                            lolParams.deaths = 0;
                            lolParams.minionKills = 0;
                            lolParams.level = 0;
                        }
                    }
                    break;

                case 'minions':
                    console.log('minions');
                    lolParams.minionKills =
                        data_to_object.info.game_info.minionKills;
                    console.log(lolParams.minionKills);
                    break;

                case 'level':
                    console.log('level');
                    lolParams.level = data_to_object.info.level.level;
                    console.log(lolParams.level);
                    break;

                case 'kill':
                    console.log('kill');
                    lolParams.kills = data_to_object.info.game_info.kills;
                    console.log(lolParams.kills);
                    break;

                case 'death':
                    console.log('death');
                    lolParams.deaths = data_to_object.info.game_info.deaths;
                    console.log(lolParams.deaths);
                    break;
            }

            if (lolParams.gameStarted && !lolParams.gameInProcess) {
                var gamedata = {
                    gameId: 5426,
                    matchId: 1,
                    rankedGame: true,
                };

                var recipientId = senderId;
                var secret = passphrase;

                var startGameTrs = JSON.stringify({
                    gamedata: gamedata,
                    recipientId: recipientId,
                    secret: secret,
                });

                _sendStartGameTrs(startGameTrs);

                lolParams.gameInProcess = true;
            }
        }
    });

    overwolf.games.events.onNewEvents.addListener(function(info) {
        if (currentGame == 'League of Legends') {
            var log = 'EVENT FIRED: ' + JSON.stringify(info);

            for (var i = info.events.length - 1; i >= 0; i--) {
                switch (info.events[i].name) {
                    case 'assist':
                        lolParams.assists = JSON.parse(
                            info.events[i].data,
                        ).count;
                        break;
                }
            }
        }
    });
};

export const setLoLFeatures = () => {
    console.log('Setting features for LoL');
    overwolf.games.events.setRequiredFeatures(lolFeatures, function(info) {
        if (info.status == 'error') {
            window.setTimeout(setLoLFeatures, 2000);
            return;
        }
    });
};
