window.addEventListener('load', function () {
  alert(`If you're not logged in your Buff account you won't get game reward!`);

  console.log('Buff App Started');

  const senderIdInput = document.getElementById('senderId');
  const passphraseInput = document.getElementById('passphrase');
  const textarea = document.getElementById('msgTxtArea');
  const validButton = document.getElementById('validUser');
  const buffIcon = document.getElementById('buffIcon');
  const buffTitle = document.getElementById('title');

  overwolf.games.onGameInfoUpdated.addListener(function (res) {
    console.log("onGameInfoUpdated: " + JSON.stringify(res));
    var startedGame = gameLaunched(res);

    if (startedGame) {
      if (startedGame === 'Dota 2') {
        console.log('DOTA 2 GAME INFO UPDATED');
        getDotaEvents();
      } else if (startedGame === 'League of Legends') {
        console.log('LOL GAME INFO UPDATED');
        getLolEvents();
      }
      setTimeout(setFeatures(startedGame),1000);
    }
  });

  overwolf.games.getRunningGameInfo(function (res) {
    console.log('getRunningGameInfo: ' + JSON.stringify(res));
    var startedGame = gameLaunched(res);

    if (startedGame) {
      if (startedGame === 'Dota 2') {
        console.log('DOTA 2 GAME RUNNING GAME INFO');
        getDotaEvents();
      } else if (startedGame === 'League of Legends') {
        console.log('LOL GAME RUNNING GAME INFO');
        getLolEvents();
      }
      setTimeout(setFeatures(startedGame),1000);
    }
  });

  var senderId,
    passphrase,
    publicKey;

  var dotaParams = {
    gameStarted: undefined,
    gameEnded: undefined,
    gameInProcess: undefined,
    xpm: undefined,
    gpm: undefined,
    deaths: undefined,
    kills: undefined,
    assists: undefined,
    lastHits: undefined,
    denies: undefined,
    playerTeam: undefined,
    rankedGame: undefined,
    lastEventTimestamp: undefined,
    loggedIn: undefined,
    idle: undefined,
    hidden: undefined,
    allPlayers: undefined,
    steamId: undefined,
    matchId: undefined
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

  var lolParams = {
    gameStarted: undefined,
    gameEnded: undefined,
    gameInProcess: undefined,
    kills: undefined,
    deaths: undefined,
    assists: undefined,
    minionKills: undefined,
    level: undefined,
    victory: undefined,
    lastEventTimestamp: undefined,
    rankedGame: undefined,
    loggedIn: undefined,
    idle: undefined,
    matchId: undefined,
    allPlayers: undefined
  };

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


  buffIcon.onclick = function () {
    if (!hidden) {
      hidden = true;
      senderIdInput.style.visibility = "hidden";
      passphraseInput.style.visibility = "hidden";
      textarea.style.visibility = "hidden";
      validButton.style.visibility = "hidden";
      buffTitle.style.visibility = "hidden";
    } else {
      if (loggedIn) {
         textarea.style.visibility = "visible";
         textarea.value = "Logged in";
      } else {
        hidden = false;
        senderIdInput.style.visibility = "visible";
        passphraseInput.style.visibility = "visible";
        textarea.style.visibility = "visible";
        validButton.style.visibility = "visible";
        buffTitle.style.visibility = "visible";
      }
    }
  }

  validButton.onclick = function () {
    if (
      senderIdInput.value != undefined && 
      passphraseInput.value != undefined
    ) {

      senderId = senderIdInput.value;
      passphrase = passphraseInput.value;

      validSenderId(senderId, function (data) {
        if (data.verified === true) {
          validUser(publicKey, passphrase);  
        } else {
          textarea.value = 'Invalid address!';  
        }
      });
    } else {
      textarea.value = 'Empty fields!';
    }
  }

  // without signatures for now
  function sendStartGameTrs(tx)  {
    var xhr = new XMLHttpRequest();
    var url = "http://18.219.35.208:4000/api/game-start";
    xhr.open('put', url, true);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(JSON.parse(xhr.responseText));
      }
    };
    console.log('SEND START GAME TX');
    console.log(tx);

    xhr.send(tx);
  }

  function sendEndGameTrs(tx) {
    var xhr = new XMLHttpRequest();
    var url = "http://18.219.35.208:4000/api/game-end";
    xhr.open('put', url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log(JSON.parse(xhr.responseText));
      }
    };
    console.log('SEND END GAME TX');
    console.log(tx);

    xhr.send(tx);
  }

  function changeState(state) {
    var xhr = new XMLHttpRequest();
    var url = "http://18.219.35.208:4000/api/game-start/state";
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
    var url = `http://18.219.35.208:4000/api/accounts/getPublicKey?address=${senderId}`;
    xhr.open('get', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        
        if (response.success == true && response.publicKey) {
          publicKey = response.publicKey;
          return cb ({ verified: true });
        } else {
          textarea.value = 'Invalid address!';
        }
      } 
    }
    xhr.send({ address: senderId });
  }

  function validUser(userPubKey, userSecret, cb) {
    var xhr = new XMLHttpRequest();
    var url = "http://18.219.35.208:4000/api/game-start/verify";
    xhr.open('put', url, true);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);

        if (response.success == true && response.verified == true) {
          passphrase = userSecret;
          alert('Successfully logged in!');

          senderIdInput.style.visibility = "hidden";
          passphraseInput.style.visibility = "hidden";
          textarea.style.visibility = "hidden";
          validButton.style.visibility = "hidden";

          loggedIn = true;
        } else {
          textarea.value = response.error;
        }
      }
    }

    var req = JSON.stringify({ publicKey: userPubKey, passphrase: userSecret });
    xhr.send(req);
  }

  function checkLastEvent() {
    if (lastEventTimestamp != undefined && 
      new Date().getTime() - lastEventTimestamp.getTime() >= 5 * 60000) {
      console.log('Player is idle!');
      idle = true;
      changeState({ senderId: "aMKnhWqASk5BLLBezNyC4misnVf6et16eL", state: 'idle' });
    } else {
      if (lastEventTimestamp) {
        var timeDif = new Date().getTime() - lastEventTimestamp.getTime();
        console.log('Last event timestamp ' + (timeDif / 600) + 's ago');
      } else {
        console.log('No events available...');
      }
    }
  }

  function getLolEvents() {
    overwolf.games.events.onError.addListener(function(info) {
      console.log("Error: " + JSON.stringify(info));
    });

    overwolf.games.events.onInfoUpdates2.addListener(function(info) {
      var log = 'FEATURE: ' + JSON.stringify(info);
      textarea.value += log + '\n';
      lolParams[lastEventTimestamp] = new Date();

      var data_to_object = info;

      console.log(info);
      switch (data_to_object.feature) {
        case "gameMode": 
          console.log("GAME_MODE");
          if (
            data_to_object.info && 
            data_to_object.game_info &&
            data_to_object.info.game_info.gameMode
          ) {  
              console.log(data_to_object.info.game_info.gameMode);
          }
          // if (data_to_object.game_info.gameMode == 'ranked') {
            // lolParams[rankedGame] = true;
          // }

        case "matchState": 
          if (
            !(lolParams[gameStarted]) &&
            !(lolParams[gameInProcess]) &&
            data_to_object.info &&
            data_to_object.info.game_info &&
            data_to_object.info.game_info.matchStarted
          ) {
            console.log("MATCH_STARTED");
            lolParams[gameStarted] = true;
          }

          if (
            lolParams[gameStarted] &&
            lolParams[gameInProcess] &&
            data_to_object.info &&
            data_to_object.info.game_info &&
            data_to_object.info.game_info.matchOutcome
          ) {
            console.log("MATCH_ENDED");
            lolParams[victory] = data_to_object.info.game_info.matchOutcome;
            lolParams[gameEnded] = true;

            if (gameEnded && gameInProcess) {
              console.log("GAME_END");

              var isWinner;

              if (victory == 'win') {
                isWinner = true;
              } else {
                isWinner = false;
              }

              lolParams[kills] = lolParams[kills] ? lolParams[kills] : 0;
              lolParams[assists] = lolParams[assists] ? lolParams[assists] : 0;
              lolParams[deaths] = lolParams[deaths] ? lolParams[deaths] : 0;
              lolParams[level] = lolParams[level] ? lolParams[level] : 0;
              lolParams[minionKills] = lolParams[minionKills] ? lolParams[minionKills] : 0;

              console.log("------------------------");
              console.log("COUNT KDA");
              console.log("KILLS");
              console.log(lolParams[kills]);
              console.log("ASSISTS");
              console.log(lolParams[assists]);
              console.log("DEATHS");
              console.log(lolParams[deaths]);
              console.log("------------------------");

              var kda = (lolParams[kills] + lolParams[assists]) / (lolParams[deaths] + 1);

              var reward = 0;

              if (kda >= 4.0) reward += 20;
              if (kda >= 3.7 && kda <= 3.9) reward += 17;
              if (kda >= 3.5 && kda <= 3.6) reward += 14;
              if (kda >= 3.2 && kda <= 3.4) reward += 12;
              if (kda >= 2.9 && kda <= 3.1) reward += 7;
              if (kda >= 2.6 && kda <= 2.8) reward += 5;
              if (kda >= 1.5 && kda <= 2.5) reward += 2;

              if (lolParams[minionKills] >= 300) reward += 20;
              if (lolParams[minionKills] >= 276 && lolParams[minionKills] <= 299) reward += 17;
              if (lolParams[minionKills] >= 251 && lolParams[minionKills] <= 275) reward += 14;
              if (lolParams[minionKills] >= 226 && lolParams[minionKills] <= 250) reward += 12;
              if (lolParams[minionKills] >= 201 && lolParams[minionKills] <= 225) reward += 10;
              if (lolParams[minionKills] >= 176 && lolParams[minionKills] <= 200) reward += 7;
              if (lolParams[minionKills] >= 151 && lolParams[minionKills] <= 175) reward += 4;
              if (lolParams[minionKills] >= 126 && lolParams[minionKills] <= 150) reward += 2;

              if (lolParams[level] >= 18) reward += 15;
              if (lolParams[level] >= 16 && lolParams[level] <= 17) reward += 12;
              if (lolParams[level] >= 14 && lolParams[level] <= 15) reward += 10;
              if (lolParams[level] >= 12 && lolParams[level] <= 13) reward += 8;
              if (lolParams[level] >= 10 && lolParams[level] <= 11) reward += 6;

              if (isWinner) reward += 45;

              var gamedata = {
                matchId: 1,
                gameId: 5426,
                rankedGame: true,
                kda: kda,
                minion_kills: lolParams[minionKills],
                level: lolParams[level],
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

              lolParams[gameInProcess] = false;
              lolParams[gameStarted] = undefined;
              lolParams[gameEnded] = undefined;
              lolParams[kills] = 0;
              lolParams[assists] = 0;
              lolParams[deaths] = 0;
              lolParams[minionKills] = 0;
              lolParams[level] = 0;
            }
          }
          break;

        case "minions":
          console.log("MINION KILLS");
          lolParams[minionKills] = data_to_object.info.game_info.minionKills;
          console.log(lolParams[minionKills]);

          break;  

        case "level":
          console.log("LEVEL");
          lolParams[level] = data_to_object.info.level.level;
          console.log(lolParams[level]);
          break;

        case "kill":
          console.log("KILLS");
          lolParams[kills] = data_to_object.info.game_info.kills;
          console.log(lolParams[kills]);
          break;

        case "death":
          console.log("DEATHS");
          lolParams[deaths] = data_to_object.info.game_info.deaths;
          console.log(lolParams[deaths]);
          break;
      }

      if (lolParams[gameStarted] && !(lolParams[gameInProcess])) {
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

        console.log(startGameTrs);

        sendStartGameTrs(startGameTrs);

        lolParams[gameInProcess] = true;
      }
    });

    overwolf.games.events.onNewEvents.addListener(function(info) {
      var log = "EVENT FIRED: " + JSON.stringify(info);
      textarea.value += log + '\n';
      lolParams[lastEventTimestamp] = new Date();

      console.log(info);
      for (var i = info.events.length - 1; i >= 0; i--) {

        switch(info.events[i].name) {
          case "assist":
            console.log("ASSISTS");
            lolParams[assists] = JSON.parse(info.events[i].data).count;
            console.log(lolParams[assists]);
            break;
        }
      }
    });
  }





  function getDotaEvents() {
    overwolf.games.events.onError.addListener(function(info) {
      var log = 'Error: ' + JSON.stringify(info);
      textarea.value += log + '\n';
    });

    overwolf.games.events.onInfoUpdates2.addListener(function(info) {
      var log = 'Info UPDATE: ' + JSON.stringify(info);
      textarea.value += log + '\n';
      
      if(
        info.info &&
        info.info.roster && 
        info.info.roster.players
      ) {
        console.log(info.info.roster.players);
        dotaParams[allPlayers] = JSON.parse(info.info.roster.players);  
      }  
    });

    overwolf.games.events.onNewEvents.addListener(function(info) {
      var log = 'EVENT FIRED: ' + JSON.stringify(info);
      textarea.value += log + '\n';
      dotaParams[lastEventTimestamp] = new Date();

      for (var i = info.events.length - 1; i >= 0; i--) { 

        var data_to_object = JSON.parse(info.events[i].data);
        //console.log(info.events[i].name);


        // Switch event name
        switch(info.events[i].name) {
          case "match_detected": 
            console.log("INTERESTING IF EVER HAPPENS!!!!")
            
            dotaParams[allPlayers] = data_to_object.match_detected.playersInfo
            
            dotaParams[allPlayers].forEach((player,index) => {
              if(player.isLocalPlayer == true) {
                dotaParams[playerTeam] = player.faction
              }
            })

            if (data_to_object.gameMode === 'AllPickRanked') {
              dotaParams[rankedGame] = true;
            } else {
              dotaParams[rankedGame] = false;
            }

            break;

          case "match_state_changed":
            console.log('MATCH STATE CHANGED!')
            console.log(data_to_object.match_state);

            if (
              !(dotaParams[gameStarted]) &&
              !(dotaParams[gameInProcess]) && 
              data_to_object.match_state == "DOTA_GAMERULES_STATE_GAME_IN_PROGRESS"
            ) {
              console.log('DOTA_GAMERULES_STATE_GAME_IN_PROGRESS!!!!!!!!!!!!');
              console.log(data_to_object);
              //console.log(log);
              dotaParams[gameStarted] = data_to_object;
            } 

            // DOUBTS - should be deleted
            if (
              dotaParams[gameStarted] &&
              dotaParams[gameInProcess] && 
              data_to_object.match_state == "DOTA_GAMERULES_STATE_POST_GAME"
            ) {
              console.log("DOTA_GAMERULES_STATE_POST_GAME"); 
              console.log("BOMBOM!!!!");
            }

            if (data_to_object.match_state == "DOTA_GAMERULES_STATE_STRATEGY_TIME") {
              dotaParams[gameInProcess] = false;
              dotaParams[gameStarted] = undefined;
              dotaParams[gameEnded] = undefined;
            }

            break;

          case "match_ended":
            console.log('MATCH ENDED');

            dotaParams[gameEnded] = data_to_object;
            // Send transaction for Game Ended
            if (matchId && dotaParams[gameEnded] && dotaParams[gameInProcess]) {
              console.log("GAME_END");
            
              var winnerTeam = dotaParams[gameEnded].winner;
              var isWinner;

              if (dotaParams[allPlayers]) {
                dotaParams[allPlayers].forEach( function(player) {
                  if (player.steamId === steamId) {
                    
                    if (player.team == 2) {
                      dotaParams[playerTeam] = 'radiant';
                    } 
                    else if (playerTeam == 3) {
                      dotaParams[playerTeam] = 'dire';
                    } 
                    else {
                      dotaParams[playerTeam] = undefined;
                    }
                  }
                });
              }

              dotaParams[kills] = dotaParams[kills] ? dotaParams[kills] : 0;
              dotaParams[assists] = dotaParams[assists] ? dotaParams[assists]: 0;
              dotaParams[deaths] = dotaParams[deaths] ? dotaParams[deaths] : 0;
              dotaParams[lastHits] = dotaParams[lastHits] ? dotaParams[lastHits] : 0;
              dotaParams[denies] = dotaParams[denies] ? dotaParams[denies] : 0;

              var kda = (dotaParams[kills] + dotaParams[assists]) / (dotaParams[deaths] + 1);

              var reward = 0;

              if(dotaParams[playerTeam] == winnerTeam) {
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

              if (dotaParams[xpm] >= 551) reward += 15;
              if (dotaParams[xpm] >= 501 && dotaParams[xpm] <= 550) reward += 13;
              if (dotaParams[xpm] >= 451 && dotaParams[xpm] <= 500) reward += 10;
              if (dotaParams[xpm] >= 401 && dotaParams[xpm] <= 450) reward += 8;
              if (dotaParams[xpm] >= 351 && dotaParams[xpm] <= 400) reward += 7;
              if (dotaParams[xpm] >= 301 && dotaParams[xpm] <= 350) reward += 6;
              if (dotaParams[xpm] >= 250 && dotaParams[xpm] <= 300) reward += 4;

              if (dotaParams[gpm] >= 551) reward += 15;
              if (dotaParams[gpm] >= 501 && dotaParams[gpm] <= 550) reward += 13;
              if (dotaParams[gpm] >= 451 && dotaParams[gpm] <= 500) reward += 10;
              if (dotaParams[gpm] >= 401 && dotaParams[gpm] <= 450) reward += 8;
              if (dotaParams[gpm] >= 351 && dotaParams[gpm] <= 400) reward += 7;
              if (dotaParams[gpm] >= 301 && dotaParams[gpm] <= 350) reward += 6;
              if (dotaParams[gpm] >= 250 && dotaParams[gpm] <= 300) reward += 4;

              if (dotaParams[lastHits] >= 250) reward += 5;
              if (dotaParams[lastHits] >= 225 && dotaParams[lastHits] <= 249) reward += 5;
              if (dotaParams[lastHits] >= 200 && dotaParams[lastHits] <= 224) reward += 4;
              if (dotaParams[lastHits] >= 175 && dotaParams[lastHits] <= 199) reward += 4;
              if (dotaParams[lastHits] >= 150 && dotaParams[lastHits] <= 174) reward += 3;
              if (dotaParams[lastHits] >= 125 && dotaParams[lastHits] <= 149) reward += 3;
              if (dotaParams[lastHits] >= 100 && dotaParams[lastHits] <= 124) reward += 2;

              if (dotaParams[denies] >= 70) reward += 5;
              if (dotaParams[denies] >= 60 && dotaParams[denies] <= 69) reward += 5;
              if (dotaParams[denies] >= 50 && dotaParams[denies] <= 59) reward += 4;
              if (dotaParams[denies] >= 40 && dotaParams[denies] <= 49) reward += 4;
              if (dotaParams[denies] >= 30 && dotaParams[denies] <= 39) reward += 3;
              if (dotaParams[denies] >= 20 && dotaParams[denies] <= 29) reward += 3;
              if (dotaParams[denies] >= 10 && dotaParams[denies] <= 19) reward += 2;

              if (isWinner) reward += 45;

              var gamedata = {            
                matchId: 1,  
                gameId: 7314,
                rankedGame: true,
                xpm: dotaParams[xpm],
                gpm: dotaParams[gpm],
                kda: kda,
                last_hits: dotaParams[lastHits],
                denies: dotaParams[denies],
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
              
              dotaParams[gameInProcess] = false;
              dotaParams[gameStarted] = undefined;
              dotaParams[gameEnded] = undefined;
              dotaParams[kills] = 0;
              dotaParams[assists] = 0;
              dotaParams[deaths] = 0;
              dotaParams[lastHits] = 0;
              dotaParams[denies] = 0;
              dotaParams[playerTeam] = undefined;
              dotaParams[allPlayers] = undefined;
            }

            break;

          case "game_state_changed":
            if (data_to_object.match_id) console.log("MATH IDIDIIDID - ", data_to_object.match_id);
            if(!matchId && data_to_object.match_id) {
              matchId = data_to_object.match_id
              console.log('MATCH_ID');
              console.log(matchId);
            }

            if (!steamId && data_to_object.player_steam_id) {
              dotaParams[steamId] = data_to_object.player_steam_id;
              console.log('STEAM_ID');
              console.log(steamId);
            }
            break;

          case "kill":
            console.log("KILL");
            console.log(log);
            dotaParams[kills] = data_to_object.kills;
            break;

          case "assist":
            console.log("ASSIST");
            console.log(log);
            dotaParams[assists] = data_to_object.assists;
            break;

          case "death":
            console.log("DEATH");
            console.log(log);
            dotaParams[deaths] = data_to_object.deaths;
            break;

          case "xpm":
            console.log("XPM");
            console.log(xpm);
            console.log(log);
            dotaParams[xpm] = data_to_object.xpm;
            break;

          case "gpm":
            console.log("GPM");
            console.log(gpm);
            console.log(log);
            dotaParams[gpm] = data_to_object.gpm;
            break;

          case "cs":
            console.log("CS");
            console.log(lastHits);
            console.log(denies);
            console.log(log);
            dotaParams[lastHits] = data_to_object.last_hits;
            dotaParams[denies] = data_to_object.denies;
            break
        }

        // Send transaction for Game Started
        if (matchId && dotaParams[gameStarted] && !(dotaParams[gameInProcess])) {
          var gamedata = {
            "gameId": 7314,
            "matchId": matchId,
            "rankedGame": true,
          }

          var recipientId = senderId;
          var secret = passphrase;

          var startGameTrs = JSON.stringify({
            gamedata: gamedata,
            recipientId: recipientId,
            secret: secret
          });

          console.log(startGameTrs);

          sendStartGameTrs(startGameTrs);

          dotaParams[gameInProcess] = true;
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

        var currentGame = gameInfoResult.gameInfo.title;

        return currentGame;
    }

    function gameRunning(gameInfo) {

        if (!gameInfo) {
            return undefined;
        }

        if (!gameInfo.isRunning) {
            return undefined;
        }

        var currentGame = gameInfo.title;

        return currentGame;
    }


    function setFeatures(gameTitle) {
        if (gameTitle == 'Dota 2') {
          overwolf.games.events.setRequiredFeatures(dotaFeatures, function(info) {
            if (info.status == "error") {
                window.setTimeout(setFeatures, 2000);
                return;
            }
          });
        } else if (gameTitle == 'League of Legends') {
          overwolf.games.events.setRequiredFeatures(lolFeatures, function(info) {
            if (info.status == "error") {
                window.setTimeout(setFeatures, 2000);
                return;
            }
          });
        }
    }
});
