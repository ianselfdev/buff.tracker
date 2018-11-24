import { _sendStartGameTrs, _sendEndGameTrs } from './gamestats';

/*eslint-disable no-undef*/

let matchId = 1;
let currentGame = null;

const dotaFeatures = [
    'kill',
    'death',
    'hero_ability_used',
    'game_state_changed',
    'match_state_changed',
    'match_detected',
    'match_ended',
    'daytime_changed',
    'ward_purchase_cooldown_changed',
    'assist',
    'death',
    'cs',
    'roster',
    'hero_ability_skilled',
    'hero_ability_used',
    'hero_ability_changed',
    'xpm',
    'gpm',
];

const dotaParams = {
    gameStarted: undefined,
    gameEnded: undefined,
    gameInProcess: undefined,

    kills: 0,
    deaths: 0,
    assists: 0,

    lastHits: 0,
    denies: 0,

    xpm: 0,
    gpm: 0,

    rankedGame: undefined,

    playerTeam: undefined,

    matchId: undefined,
    allPlayers: undefined,

    steamId: undefined,
};

export const _getDotaEvents = (senderId, passphrase) => {
    overwolf.games.events.onError.addListener(function(info) {
        if (currentGame == 'Dota 2') {
            console.log('Error: ' + JSON.stringify(info));
        }
    });

    overwolf.games.events.onInfoUpdates2.addListener(function(info) {
        if (currentGame == 'Dota 2') {
            var log = 'Info UPDATE: ' + JSON.stringify(info);

            if (info.info && info.info.roster && info.info.roster.players) {
                console.log(info.info.roster.players);
                dotaParams.allPlayers = JSON.parse(info.info.roster.players);
            }
        }
    });

    overwolf.games.events.onNewEvents.addListener(function(info) {
        if (currentGame == 'Dota 2') {
            var log = 'EVENT FIRED: ' + JSON.stringify(info);

            for (var i = info.events.length - 1; i >= 0; i--) {
                var data_to_object = JSON.parse(info.events[i].data);

                // Switch event name
                switch (info.events[i].name) {
                    case 'match_detected':
                        console.log('INTERESTING IF EVER HAPPENS!');

                        dotaParams.allPlayers =
                            data_to_object.match_detected.playersInfo;

                        dotaParams.allPlayers.forEach((player, index) => {
                            if (player.isLocalPlayer == true) {
                                dotaParams.playerTeam = player.faction;
                            }
                        });

                        if (data_to_object.gameMode === 'AllPickRanked') {
                            dotaParams.rankedGame = true;
                        } else {
                            dotaParams.rankedGame = false;
                        }

                        break;

                    case 'match_state_changed':
                        console.log('MATCH STATE CHANGED!');

                        if (
                            !dotaParams.gameStarted &&
                            !dotaParams.gameInProcess &&
                            data_to_object.match_state ==
                                'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS'
                        ) {
                            console.log(
                                'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS!',
                            );

                            dotaParams.gameStarted = data_to_object;
                        }

                        if (
                            data_to_object.match_state ==
                            'DOTA_GAMERULES_STATE_STRATEGY_TIME'
                        ) {
                            dotaParams.gameInProcess = false;
                            dotaParams.gameStarted = undefined;
                            dotaParams.gameEnded = undefined;
                        }

                        break;

                    case 'match_ended':
                        console.log('MATCH ENDED');

                        dotaParams.gameEnded = data_to_object;
                        // Send transaction for Game Ended
                        if (
                            matchId &&
                            dotaParams.gameEnded &&
                            dotaParams.gameInProcess
                        ) {
                            console.log('GAME END');

                            var winnerTeam = dotaParams.gameEnded.winner;
                            var isWinner;

                            if (dotaParams.allPlayers) {
                                dotaParams.allPlayers.forEach(function(player) {
                                    if (player.steamId === dotaParams.steamId) {
                                        if (player.team == 2) {
                                            dotaParams.playerTeam = 'radiant';
                                        } else if (player.team == 3) {
                                            dotaParams.playerTeam = 'dire';
                                        } else {
                                            dotaParams.playerTeam = undefined;
                                        }
                                    }
                                });
                            }

                            dotaParams.kills = parseInt(dotaParams.kills)
                                ? parseInt(dotaParams.kills)
                                : 0;
                            dotaParams.assists = parseInt(dotaParams.assists)
                                ? parseInt(dotaParams.assists)
                                : 0;
                            dotaParams.deaths = parseInt(dotaParams.deaths)
                                ? parseInt(dotaParams.deaths)
                                : 0;

                            dotaParams.lastHits = parseInt(dotaParams.lastHits)
                                ? parseInt(dotaParams.lastHits)
                                : 0;
                            dotaParams.denies = parseInt(dotaParams.denies)
                                ? parseInt(dotaParams.denies)
                                : 0;

                            dotaParams.gmp = parseInt(dotaParams.gmp);
                            dotaParams.xpm = parseInt(dotaParams.xpm);

                            var kda =
                                (dotaParams.kills + dotaParams.assists) /
                                (dotaParams.deaths + 1);

                            var reward = 0;

                            if (dotaParams.playerTeam == winnerTeam) {
                                isWinner = true;
                            } else {
                                isWinner = false;
                            }

                            if (kda >= 4.0) reward += 15;
                            if (kda >= 3.7 && kda <= 3.9) reward += 13;
                            if (kda >= 3.5 && kda <= 3.6) reward += 11;
                            if (kda >= 3.2 && kda <= 3.4) reward += 8;
                            if (kda >= 2.9 && kda <= 3.1) reward += 4;
                            if (kda >= 2.6 && kda <= 2.8) reward += 3;
                            if (kda >= 1.5 && kda <= 2.5) reward += 2;

                            if (dotaParams.xpm >= 551) reward += 15;
                            if (dotaParams.xpm >= 501 && dotaParams.xpm <= 550)
                                reward += 13;
                            if (dotaParams.xpm >= 451 && dotaParams.xpm <= 500)
                                reward += 10;
                            if (dotaParams.xpm >= 401 && dotaParams.xpm <= 450)
                                reward += 8;
                            if (dotaParams.xpm >= 351 && dotaParams.xpm <= 400)
                                reward += 7;
                            if (dotaParams.xpm >= 301 && dotaParams.xpm <= 350)
                                reward += 6;
                            if (dotaParams.xpm >= 250 && dotaParams.xpm <= 300)
                                reward += 4;

                            if (dotaParams.gpm >= 551) reward += 15;
                            if (dotaParams.gpm >= 501 && dotaParams.gpm <= 550)
                                reward += 13;
                            if (dotaParams.gpm >= 451 && dotaParams.gpm <= 500)
                                reward += 10;
                            if (dotaParams.gpm >= 401 && dotaParams.gpm <= 450)
                                reward += 8;
                            if (dotaParams.gpm >= 351 && dotaParams.gpm <= 400)
                                reward += 7;
                            if (dotaParams.gpm >= 301 && dotaParams.gpm <= 350)
                                reward += 6;
                            if (dotaParams.gpm >= 250 && dotaParams.gpm <= 300)
                                reward += 4;

                            if (dotaParams.lastHits >= 250) reward += 5;
                            if (
                                dotaParams.lastHits >= 225 &&
                                dotaParams.lastHits <= 249
                            )
                                reward += 5;
                            if (
                                dotaParams.lastHits >= 200 &&
                                dotaParams.lastHits <= 224
                            )
                                reward += 4;
                            if (
                                dotaParams.lastHits >= 175 &&
                                dotaParams.lastHits <= 199
                            )
                                reward += 4;
                            if (
                                dotaParams.lastHits >= 150 &&
                                dotaParams.lastHits <= 174
                            )
                                reward += 3;
                            if (
                                dotaParams.lastHits >= 125 &&
                                dotaParams.lastHits <= 149
                            )
                                reward += 3;
                            if (
                                dotaParams.lastHits >= 100 &&
                                dotaParams.lastHits <= 124
                            )
                                reward += 2;

                            if (dotaParams.denies >= 70) reward += 5;
                            if (
                                dotaParams.denies >= 60 &&
                                dotaParams.denies <= 69
                            )
                                reward += 5;
                            if (
                                dotaParams.denies >= 50 &&
                                dotaParams.denies <= 59
                            )
                                reward += 4;
                            if (
                                dotaParams.denies >= 40 &&
                                dotaParams.denies <= 49
                            )
                                reward += 4;
                            if (
                                dotaParams.denies >= 30 &&
                                dotaParams.denies <= 39
                            )
                                reward += 3;
                            if (
                                dotaParams.denies >= 20 &&
                                dotaParams.denies <= 29
                            )
                                reward += 3;
                            if (
                                dotaParams.denies >= 10 &&
                                dotaParams.denies <= 19
                            )
                                reward += 2;

                            if (isWinner) reward += 45;

                            var gamedata = {
                                matchId: 1,
                                gameId: 7314,
                                rankedGame: true,
                                xpm: dotaParams.xpm,
                                gpm: dotaParams.gpm,
                                kda: kda,
                                last_hits: dotaParams.lastHits,
                                denies: dotaParams.denies,
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

                            _sendEndGameTrs(endGameTrs);

                            dotaParams.gameInProcess = false;
                            dotaParams.gameStarted = undefined;
                            dotaParams.gameEnded = undefined;
                            dotaParams.kills = 0;
                            dotaParams.assists = 0;
                            dotaParams.deaths = 0;
                            dotaParams.lastHits = 0;
                            dotaParams.denies = 0;
                            dotaParams.playerTeam = undefined;
                            dotaParams.allPlayers = undefined;
                        }

                        break;

                    case 'game_state_changed':
                        if (!matchId && data_to_object.match_id) {
                            matchId = data_to_object.match_id;
                        }

                        if (
                            !dotaParams.steamId &&
                            data_to_object.player_steam_id
                        ) {
                            dotaParams.steamId = data_to_object.player_steam_id;
                        }
                        break;

                    case 'kill':
                        dotaParams.kills = data_to_object.kills;
                        break;

                    case 'assist':
                        dotaParams.assists = data_to_object.assists;
                        break;

                    case 'death':
                        dotaParams.deaths = data_to_object.deaths;
                        break;

                    case 'xpm':
                        dotaParams.xpm = data_to_object.xpm;
                        break;

                    case 'gpm':
                        dotaParams.gpm = data_to_object.gpm;
                        break;

                    case 'cs':
                        dotaParams.lastHits = data_to_object.last_hits;
                        dotaParams.denies = data_to_object.denies;
                        break;
                }

                // Send transaction for Game Started
                if (
                    matchId &&
                    dotaParams.gameStarted &&
                    !dotaParams.gameInProcess
                ) {
                    var gamedata = {
                        gameId: 7314,
                        matchId: matchId,
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

                    dotaParams.gameInProcess = true;
                }
            }
        }
    });
};

export const setDotaFeatures = () => {
    console.log('Setting features for Dota');
    overwolf.games.events.setRequiredFeatures(dotaFeatures, function(info) {
        if (info.status == 'error') {
            window.setTimeout(setDotaFeatures, 2000);
            return;
        }
    });
};
