const POSITIONS = {"GK": 0, "DF": 1, "MF": 2, "FW": 3};

const TYPES = {
  "Appearance": {"GK": 3, "DF": 3, "MF": 3, "FW": 3},
  "Goal": {"GK": 5, "DF": 4, "MF": 3, "FW": 2},
  "Assist": {"GK": 4, "DF": 2, "MF": 1.5, "FW": 1.5},
  "mom": {"GK": 3, "DF": 3, "MF": 3, "FW": 3},
  "dod": {"GK": -3, "DF": -3, "MF": -3, "FW": -3},
  "Goals Conceded": {"GK": 
                      {"0":8 ,"1":8 ,"2":6 ,"3":6 ,"4":5 ,"5":5 ,"6":4 ,"7":4 ,"8":3 ,"9":3 ,"10":0 ,"11":-1 ,"12":-1 ,"13":-2 ,"14":-2 ,"15":-3 ,"16":-3 ,"17":-4 ,"18":-4 ,"19":-5 ,"20":-5}, 
                    "DF": 
                      {"0":8 ,"1":8 ,"2":6 ,"3":6 ,"4":5 ,"5":5 ,"6":4 ,"7":4 ,"8":3 ,"9":3 ,"10":0 ,"11":-1 ,"12":-1 ,"13":-2 ,"14":-2 ,"15":-3 ,"16":-3 ,"17":-4 ,"18":-4 ,"19":-5 ,"20":-5},   
                    "MF": 
                      {"0":4 ,"1":4 ,"2":3 ,"3":3 ,"4":2.5 ,"5":2.5 ,"6":2 ,"7":2 ,"8":1.5 ,"9":1.5 ,"10":0 ,"11":-0.5 ,"12":-0.5 ,"13":-1 ,"14":-1 ,"15":-1.5 ,"16":-1.5 ,"17":-2 ,"18":-2 ,"19":-2.5 ,"20":-2.5},
                    "FW":
                      {"0":0 ,"1":0 ,"2":0 ,"3":0 ,"4":0 ,"5":0 ,"6":0 ,"7":0 ,"8":0 ,"9":0 ,"10":0 ,"11":0 ,"12":0 ,"13":0 ,"14":0 ,"15":0 ,"16":0 ,"17":0 ,"18":0 ,"19":0 ,"20":0}
                    },
  "Penalty": {"GK": 
                {0:0 ,0.5:-1, 1:-2, 1.5:-3, 2:-4, 2.5:-5, 3:-6, 3.5:-7, 4:-8, 4.5:-9, 5:-10}, 
             "DF": 
                {0:0 ,0.5:-1, 1:-2, 1.5:-3, 2:-4, 2.5:-5, 3:-6, 3.5:-7, 4:-8, 4.5:-9, 5:-10},  
             "MF": 
                {0:0 ,0.5:-1, 1:-2, 1.5:-3, 2:-4, 2.5:-5, 3:-6, 3.5:-7, 4:-8, 4.5:-9, 5:-10},     
             "FW": 
                {0:0 ,0.5:-1, 1:-2, 1.5:-3, 2:-4, 2.5:-5, 3:-6, 3.5:-7, 4:-8, 4.5:-9, 5:-10}
              }
              };

$.each(TYPES, function(type, positions) {
    $.each(positions, function(position, points) {
        $("#" + type.replace(" ", "") + "_" + position).text(points);
    });
});

$.getJSON("data/squads.json", function(squads) {
    
    var playerList = [];
    var playerDict = {};
    
    $.each(squads, function(undefined, squad) {
        $.each(squad["players"], function(undefined, player) {
            playerList.push(player["player"]);
            playerDict[player["player"]] = {
                "name": player["player"],
                "team": squad["team"],
                "points": 0,
                "goals": 0,
                "assists": 0,
                "penalties": 0,
                "appearances": 0,
                "goalsconceded": 0,
                "gameweekpoints": 0,
                "mom": 0,
                "dod": 0,
                "value": player["value"],
                "position": player["position"]};
        });
    });
    
    $.getJSON("data/actions.json", function(actions) {
        
        var managerList = [];
        var managerDict = {};
        
        $.each(actions, function(undefined, action) {
            $.each(action, function(type, data) {
                if (type == "Manager") {
                    managerList.push(data["manager"]);
                    managerDict[data["manager"]] = {
                        "name": data["manager"],
                        "team": data["team"],
                        "teamname": data["teamname"],
                        "points": 0,
                        "drafts": 0,
                        "teamvalue": 0,
                        "transfers": 0,
                        "players": []};
                } else {
                    var tr;
                    if (type == "Draft") {
                        var player = playerDict[data["player"]];
                        var manager = managerDict[data["manager"]];
                        manager["players"].push(data["player"]);
                        manager["teamvalue"] += player["value"];
                        tr = getRow();
                        tr.append($("<td>").append(getDescriptor(type, ++manager["drafts"])));
                        tr.append($("<td>").append(getPerson(player)));
                        tr.append($("<td>").append(getPerson(manager)));
                    } else if (type == "Transfer") {
                        var playerOut = playerDict[data["out"]];
                        var playerIn = playerDict[data["in"]];
                        var manager = managerDict[data["manager"]];
                        var index = manager["players"].indexOf(data["out"]);
                        if (index !== -1) {
                            manager["players"].splice(index, 1, data["in"]);
                        }
                        tr = getRow();
                        tr.append($("<td>").append(getDescriptor(type, ++manager["transfers"])));
                        tr.append($("<td>").append(getPerson(playerIn, "in")).append(getPerson(playerOut, "out")));
                        tr.append($("<td>").append(getPerson(manager)));
                    } else if (type == "Points") {
                        var player = playerDict[data["player"]];
                        var goalpoint = TYPES["Goal"][player["position"]] || 0;
                        var assistpoint = TYPES["Assist"][player["position"]] || 0;
                        var appearancepoint = TYPES["Appearance"][player["position"]] || 0;
                        var mompoint = TYPES["mom"][player["position"]] || 0;
                        var dodpoint = TYPES["dod"][player["position"]] || 0;
                        var goalconcededpoint = TYPES["Goals Conceded"][player["position"]] || 0;
                        var penaltypoint = TYPES["Penalty"][player["position"]] || 0;
                        
                        var goalnum = data["Goal"] || 0;
                        var assistnum = data["Assist"] || 0;
                        var appearancenum = data["Appearance"] || 0;
                        var momnum = data["mom"] || 0;
                        var dodnum = data["dod"] || 0;
                        var goalconcedednum = data["Goals Conceded"] || 0;
                        var penaltynum = data["Penalty"] || 0;
                        
                        var points = goalpoint * goalnum
                                     + assistpoint * assistnum
                                     + appearancepoint * appearancenum
                                     + mompoint * momnum
                                     + dodpoint * dodnum
                                     + goalconcededpoint[goalconcedednum] 
                                     + penaltypoint[penaltynum]
                        player["points"] += points;
                        player["goals"] += goalnum;
                        player["assists"] += assistnum;
                        player["penalties"] += penaltynum;
                        player["appearances"] += appearancenum;
                        player["mom"] += momnum;
                        player["dod"] += dodnum;
                        player["goalsconceded"] += goalconcedednum;
                        player["gameweekpoints"] = points;
                        $.each(managerList, function(undefined, nameManager) {
                            var manager = managerDict[nameManager];
                            if (manager["players"].indexOf(player["name"]) !== -1) {
                                manager["points"] += points;
                            }
                        });
                        tr = getRow(points);
                        tr.append($("<td>").append(getDescriptor(type, points)));
                        tr.append($("<td>").append(getPerson(player)));
                    }
                    $("#table_actions").prepend(tr);
                }
            });
        });
        
        playerList.sort(function(a, b) {
            return sortPoints(playerDict[a], playerDict[b])
                || sortPosition(playerDict[a], playerDict[b])
                || sortName(a, b);
        });
        
        $.each(playerList, function(undefined, namePlayer) {
            var player = playerDict[namePlayer];
            var tr = getRow(player["points"]);
            tr.append($("<td>").append(getPerson(player)));
            var td = getRow(player["points"]);
            td.append($("<td>").append(getPoints(player)));
            var ti = getRow(player["points"]);
            ti.append($("<td>").append(getGoals(player)));
            var tw = getRow(player["points"]);
            tw.append($("<td>").append(getAssists(player)));   
            var tj = getRow(player["points"]);
            tj.append($("<td>").append(getAppearances(player)));
            var ts = getRow(player["points"]);
            ts.append($("<td>").append(getValue(player)));         
            var t = getRow(player["points"]);
            t.append($("<td>").append(getPenalties(player)));              
            var tu = getRow(player["points"]);
            tu.append($("<td>").append(getGoalsConceded(player)));  
            var th = getRow(player["points"]);
            th.append($("<td>").append(player["gameweekpoints"]));     
            var tq = getRow(player["points"]);
            tq.append($("<td>").append(getMOM(player)));         
            var tz = getRow(player["points"]);
            tz.append($("<td>").append(getDOD(player)));             
            tr.append($("<td>").append(ts));
            tr.append($("<td>").append(tj));
            tr.append($("<td>").append(ti));
            tr.append($("<td>").append(tw));
            tr.append($("<td>").append(tu));
            tr.append($("<td>").append(t));
            tr.append($("<td>").append(tq));
            tr.append($("<td>").append(tz));
            tr.append($("<td>").append(th));
            tr.append($("<td>").append(td));
            $("#table_players").append(tr);
        });
        
        managerList.sort(function(a, b) {
            return sortPoints(managerDict[a], managerDict[b])
                || sortName(a, b);
        });
        
        $.each(managerList, function(rank, nameManager) {
            var manager = managerDict[nameManager];
            manager["players"].sort(function(a, b) {
                return sortPosition(playerDict[a], playerDict[b]);
            });
            var tr = getRow(rank == 0 ? 1 : rank == managerList.length-1 ? -1 : 0);
            tr.append($("<td>").append(getPerson(manager)));
            var td = getRow(rank == 0 ? 1 : rank == managerList.length-1 ? -1 : 0);
            td.append($("<td>").append(getPoints(manager)));
            var th = getRow(rank == 0 ? 1 : rank == managerList.length-1 ? -1 : 0);
            th.append($("<td>").append(getTeamName(manager)));  
            tr.append($("<td>").append(th));
            tr.append($("<td>").append(td));
            $("#table_managers").append(tr);
        });
  
        $.each(managerList, function(rank, nameManager) {
            var manager = managerDict[nameManager];
            manager["players"].sort(function(a, b) {
                return sortPosition(playerDict[a], playerDict[b]);
            });
            var td = $("<td>");
            $.each(manager["players"], function(undefined, namePlayer) {
                var player = playerDict[namePlayer];
                td.append(getPersonandScore(player));
            });
            var tr = getRow(rank == 0 ? 1 : rank == managerList.length-1 ? -1 : 0);
            tr.append($("<td>").append(getPerson(manager)));
            var th = getRow(rank == 0 ? 1 : rank == managerList.length-1 ? -1 : 0);
            th.append($("<td>").append(getTeamName(manager)));  
            tr.append($("<td>").append(th));          
            tr.append($("<td>").append(td));
            tr.append($("<td>").append("£" + manager["teamvalue"] + "m"));
            $("#table_teams").append(tr);
        });
    });
});

function sortPoints(a, b) {
    return b["points"] - a["points"];
}

function sortPosition(a, b) {
    return POSITIONS[a["position"]] - POSITIONS[b["position"]];
}

function sortName(a, b) {
    return a.localeCompare(b);
}

function getRow(value) {
    if (typeof value == 'undefined') {
        value = 0
    }
    var tr = $("<tr>");
    if (value > 0) {
        tr.attr("class", "success");
    } else if (value < 0) {
        tr.attr("class", "danger");
    } else {
        tr.attr("class", "info");
    }
    return tr;
}

function getDescriptor(type, value) {
    var p = $("<p>");
    p.text(type + " (" + value + ")");
    return p;
}

function getPerson(data, sub) {
    var p = $("<p>");
    if (typeof sub != 'undefined') {
        p.append(getArrow(sub));
    }
    try {
        p.append(data["position"]);
    } catch (err) {}
    p.append(getFlag(data["name"]));
    p.append(data["name"]);
    return p;
}

function getPersonandScore(data, sub) {
    var p = $("<p>");
    if (typeof sub != 'undefined') {
        p.append(getArrow(sub));
    }
    try {
        p.append(data["position"]);
    } catch (err) {}
    p.append(getFlag(data["name"]));
    p.append(data["name"] + " (" + data["points"] + ")");
    return p;
}

function getTeamName(data, sub) {
    var p = $("<p>");
    p.append(data["teamname"]);
    return p;
}
 
function getPoints(data, sub) {
    var p = $("<p>");
    p.append(data["points"]);
    return p;
}

function getValue(data, sub) {
    var p = $("<p>");
    p.append("£" + data["value"] + "m");
    return p;
}

function getGoals(data, sub) {
    var p = $("<p>");
    p.append(data["goals"]);
    return p;
}

function getPenalties(data, sub) {
    var p = $("<p>");
    p.append(data["penalties"]);
    return p;
}


function getGoalsConceded(data, sub) {
    var p = $("<p>");
    p.append(data["goalsconceded"]);
    return p;
}

function getAssists(data, sub) {
    var p = $("<p>");
    p.append(data["assists"]);
    return p;
}

function getAppearances(data, sub) {
    var p = $("<p>");
    p.append(data["appearances"]);
    return p;
}

function getMOM(data, sub) {
    var p = $("<p>");
    p.append(data["mom"]);
    return p;
}

function getDOD(data, sub) {
    var p = $("<p>");
    p.append(data["dod"]);
    return p;
}

function getFlag(player) {
    var img = $("<img>");
    img.attr("src", "images/flags/" + player + ".GIF");
    img.attr("style", "height: 28; width: 30; margin: 0 8");
    return img;
}

function getArrow(sub) {
    var img = $("<img>");
    img.attr("src", "images/arrows/" + sub + ".GIF");
    img.attr("style", "height: 16; width: 16; margin: 0 8");
    return img;
}
