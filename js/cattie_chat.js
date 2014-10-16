function deleteElementFromArray(arr, ele) {
  var index = arr.indexOf(5);
  if (index > -1) {
      arr.splice(index, 1);
  }
}

function getPar(par) {
  //获取当前URL
  var local_url = document.location.href;
  //获取要取得的get参数位置
  var get = local_url.indexOf(par + "=");
  if (get == -1) {
    return false;
  }
  //截取字符串
  var get_par = local_url.slice(par.length + get + 1);
  //判断截取后的字符串是否还有其他get参数
  var nextPar = get_par.indexOf("&");
  if (nextPar != -1) {
    get_par = get_par.slice(0, nextPar);
  }
  return get_par;
}

function auth(peerId, watchingPeers) {
  return new Promise(function(resolve, reject) {
    $.post('http://localhost:8080/sign', {
      self_id: peerId,
      watch_ids: watchingPeers.join(':')
    }).success(function(data) {
      console.log(data.watch_ids)
      resolve({
        n: data.nonce,
        t: data.timestamp,
        s: data.signature,
        watchingPeerIds: data.watch_ids.split(':')
      });
    }).error(function(err) {
      reject(err);
    })
  })
}

function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

function deleteCookie( name ) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function createCookie(name,value,hours) {
    if (hours) {
        var date = new Date();
        date.setTime(date.getTime()+(hours*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function randomString(length) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

  if (!length) {
    length = Math.floor(Math.random() * chars.length);
  }

  var str = '';
  for (var i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

function groupIdExisting() {
  // TODO
  var tg = getPar('groupId');
  if (tg) {
    deleteCookie('groupId');
  }

  return tg != false || typeof getCookie('groupId') != 'undefined';
}

function getGroupId() {
  var tg = getPar('groupId');
  if (tg) {
    return tg;
  } else if (typeof getCookie('groupId') != 'undefined') {
    return getCookie('groupId');
  }
  return false;
}

var udao = new UserDao();

// var username = getPar('username');
var user = udao.getuser();
var username = user.get('username');

var peerId = username + randomString(6);
var triggeredByUser = true;

function chatOnReady() {
  isMaster = session.get('owner') == user.id; //username.charAt(0) == 'm';
}

// var watchingPeer = $('#watchingPeer').val().split(',');
var chat;

// Master 使用的
var clients = [];
var kickTimer = {};
var timeout = 10;
var play_progress = {};
var state = 'notstart';
var start_time = (new Date()).valueOf();

function startClient() {
  var watching = [];
  chat = new AVChatClient({
    appId: appid,
    peerId: peerId,
    watchingPeerIds: watching
  });
}

function addOtherChatContent(data) {
    var li = document.createElement("li");
    
    var em = $("<em></em>").text(data.fromPeerId.substr(0, data.fromPeerId.length - 6))[0];
    li.appendChild(em);
    var span = document.createElement("span");
    var div = $("<div></div>").text(data.msg)[0];
    var currentdate = new Date();
    var dateTime =  currentdate.getHours() + ":"
        + currentdate.getMinutes();

    div.appendChild($("<i></i>").text(dateTime)[0]);
    div.appendChild($("<strong></strong>").text("")[0]);
    span.appendChild(div);
    li.appendChild(span);
    $('#content')[0].appendChild(li);
}


function registerNotifications() {
  // --------------- chat 相关监听 ---------------
  chat.on('message', function(data) {
      try {
        var hb = JSON.parse(data.msg);

        if (isMaster) {
          if (hb['type'] == 'heartbeat') {
            var pid = data.fromPeerId;
            console.log(pid);
            if (clients.indexOf(pid) == -1) {
              clients.push(pid);
            }
            if (typeof kickTimer[pid] != 'undefined') {
              // 如果还没跪
              clearTimeout(kickTimer[pid]);
            }
            kickTimer[pid] = setTimeout('kick("' + pid + '")', timeout * 1000);

            // 控制进度。

            if (state == 'mannualPause') {
              // 如果已经手动暂停了，就不再管这个了
              return;
            }

            self_play_time = player.currentTime();

            if (state == 'playing' && hb['state'] == 'notstart') {
              console.log('the client should skip to time: ' + self_play_time);
              sendSkipToCommand(pid, self_play_time);
              play_progress[pid] = {
                'report_time': hb['time'],
                'play_time': self_play_time,
                'state': hb['state'],
              }
              return;
            }

            play_progress[pid] = {
              'report_time': hb['time'],
              'play_time': hb['play_time'],
              'state': hb['state'],
            }

            var min = self_play_time; // 1000000;
            var current_time = (new Date()).valueOf();
            tarr = {};
            for (var k in play_progress) {
              var p = play_progress[k];
              var pct = p.play_time + (current_time - p.report_time)/1000;
              tarr[pid] = pct;
              if (pct < min) {
                min = pct;
              }
            }

            console.log('min is ' + min);

            for (var k in tarr) {
              console.log(k + ' time: ' + tarr[k] + ', progress: ' + play_progress[k]);
              console.log(tarr[k] - min);
              console.log(play_progress[k]);
              if (tarr[k] - min >= 1.5 && play_progress[k]['state'] == 'playing') {
                console.log('pid ' + pid + ' should pause');
                sendPauseCommand(pid);
              } else if (tarr[k] - min < 1 && play_progress[k]['state'] == 'pause') {
                console.log('pid ' + pid + ' should continue');
                sendPlayCommand(pid);
              }
            }

            console.log('self time: ' + self_play_time + ', progress: ' + state);

            if (self_play_time - min >= 1.5 && state == 'playing') {
              console.log('self should pause');
              pause(false);
            } else if (self_play_time - min <= 1 && state == 'pause') {
              console.log('self should continue');
              play(false);
            }

          }
        } else {
          if (hb['type'] == 'command') {
            var command = hb['command'];
            if (command == 'play') {
              play();
            } else if (command == 'pause') {
              pause();
            } else if (command == 'skipto') {
              var tp = hb['time'];
              skipTo(tp);
            }
          }
        }
        // treat as heart beat message
        return;
      } catch (e) {
          addOtherChatContent(data);
      }
    console.log(JSON.stringify(data));
    // console.log(data);
  });

  chat.on('online', function(peers) {
    console.log('[MESSAGE]peers online: ' + peers);
  });

  chat.on('offline', function(peers) {
    console.log('[MESSAGE]peers offline: ' + peers);
  });


  // --------------- group 相关监听 ---------------
    function showParticipants(session){
        var ul = document.getElementById('user-list');
        ul.innerHTML = '';
        for (a in session) 
            session[a] = session[a].substr(0, session[a].length - 6);
        var uniqueNames = [];
        $.each(session, function(i, el){
            if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
        });
        for (a in uniqueNames) {
            var img = document.createElement('img');
            img.src = "images/header/user_header.jpg";
            // img.width = "100%";
            var span = $("<span></span>").text("")[0];
            span.appendChild(img);
            truePeerId = uniqueNames[a];
            var p = $("<p></p>").text(truePeerId)[0];
            var li = document.createElement('li');
            li.appendChild(span);
            li.appendChild(p);
            ul.appendChild(li);
        }
    };


  chat.on('membersJoined', function(data) {
    console.log('member joined:' + data.peerId);
    // return;
      //查询当前群组内的 成员
      var AVOSRealtimeGroups = AV.Object.extend("AVOSRealtimeGroups");
      var query = new AV.Query(AVOSRealtimeGroups);
      query.get(data.roomId, {
          success: function(obj) {
              var members = obj.get('m');
              showParticipants(members);
              // members.forEach(function(id) {

              //   if ($('#group-member-' + id).length < 1) {
              //     $('#group-container-' + data.roomId + ' .members').append($('#group-member-tpl').html().replace(/@peerId@/g, id));
              //   }
              // });
          },
          error: function(object, error) {
              // The object was not retrieved successfully.
              // error is a AV.Error with an error code and description.
          }
      });
    if (data.peerId == peerId) {

    }
  });


  chat.on('joined', function(data) {
    groupId = data.roomId;

    // return;
    //查询当前群组内的 成员
    var AVOSRealtimeGroups = AV.Object.extend("AVOSRealtimeGroups");
    var query = new AV.Query(AVOSRealtimeGroups);
    query.get(data.roomId, {
      success: function(obj) {
        var members = obj.get('m');
        showParticipants(members);
        // members.forEach(function(id) {

        //   if ($('#group-member-' + id).length < 1) {
        //     $('#group-container-' + data.roomId + ' .members').append($('#group-member-tpl').html().replace(/@peerId@/g, id));
        //   }
        // });
      },
      error: function(object, error) {
        // The object was not retrieved successfully.
        // error is a AV.Error with an error code and description.
      }
    });
  });
  chat.on('left', function(data) {
    console.log(['left', data]);
      //查询当前群组内的 成员
      var AVOSRealtimeGroups = AV.Object.extend("AVOSRealtimeGroups");
      var query = new AV.Query(AVOSRealtimeGroups);
      query.get(data.roomId, {
          success: function(obj) {
              var members = obj.get('m');
              showParticipants(members);
              // members.forEach(function(id) {

              //   if ($('#group-member-' + id).length < 1) {
              //     $('#group-container-' + data.roomId + ' .members').append($('#group-member-tpl').html().replace(/@peerId@/g, id));
              //   }
              // });
          },
          error: function(object, error) {
              // The object was not retrieved successfully.
              // error is a AV.Error with an error code and description.
          }
      });
  });
  chat.on('membersLeft', function(data) {
    console.log(['membersLeft', data]);
      //查询当前群组内的成员
      var AVOSRealtimeGroups = AV.Object.extend("AVOSRealtimeGroups");
      var query = new AV.Query(AVOSRealtimeGroups);
      query.get(data.roomId, {
          success: function(obj) {
              var members = obj.get('m');
              showParticipants(members);
              // members.forEach(function(id) {

              //   if ($('#group-member-' + id).length < 1) {
              //     $('#group-container-' + data.roomId + ' .members').append($('#group-member-tpl').html().replace(/@peerId@/g, id));
              //   }
              // });
          },
          error: function(object, error) {
              // The object was not retrieved successfully.
              // error is a AV.Error with an error code and description.
          }
      });
    if (data.peerId == peerId) {

    }
  });
}

//------------- group 相关 ----------------
//用于 Group 用户获取，chat本身不依赖 AV
//AV.initialize(appid, 'ei9xtnhuh22yxfgigur6edc8b29ma19rwgajappxjgr9bj6d');

var groupId;

function setGroup(groupId) {
  $('#groupid').val(groupId);
}

function setCurrentGroup(groupid) {
  groupId = groupid;
}

function joinGroup(groupName, success) {
  chat.joinGroup(groupName).then(function(data) {
    console.log('Join group: ' + groupName);
    if (typeof success != 'undefined') {
      success(data);
    }
  }, function(err) {
    console.log(err);
  })
}

function kick(targetId) {
  console.log('kick targetId: ' + targetId);
  chat.kickFromGroup(groupId, targetId).then(function(data) {
    console.log(['the ' + targetId + ' has been kicked. It\'s a pity', data]);
    deleteElementFromArray(clients, targetId);
    delete kickTimer[targetId];
    delete play_progress[targetId];
  })
}

function sendGroupMessage(msg) {
  var transient = false;
  chat.sendToGroup(msg, groupId, transient).then(function(data) {
    console.log('send group message');
    console.log(data);
    console.log(JSON.stringify({
      msg: msg,
      groupId: groupId
    }));
    // uTODO
    // $('#status').append('Msg Sended');
    // $('#status').append('<br>');
  }, function() {
    alert("send failure!!!")
  });
};

function sendPauseCommand(pid) {
  var msgObj = {
    'type': 'command',
    'command': 'pause',
    'pid': pid,
    // 'peerId': peerId,
  }
  var msg = JSON.stringify(msgObj);
  chat.sendToGroup(msg, groupId).then(function() {
    console.log(['send Sync message', msgObj]);
  }), function() {
    console.log("send heart beat failure= =");
  }
}

function sendPlayCommand(pid) {
  var msgObj = {
    'type': 'command',
    'command': 'play',
    'pid': pid,
    // 'peerId': peerId,
  }
  var msg = JSON.stringify(msgObj);
  chat.sendToGroup(msg, groupId).then(function() {
    console.log(['send Sync message', msgObj]);
  }), function() {
    console.log("send heart beat failure= =");
  }

}

function sendSkipToCommand(pid, time) {
  var msgObj = {
    'type': 'command',
    'command': 'skipto',
    'pid': pid,
    'time': time
  };
  var msg = JSON.stringify(msgObj);
  chat.sendToGroup(msg, groupId).then(function() {
    console.log(['send skip to message', msgObj]);
  }), function() {
    console.log("send heart beat failure= =");
  }
}


function getStatus(peerIds) {
  chat.getStatus(peerIds).then(function(data) {
    console.log(data);
  })
}

var send_per_sec = function() {
  console.log('[INFO]peer id: ' + peerId + ', play_time: ' + ((new Date()).valueOf() - start_time));
  var msgObj = {
    'type': 'heartbeat',
    'time': (new Date()).valueOf(),
    'play_time': player.currentTime(),
    'state': state,
    // 'peerId': peerId,
  }
  var msg = JSON.stringify(msgObj);
  chat.sendToGroup(msg, groupId).then(function() {
    console.log(['send Sync message', msgObj]);
  }), function() {
    console.log("send heart beat failure= =");
  }
}

startChatClient = function() {
  startClient();
  registerNotifications();

  chat.open().then(function(data) {
    console.log(data);
    if (groupIdExisting()) {
      groupId = getGroupId();
      console.log(groupId);
      joinGroup(groupId, function(data) {
        console.log(data);
        if (isMaster) {
          // setInterval(checkClientStatus, timeout * 1000);
        } else {
          HeartBeatInterval = setInterval('send_per_sec()', 3000);
        }
      });

    } else {
      var groupNamet = randomString(10);
      joinGroup(groupNamet, function(data) {
        groupId = data.roomId;
        createCookie('groupId', groupId, 3);
        console.log(data);
      });
    }

  }, function(err) {
    if (typeof fail != 'undefined') {
      fail(data);
    }
  });
}

function closeClient() {
  chat.close().then(function() {
    console.log('closed');
  });
}

// ------ Master -------
  
function checkClientStatus() {
  // 检查进度
}


function play(withSend) {
  if (isMaster) {
    if (typeof withSend == 'undefined' || withSend == true) {
      for (var k in clients) {
        sendPlayCommand(clients[k]);
      }
    }
  } else {
    console.log('start to play');
  }
  state = 'playing';
  triggeredByUser = false;
  player.play();
  triggeredByUser = false;
}

function pause(withSend) {
  if (isMaster) {
    if (typeof withSend == 'undefined' || withSend == true) {
      for (var k in clients) {
        sendPauseCommand(clients[k]);
      }
    }
  } else {
    console.log('start to play');
  }
  state = 'pause';
  triggeredByUser = false;
  player.pause();
  // triggeredByUser = true;
}

function skipTo(time, startup) {
  if (isMaster) {
    for (var k in clients) {
      sendSkipToCommand(clients[k], time);
    }
  } else {
    console.log('skip to ' + time);
  }

  if (typeof startup != 'undefined' && startup) {
    state = 'playing';

    triggeredByUser = false;
    player.play();

    setTimeout(function() {player.currentTime(time)}, 3000);
  } else {
    player.currentTime(time);
    state = 'playing';

    triggeredByUser = false;
    player.play();
  }
}

function registerPlayerEvent() {
  player.on('pause', function() {
    if (!isMaster) {
      return;
    }
    if (!triggeredByUser) {
      triggeredByUser = true;
      return;
    }
    state = 'mannualPause';
    for (var k in clients) {
      sendPauseCommand(clients[k]);
    }
  });

  player.on('play', function() {
    if (!isMaster) {
      return;
    }
    if (!triggeredByUser) {
      triggeredByUser = true;
      return;
    }
    state = 'playing';
    for (var k in clients) {
      sendPlayCommand(clients[k]);
    }
  });

  player.on('seeked', function() {
    if (isMaster) {
      var ct = player.currentTime();
      for (var k in clients) {
        sendSkipToCommand(clients[k], ct);
      }
    }
  })
}

// startChatClient();

