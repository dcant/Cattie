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