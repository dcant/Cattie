var appid = "7ec7valej2rlz3eu16lnok3haw7rujcxm2adi3pa4mt0793h";
var appkey = "iqjhg4k86lq7nstwjnqmqnhahfiy8suvnn16uiyuz5v25hcm";
AV.initialize(appid, appkey);

function TempUserDao() {
	this.username = null;
}

//var tempuser = new TempUserDao();

function UserDao() {
	this.getuser = function() {
		if (AV.User.current())
			return AV.User.current();
		else
			var user ={};
			user['username'] = sessionStorage.getItem('username');
			user.get=function(){return sessionStorage.getItem('username');}
			return user;
	}

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

	this.tempregister = function(username, scallback) {
		sessionStorage.setItem('username', username);
		scallback(username);
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
}

function SessionDao() {
	var Session = AV.Object.extend("VSession");
	this.createSession = function(owner, video ,scallback, ecallback) {
		var session = new Session();
		session.set("state", 0);
		session.set("owner", owner);
		session.set("video", video);
		session.save(null, {
			success: function(data) {
					scallback(data);
			},
			error: function(record, error) {
					ecallback(record, error);
			}
		});
	};
	
	this.getSession = function(session_id, scallback, ecallback){
		var query = new AV.Query(Session);
		query.get(session_id,{
			success: function(data){
				scallback(data);
			},
			error: function(record, error){
				ecallback(record, error);
			}
		});
	};

	this.setGroup = function(sessionid, sync, group) {
		//TODO
		var query = new AV.Query(Session);
		query.get(sessionid,{
			success: function(data){
				session.set("sync", sync);
				session.set("group", group);
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
				//ecallback(record, error);
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
	var VideoInfo = AV.Object.extend("VideoInfo");
	this.create = function(videoname, videotype, videotitle, videodescription) {
		
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
	
	this.getVideo =  function(video_id, scallback, ecallback){
		var query =  new AV.Query(VideoInfo);
		query.get(video_id, {
			success: function(data){
				scallback(data);
			},
			error: function(data, error){
				ecallback(data, error);
			}
		});
	};
	
	this.getOrCreateVideo = function(url, vinfo, scallback){
		var VideoInfo = AV.Object.extend("VideoInfo");
		var query = new AV.Query(VideoInfo);
		query.equalTo("url", url);
		query.find({
			success: function(data) {
				if(data.length == 0){
					var videoinfo = new VideoInfo();
					videoinfo.set("url", url);
					videoinfo.set("title", vinfo.title);
					videoinfo.set("tags", vinfo.tags);
					videoinfo.set("description", vinfo.description);
					videoinfo.save(null, {
						success: function(data) {
							scallback(data);
						},
						error: function(videoinfo, error) {

						}
					});
				}else{
					scallback(data[0]);
				}
			},error: function(videoinfo, error){
				//alert(error);
			}
		});
	};
	
	this.setRealUrl = function(video, real_video_url){
		video.set("real_url", real_video_url);
		video.save();
	};
}