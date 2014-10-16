
/*-------------- Cattie | Author by Ming  ------------------*/
/*                   v1.0 | 2014-10-11                      */
/*                     License: MIT                         */
/*----------------------------------------------------------*/


$(document).ready(function() {
    
	/*---------------- 浏览器兼容性检测 -----------------------*/
	//关闭兼容性提示
	var $cp_tips = $(".cp-tips"); //提示信息对象
	$(".cp-tips-close").click(function() {
		$cp_tips.stop(true,true).slideUp(400);
	});
	$cp_tips.delay(3000).slideUp(500); //延时3s自动关闭
	

	$("#pc-login, #pc-register").validator({
		
		stopOnError: false,
		focusCleanup: true, //是否在输入框获得焦点的时候清除消息，默认不清除
		timely: 2,          //2启用实时验证，在输入的同时验证该字段
		//theme:'yellow_right_effect',
		fields: {
	
		   url: 'required; url',
		   email: 'required; email',
		   username:'required; username',
		   password:'required; password',
		   "password[twice]":{
			   rule:'required; match[password]',
			   msg:'两次密码输入不一致'
		   },
		   
	
		},
	
	});



	/*---------- PC/平板 弹出层   登录/注册 -------------*/
	var $title_li = $(".LR-tab-title li");
	var $LR_content = $(".LR-content-wrap div.LR-content");
	var $lay_hide = $(".float-lay-bg, .login-register-wrap");
	//打开弹出层
	$(".log-wrap li").click(function(){
		$lay_hide.fadeIn(500);
		var index = $(this).index();
		$title_li.eq(index).addClass("LR-item-on").siblings().removeClass("LR-item-on");;
		$LR_content.eq(index).addClass("LR-content-show").siblings().removeClass("LR-content-show");
	});
	//关闭弹出层
	$(".LR-wrap-close").click(function() {
		$lay_hide.fadeOut(500);
	});
	//切换登录/注册
	$title_li.click(function() {
		var index = $(this).index();
		$(this).addClass("LR-item-on").siblings().removeClass("LR-item-on");;
		$LR_content.eq(index).addClass("LR-content-show").siblings().removeClass("LR-content-show");
		
	});
	
	
	
	$(".shareLink").click(function() {
		session_url = generateUrl(session, decoded);
		console.log("aaaaaa"+session_url);
		enableGenerate(session_url);
        $(".create-link-wrap").fadeIn(500);
    });
	
	$(".create-link-wrap span").click(function() {
        $(".create-link-wrap").fadeOut(500);
    });

	$("#voice-online").on("click",function() {
        $(this).toggleClass("voicing");
		
    });
	
	
	/*弹出警告框，或关闭*/
	/*warn_event($(".warn-wrap"));  使用案例*/  
	
	function warn_event($id){
		var $warn_hide = $(".float-lay-bg, .warn-wrap")
		$id.click(function(){
			$warn_hide.fadeToggle(500);
		});
		
	}
	
	
		
	
});