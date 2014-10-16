function deleteElementFromArray(arr, ele) {
  var index = arr.indexOf(5);
  if (index > -1) {
      arr.splice(index, 1);
  }
}
function syncIdExisting() {
  // TODO
  return getPar('syncId') != false;
}

function getSyncId() {
  return getPar('syncId');
}

// TODO
var isMaster = username.charAt(0) == 'm';

var syncPeerId = username + randomString(6);
var syncer;

// Master 使用的
var clients = [];
var kickTimer = {};
var timeout = 10;

function startSyncClient() {
  var watching = [];
  syncer = new AVChatClient({
    appId: appid,
    peerId: peerId,
    watchingPeerIds: watching
  });
}

function registerSyncNotifications() {
  syncer.on('message', function(data) {
    console.log(JSON.stringify(data));
    // console.log(data);
  });

  syncer.on('online', function(peers) {
    console.log('[MESSAGE]peers online: ' + peers);
  });

  syncer.on('offline', function(peers) {
    console.log('[MESSAGE]peers offline: ' + peers);
  });

  syncer.on('membersJoined', function(data) {
    console.log('member joined:' + data.peerId);
    if (data.peerId == peerId) {

    }
  });

  syncer.on('joined', function(data) {
    syncId = data.roomId;
    console.log(['sync joined:', data]);
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

  syncer.on('left', function(data) {
    console.log(['left', data]);
  });

  syncer.on('membersLeft', function(data) {
    console.log(['memebersLeft', data]);

    if (data.peerId != syncPeerId) {

    }
  })
}

//------------- group 相关 ----------------
//用于 Group 用户获取，syncer本身不依赖 AV
//AV.initialize(appid, 'ei9xtnhuh22yxfgigur6edc8b29ma19rwgajappxjgr9bj6d');

function joinSyncer(groupName, success) {
  syncer.joinGroup(groupName).then(function(data) {
    console.log('Join syncer: ' + groupName);
    if (typeof success != 'undefined') {
      success(data);
    }
  }, function(err) {
    console.log(err);
  })
}

function kickSycn(targetId) {
  syncer.kickFromGroup(syncId, targetId).then(function(data) {
    console.log(data);
  })
}

function sendSyncMessage(msg) {
  syncer.sendToGroup(msg, syncId).then(function() {
    console.log('send sync message');
    console.log(JSON.stringify({
      msg: msg,
    }));
    // uTODO
    // $('#status').append('Msg Sended');
    // $('#status').append('<br>');
  }, function() {
    alert("send failure!!!")
  });
}

function getStatus(peerIds) {
  syncer.getStatus(peerIds).then(function(data) {
    console.log(data);
  })
}

var send_per_sec = function() {
  msgObj = {
    'time': (new Date()).valueOf(),
    'peerId': peerId,
  }
  msg = JSON.stringify(msgObj);

  syncer.sendToGroup(msg, syncId).then(function() {
    console.log(['send Sync message', msgObj]);
  }), function() {
    console.log("send heart beat failure= =");
  }
}


// ---- Start the syncer ----
startSyncClient();
registerSyncNotifications();

var open_success = function(data) {
  console.log(data);
  if (isMaster) {

  } else {
    if (clients.indexOf(syncPeerId) != -1) {
      clients.push_back(syncPeerId);
    }
  }
}


syncer.open().then(function(data) {
  if (syncIdExisting()) {
    // 加入老的Group
    syncId = getSyncId();
    joinSyncer(syncId, function(data) {
      open_success(data);
    });
  } else {
    // 新的Group
    var groupNamet = randomString(10);
    joinSyncer(groupNamet, function(data) {
      console.log(data);
    });
  }
}, function(err) {
  if (typeof fail != 'undefined') {
    fail(data);
  }
});


function closeSyncClient() {
  syncer.close().then(function() {
    console.log('closed');
  });
}

// ------ Master -------
if (isMaster) {
  
  function checkClientStatus() {

  }

  function play() {
    var inte = setInterval('send_per_sec()', 5000);
    clients.forEach(function(c) {
      kickTimer[c] = setTimeout('kick("' + c + '")', timeout * 1000);
    });
    setInterval(checkClientStatus, timeout);
  }

  function pause() {

  }

}




