
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
        $(".create-link-wrap").fadeIn(500);
    });
	
	$(".create-link-wrap span").click(function() {
        $(".create-link-wrap").fadeOut(500);
    });
	
	//复制到剪切板js代码
		$(".copy-link-btn").click(function(e) {
			alert();
			copyToClipBoard($("#created-link").text());
		});
	
        function copyToClipBoard(s) {
            //alert(s);
            if (window.clipboardData) {
                window.clipboardData.setData("Text", s);
                alert("已经复制到剪切板！"+ "\n");
            } else if (navigator.userAgent.indexOf("Opera") != -1) {
                window.location = s;
            } else if (window.netscape) {
                try {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                } catch (e) {
                    alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将'signed.applets.codebase_principal_support'设置为'true'");
                }
                var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
                if (!clip)
                    return;
                var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
                if (!trans)
                    return;
                trans.addDataFlavor('text/unicode');
                var str = new Object();
                var len = new Object();
                var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
                var copytext = s;
                str.data = copytext;
                trans.setTransferData("text/unicode", str, copytext.length * 2);
                var clipid = Components.interfaces.nsIClipboard;
                if (!clip)
                    return false;
                clip.setData(trans, null, clipid.kGlobalClipboard);
                alert("已经复制到剪切板！" + "\n" + s)
            }
        }	




	
	
		
	
});