var OAuth_user = {};

/*var tempIndex = location.href.lastIndexOf('.html');
var redirect_uri = location.href.substring(0,tempIndex+5);*/
var redirect_uri = location.href;


var client_id_douban = "06dbafca5db2787314930f5f19176959";
var client_secret_douban = "71251edc1a520965";
var auth_url_douban = 'https://www.douban.com/service/auth2/auth?client_id=06dbafca5db2787314930f5f19176959&redirect_uri='+redirect_uri+'&response_type=code&state=douban'
var token_base_url_douban = "https://www.douban.com/service/auth2/auth?";


//tudou
var client_id_tudou = "8988764315e38435";
var client_secret_tudou = "0fe8e8d9cbbca2402e977ae167f209fa";
var auth_url_tudou = "https://api.tudou.com/oauth2/authorize?client_id=8988764315e38435&redirect_uri="+redirect_uri+"&scope=user_base_info&state=tudou&display=web";
var token_base_url_tudou = "https://api.tudou.com/oauth2/access_token&"+"client_id=8988764315e38435&client_secret=0fe8e8d9cbbca2402e977ae167f209fa&code=";
var access_token_tudou = null;
var uid_tudou = null;
/*reference */
//var baseUrl = "http://10.5.72.100:8080/Cattie/agent.php?";
(function($){
    //console.log("execution ready");

  $(document).ready(function(){
    var state = getQueryVariable('state');
    console.log("dodument ready");
    switch(state){
      case 'tudou':{
        var code = getQueryVariable("code");
        if(!code){
          console.log('error invalid code !');
          return;
        }else{
          console.log(code);
          //console.log('token_base_url_tudou '+baseUrl+ "url="+token_base_url_tudou+code);
          $.ajax({
            type:"POST",
            url:baseUrl + "/agent.php?",
            data:{
              url:"https://api.tudou.com/oauth2/access_token",
              client_id:"8988764315e38435",
              client_secret:"0fe8e8d9cbbca2402e977ae167f209fa",
              code:code
            },
            contentType:"application/x-www-form-urlencoded; charset=UTF-8",
            success:function(data){
              console.log(data);
              data = JSON.parse(data);
              console.log(data);

              console.log('access_token_tudou '+data["access_token"]);
              access_token_tudou = data["access_token"];
              uid_tudou = data["uid"];
              if(access_token_tudou && uid_tudou){
                $.get(baseUrl + "/agent.php?url=http://api.tudou.com/v6/user/info&app_key=8988764315e38435&format=json&user="+uid_tudou,
                  function(data){
                    if(!data){
                      console.log('cant get user info!!!!!');
                    }else{
                      console.log('userinfo '+data);
                      data = JSON.parse(data);
                      OAuth_user.userName = data.userName;
                      var user = new UserDao();
                      user.register(data.userName,"111111",makeEmail(),function(user){
                        var inuser = new UserDao();
                        inuser.login(data.userName, "111111", function(user) {
                            $(".float-lay-bg, .login-register-wrap").fadeOut(200);
                            $(".log-wrap").hide();
                            document.getElementById("login_username").value = "";
                            document.getElementById("login_password").value = "";
                            document.getElementById("curname").innerText = " "+user.get("username")+" ";
                            $(".login-wrap").show();
                        });
                      },function(user,error){
                        //document.getElementById("alter2").innerText = error.message;
                        console.log('error user register');
                        console.log(user);
                        console.log(error);
                      })

                    }
                  })
              }
            }
          })
        }

        break;
      }
      case 'douban':{
        var code = getQueryVariable("code");
        if(!code){
          console.log('error invalid code !');
          return;
        }else{
          console.log(code);
          
          $.ajax({
            type:"POST",
            url:baseUrl + "/agent.php?",
            data:{
              url:"https://www.douban.com/service/auth2/token",
              client_id:"06dbafca5db2787314930f5f19176959",
              client_secret:"71251edc1a520965",
              redirect_uri:redirect_uri,
              grant_type:"authorization_code",
              code:code
            },
            contentType:"application/x-www-form-urlencoded; charset=UTF-8",
            success:function(data){
              console.log(data);
              data = JSON.parse(data);
              console.log(data);
              access_token_douban = data["access_token"];
              if(!access_token_douban){
                console.log('empty access_token_douban');
              }else{
                OAuth_user.userName = data["douban_user_name"];
                var user = new UserDao();
                user.register(data["douban_user_name"],"111111",makeEmail(),function(user){
                  var inuser = new UserDao();
                  inuser.login(data["douban_user_name"], "111111", function(user) {
                      $(".float-lay-bg, .login-register-wrap").fadeOut(200);
                      $(".log-wrap").hide();
                      document.getElementById("login_username").value = "";
                      document.getElementById("login_password").value = "";
                      document.getElementById("curname").innerText = " "+user.get("username")+" ";
                      $(".login-wrap").show();
                  });
                },function(user,error){
                  //document.getElementById("alter2").innerText = error.message;
                  console.log('error user register');
                  console.log(user);
                  console.log(error);
                })
              }
            }
          })
        }
        break;
      }
      default:console.log('no state parameter');
    }
  })
  $(document).on('click','#doubanLogin',function(){
     window.location.href = auth_url_douban;
  });
  $(document).on('click','#tudouLogin',function(){
    window.location.href = auth_url_tudou;
  });

})(jQuery)
