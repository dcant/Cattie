function checker() {
    var User = new UserDao();
    var user = User.getuser()

    if(user.get('username') != null) {

        $(".log-wrap").hide();
        document.getElementById("login_username").value = "";
        document.getElementById("login_password").value = "";
        document.getElementById("curname").innerText = " "+user.get("username")+" ";
        $(".login-wrap").show();

        checkpage();

    } else {

        $(".log-wrap").show();
        $(".login-wrap").hide();

        checkpage();
    }

    $("#login_submit").click(function() {
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
			if(session.get("owner") == user.id){
				$(".shareLink").css("display","inline-block");
			}

            checkpage();
        }, function() {
            document.getElementById("alter1").innerText = "用户名或密码错误！";
        });
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

                checkpage();
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

        if (typeof(page) != "undefined") {
            $("#msg").attr("readonly", "readonly");
            $("#msg").hide();
            $("#sendMsg").hide();
        }
		$(".shareLink").hide();
    });
}

function checkpage() {
    if (typeof(page) != "undefined") {
        $("#msg").show();
        $("#sendMsg").show();
    }
}