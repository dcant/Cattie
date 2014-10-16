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
  return getPar('groupId') != false;
}

function getGroupId() {
  return getPar('groupId');
}


var appid = '7ec7valej2rlz3eu16lnok3haw7rujcxm2adi3pa4mt0793h';
var username = getPar('username');

var udao = new UserDao();
var peerId = udao.getuser().get('username') + '@' + randomString(6);
var isMaster = username.charAt(0) == 'm';

// var watchingPeer = $('#watchingPeer').val().split(',');
var chat;

// Master 使用的
var clients = [];
var kickTimer = {};
var timeout = 10;

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
      addOtherChatContent(data);
      try {
        var hb = JSON.parse(data.msg);

        if (isMaster) {
          if (hb['type'] == 'heartbeat') {
            var pid = data.fromPeerId;
            if (clients.indexOf(pid) == -1) {
              clients.push_back(pid);
            }
            if (typeof kickTimer[pid] != 'undefined') {
              // 如果还没跪
              clearTimeout(kickTimer[pid]);
            }
            kickTimer[pid] = setTimeout('kick("' + pid + '")', timeout * 1000);
          }
        } else {
          if (hb['type'] == 'command') {
            var command = hb['command'];
            if (command == 'play') {
              play();
            } else if (command == 'startPlay') {
              startPlay();
            } else if (command == 'pause') {
              pause();
            } else if (command == 'skipto') {
              var tp = hb['timepoint'];
              skipTo(tp);
            }
          }
        }
        // treat as heart beat message
        return;
      } catch (e) {

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
  chat.on('membersJoined', function(data) {
    console.log('member joined:' + data.peerId);
    return;
    if (data.peerId == peerId) {

    }
  });

  chat.on('joined', function(data) {
    groupId = data.roomId;

    return;
    //查询当前群组内的 成员
    var AVOSRealtimeGroups = AV.Object.extend("AVOSRealtimeGroups");
    var query = new AV.Query(AVOSRealtimeGroups);
    query.get(data.roomId, {
      success: function(obj) {
        var members = obj.get('m');
        members.forEach(function(id) {
          if ($('#group-member-' + id).length < 1) {
            $('#group-container-' + data.roomId + ' .members').append($('#group-member-tpl').html().replace(/@peerId@/g, id));
          }
        });
      },
      error: function(object, error) {
        // The object was not retrieved successfully.
        // error is a AV.Error with an error code and description.
      }
    });
  });
  chat.on('left', function(data) {
    console.log(['left', data]);

  });
  chat.on('membersLeft', function(data) {
    console.log(['membersLeft', data]);
    return;
    if (data.peerId == peerId) {

    }
  });
}

//------------- group 相关 ----------------
//用于 Group 用户获取，chat本身不依赖 AV
//AV.initialize(appid, appkey);

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

function getStatus(peerIds) {
  chat.getStatus(peerIds).then(function(data) {
    console.log(data);
  })
}

var send_per_sec = function() {
  msgObj = {
    'type': 'heartbeat',
    'time': (new Date()).valueOf(),
    'peerId': peerId,
  }
  msg = JSON.stringify(msgObj);
  chat.sendToGroup(msg, syncId).then(function() {
    console.log(['send Sync message', msgObj]);
  }), function() {
    console.log("send heart beat failure= =");
  }
}


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
        setInterval(checkClientStatus, timeout * 1000);
      } else {
        HeartBeatInterval = setInterval('send_per_sec()', 5000);
      }
    });

  } else {
    var groupNamet = randomString(10);
    joinGroup(groupNamet, function(data) {
      console.log(data);
    });
  }

}, function(err) {
  if (typeof fail != 'undefined') {
    fail(data);
  }
});


function closeClient() {
  chat.close().then(function() {
    console.log('closed');
  });
}

// ------ Master -------
  
checkClientStatus = function() {
  // 检查进度
}

// 立即开始检查状态
startPlay = function() {
  if (isMaster) {

  } else {

  }
}

play = function() {
  if (isMaster) {

  } else {

  }
}

pause = function() {
  if (isMaster) {

  } else {

  }
}





