var appid = "7ec7valej2rlz3eu16lnok3haw7rujcxm2adi3pa4mt0793h";
var appkey = "iqjhg4k86lq7nstwjnqmqnhahfiy8suvnn16uiyuz5v25hcm";
AV.initialize(appid, appkey);

function UserDao() {
	this.register = function(username, password, email, scallback, ecallback) {
		var user = new AV.User();
		user.set("username", username);
		user.set("password", password);
		user.set("email", email);

		user.signUp(null, {
			success: function(user) {
				scallback(user);
			},
			error: function(user, error) {
				ecallback(user, error);
			}
		});
	}

	this.login = function(username, password, scallback, ecallback) {
		AV.User.logIn(username, password, {
			success: function(user) {
				scallback(user);
			},
			error: function(user, error) {
				ecallback();
			}
		});
	}

	this.logout = function() {
		AV.User.logOut();
	}

	this.find = function(username, scallback, ecallback) {
		var query = new AV.Query(AV.User);
		query.equalTo("username", username);
		query.first({
			success: function(user) {
				scallback(user);
			},
			error: function(error) {
				ecallback(error);
			}
		});
	}

	this.addFriend = function(username, scallback, ecallback) {
		var current = AV.User.current();
		if (!current) {
			ecallback();
			return;
		}

		var query = new AV.Query(AV.User);
		query.equalTo("username", username);
		query.first({
			success: function(user) {
				AV.User.current().follow(user.id).then(function() {
					scallback();
				}, function(err) {
					ecallback(err);
				});
			},
			error: function(error) {
				ecallback(error);
			}
		});
	}

	this.getFriends = function(scallback) {
		var currentUser = AV.User.current();
		if (!currentUser)
			return ;
		var query = AV.User.current().followeeQuery();
		query.include('followee');
		query.find().then(function(followees) {
			scallback(followees);
		}, function(err) {

		});
	}

	this.delFriend = function(scallback) {
		var currentUser = AV.User.current();
		if (!currentUser)
			return;
		AV.User.current().unfollow(id).then(function() {
			scallback();
		}, function(err) {

		});
	}
	
	this.getCurrentOrCreate = function(callback){
		//TODO
		var a = {};
		a["id"] = 10;
		callback(a);
	};
}

function SessionDao() {
	var Session = AV.Object.extend("Session");
	this.createSession = function(owner, video ,scallback, ecallback) {
		var session = new Session();
		session.set("state", 0);
		session.set("owner", owner);
		session.set("video", video);
		session.save(null, {
			success: function(data) {
				if(scallback)
					scallback(data);
			},
			error: function(record, error) {
				if(ecallback)
					ecallback(record, error);
			}
		});
	};

	this.setGroup = function(sessionid, sync, group) {
		//TODO
		var session = new Session();
		session.get(sessionid,{
			success: function(data){
				session.set("chatgroup", chatgroup);
				session.set("eventgroup", eventgroup);
				session.save(null, {
					success: function(data){
						//scallback(data);
					},
					error: function(record, error){
						//ecallback(record, error);
					}
				});
			},
			error: function(record, error){
				ecallback(record, error);
			}
		});
	};
}

function RecordDao() {
	this.create = function(sessionid, videoid, userid, score, scallback) {
		var Record = AV.Object.extend("Record");
		var record = new Record();
		record.set("sessionid", sessionid);
		record.set("videoid", videoid);
		record.set("userid", userid);
		record.set("score", score);

		record.save(null, {
			success: function(record) {
				scallback();
			},
			error: function(record, error) {

			}
		});
	}

	this.update = function(recordid, score, scallback) {
		var Record = AV.Object.extend("Record");
		var query = new AV.Query(Record);
		query.get(recordid, {
			success: function(record) {
				var urecord = record;
				urecord.set("score", score);

				urecord.save(null, {
					success: function(urecord) {
						scallback();
					},
					error: function(urecord, error) {

					}
				});
			}
		})
	};
}

function VideoDao() {
	this.create = function(videoname, videotype, videotitle, videodescription) {
		var VideoInfo = AV.Object.extend("VideoInfo");
		var videoinfo = new VideoInfo();
		videoinfo.set("videoname", videoname);
		videoinfo.set("videotype", videotype);
		videoinfo.set("videotitle", videotitle);
		videoinfo.set("videodescription", videodescription);

		videoinfo.save(null, {
			success: function(videoinfo) {

			},
			error: function(videoinfo, error) {

			}
		});
	};
	
	this.getOrCreateVideo = function(decoded, vinfo){
		//TODO
		var video ={};
		video["real_url"] = "http://k.youku.com/player/getFlvPath/sid/441303464340012e66d19_01/st/mp4/fileid/0300200100543774387B661468DEFE193D28B1-8075-B760-7F9C-72BCBD894205?K=0135cfab3c33c322261df231&hd=0&ymovie=1&myp=0&ts=1420&ypp=2&ctype=12&ev=1&token=3298&oip=3663591661&ep=diaVGUmOUsgE5iffiD8bMirkIHYGXP4J9h%2BHgdJjALshTOu4njrSz5rCSPlDEv8RBldwZer4qKTlYjIVYfhDrm0QrUmuOfrniPmQ5apRtuNyEhE%2Fds%2FXsVSdQTn5"
		video["url"] = "http://www.tudou.com/albumplay/jGaFpdJqObQ/sArqU-hBvjw.html";
		return video;
	};
}