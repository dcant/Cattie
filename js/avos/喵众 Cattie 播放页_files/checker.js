function checker() {
    var User = new UserDao();
    var user = User.getuser()

    if(user.get('username') != null || (sessionStorage.getItem('username') != null)) {

        $(".log-wrap").hide();
        document.getElementById("login_username").value = "";
        document.getElementById("login_password").value = "";
        if (sessionStorage.getItem('username') == null)
            document.getElementById("curname").innerText = " "+user.get("username")+" ";
        else {
            document.getElementById("curname").innerText = " "+sessionStorage.getItem('username')+" ";
            $("#logout").hide();
        }
        $(".login-wrap").show();

    } else {

        $(".log-wrap").show();
        $(".login-wrap").hide();
    }

    $("#noneuser-log").click(function(){

        var $hide = $("#none-pwd, #forget-pwd");
        if($(this).find("input").is( ":checked" )){

            $hide.hide();
        }
        else{
            $hide.show();
        }
     
     

    });

    $("#login_submit").click(function() {
        if ($("#noneuser-log").find("input").is(":checked")) {
            var user = new UserDao();
            var username = $("#login_username").val();
            user.tempregister(username, function(username) {
            $(".float-lay-bg, .login-register-wrap").fadeOut(200);
            $(".log-wrap").hide();
            document.getElementById("login_username").value = "";
            document.getElementById("login_password").value = "";
            document.getElementById("curname").innerText = username;
            $(".login-wrap").show();
            $("#logout").hide();
            });
        } else {
            var user = new UserDao();
            var username = $("#login_username").val();
            var password = $("#login_password").val();
            user.login(username, password, function(user) {
                $(".float-lay-bg, .login-register-wrap").fadeOut(200);
                $(".log-wrap").hide();
                document.getElementById("login_username").value = "";
                document.getElementById("login_password").value = "";
                document.getElementById("curname").innerText = " "+user.get("username")+" ";
                $(".login-wrap").show();
            }, function() {
                document.getElementById("alter1").innerText = "用户名或密码错误！";
            });
        }
    });

    $("#register_submit").click(function() {
        var user = new UserDao();
        var username = $("#register_username").val();
        var email = $("#register_email").val();
        var password = $("#register_password").val();

        user.register(username, password, email, function(user) {
            var inuser = new UserDao();
            inuser.login(username, password, function(user) {
                $(".float-lay-bg, .login-register-wrap").fadeOut(200);
                $(".log-wrap").hide();
                document.getElementById("login_username").value = "";
                document.getElementById("login_password").value = "";
                document.getElementById("curname").innerText = " "+user.get("username")+" ";
                $(".login-wrap").show();
            });
        }, function(user, error) {
            document.getElementById("alter2").innerText = error.message;
        });
    });

    $("#logout").on("click", function() {
        var user = new UserDao();
        user.logout();
        $(".log-wrap").show();
        $(".login-wrap").hide();
    });
}