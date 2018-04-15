window.addEventListener('load', function () {

  // without signatures for now
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

  console.log('Buff App Started');

  var textarea = document.getElementById('textareaMessage');

  var requestedFeatures = [

    'kill',
    'death',
    'hero_ability_used',
    'game_state_changed',
    'match_detected',
    'match_state_changed',
    'match_detected', // not available in the documentation(
    'match_ended',
    'daytime_changed',
    'ward_purchase_cooldown_changed',
    'assist',
    'death',
    'cs',
    'roster',
    // 'hero_picked',
    // 'hero_leveled_up',
    // 'hero_respawned',
    // 'hero_boughtback',
    // 'hero_status_effect_changed',
    // 'hero_attributes_skilled',
    'hero_ability_skilled',
    'hero_ability_used',
    'hero_ability_changed',
    // 'hero_item_changed',
    // 'hero_item_used',
    // 'hero_item_consumed',
    // 'hero_item_charged'

    // these are also supported but spam the console as they happen a lot:
    // 'clock_time_changed',
    'xpm',
    'gpm',
    // 'gold',
    // 'hero_buyback_info_changed',
    // 'hero_health_mana_info',
    // 'hero_ability_cooldown_changed',
    // 'hero_item_cooldown_changed',
  ];

  var match_id, game_started, game_ended, game_in_process, xpm, gpm, death, kill, assist, xpm, gpm, cs, player_team, winner_team, isWinner;

  function registerEvents() {
    // general events errors
    overwolf.games.events.onError.addListener(function(info) {
      var log = 'Error: ' + JSON.stringify(info);
      textarea.value += log + '\n';
      //console.log('Error: ' + JSON.stringify(info));
    });

    // 'static' data changed (total kills, username, steam-id)
    // This will also be triggered the first time we register
    // for events and will contain all the current information
    overwolf.games.events.onInfoUpdates2.addListener(function(info) {
      var log = 'Info UPDATE: ' + JSON.stringify(info);
      textarea.value += log + '\n';
      //console.log(log);
    });

    // an event triggerd
    overwolf.games.events.onNewEvents.addListener(function(info) {
      var log = 'EVENT FIRED: ' + JSON.stringify(info);
      textarea.value += log + '\n';



      for (var i = info.events.length - 1; i >= 0; i--) {

        var data_to_object = JSON.parse(info.events[i].data);

        switch(info.events[i].name) {
        	case "match_detected": 
          		console.log(match_id, game_started, game_ended, game_in_process);
          		console.log("match_detected");
          		console.log(log);
              var allPlayers = data_to_object.match_detected.playersInfo
              allPlayers.forEach((player,index) => {
                if(player.isLocalPlayer == true) {
                  player_team = player.faction
                }
              })
          		break;

          	case "match_state_changed":
          		if(!game_started 
          			&& !game_in_process 
          			&& data_to_object.match_state == "DOTA_GAMERULES_STATE_GAME_IN_PROGRESS") {
          			console.log(1);
					console.log(match_id, game_started, game_ended, game_in_process);
					console.log(log);
          			game_started = data_to_object
          		}
          		break;

          	case "match_ended":
          		console.log(2);
         		  console.log(match_id, game_started, game_ended, game_in_process);
         		  console.log(log);
          		game_ended = data_to_object
              winner_team = game_ended.winner
          		break;

          	case "game_state_changed":
          		if(!match_id && data_to_object.match_id) {
          			console.log(3);
          			console.log(match_id, game_started, game_ended, game_in_process);
          			console.log(log);
          			match_id = data_to_object.match_id
          		}
          		break;

          	case "kill":
          		console.log("KILL");
        		console.log(match_id,game_started,game_ended,game_in_process, kills);
        		console.log(log);
        		kill = data_to_object.kills
        		break;

        	case "assist":
        		console.log("ASSIST");
        		console.log(match_id,game_started,game_ended,game_in_process, assist);
        		console.log(log);
        		assist = data_to_object.assists
        		break;

        	case "death":
        		console.log("DEATH");
        		console.log(match_id,game_started,game_ended,game_in_process, death);
        		console.log(log);
        		death = data_to_object.deaths
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
          console.log(4);

          console.log(match_id, game_started, game_ended, game_in_process);

          console.log(log);
          
          var data = JSON.stringify({
            type: 'game_started',
            body: {
              id: match_id,  //  should be unique id in future, since there can be two gamers in the same game, but for now it is enough for testing
              data: game_started
            }
          });

          send_transaction(data);

          game_in_process = true;
        }


        if (match_id && game_ended && game_in_process) {
          console.log("GAME_END");
          console.log(match_id, game_started, game_ended, game_in_process);
          console.log(log);
          var kda = (kill + assist) / death
          if(player_team == winner_team) {
            isWinner = true
          } else false
          var data = JSON.stringify({
            type: 'game_ended',
            body: {
              id: match_id,  //  should be unique id in future, since there can be two gamers in the same game, but for now it is enough for testing
              data: game_ended,
              team: player_team,        
              xpm: xpm,
              gpm: gpm,
              kda: kda,
              last_hits: cs.last_hits,
              denies: cs.denies,
              winner: isWinner
            }
          });

          send_transaction(data);

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

        // NOTE: we divide by 10 to get the game class id without it's sequence number
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

        // NOTE: we divide by 10 to get the game class id without it's sequence number
        if (Math.floor(gameInfo.id/10) != 7314) {
            return false;
        }

        console.log("Dota 2 running");
        return true;

    }


    function setFeatures() {
        overwolf.games.events.setRequiredFeatures(requestedFeatures, function(info) {
            if (info.status == "error")
            {
                //console.log("Could not set required features: " + info.reason);
                //console.log("Trying in 2 seconds");
                window.setTimeout(setFeatures, 2000);
                return;
            }

            //console.log("Set required features:");
            //console.log(JSON.stringify(info));
        });
    }


// Start here
    overwolf.games.onGameInfoUpdated.addListener(function (res) {
        //console.log("onGameInfoUpdated: " + JSON.stringify(res));
        if (gameLaunched(res)) {
            registerEvents();
            setTimeout(setFeatures, 1000);
        }
    });

    overwolf.games.getRunningGameInfo(function (res) {
        if (gameRunning(res)) {
            registerEvents();
            setTimeout(setFeatures, 1000);
        }
        //console.log("getRunningGameInfo: " + JSON.stringify(res));
    });
});
