var getQueryVariable = function(variable, queryString){
	queryString = queryString || window.location.search;

	var query = queryString.substr(1),
		vars  = query.split('&'),
		pairs;

	for(var i = 0, j = vars.length; i < j; i++){
		pairs = vars[i].split('=');

		if(decodeURIComponent(pairs[0]) == variable){
			return decodeURIComponent(pairs[1]);
		}
	}
};
var makeEmail = function() { 
    var strValues="abcdefg12345"; 
    var strEmail = "random"; 
    var strTmp; 
    for (var i=0;i<10;i++) { 
        strTmp = strValues.charAt(Math.round(strValues.length*Math.random())); 
        strEmail = strEmail + strTmp; 
    } 
    strTmp = ""; 
    strEmail = strEmail + "@"; 
    for (var j=0;j<8;j++) { 
        strTmp = strValues.charAt(Math.round(strValues.length*Math.random())); 
        strEmail = strEmail + strTmp; 
    } 
    strEmail = strEmail + ".com" 
    return strEmail; 
} 