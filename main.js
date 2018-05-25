window.addEventListener('load', function () {


  alert(`If you're not logged in your Buff account you won't get game reward!`);

  const senderIdInput = document.getElementById('senderId');
  const passphraseInput = document.getElementById('passphrase');
  const textarea = document.getElementById('msgTxtArea');
  const validButton = document.getElementById('validUser');

  var match_id, game_started, game_ended, game_in_process, xpm, gpm, death, kill, assist, xpm, gpm, cs, player_team, winner_team, isWinner, gameRanked, lastEventTimestamp, senderId, passphrase, publicKey, idle;

  senderIdInput.onclick = function () {
    if (senderIdInput.value === 'Put here your address') {
      senderIdInput.value = "";
    }
  }

  passphraseInput.onclick = function () {
    if (passphraseInput.value === 'Put here your secret') {
      passphraseInput.value = "";
    }
  }

  validButton.onclick = function () {
    if (senderIdInput.value != undefined && 
      passphraseInput.value != undefined) {

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
    var url = "http://18.219.35.208:4000/api/game-start";
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
    'match_detected',
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
    });

    overwolf.games.events.onNewEvents.addListener(function(info) {
      var log = 'EVENT FIRED: ' + JSON.stringify(info);
      textarea.value += log + '\n';
      lastEventTimestamp = new Date();

      for (var i = info.events.length - 1; i >= 0; i--) { 

        var data_to_object = JSON.parse(info.events[i].data);

        switch(info.events[i].name) {
        	case "match_detected": 
          		console.log(log);
              var allPlayers = data_to_object.match_detected.playersInfo
              allPlayers.forEach((player,index) => {
                if(player.isLocalPlayer == true) {
                  player_team = player.faction
                }
              })
              if (data_to_object.gameMode === 'AllPickRanked') {
                gameRanked = true;
              } else gameRanked = false;

          		break;

          	case "match_state_changed":
          		if(!game_started 
          			&& !game_in_process 
          			&& data_to_object.match_state == "DOTA_GAMERULES_STATE_GAME_IN_PROGRESS") {
      					console.log(log);
          			game_started = data_to_object;

                var gamedata = {
                  "gameId": 7314,
                  "matchId": 1,
                  "rankedGame": true,
                }

                var recipientId = "aMKnhWqASk5BLLBezNyC4misnVf6et16eL";
                var secret = "assume harbor must knee shoulder file already apart today october target range";

                var startGameTrs = JSON.stringify({
                  gamedata: gamedata,
                  recipientId: recipientId,
                  secret: secret
                });

                console.log(startGameTrs);

                sendStartGameTrs(startGameTrs);
          		}
          		break;

          	case "match_ended":
         		  console.log(log);
          		game_ended = data_to_object
              winner_team = game_ended.winner
          		break;

          	case "game_state_changed":
          		if(!match_id && data_to_object.match_id) {
          			console.log(log);
          			match_id = data_to_object.match_id
          		}
          		break;

          	case "kill":
          		console.log("KILL");
        		console.log(log);
        		kill = data_to_object.kill.kills;
        		break;

        	case "assist":
        		console.log("ASSIST");
        		console.log(log);
        		assist = data_to_object.assist.assists;
        		break;

        	case "death":
        		console.log("DEATH");
        		console.log(log);
        		death = data_to_object.death.deaths;
        		break;

        	case "xpm":
        		console.log("XPM");
        		console.log(xpm);
        		console.log(log);
        		xpm = data_to_object.xpm
        		break;

        	case "gpm":
        		console.log("GPM");
        		console.log(gpm);
        		console.log(log);
        		gpm = data_to_object.gpm
        		break;

          case "cs":
            console.log("CS");
            console.log(cs);
            console.log(log);
            last_hits = data_to_object.cs
        }

        if (match_id && game_started && !game_in_process) {
          console.log(log);
          game_in_process = true;
        }


        if (match_id && game_ended && game_in_process) {
          console.log("GAME_END");
          console.log(match_id, game_started, game_ended, game_in_process);
          console.log(log);
          var kda = (kill + assist) / death + 1;
          var denies = cs.denies;
          var last_hits = cs.last_hits;
          var reward = 0;


          if(player_team == winner_team) {
            isWinner = true;
          } else isWinner = false;

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

          if (last_hits >= 250) reward += 5;
          if (last_hits >= 225 && last_hits <= 249) reward += 5;
          if (last_hits >= 200 && last_hits <= 224) reward += 4;
          if (last_hits >= 175 && last_hits <= 199) reward += 4;
          if (last_hits >= 150 && last_hits <= 174) reward += 3;
          if (last_hits >= 125 && last_hits <= 149) reward += 3;
          if (last_hits >= 100 && last_hits <= 124) reward += 2;

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
              last_hits: last_hits,
              denies: denies,
              winner: isWinner,
              reward: reward
          };

          var recipientId = "aMKnhWqASk5BLLBezNyC4misnVf6et16eL";
          var secret = "assume harbor must knee shoulder file already apart today october target range";

          var endGameTrs = JSON.stringify({
            gamedata: gamedata,
            recipientId: recipientId,
            secret: secret
          });

          console.log(endGameTrs);

          sendEndGameTrs(endGameTrs);        


          game_in_process = false;
          game_started = undefined;
          game_ended = undefined;
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
