var baseUrl = "http://10.5.72.96/catties/";
var flvxztoken = "61f229cc8620091383e9ff541e26bb2c";

String.prototype.trim= function(){  
    // 用正则表达式将前后空格  
    // 用空字符串替代。  
    return this.replace(/(^\s*)|(\s*$)/g, "");  
}

window.vurlencode = function(uri){
	uri = uri.replace(/^(http:\/\/[^\/]*(?:youku|tudou|ku6|yinyuetai|letv|sohu|youtube|iqiyi|facebook|vimeo|cutv|cctv|pptv))xia.com\//,'$1.com/');
	uri = uri.replace(/^(http:\/\/[^\/]*(?:bilibili|acfun|pps))xia\.tv\//,'$1.tv/');
	uri = uri.replace(/^(https?:)\/\//,'$1##');
	uri = $.base64.btoa(uri);
	uri = uri.replace('+','-').replace('/','_');
	return uri;
}
window.vurldecode = function(uri){
	var sharpPos;
	sharpPos = uri.indexOf('#');
	if(sharpPos>0) uri = uri.substring(0,sharpPos);
	if(/^[A-Za-z0-9=\+\/]+$/.test(uri)) uri = $.base64.atob(uri);
	else if(/^[A-Za-z0-9=\-_]+$/.test(uri)) uri = $.base64.atob(uri.replace('-','+').replace('_','/'));
	uri = uri.replace(/^(https?:)##/,'$1//');
	return uri;
}

function VideoUtil(){
	this.getInfo = function(url, callback){
		//http://www.tudou.com/albumplay/8gIBN9P0p2k/TzQG2c812uo.html
		var code =url.substring( url.lastIndexOf("/")+1, url.lastIndexOf("."));
		//alert(code);
		var url = "http://api.tudou.com/v6/video/info&app_key=8988764315e38435&format=json&itemCodes="+code;
		$.get(baseUrl+"/agent.php?url="+url, function(data) {
			console.log(data);
			callback(JSON.parse(data));
		});
	};
}

function GetQueryString(name){
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}

function generateUrl(session, decoded){
	return window.location.href + "&session_id="+vurlencode(session.id) + "&groupId=" + groupId;
}

function parseRealUrl(video_url, callback){
	var url = "http://api.flvxz.com/token/" + flvxztoken + "/url/" + video_url;
	console.log(url);
	$.get(baseUrl+"/videourl.php?url=" + url, function(data) {
		//console.log(data);
		//var begin = data.indexOf("<![CDATA[") + 9;
		//var subdata=data.substring(begin);
		//var end = subdata.indexOf("]]></furl><ftype>mp4</ftype>");
		//url = data.substring(begin, begin + end);
		console.log(data);
		callback(data);//callback url
	});
}
