window.addEventListener('load', function () {
  alert(`If you're not logged in your Buff account you won't get game reward!`);

  const senderIdInput = document.getElementById('senderId');
  const passphraseInput = document.getElementById('passphrase');
  const textarea = document.getElementById('msgTxtArea');
  const validButton = document.getElementById('validUser');
  const buffIcon = document.getElementById('buffIcon');
  const buffTitle = document.getElementById('title');

  var gameStarted,
    gameEnded,
    gameInProcess,
    xpm,
    gpm,
    deaths,
    kills,
    assists,
    lastHits,
    denies,
    playerTeam,
    gameRanked,
    lastEventTimestamp,
    senderId,
    passphrase,
    loggedIn,
    publicKey,
    idle,
    hidden,
    allPlayers,
    steamId;

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

  console.log('Buff App Started');

  var requestedFeatures = [
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

  function registerEvents() {
  
    overwolf.games.events.onError.addListener(function(info) {
      var log = 'Error: ' + JSON.stringify(info);
      textarea.value += log + '\n';
    });

    overwolf.games.events.onInfoUpdates2.addListener(function(info) {
      var log = 'Info UPDATE: ' + JSON.stringify(info);
      textarea.value += log + '\n';
      
      if(info.info.roster.players != undefined) {
        allPlayers = JSON.parse(info.info.roster.players);  
      }  
    });

    overwolf.games.events.onNewEvents.addListener(function(info) {
      var log = 'EVENT FIRED: ' + JSON.stringify(info);
      textarea.value += log + '\n';
      lastEventTimestamp = new Date();

      for (var i = info.events.length - 1; i >= 0; i--) { 

        var data_to_object = JSON.parse(info.events[i].data);
        //console.log(info.events[i].name);


        // Switch event name
        switch(info.events[i].name) {
          case "match_detected": 
            console.log("INTERESTING IF EVER HAPPENS!!!!")
            
            var allPlayers = data_to_object.match_detected.playersInfo
            
            allPlayers.forEach((player,index) => {
              if(player.isLocalPlayer == true) {
                playerTeam = player.faction
              }
            })

            if (data_to_object.gameMode === 'AllPickRanked') {
              gameRanked = true;
            } else {
              gameRanked = false;
            }

            break;

          case "match_state_changed":
            console.log('MATCH STATE CHANGED!')
            console.log(data_to_object.match_state);

            if (
              !gameStarted &&
              !gameInProcess && 
              data_to_object.match_state == "DOTA_GAMERULES_STATE_GAME_IN_PROGRESS"
            ) {
              console.log('DOTA_GAMERULES_STATE_GAME_IN_PROGRESS!!!!!!!!!!!!');
              console.log(data_to_object);
              //console.log(log);
              gameStarted = data_to_object;
            } 

            // DOUBTS - should be deleted
            if (
              gameStarted &&
              gameInProcess && 
              data_to_object.match_state == "DOTA_GAMERULES_STATE_POST_GAME"
            ) {
              console.log("DOTA_GAMERULES_STATE_POST_GAME"); 
              console.log("BOMBOM!!!!");
            }

            if (data_to_object.match_state == "DOTA_GAMERULES_STATE_STRATEGY_TIME") {
              gameInProcess = false;
              gameStarted = undefined;
              gameEnded = undefined;
            }

            break;

          case "match_ended":
            console.log('MATCH ENDED');

            gameEnded = data_to_object;
            // Send transaction for Game Ended
            if (matchId && gameEnded && gameInProcess) {
              console.log("GAME_END");
            
              var winnerTeam = gameEnded.winner;

              allPlayers.forEach( function(player) {
                if (player.steamId === steamId) {
                  
                  if (player.team == 2) {
                    playerTeam = 'radiant';
                  } 
                  else if (playerTeam == 3) {
                    playerTeam = 'dire';
                  } 
                  else {
                    playerTeam = undefined;
                  }
                }
              });

              kills = kills ? kills : 0;
              assists = assists ? assists: 0;
              deaths = deaths ? deaths : 0;
              lastHits = lastHits ? lastHits : 0;
              denies = denies ? denies : 0;

              var kda = (kills + assists) / (deaths + 1);

              var reward = 0;

              if(playerTeam == winnerTeam) {
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

              if (xpm >= 551) reward += 15;
              if (xpm >= 501 && xpm <= 550) reward += 13;
              if (xpm >= 451 && xpm <= 500) reward += 10;
              if (xpm >= 401 && xpm <= 450) reward += 8;
              if (xpm >= 351 && xpm <= 400) reward += 7;
              if (xpm >= 301 && xpm <= 350) reward += 6;
              if (xpm >= 250 && xpm <= 300) reward += 4;

              if (gpm >= 551) reward += 15;
              if (gpm >= 501 && gpm <= 550) reward += 13;
              if (gpm >= 451 && gpm <= 500) reward += 10;
              if (gpm >= 401 && gpm <= 450) reward += 8;
              if (gpm >= 351 && gpm <= 400) reward += 7;
              if (gpm >= 301 && gpm <= 350) reward += 6;
              if (gpm >= 250 && gpm <= 300) reward += 4;

              if (lastHits >= 250) reward += 5;
              if (lastHits >= 225 && lastHits <= 249) reward += 5;
              if (lastHits >= 200 && lastHits <= 224) reward += 4;
              if (lastHits >= 175 && lastHits <= 199) reward += 4;
              if (lastHits >= 150 && lastHits <= 174) reward += 3;
              if (lastHits >= 125 && lastHits <= 149) reward += 3;
              if (lastHits >= 100 && lastHits <= 124) reward += 2;

              if (denies >= 70) reward += 5;
              if (denies >= 60 && denies <= 69) reward += 5;
              if (denies >= 50 && denies <= 59) reward += 4;
              if (denies >= 40 && denies <= 49) reward += 4;
              if (denies >= 30 && denies <= 39) reward += 3;
              if (denies >= 20 && denies <= 29) reward += 3;
              if (denies >= 10 && denies <= 19) reward += 2;

              if (isWinner) reward += 45;

              var gamedata = {            
                matchId: 1,  
                gameId: 7314,
                gameRanked: true,
                xpm: xpm,
                gpm: gpm,
                kda: kda,
                last_hits: lastHits,
                denies: denies,
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
              
              gameInProcess = false;
              gameStarted = undefined;
              gameEnded = undefined;
              kills = 0;
              assists = 0;
              deaths = 0;
              lastHits = 0;
              denies = 0;
              allPlayers = undefined;
            }

            break;

          case "game_state_changed":
            if(!matchId && data_to_object.match_id) {
              console.log("MATCH_ID");
              // matchId = data_to_object.match_id
              steamId = data_to_object.player_steam_id;
              console.log('MATCH_ID');
              console.log(matchId);
              console.log('STEAM_ID');
              console.log(steamId);
            }
            break;

          case "kill":
            console.log("KILL");
            console.log(log);
            kills = data_to_object.kills;
            break;

          case "assist":
            console.log("ASSIST");
            console.log(log);
            assists = data_to_object.assists;
            break;

          case "death":
            console.log("DEATH");
            console.log(log);
            deaths = data_to_object.deaths;
            break;

          case "xpm":
            console.log("XPM");
            console.log(xpm);
            console.log(log);
            xpm = data_to_object.xpm;
            break;

          case "gpm":
            console.log("GPM");
            console.log(gpm);
            console.log(log);
            gpm = data_to_object.gpm;
            break;

          case "cs":
            console.log("CS");
            console.log(lastHits);
            console.log(denies);
            console.log(log);
            lastHits = data_to_object.last_hits;
            denies = data_to_object.denies;
            break
        }

        // Send transaction for Game Started
        if (matchId && gameStarted && !gameInProcess) {
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

          gameInProcess = true;
        }
      }     
    });
  }

  function gameLaunched(gameInfoResult) {
    if (!gameInfoResult) {
      return false;
    }

    if (!gameInfoResult.gameInfo) {
      return false;
    }

    if (!gameInfoResult.runningChanged && !gameInfoResult.gameChanged) {
      return false;
    }

    if (!gameInfoResult.gameInfo.isRunning) {
      return false;
    }

    if (Math.floor(gameInfoResult.gameInfo.id/10) != 7314) {
      return false;
    }

    console.log("Dota 2 Launched");
    return true;
  }

  function gameRunning(gameInfo) {
    if (!gameInfo) {
      return false;
    }

    if (!gameInfo.isRunning) {
      return false;
    }

    if (Math.floor(gameInfo.id/10) != 7314) {
      return false;
    }

    console.log("Dota 2 running");
    return true;
  }


  function setFeatures() {
    overwolf.games.events.setRequiredFeatures(requestedFeatures, function(info) {
      if (info.status == "error") {
        window.setTimeout(setFeatures, 2000);
        return;
      }
    });
  }

// Start here
  overwolf.games.onGameInfoUpdated.addListener(function (res) {
    if (gameLaunched(res)) {
      registerEvents();
      setInterval(function() {
        if(!idle) {
          console.log('Checking last event timestamp...');
          checkLastEvent();
        }
      }, 1000 * 60);
      setTimeout(setFeatures, 1000);
    }
  });

  overwolf.games.getRunningGameInfo(function (res) {
    if (gameRunning(res)) {
      registerEvents();
      setTimeout(setFeatures, 1000);
    }
  });
});