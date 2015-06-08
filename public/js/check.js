    /**
     * Created by grallen on 2015/5/17.
     */

    var socket = io(location.origin + '/check', {path: "/chat_video/socket_io"});
    socket.emit('login', {id: $.cookie('id')});
    socket.on('checkCheckViewIsOpen',function (data) {
        if (data.info == false) {
            alert("请勿同时打开两个审核页面!");
            window.location.href = "login";
        }
    });
    
    var autoCheck = false,
        commentnum = $('.commentnum'),
        ave = $('.ave'),
        peoplenum = $('.peoplenum'),
        flag = true;
        
    


    function addBrrageToCheck(obj, data){
        var content = $("<div>",{
            "class" : "content",
            "openid" : data.openid,
            "activityId": data.activityId
        }).appendTo(obj);
        
        $('<input type="hidden" name="position" value="'+ data.position +'">').appendTo(content);
        $('<input type="hidden" name="color" value="'+ data.color +'">').appendTo(content);
        
        $("<img>",{
            "src" : data.face
        }).appendTo(content);

        $("<p>",{
            "class" : "name",
            "text" : data.nickname ? data.nickname : "新增用户"
        }).appendTo(content);

        $("<p>",{
            "class" : "txt",
            "style": "color: " + data.color,
            "text" : data.text
        }).appendTo(content);

        $("<div>",{
            "class" : "btn btn-danger addBlackUser",
            "text" : "屏蔽此人消息"
        }).appendTo(content);

        $("<div>",{
            "class" : "btn btn-info barrageToIndex",
            "text" : "审核通过"
        }).appendTo(content);
        
        $("<div>",{
            "class" : "btn btn-warning notpass",
            "text" : "删除此条消息"
        }).appendTo(content);
    }

    // 添加黑名单用户
    $('.check').on('click', '.addBlackUser', function (event) {
        event.preventDefault();
        var content = $(this).parent();
        $.ajax({
             url: 'addBlackUser',
             type: 'POST',
             data: {
                openid: content.attr('openid'),
                activityId: content.attr('activityId')
             },
             beforeSend: function () {
               
             },
             success: function (response) {
                if (response.status === 200) {
                    content.remove();
                } else {
                    alert(response.info);
                }
             }
        });
    });

    // 添加屏蔽词汇
    $('.addBlackWord').on('click', function (event) {
        $.ajax({
            url: 'addBlackWord',
            type: 'POST',
            data: {
                activityId: $.cookie('id'),
                type: 0,
                content: $('input[name=filter]').val()
            },
            beforeSend: function () {
                flag = false;
            },
            success: function (response) {
                flag = true;
                if (response.status === 200) {
                    var blackWord = $('input[name=filter]').val();
                    $('input[name=filter]').val('');
                    $('<span>', {
                        'text': blackWord,
                        'class': 'blackWord',
                        'data-id': response.data
                    }).appendTo($('.show').find('div'));
                } else {
                    alert(response.info);
                }
            }
        })
    });

    // 删除屏蔽词汇
    $('.show').on('click', '.blackWord', function (event) {
        var self = $(this);
        $.ajax({
            url: 'delBlackWord',
            type: 'POST',
            data: {
                id: self.data('id')
            },
            beforeSend: function () {
                flag = false;
            },
            success: function (response) {
                if (response.status === 200) {
                    self.remove();
                } else {
                    alert(response.info);
                }
            }
        })
    });

    // 清空一条弹幕
    $(".check").on("click", '.notpass', function(){
        $(this).parent().remove();
    });

    // 清空所有弹幕
    $('.clearAllBarrage').on('click', function () { 
        $('.content').remove();
    });

    // 通过一条弹幕
    $(".check").on("click", '.barrageToIndex', function (event){
        var that = $(this).parent();
        if (flag) {
            $.ajax({
                url: 'barrageToIndex',
                type: 'POST',
                data: {
                    data: getBarrageInfo(that),
                    type: 'object'
                },
                beforeSend: function () {
                    flag = false;
                },
                success: function (response) {
                    flag = true;
                    if (response.status === 200) {
                        peoplenum.html(parseInt(peoplenum.html()) + response.userCount);
                        ave.html(Math.ceil(parseInt(commentnum.html()) / parseInt(peoplenum.html())));
                        that.remove();
                    } else {
                        alert(response.info);
                    }
                }
            });
        }
    });


    // 通过所有弹幕
    $(".allBarrageToIndex").on("click", allBarrageToIndex);
    

    function allBarrageToIndex() {
        var contents = $(".content");
        if (contents.length > 70) {
            var group = contents.length / 70;
            // 如果为整数
            if (parseInt(group) == group) {
                for (var i = 0; i < group; i++) {
                   _allBarrageToIndex(contents.slice(i * 70, (i + 1) * 70));
                }
            } else {
                group = parseInt(group);
                for (var i = 0; i < group; i++) {
                   _allBarrageToIndex(contents.slice(i * 70, (i + 1) * 70));
                }
                _allBarrageToIndex(contents.slice(group * 70));
            }
        } else {
            _allBarrageToIndex(contents);
        }
    
        function _allBarrageToIndex(contents) {
            var data = [];
            $.each(contents, function (index, content) {
                data.push(getBarrageInfo($(content)));
            });
            if (data.length != 0) {
                $.ajax({
                    url: 'barrageToIndex',
                    type: 'POST',
                    data: {
                        data: data,
                        type: 'array'
                    },
                    beforeSend: function () {
                        flag = false;
                    },
                    success: function (response) {
                        flag = true;
                        if (response.status === 200) {
                            peoplenum.html(parseInt(peoplenum.html()) + response.userCount);
                            ave.html((parseInt(commentnum.html()) / parseInt(peoplenum.html())).toFixed(1));
                            $(".content").remove();
                        } else {
                            alert(response.info);
                        }
                    }
                });
            }
        }
    }


    // 开启/关闭自动审核
    (function() { 
        $(".openAutoCheck").on("click", function(){
            if (!autoCheck) {
                autoCheck = true;
                $(this).html("关闭自动审核").removeAttr("disabled");
                
            } else {
                autoCheck = false;
                $(this).html("开启自动审核").attr('disabled', true);
            }
        });
    })();

    // 执行自动审核
    setInterval(function () {
        if (autoCheck) allBarrageToIndex();
    }, 2000);


    function getBarrageInfo(element) {
        return {
            activityId: element.attr('activityId'),
            openid: element.attr('openid'),
            text: element.find('.txt').html(),
            nickname: element.find('.name').html(),
            face: element.find('img').attr('src'),
            color: element.find('input[name=color]').val(),
            position: element.find('input[name=position]').val()
        }
    }

    // 右侧功能栏滚动监听
    $(window).on("scroll", function(){
        var y = $(this).scrollTop();
        var statistics = $(".statistics");
        if (y > 80) {
            statistics.css("transform","translateY("+(y-80)+"px)");
        } else {
            statistics.css("transform","translateY(0)");
        }
    });

    // socket事件监听
    socket.on('barrageToCheck', function (data) {
        commentnum.html(parseInt(commentnum.html()) + data.barrageCount);
        delete data['barrageCount'];
        addBrrageToCheck($(".check"), data);    
    });

