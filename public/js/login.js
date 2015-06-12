	

	$(function(){
	    //得到焦点
	    $("#password").focus(function(){
	        $("#left_hand").animate({
	            left: "150",
	            top: " -38"
	        },{step: function(){
	            if(parseInt($("#left_hand").css("left"))>140){
	                $("#left_hand").attr("class","left_hand");
	            }
	        }}, 2000);
	        $("#right_hand").animate({
	            right: "-64",
	            top: "-38px"
	        },{step: function(){
	            if(parseInt($("#right_hand").css("right"))> -70){
	                $("#right_hand").attr("class","right_hand");
	            }
	        }}, 2000);
	    });
	    //失去焦点
	    $("#password").blur(function(){
	        $("#left_hand").attr("class","initial_left_hand");
	        $("#left_hand").attr("style","left:100px;top:-12px;");
	        $("#right_hand").attr("class","initial_right_hand");
	        $("#right_hand").attr("style","right:-112px;top:-12px");
	    });

	    $('.btn-index').on('click', function (event){
			event.preventDefault();
			$.ajax({
				url: "login",
				type: 'POST',
				data: {
					activityId: $('input[name=activityId]').val(),
					stuId: $('input[name=stuId]').val(),
					path: 'index'
				},
				beforeSend: function () {
					
				},
				success: function (response) {
					if (response.status === 200) {
						$.cookie('id', response.data.activityId);		
						if (response.path == 'index') {
							$.cookie('videoSrc', response.data.videoSrc);
						}
						location.href = response.path;	
					} else {
						alert(response.info);
					}
				}
			});
		});

	});