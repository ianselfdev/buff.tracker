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
    gold,
    kills,
    deaths,
    assists,
    minionKills,
    level,
    victory,
    lastEventTimestamp,
    gameRanked,
    senderId,
    passphrase,
    loggedIn,
    publicKey,
    idle,
    allPlayers;

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


  function sendStartGameTrs(tx) {
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
    console.log('STATE CHANGED');
    console.log(state);

    xhr.send(state);
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

  console.log('Buff App Started');

  var requestedFeatures = [
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
    'gold'
  ];

  function registerEvents() {

    overwolf.games.events.onError.addListener(function(info) {
      console.log("Error: " + JSON.stringify(info));
    });

    overwolf.games.events.onInfoUpdates2.addListener(function(info) {
      var log = 'FEATURE: ' + JSON.stringify(info);
      textarea.value += log + '\n';
      lastEventTimestamp = new Date();

      for (var i = info.length - 1; i >= 0; --i) {
        var data_to_object = JSON.parse(info);

        switch (data_to_object.feature) {
          case "gameMode": 
            console.log("GAME_MODE");
            console.log(data_to_object.game_info.gameMode);
            // if (data_to_object.game_info.gameMode == 'ranked') {
              // gameRanked = true;
            // }

          case "matchState": 
            if (!gameStarted && 
              !gameInProcess &&
              data_to_object.game_info.matchStarted == true) {
              console.log("MATCH_STARTED");
              gameStarted = true;
            }

            if (gameStarted &&
              gameInProcess &&
              data_to_object.game_info.matchOutcome) {
              console.log("MATCH_ENDED");
              victory = data_to_object.game_info.matchOutcome;
              gameEnded = true;
            }

            break;

          case "gold":
            console.log("GOLD");
            gold = data_to_object.game_info.gold;
            console.log(gold);
            break;

          case "minions":
            if (data_to_object.game_info.minionKills != undefined) {
              console.log("MINION KILLS");
              minionKills = data_to_object.game_info.minionKills;
              console.log(minionKills);
            }  
            break;  

          case "level":
            console.log("LEVEL");
            level = data_to_object.level.level;
            console.log(level);
            break;

          case "kill":
            console.log("KILLS");
            kills = data_to_object.game_info.kills;
            console.log(kills);
            break;

          case "death":
            console.log("DEATHS");
            deaths = data_to_object.game_info.deaths;
            console.log(deaths);
            break;
        }

        if (gameStarted && !gameInProcess) {
          var gamedata = {
            "gameId": 5426,
            "matchId": matchId,
            "rankedGame": true
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

        if (gameEnded && gameInProcess) {
          console.log("GAME_END");

          var isWinner;

          if (victory == 'win') {
            isWinner = true;
          } else {
            isWinner = false;
          };

          kills = kills ? kills : 0;
          assists = assists ? assists : 0;
          deaths = deaths ? deaths : 0;
          minionKills = minionKills ? minionKills : 0;

          var kda = (kills + assists) / (deaths + 1);

          var reward = 0;

          if (gold >= 15000) reward += 15;
          if (gold >= 12001 && gold <= 14999) reward += 13;
          if (gold >= 10001 && gold <= 12000) reward += 10;
          if (gold >= 8001 && gold <= 10000) reward += 8;
          if (gold >= 6001 && gold <= 8000) reward += 7;
          if (gold >= 4001 && gold <= 6000) reward += 6;
          if (gold >= 3001 && gold <= 4000) reward += 4;

          if (kda >= 4.0) reward += 15;
          if (kda >= 3.7 && kda <= 3.9) reward += 13;
          if (kda >= 3.5 && kda <= 3.6) reward += 11;
          if (kda >= 3.2 && kda <= 3.4) reward += 8;
          if (kda >= 2.9 && kda <= 3.1) reward += 4;
          if (kda >= 2.6 && kda <= 2.8) reward += 3;
          if (kda >= 1.5 && kda <= 2.5) reward += 2;

          if (minionKills >= 300) reward += 15;
          if (minionKills >= 276 && minionKills <= 299) reward += 13;
          if (minionKills >= 251 && minionKills <= 275) reward += 10;
          if (minionKills >= 226 && minionKills <= 250) reward += 8;
          if (minionKills >= 201 && minionKills <= 225) reward += 7;
          if (minionKills >= 176 && minionKills <= 200) reward += 6;
          if (minionKills >= 151 && minionKills <= 175) reward += 4;
          if (minionKills >= 126 && minionKills <= 150) reward += 2;

          if (level >= 18) reward += 10;
          if (level >= 16 && level <= 17) reward += 9;
          if (level >= 14 && level <= 15) reward += 8;
          if (level >= 12 && level <= 13) reward += 6;
          if (level >= 10 && level <= 11) reward += 4;

          if (isWinner) reward += 45;

          var gamedata = {
            matchId: 1,
            gameId: 5426,
            gameRanked: true,
            gold: gold,
            kda: kda,
            minion_kills: minionKills,
            level: level,
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
          gold = 0;
          minionKills = 0;
          level = 0;
        }

      }
    });

    overwolf.games.events.onNewEvents.addListener(function(info) {
      var log = "EVENT FIRED: " + JSON.stringify(info);
      textarea.value += log + '\n';
      lastEventTimestamp = new Date();

      for (var i = info.events.length - 1; i >= 0; i--) {

        var data_to_object = JSON.stringify(info.events[i]);

        switch(info.events[i].name) {
          case "assist":
            console.log("ASSISTS");
            assists = data_to_object.data;
            console.log(assists);
            break;
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

    // NOTE: we divide by 10 to get the game class id without it's sequence number
    if (Math.floor(gameInfoResult.gameInfo.id/10) != 5426) {
      return false;
    }

    console.log("LoL Launched");
    return true;

  }

  function gameRunning(gameInfo) {

    if (!gameInfo) {
      return false;
    }

    if (!gameInfo.isRunning) {
      return false;
    }

    // NOTE: we divide by 10 to get the game class id without it's sequence number
    if (Math.floor(gameInfo.id/10) != 5426) {
      return false;
    }

    console.log("LoL running");
    return true;

  }


  function setFeatures() {
    overwolf.games.events.setRequiredFeatures(requestedFeatures, function(info) {
      if (info.status == "error")
      {
        window.setTimeout(setFeatures, 2000);
        return;
      }

      console.log("Set required features:");
      console.log(JSON.stringify(info));
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
    console.log("onGameInfoUpdated: " + JSON.stringify(res));
  });

  overwolf.games.getRunningGameInfo(function (res) {
    if (gameRunning(res)) {
      registerEvents();
      setTimeout(setFeatures, 1000);
    }
    console.log("getRunningGameInfo: " + JSON.stringify(res));
  });
});



