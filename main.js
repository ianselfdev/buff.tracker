window.addEventListener('load', function () {

  function send_transaction(tx) {
    var xhr = new XMLHttpRequest();
    var url = "http://localhost:3000/txs";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(JSON.parse(xhr.responseText));
        }
    };
    console.log('SEND TX');
    console.log(tx);

    xhr.send(tx);
  }

  var g_interestedInFeatures = [
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


  console.log('Buff App Started');

  var textarea = document.getElementById('textareaMessage')

  var player_id, game_started, game_ended, game_in_process, xpm , gold, kill, death, assist, minion_kills, level, victory;

  function registerEvents() {
    // general events errors
    overwolf.games.events.onError.addListener(function(info) {
      console.log("Error: " + JSON.stringify(info));
      textarea.value += log + '\n';
    });

    // "static" data changed (total kills, username, steam-id)
    // This will also be triggered the first time we register
    // for events and will contain all the current information
    overwolf.games.events.onInfoUpdates2.addListener(function(info) {
      console.log("Info UPDATE: " + JSON.stringify(info));
      textarea.value += log + '\n';
    });

    // an event triggerd
    overwolf.games.events.onNewEvents.addListener(function(info) {
      console.log("EVENT FIRED: " + JSON.stringify(info));
      textarea.value += log + '\n';

      for (var i = info.events.length - 1; i >= 0; i--) {

        var data_to_object = JSON.parse(info.events[i].data);

        switch(info.events[i].name) {
          case "death": 
            console.log(match_id, game_started, game_ended, game_in_process);
            console.log('DEATH');
            console.log(log);
            death = data_to_object.death;

          case "kill":
            console.log(match_id, game_started, game_ended, game_in_process);
            console.log('KILL');
            console.log(log);
            death = data_to_object.kill.count;

          case "assist": 
            console.log(match_id, game_started, game_ended, game_in_process);
            console.log('ASSIST');
            console.log(log);
            death = data_to_object.assist;

          case "matchState": 
             console.log(match_id, game_started, game_ended, game_in_process);
             if (data_to_object.matchStart != undefined) {
              game_started = true;
              console.log('GAME STARTED!');
             } 
             if (data_to_object.matchEnd != undefined && player_id && game_in_process) {
                game_ended = true;
                console.log('GAME ENDED!');
                var kda = (kill + assist) / death + 1;
                var reward = 0;

                if (kda >= 4.0) reward += 15;
                if (kda >= 3.7 && kda <= 3.9) reward += 13;
                if (kda >= 3.5 && kda <= 3.6) reward += 11;
                if (kda >= 3.2 && kda <= 3.4) reward += 8;
                if (kda >= 2.9 && kda <= 3.1) reward += 4;
                if (kda >= 2.6 && kda <= 2.8) reward += 3;
                if (kda >= 1.5 && kda <= 2.5) reward += 2;

                if (gold >= 15000) reward += 15;
                if (gold >= 12001 && gold <= 14999) reward += 13;
                if (gold >= 10001 && gold <= 12000) reward += 10;
                if (gold >= 8001 && gold <= 10000) reward += 8;
                if (gold >= 6001 && gold <= 8000) reward += 7;
                if (gold >= 4001 && gold <= 6000) reward += 6;
                if (gold >= 3000 && gold <= 4000) reward += 4;

                if (minion_kills >= 300) reward += 15;
                if (minion_kills >= 251 && minion_kills <= 275) reward += 13;
                if (minion_kills >= 226 && minion_kills <= 250) reward += 10;
                if (minion_kills >= 201 && minion_kills <= 225) reward += 8;
                if (minion_kills >= 176 && minion_kills <= 200) reward += 7;
                if (minion_kills >= 151 && minion_kills <= 175) reward += 6;
                if (minion_kills >= 125 && minion_kills <= 150) reward += 4;

                if (level >= 18) reward += 10;
                if (level >= 16 && level <= 17) reward += 9;
                if (level >= 14 && level <= 15) reward += 8;
                if (level >= 12 && level <= 13) reward += 6;
                if (level >= 10 && level <= 11) reward += 4;

                if (victory) reward += 45;

                var data = JSON.stringify({
                  type: 'game_ended',
                  body: {
                    matchId: player_id,
                    gameId: 5426,
                    gameRanked: gameRanked,
                    gold: gold,
                    kda: kda,
                    minion_kills: minion_kills,
                    level: level,
                    victory: victory,
                    reward: reward
                  }
                });

                console.log(data);

                send_transaction(data);

                game_in_process = false;
                game_started = undefined;
                game_ended = undefined;



              }
              if (data_to_object.matchStart != undefined && data_to_object.matchEnd == undefined && player_id) {
                game_in_process = true;
                console.log('GAME IN PROCESS');
             }

          case "announcer": 
            console.log(match_id, game_started, game_ended, game_in_process);
            if (data_to_object.defeat != undefined) {
              victory = true;
            } 
            if (data_to_object.victory != undefined) {
              victory = false;
            }   


          case "kill":
            console.log(match_id, game_started, game_ended, game_in_process);
            console.log('MINION KILLS');
            console.log(log);
            minion_kills = data_to_object.minions.minionKills;

          case "level": 
            console.log(match_id, game_started, game_ended, game_in_process);
            console.log("LEVEL");
            console.log(log);
            level = data_to_object.level;

          case "summoner_info": 
            console.log(match_id, game_started, game_ended, game_in_process);
            console.log("SUMMONER INFO");
            console.log(log);
            player_id = data_to_object.summoner_info.id;

          case "gameMode":
             console.log(match_id, game_started, game_ended, game_in_process);
             console.log("GAME MODE");
             console.log(log);
             if (data_to_object.gameMode.game_info === 'ranked') {
               gameRanked = true;
             }
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
    overwolf.games.events.setRequiredFeatures(g_interestedInFeatures, function(info) {
      if (info.status == "error")
      {
        //console.log("Could not set required features: " + info.reason);
        //console.log("Trying in 2 seconds");
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
}



