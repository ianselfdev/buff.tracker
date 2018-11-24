window.addEventListener('load', function () {
  // overwolf.windows.getCurrentWindow(function(result) {
  //   if(result.status === "success") {
  //     overwolf.windows.changeSize(result.window.id, 600, 900, function(res) {
  //       console.log(res);
  //     })
  //   }
  // });
  console.log('Buff App Started');

  var buffTitle = document.getElementById('title');
  var buffInfo = document.getElementById('info');
  var buffExplanation = document.getElementById('explanation');

  var applyForm = document.getElementById('applyForm');

  var senderIdInput = document.getElementById('senderId');
  var passphraseInput = document.getElementById('passphrase');
  var validButton = document.getElementById('validUser');

  var lorchuButton = document.getElementById('lorchu');
  console.log(lorchuButton);

  var exitButton = document.getElementById('exit');

  var loggedIn,
    senderId,
    passphrase,
    publicKey,
    currentGame;

  var dotaParams = {
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

  var lolParams = {
    gameStarted: undefined,
    gameEnded: undefined,
    gameInProcess: undefined,

    kills: 0,
    deaths: 0,
    assists: 0,

    minionKills: 0,
    neutralMinionKills: 0,

    level: 0,

    rankedGame: undefined,
    victory: undefined,

    matchId: undefined,
    allPlayers: undefined
  };

  var dotaFeatures = [
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
    'gpm'
  ];

  var lolFeatures = [
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
    'announcer'
  ];


  var matchId = 1;

  validButton.onclick = function () {
    if (
      senderIdInput.value != '' &&
      passphraseInput.value != ''
    ) {
      senderId = senderIdInput.value;
      passphrase = passphraseInput.value;

      validSenderId(senderId, function (data) {
        if (data.verified === true) {
          validUser(publicKey, passphrase);
        } else {
          alert('Invalid address');
        }
      });
    } else if (passphraseInput.value != '' &&
      senderIdInput.value == '') {
      alert('Missing address');
    } else if (senderIdInput.value != '' &&
      passphraseInput.value == '') {
      alert('Missing passphrase');
    } else {
      alert('Missing fields');
    }
  }

  lorchuButton.onclick = function () {
    senderId = undefined;
    passphrase = undefined;
    publicKey = undefined;

    buffTitle.innerText = 'Buff Achievement Tracker';
    buffInfo.innerText = 'Welcome to Buff Achievement Tracker';
    buffExplanation.style.visibility = 'visible';

    applyForm.style.visibility = 'visible';

    lorchuButton.style.visibility = 'hidden';
    exitButton.style.visibility = 'hidden';

    senderIdInput.value = '';
    passphraseInput.value = '';

    loggedIn = false;
  }

  exitButton.onclick = function () {
    window.close();
  }

  // without signatures for now
  function sendStartGameTrs(tx)  {
    var xhr = new XMLHttpRequest();
    var url = 'http://52.15.131.50:4000/api/game-start';
    xhr.open('put', url, true);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(JSON.parse(xhr.responseText));
      }
    };
    console.log('SEND START GAME TX');
    xhr.send(tx);
  }

  function sendEndGameTrs(tx) {
    var xhr = new XMLHttpRequest();
    var url = 'http://52.15.131.50:4000/api/game-end';
    xhr.open('put', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(JSON.parse(xhr.responseText));
      }
    };
    console.log('SEND END GAME TX');
    xhr.send(tx);
  }

  function changeState(state) {
    var xhr = new XMLHttpRequest();
    var url = 'http://52.15.131.50:4000/api/game-start/state';
    xhr.open('put', url, true);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(JSON.parse(xhr.responseText));
      }
    };
    xhr.send(state);
  }

  function validSenderId(senderId, cb) {
    var xhr = new XMLHttpRequest();
    var url = `http://52.15.131.50:4000/api/accounts/getPublicKey?address=${senderId}`;
    xhr.open('get', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);

        if (response.success == true && response.publicKey) {
          publicKey = response.publicKey;
          return cb ({ verified: true });
        }
        return cb ({verified: false});
      }
    }
    xhr.send({ address: senderId });
  }

  function validUser(userPubKey, userSecret, cb) {
    var xhr = new XMLHttpRequest();
    var url = 'http://52.15.131.50:4000/api/game-start/verify';
    xhr.open('put', url, true);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);

        if (response.success == true && response.verified == true) {
          passphrase = userSecret;
          alert('Successfully logged in!');

          buffTitle.innerText = 'Buff Tracking in Progress';
          buffInfo.innerText = 'You can start playing your favorite game!';
          buffExplanation.style.visibility = 'hidden';

          applyForm.style.visibility = 'hidden';

          lorchuButton.style.visibility = 'visible';
          exitButton.style.visibility = 'visible';

          loggedIn = true;
        } else {
          alert(response.error);
        }
      }
    }

    var req = JSON.stringify({ publicKey: userPubKey, passphrase: userSecret });
    xhr.send(req);
  }

  function getLolEvents() {
    console.log('REGISTERING LoL EVENTS');
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
              !(lolParams.gameStarted) &&
              !(lolParams.gameInProcess) &&
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
              lolParams.victory = data_to_object.info.game_info.matchOutcome;
              lolParams.gameEnded = true;

              if (lolParams.gameEnded && lolParams.gameInProcess) {
                console.log('GAME END');

                var isWinner;

                if (lolParams.victory == 'win') {
                  isWinner = true;
                } else {
                  isWinner = false;
                }

                lolParams.kills = parseInt(lolParams.kills) ? parseInt(lolParams.kills) : 0;
                lolParams.assists = parseInt(lolParams.assists) ? parseInt(lolParams.assists) : 0;
                lolParams.deaths = parseInt(lolParams.deaths) ? parseInt(lolParams.deaths) : 0;

                lolParams.level = parseInt(lolParams.level) ? parseInt(lolParams.level) : 0;

                lolParams.minionKills = parseInt(lolParams.minionKills) ? parseInt(lolParams.minionKills) : 0;

                if (lolParams.deaths == 0){lolParams.deaths +=1};
                var kda = (lolParams.kills + lolParams.assists) / (lolParams.deaths);

                var reward = 0;

                if (kda >= 4.0) reward += 20;
                if (kda >= 3.7 && kda <= 3.9) reward += 17;
                if (kda >= 3.5 && kda <= 3.6) reward += 14;
                if (kda >= 3.2 && kda <= 3.4) reward += 12;
                if (kda >= 2.9 && kda <= 3.1) reward += 7;
                if (kda >= 2.6 && kda <= 2.8) reward += 5;
                if (kda >= 1.5 && kda <= 2.5) reward += 2;

                var creepScore = (lolParams.minionKills + lolParams.neutralMinionKills);

                if (creepScore >= 300) reward += 20;
                if (creepScore >= 276 && creepScore <= 299) reward += 17;
                if (creepScore >= 251 && creepScore <= 275) reward += 14;
                if (creepScore >= 226 && creepScore <= 250) reward += 12;
                if (creepScore >= 201 && creepScore <= 225) reward += 10;
                if (creepScore >= 176 && creepScore <= 200) reward += 7;
                if (creepScore >= 151 && creepScore <= 175) reward += 4;
                if (creepScore >= 126 && creepScore <= 150) reward += 2;

                if (lolParams.level >= 18) reward += 15;
                if (lolParams.level >= 16 && lolParams.level <= 17) reward += 12;
                if (lolParams.level >= 14 && lolParams.level <= 15) reward += 10;
                if (lolParams.level >= 12 && lolParams.level <= 13) reward += 8;
                if (lolParams.level >= 10 && lolParams.level <= 11) reward += 6;

                if (isWinner) reward += 45;

                var gamedata = {
                  matchId: 1,
                  gameId: 5426,
                  rankedGame: true,
                  kda: kda,
                  minion_kills: creepScore,
                  level: lolParams.level,
                  victory: isWinner,
                  reward: reward
                };

                var recipientId = senderId;
                var secret = passphrase;

                console.log('SENDING END GAME TRS');

                var endGameTrs = JSON.stringify({
                  gamedata: gamedata,
                  recipientId: recipientId,
                  secret: secret
                });

                console.log(endGameTrs);

                sendEndGameTrs(endGameTrs);

                lolParams.gameInProcess = false;
                lolParams.gameStarted = undefined;
                lolParams.gameEnded = undefined;
                lolParams.kills = 0;
                lolParams.assists = 0;
                lolParams.deaths = 0;
                lolParams.minionKills = 0;
                lolParams.neutralMinionKills = 0;
                lolParams.level = 0;
              }
            }
            break;

          case 'minions':
            if (data_to_object.info.game_info.minionKills == undefined){

              lolParams.neutralMinionKills = data_to_object.info.game_info.neutralMinionKills;
              console.log('minions');
              console.log(lolParams.neutralMinionKills);
            }else if (data_to_object.info.game_info.neutralMinionKills == undefined){
                lolParams.minionKills = data_to_object.info.game_info.minionKills;
                console.log('minions');
                console.log(lolParams.minionKills);
            };
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

        if (lolParams.gameStarted && !(lolParams.gameInProcess)) {
          var gamedata = {
            gameId: 5426,
            matchId: 1,
            rankedGame: true
          }

          var recipientId = senderId;
          var secret = passphrase;

          var startGameTrs = JSON.stringify({
            gamedata: gamedata,
            recipientId: recipientId,
            secret: secret
          });

          sendStartGameTrs(startGameTrs);

          lolParams.gameInProcess = true;
        }
      }
    });

    overwolf.games.events.onNewEvents.addListener(function(info) {
      if (currentGame == 'League of Legends') {
        var log = 'EVENT FIRED: ' + JSON.stringify(info);

        for (var i = info.events.length - 1; i >= 0; i--) {

          switch(info.events[i].name) {
            case 'assist':
              lolParams.assists = JSON.parse(info.events[i].data).count;
              break;
          }
        }
      }
    });
  }

  function getDotaEvents() {
    overwolf.games.events.onError.addListener(function(info) {
      if (currentGame == 'Dota 2') {
        console.log('Error: ' + JSON.stringify(info));
      }
    });

    overwolf.games.events.onInfoUpdates2.addListener(function(info) {
      if (currentGame == 'Dota 2') {
        var log = 'Info UPDATE: ' + JSON.stringify(info);

        if(
          info.info &&
          info.info.roster &&
          info.info.roster.players
        ) {
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
          switch(info.events[i].name) {
            case 'match_detected':
              console.log('INTERESTING IF EVER HAPPENS!')

              dotaParams.allPlayers = data_to_object.match_detected.playersInfo

              dotaParams.allPlayers.forEach((player,index) => {
                if(player.isLocalPlayer == true) {
                  dotaParams.playerTeam = player.faction
                }
              })

              if (data_to_object.gameMode === 'AllPickRanked') {
                dotaParams.rankedGame = true;
              } else {
                dotaParams.rankedGame = false;
              }

              break;

            case 'match_state_changed':
              console.log('MATCH STATE CHANGED!')

              if (
                !(dotaParams.gameStarted) &&
                !(dotaParams.gameInProcess) &&
                data_to_object.match_state == 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS'
              ) {
                console.log('DOTA_GAMERULES_STATE_GAME_IN_PROGRESS!');

                dotaParams.gameStarted = data_to_object;
              }

              if (data_to_object.match_state == 'DOTA_GAMERULES_STATE_STRATEGY_TIME') {
                dotaParams.gameInProcess = false;
                dotaParams.gameStarted = undefined;
                dotaParams.gameEnded = undefined;
              }

              break;

            case 'match_ended':
              console.log('MATCH ENDED');

              dotaParams.gameEnded = data_to_object;
              // Send transaction for Game Ended
              if (matchId && dotaParams.gameEnded && dotaParams.gameInProcess) {
                console.log('GAME END');

                var winnerTeam = dotaParams.gameEnded.winner;
                var isWinner;

                if (dotaParams.allPlayers) {
                  dotaParams.allPlayers.forEach( function(player) {
                    if (player.steamId === dotaParams.steamId) {
                      if (player.team == 2) {
                        dotaParams.playerTeam = 'radiant';
                      }
                      else if (player.team == 3) {
                        dotaParams.playerTeam = 'dire';
                      }
                      else {
                        dotaParams.playerTeam = undefined;
                      }
                    }
                  });
                }

                dotaParams.kills = parseInt(dotaParams.kills) ? parseInt(dotaParams.kills) : 0;
                dotaParams.assists = parseInt(dotaParams.assists) ? parseInt(dotaParams.assists) : 0;
                dotaParams.deaths = parseInt(dotaParams.deaths) ? parseInt(dotaParams.deaths) : 0;

                dotaParams.lastHits = parseInt(dotaParams.lastHits) ? parseInt(dotaParams.lastHits) : 0;
                dotaParams.denies = parseInt(dotaParams.denies) ? parseInt(dotaParams.denies) : 0;

                dotaParams.gmp = parseInt(dotaParams.gmp);
                dotaParams.xpm = parseInt(dotaParams.xpm);

                var kda = (dotaParams.kills + dotaParams.assists) / (dotaParams.deaths + 1);

                var reward = 0;

                if(dotaParams.playerTeam == winnerTeam) {
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
                if (dotaParams.xpm >= 501 && dotaParams.xpm <= 550) reward += 13;
                if (dotaParams.xpm >= 451 && dotaParams.xpm <= 500) reward += 10;
                if (dotaParams.xpm >= 401 && dotaParams.xpm <= 450) reward += 8;
                if (dotaParams.xpm >= 351 && dotaParams.xpm <= 400) reward += 7;
                if (dotaParams.xpm >= 301 && dotaParams.xpm <= 350) reward += 6;
                if (dotaParams.xpm >= 250 && dotaParams.xpm <= 300) reward += 4;

                if (dotaParams.gpm >= 551) reward += 15;
                if (dotaParams.gpm >= 501 && dotaParams.gpm <= 550) reward += 13;
                if (dotaParams.gpm >= 451 && dotaParams.gpm <= 500) reward += 10;
                if (dotaParams.gpm >= 401 && dotaParams.gpm <= 450) reward += 8;
                if (dotaParams.gpm >= 351 && dotaParams.gpm <= 400) reward += 7;
                if (dotaParams.gpm >= 301 && dotaParams.gpm <= 350) reward += 6;
                if (dotaParams.gpm >= 250 && dotaParams.gpm <= 300) reward += 4;

                if (dotaParams.lastHits >= 250) reward += 5;
                if (dotaParams.lastHits >= 225 && dotaParams.lastHits <= 249) reward += 5;
                if (dotaParams.lastHits >= 200 && dotaParams.lastHits <= 224) reward += 4;
                if (dotaParams.lastHits >= 175 && dotaParams.lastHits <= 199) reward += 4;
                if (dotaParams.lastHits >= 150 && dotaParams.lastHits <= 174) reward += 3;
                if (dotaParams.lastHits >= 125 && dotaParams.lastHits <= 149) reward += 3;
                if (dotaParams.lastHits >= 100 && dotaParams.lastHits <= 124) reward += 2;

                if (dotaParams.denies >= 70) reward += 5;
                if (dotaParams.denies >= 60 && dotaParams.denies <= 69) reward += 5;
                if (dotaParams.denies >= 50 && dotaParams.denies <= 59) reward += 4;
                if (dotaParams.denies >= 40 && dotaParams.denies <= 49) reward += 4;
                if (dotaParams.denies >= 30 && dotaParams.denies <= 39) reward += 3;
                if (dotaParams.denies >= 20 && dotaParams.denies <= 29) reward += 3;
                if (dotaParams.denies >= 10 && dotaParams.denies <= 19) reward += 2;

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
                  reward: reward
                };

                var recipientId = senderId;
                var secret = passphrase;

                console.log('SENDING END GAME TRS');

                var endGameTrs = JSON.stringify({
                  gamedata: gamedata,
                  recipientId: recipientId,
                  secret: secret
                });

                sendEndGameTrs(endGameTrs);

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
              if(!matchId && data_to_object.match_id) {
                matchId = data_to_object.match_id
              }

              if (!dotaParams.steamId && data_to_object.player_steam_id) {
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
              break
          }

          // Send transaction for Game Started
          if (matchId && dotaParams.gameStarted && !(dotaParams.gameInProcess)) {
            var gamedata = {
              gameId: 7314,
              matchId: matchId,
              rankedGame: true,
            }

            var recipientId = senderId;
            var secret = passphrase;

            var startGameTrs = JSON.stringify({
              gamedata: gamedata,
              recipientId: recipientId,
              secret: secret
            });

            sendStartGameTrs(startGameTrs);

            dotaParams.gameInProcess = true;
          }
        }
      }
    });
  }

  function gameLaunched(gameInfoResult) {
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

    if (Math.floor(gameInfoResult.gameInfo.id/10) != 7314 && Math.floor(gameInfoResult.gameInfo.id/10) != 5426) {
      return undefinedZ;
    }

    if (gameInfoResult.gameInfo.title) {
      var currentGame = gameInfoResult.gameInfo.title;

      console.log(currentGame + ' Launched!')

      return currentGame;
    }

    return undefined;
  }

  function gameRunning(gameInfo) {
    if (!gameInfo) {
      return undefined;
    }

    if (!gameInfo.isRunning) {
      return undefined;
    }

    if (Math.floor(gameInfo.id/10) != 7314 && Math.floor(gameInfo.id/10) != 5426) {
      return undefined;
    }

    if (gameInfo.title) {
      var currentGame = gameInfo.title;

      console.log(currentGame + ' Launched!')

      return currentGame;
    }

    return undefined;
  }


  function setDotaFeatures() {
    console.log('Setting features for Dota');
    overwolf.games.events.setRequiredFeatures(dotaFeatures, function(info) {
      if (info.status == 'error') {
          window.setTimeout(setDotaFeatures, 2000);
          return;
      }
    });
  }

  function setLoLFeatures() {
    console.log('Setting features for LoL');
    overwolf.games.events.setRequiredFeatures(lolFeatures, function(info) {
      if (info.status == 'error') {
          window.setTimeout(setLoLFeatures, 2000);
          return;
      }
    });
  }


  overwolf.games.onGameInfoUpdated.addListener(function (res) {
    console.log('onGameInfoUpdated: ' + (res.gameInfo && res.gameInfo.title ? res.gameInfo.title : 'no title'));
    var gameTtile = gameLaunched(res);

    currentGame = gameTtile ? gameTtile : currentGame;

    if (gameTtile) {
      if (gameTtile === 'Dota 2') {
        console.log('DOTA 2 GAME INFO UPDATED');
        getDotaEvents();
        setTimeout(setDotaFeatures, 1000);
      } else if (gameTtile === 'League of Legends') {
        console.log('LOL GAME INFO UPDATED');
        getLolEvents();
        setTimeout(setLoLFeatures, 1000);
      }
    }
  });

  overwolf.games.getRunningGameInfo(function (res) {
    console.log('getRunningGameInfo: ' + (res && res.title ? res.title : 'no title'));
    var gameTtile = gameRunning(res)

    currentGame = gameTtile ? gameTtile : currentGame;

    if (gameTtile) {
      if (gameTtile === 'Dota 2') {
        console.log('DOTA 2 GAME RUNNING GAME INFO');
        getDotaEvents();
        setTimeout(setDotaFeatures, 1000);
      } else if (gameTtile === 'League of Legends') {
        console.log('LOL GAME RUNNING GAME INFO');
        getLolEvents();
        setTimeout(setLoLFeatures, 1000);
      }
    }
  });
});
