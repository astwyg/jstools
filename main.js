define(function (require, exports, module) {
	$=require("jquery");
	require("./common/valid.js");
	
	$("#email").valid("input",
		["email"],
		["#error_email","邮箱格式不正确"]);

});
