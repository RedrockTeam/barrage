
	
	var socket = io(location.origin + '/index', { path : "/chat_video/socket_io" });
	socket.emit('login', {id: $.cookie('id')});
	socket.on('checkIndexViewIsOpen',function (data) {
		if (data.info == false) {
			alert("请勿同时打开两个活动页面!");
			window.location.href = "login";
		} else {
			$('body').fadeIn();
		}
	});



	$(function() {
		var monitor;
		var outputComment;

		socket.on('barrageToIndex', function (info) {
			slide($('.Screen'), info.text, {
	            "color": info.color
	        }, info.position);
		});
		
		var match = 0;
		var $li = $("#point div");
		$li.on("click",function(){
			var num = +$(this).attr("num");
			if(num != match){
				clearScreen();
				gradualChange(num);
				setTimeout(function(){
					choose(num);
				},1000);
			}
		});

	    $($li[0]).click();
		function clearScreen(){
			clearInterval(monitor);
			clearInterval(outputComment);
			setTimeout(function(){
				$(".Screen").remove();
				$(".wall").remove();
				$(".slotMachine").remove();
				$(".brush").remove();
			},995);
		}

		function choose(num) {
			$("#point div").removeClass("onclick");
			$($("#point div")[+num-1]).addClass("onclick");
			switch (num) {
				case 1:
					//创建弹幕幕布
					var Screen = creatScreen($("#barrage"));
					setTimeout(function(){
						Screen.children().remove();
					},5);
					//弹幕队列初始化
					var newLength = parseInt(Screen.height()/40);
					slideQueue.length = newLength;
					fixQueue.length = newLength;
					for (var i = newLength - 1; i >= 0; i--) {
						slideQueue[i] = 1;
						fixQueue[i] = 1;
					};
					//监听视频缩放
					var width = $("#example_video_1").width();
					var height = $("#example_video_1").height();
					monitor = setInterval(function () {
						var newWidth = $("#example_video_1").width();
						var newHeight = $("#example_video_1").height();
						if (width != newWidth || height != newHeight) {
							width = newWidth;
							height = newHeight;
							zoom(Screen);
						}
					}, 50);
					break;
				case 2:
					//创建墙
					var waitComment = [];	//	等待队列
					var data = creatWall($("#wall")[0]);
					//为刷子帮上点击事件
					data.brush.on("click", function () {
						clearBool = true;
					});
					var Array = data.congestionArray;
					//及时输出等待数组中的评论
					outputComment = setInterval(function () {
						outputOnTime(data.wall, waitComment, Array, clearBool);
					}, 1000);
					//模拟测试数据
					//测试弹幕
					setTimeout(function(){
						socket.on('barrageToIndex', function (info) {
							if (info.activityId == $.cookie('id')) {
								var comment = creatComment(data.wall, info.text, info.face, info.color);
								onTheWall(comment.comment, comment.size, Array, waitComment);
							}
		                });
					}, 1000);
					break;
				case 3:
					//建立老虎机
					var SlotMachine = creatSlotMachine($(".slotMachineContainer")[0],list);
					//给确定按钮绑定事件
					$(".screen .confirm").on("click",function(){
						$(".prize").hide("nomal",function(){
							$(".screen").css("display","none");
						});
					});
					// 给按钮绑定点击事件
					$(SlotMachine.button).on("click",function(){
	                	drawARaffle(SlotMachine);
					}).css("cursor","pointer");
					break;
				default :
					break;
			}
			match = num;
		}



		function gradualChange(num){
			if(num != match){
				var $container = $(".container>div");
				$($container[match-1]).addClass("containerDisappear");
				$($container[3]).addClass("containerDisappear");
				setTimeout(function(){
					$container.css("display","none").removeClass("containerDisappear containerAppear");
					$($container[num-1]).css("display","block").addClass("containerAppear");
					$($container[3]).css("display","block").addClass("containerAppear");
				},1000);
			}
		}
		$("#cyxbs").on("click",function(){
			$("#cyxbsScreen").show("normal");
		});
		$("#cyxbsScreen").on("click",function(){
			$("#cyxbsScreen").hide("normal");
		});
	});
/*	
	$(function () {
		parseYoukuCode($('#example_video_1').attr('data-id'), function (data){
			if(Array.isArray(data)){
				$('<source>', {
					"src": data[0][1],
					"type": "video/mp4"
				}).appendTo($('#example_video_1'));
			}else{
				console.log('err', data);
			}
		});
	});
	
*/	

	
	

