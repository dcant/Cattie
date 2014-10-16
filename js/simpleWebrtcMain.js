wrtc = 0;
wrtc = new SimpleWebRTC({});
function startWebrtc() {
    wrtc.startLocalVideo();
}

function join(roomName) {
    wrtc.on('readyToCall', function () {
        wrtc.joinRoom(roomName);
    });
}
function stopWebrtc() {
    wrtc.stopLocalVideo();
}

function webrtc() {
    this.SimpleWebRTC = swrtc = new SimpleWebRTC({});
    this.start = function() {
        this.SimpleWebRTC.startLocalVideo();
    }

    this.join = function(roomName) {
        this.SimpleWebRTC.on('readyToCall', function () {
            swrtc.joinRoom(roomName);
        });
    }
    this.stop = function() {
        this.SimpleWebRTC.stopLocalVideo();
    }
}

