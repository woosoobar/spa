/**
 * spa.shell.js
 * SAP용 셸 모듈
 */

spa.shell = (function() {
	//-------------------- 모듈스코프변수 시작 --------------------
	var 
	configMap = { //정적 정보
		main_html : String()
			+'<div class="spa-shell-head">'
			+'	<div class="spa-shell-head-logo"></div>'
			+'	<div class="spa-shell-head-acct"></div>'
			+'	<div class="spa-shell-head-search"></div>'
			+'</div>'
			+'<div class="spa-shell-main">'
			+'	<div class="spa-shell-main-nav"></div>'
			+'	<div class="spa-shell-main-content"></div>'
			+'</div>'
			+'<div class="spa-shell-foot"></div>'
			+'<div class="spa-shell-chat"></div>'
			+'<div class="spa-shell-modal"></div>'
		,
		chat_extend_time : 250,
		chat_retract_time : 300,
		chat_extend_height : 400,
		chat_retract_height : 15,
		chat_extended_title : 'Click to retract',
		chat_retracted_title : 'Click to extend',
		anchor_schema_map : {
			chat : {open : true, closed : true}
		}
	},
	stateMap = { // 동적 정보
		$container : null,
		anchor_map : {},
		is_chat_retracted : true
	},
	jqueryMap = {},
	copyAnchorMap, changeAnchorPart, onHashchange,
	setJqueryMap, toggleChat, onClickChat, initModule;
	//-------------------- 모듈스코프변수 끝 --------------------
		
	//-------------------- 유티리티 메서드  start  --------------------
	copyAnchorMap = function() {
		return $.extend( true, {}, stateMap.anchor_map );
	}
	//-------------------- 유티리티 메서드  end  --------------------
	
	changeAnchorPart = function( arg_map ) {
		var
		anchor_map_revise = copyAnchorMap(),
		bool_return = true,
		key_name, key_name_dep;
		
		KEYVAL :
		for (key_name in arg_map) {
			if ( arg_map.hasOwnProperty( key_name ) ) {
				if ( key_name.indexOf('_') === 0 ) {
					continue KEYVAL;
				}
				// 독립적 키 값을 업데이트
				anchor_map_revise[key_name] = arg_map[key_name];
				// 대응되는 의존적 키를 업데이트
				key_name_dep = '_' + key_name;
				if ( arg_map[key_name_dep] ) {
					anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
				} else {
					delete anchor_map_revise[key_name_dep];
					delete anchor_map_revise['_s' + key_name_dep];					
				}								
			}
		}
		
		try {
			$.uriAnchor.setAnchor( anchor_map_revise );
		} catch (error) {
			$.uriAnchor.setAnchor( stateMap.anchor_map, null, true );
			bool_return = false;
		}
		return bool_return;
	}
	
	onHashchange = function() {
		var
		anchor_map_previous = copyAnchorMap(),
		anchor_map_proposed,
		_s_chat_pervious, _s_chat_proposed,
		s_chat_proposed;
		
		try {
			anchor_map_proposed = $.uriAnchor.makeAnchorMap();
		} catch(error) {
			$.uriAnchor.setAnchor( anchor_map_previous, null, true);
			return false;
		}
		stateMap.anchor_map = anchor_map_proposed;
		
		_s_chat_pervious = anchor_map_previous._s_chat;
		_s_chat_proposed = anchor_map_proposed._s_chat;
		
		if ( !anchor_map_previous || _s_chat_pervious !== _s_chat_proposed ) {
			
			s_chat_proposed = anchor_map_proposed.chat;
			
			switch ( s_chat_proposed ) {
			case 'open' :
				toggleChat(true);
				break;
			case 'closed' :
				toggleChat(false);
				break;
			default :
				toggleChat(false);
				delete anchor_map_proposed.chat;
				$.uriAnchor.setAnchor( anchor_map_proposed, null, true );				
			}
		}
		return false;
	}
	
	//-------------------- DOM 메서드 /setJqueryMap/ start  --------------------
	setJqueryMap = function() {
		var $container = stateMap.$container;
		jqueryMap = { 
			$container : $container,
			$chat : $container.find('.spa-shell-chat')	
		};
	};
	//-------------------- DOM 메서드 /setJqueryMap/ end  --------------------
	
	//-------------------- DOM 메서드 /toggleChat/ start  --------------------
	toggleChat = function( do_extend, callback ) {
		var
		px_chat_ht = jqueryMap.$chat.height();
		is_open = px_chat_ht === configMap.chat_extend_height,
		is_closed = px_chat_ht === configMap.chat_retract_height,
		is_sliding = !is_open && !is_closed;
		
		if ( is_sliding ) { return false }
		
		if ( do_extend ) {
			jqueryMap.$chat.animate(
					{ height : configMap.chat_extend_height },
					configMap.chat_extend_time,
					function() {
						jqueryMap.$chat.attr('title', configMap.chat_extended_title);
						stateMap.is_chat_retracted = false;
						if ( callback ) {
							callback( jqueryMap.$chat );
						}
					});
			return true;
		}
		
		jqueryMap.$chat.animate(
				{ height : configMap.chat_retract_height },
				configMap.chat_retract_time,
				function() {
					jqueryMap.$chat.attr('title', configMap.chat_retracted_title);
					stateMap.is_chat_retracted = true;
					if ( callback ) {
						callback( jqueryMap.$chat );
					}
				});
		return true;
	}
	//-------------------- DOM 메서드 /toggleChat/ end  --------------------
	
	//-------------------- DOM 메서드 /onClickChat/ start  --------------------
	onClickChat = function( event ) {
//		if (toggleChat( stateMap.is_chat_retracted )) {
//			$.uriAnchor.setAnchor({ chat : (stateMap.is_chat_retracted ? 'open' : 'closed') })
//		}
		changeAnchorPart( {chat : (stateMap.is_chat_retracted ? 'open' : 'closed')} );
		return false;
	}
	//-------------------- DOM 메서드 /onClickChat/ end  --------------------
	
	initModule = function( $container ) {
		stateMap.$container = $container;
		$container.html( configMap.main_html );
		setJqueryMap();
		
		stateMap.is_chat_retracted = true;
		
		$.uriAnchor.configModule( {schema_map : configMap.anchor_schema_map} );

		// 기능 모듈 설정 및 초기화
		spa.chat.configModule( {} );
		spa.chat.initModule( jqueryMap.$chat );
		
		jqueryMap.$chat
			.attr('title', configMap.chat_retracted_title)
			.click( onClickChat );
		
		$(window)
			.bind('hashchange', onHashchange)
			.trigger('hashchange');
//		setTimeout( function() { toggleChat(true); }, 3000);
//		setTimeout( function() { toggleChat(false); }, 5000);
	};
	
	return { initModule : initModule };
}());