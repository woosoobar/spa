/**
 * spa.js
 * 루트 네임스페이스 모듈
 */

var spa = (function() {
	var initModule = function( $container ) {
		spa.shell.initModule( $container );
	}
	return { initModule : initModule };
}());