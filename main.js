define(function (require, exports, module) {
	$=require("jquery");
	require("./common/valid.js");
	
	$("#email").valid("input",
		["email"],
		["#error-email","邮箱格式不正确"]);
	$("#email").valid("blur",
		["noEmpty"],
		["#error-email","邮箱不能为空"]);
	$("#checkbox").valid("click",
		["checkbox","2-3"],
		["#error-checkbox","请选择两到三个"]);
	$("#radio").valid("click",
		["checkbox","noEmpty"], //注意, 这里不是写错了, radio和checkbox公用一个方法, bootstrap中很多地方也是这么做的
		["#error-radio","请选一个"]);
	$("button").submitValid(".form-needed",".form-error");
});
