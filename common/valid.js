
/**
 * @module valid
 * @author WangYG
 * @description 约定:
 *              1. 使用window.DOMCheckFailed记录检测到的错误, 不要尝试修改这个全局变量.
 *              2. select默认值中包含符号"-", 正常取值不包含符号"-"
 * 
 */
define(function (require, exports, module) {
	$=require("jquery");
	/**
	 * 给jquery添加一个valid方法, 用于表单验证, 当目标元素{event}发生时, 目标元素的值与{expected}做比较, 如果符合, 调用{success}方法, 否则调用{fail}方法.
	 * 注意: 调用此方法会在window上生成一个DOMCheckFailed数组变量, 可以检查此变量确定是否可以submit
	 * @param  {string} event     input(每次输入变化时), blur(失去焦点)
	 * @param  {object} expected  如果输入为正则表达式, 则按照正则表达式进行验证, 如果传入数组, 则参考下面例子:
	 * 		1) []:执行fail函数
	 * 		2) ["noEmpty"]: 不为空
	 * 		3) ["int","2-5"]:检查是否为2-5位数字, 同类的还有"string"
	 * 		4) ["ajax","ok","api/xxx",{username:"#username"}]: 发POST请求, 如果没有第四个参数则发送GET, 结果和第二参数做比较, 如果不符, 执行fail, 否则执行success.
	 * 		5) ["select","-"]: 这个比较特殊, 只能加在select元素上, 如果on select的value包括"-", 执行fail, 一般select都会设计成第一个是"--请选择--", 其他的不包括"-", 以此判断用户是否做出了选择.
	 * 		6) 其他情况可看名字猜意思.
	 * @param  {function/object}  fail  验证失败时的回调, 如果传入的是方法引用, 则调用该方法; 如果传入的是一个数组, 则会将第一个元素作为选择器关键字, 该元素被设置为第二元素的值.
	 * @param  {function/object/void} success   验证成功时的回调, 和fail类似, 可以为空, 若为空执行fail的逆操作.
	 * @return {void/dummy} 请勿使用返回值.
	 */
	$.fn.valid = function(event, expected, fail, success){
		//locals
		var flag = null; //成功标志
		var self = this;
		var value = null;
		window.DOMCheckFailed = window.DOMCheckFailed || {}; //全局错误标志
		//check params
		if(typeof event!="string")
			throw new Error("argument 1 (event) need to be a string");
		if(typeof expected!="object")
			throw new Error("argument 2 (expected) need to be a object or array");
		if(typeof fail == "undefined")
			console.warn("argument 3 (fail) not set, this call seems dummy")
		var checkSum = function(str,limit){
			var expectedLenMax = 0;
			var expectedLenMin = 0;
			var expectedLenSplit = limit.split("-");
			if(expectedLenSplit.length==1)
				expectedLenMax = expectedLenMin = parseInt(limit);
			else{
				expectedLenMin = expectedLenSplit[0];
				expectedLenMax = expectedLenSplit[1];
			}
			if(str.length>expectedLenMax || str.length<expectedLenMin)
				return false;
			else
				return true;
		}
		var actByFlag = function(flag){
			if(flag==true){  
				if(typeof success== "undefined"){ //如果不传success方法, 则去掉fail产生的DOM
					if(fail.length>0) //如果fail是function, 则直接返回.
						if($(fail[0]).html() == fail[1])
							$(fail[0]).empty();
				}else if(typeof success== "function"){ // 传入的是方法
					success();
					if(typeof fail== null) //expected=[]时,无条件进入success处理, 此情况不处理window.DOMCheckFailed
						return;
				}else{ //传入的是数组 元素1是选择器 元素2是DOM内容
					$(success[0]).html(success[1]);
				}
				delete window.DOMCheckFailed[self.selector+"|"+expected];
			}else if(flag==false){  //防止flag==null, 所以没有使用if(flag)..else..
				if(typeof fail== "function"){
					fail();
				}else if(typeof fail == null){
					return;
				}else{
					$(fail[0]).html(fail[1]);
				}
				window.DOMCheckFailed[self.selector+"|"+expected]="error";
			}
		}
		//bind the event with function
		$(this.selector).on(event,function(){
			value = $(self.selector).val(); //先取值 再判断
			if(expected.length == undefined){ //如果expected是正则表达式, 则直接进行检查
				flag = expected.test(value);
			}else{ //expected 是数组, 则按情况判断
				if(expected.length==0)
					flag = true;  //expected=[]时,无条件进入success处理, 此情况不处理window.DOMCheckFailed
				else{ 
					flag = true;
					switch(expected[0]){
						case "int": //expected=["int","2-5"]
							flag = checkSum(value,expected[1])
							for(var i in value){
								if(value[i]>"9"||value[i]<"0"){
									flag = false;
									break;
								}	
							}
							break;
						case "string":
							flag = checkSum(value,expected[1])
							break;
						case "noEmpty":
							flag = (value.length > 0);
							break;
						case "email":
							pattern = /^([a-zA-Z0-9\-]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9\-]+[_|\_|\.]?)*[a-zA-Z0-9\-]+\.[a-zA-Z]{2,3}$/;
							flag = pattern.test(value);
							break;
						case "mobile-phone":
							pattern = /^1[3|5|7|8]\d{9}$/;
							flag = pattern.test(value);
							break;
						case "strong-pwd":
							pattern = /^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$/;
							flag = pattern.test(value);
							if(flag){
								console.log("strong pwd");
							}
							break;
						case "medium-pwd":
							pattern = /^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$/;
							flag = pattern.test(value);
							break;
						case "weak-pwd":
							pattern = /(?=.{6,}).*/;
							flag = pattern.test(value);
							break;
						case "select":
							var selectValue = $(self.selector + " option:selected").text();
							var initPattern = expected[1]||"-";
							flag = (selectValue.indexOf(initPattern)<0);
							break;
						case "ajax": //expected=["ajax","true","/api/xxx",{username:xxxx}]
							if(expected.length==3){
								window.DOMCheckFailed[self.selector+"|"+expected]="pending";
								$.get(expected[2],function(data,status){
									actByFlag(data == expected[1]);
								})
							}else if(expected.length==4){
								var params = {}
								for(var i in expected[3]){
									params[expected[3][i]]=$(expected[3][i]).val();
								}
								window.DOMCheckFailed[self.selector+"|"+expected]="pending";
								$.post(expected[2],params,function(data,status){
									actByFlag(data == expected[1]);
								})
							}
							break;
					}
					
				}
			}
			actByFlag(flag);
		});
		
	}

	/**
	 * 表单提交时检查表单的方法
	 * @param  {string} needed     必填元素的selector
	 * @param  {string} wrongClass 错误提示元素的selector
	 * @return {bool}              返回true为通过检查
	 */
	$.fn.submitValid = function(neededClass, wrongClass){
		var _this = this;
		var hasError = false;
		$(this.selector).on("click",function(){
			$(neededClass).each(function(index,element){
				switch($(this).prop("tagName")){
					case "INPUT":
						if($(this).html()=="")
							$(this).trigger("blur");
						break;
					case "SELECT":
						var target = $("#" + $(this)[0].id + " option:selected");
						target.trigger("change");
						break;
				}
				
			})
			$(wrongClass).each(function(index,element){
				if($(this).html()!=""){
					$('html,body').animate({scrollTop: $(this).offset().top-50}, 800);
					hasError = true;
					return false;
				}
			})
			return !hasError;
		});
	}
});
