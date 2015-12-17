/**
 * spa.util.js
 * 범용 자바스크립트 유틸리티
 */

spa.util = (function() {
	var makeError, setConfigMap;
	
	//------------- public 생성자 /makeError/ start  ------------
	// 목적 : 에러객체 생성을 위한 편의 래퍼
	// 인자 : * name_text - 에러명
	//		* msg_text - 상세 에러 메시지
	//		* data - 선택적으로 에러 객체에 첨부할 데이터
	// 반환값 : 새로 생성한 에러 객체
	// 예외 : 없음
	makeError = function( name_text, msg_text, data ) {
		var error = new Error();
		error.name = msg_text;
		error.massage = msg_text;
		if ( data ) {
			error.data = data;
		}
		return error;
	}
	
	setConfigMap = function( arg_map ) {
		var
		input_map = arg_map.input_map,
		settable_map = arg_map.settable_map,
		config_map = arg_map.config_map,
		key_name, error;
		
		for (key_name in input_map) {
			if ( input_map.hasOwnProperty( key_name ) ) {
				if ( settable_map.hasOwnProperty( key_name ) ) {
					config_map[key_name] = input_map[key_name];
				} 
				else {
					error = makeError('Bad input', 'Setting config key |'+key_name+'| is not supported');
					throw error;
				} 
			}
		}
	}
	
	return {makeError : makeError, setConfigMap : setConfigMap};
	
}());