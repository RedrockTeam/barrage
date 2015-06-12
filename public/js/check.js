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
        flag = true,
        barrageList = $(".main").find('.panel-body');

    (function init () {
        $('.black-user-list').css({
            'height': $('.count-barrage').height(),
            'max-height': $('.count-barrage').height()
        });
        $('.black-user-list').find('p').css('line-height', $('.count-barrage').height() * 0.8 + 'px');

        $('.black-words-list').css('height', $('.send-barrage').css('height'));
        $('.black-words-list').find('.panel-body').css(
            'height', ($('.black-words-list').outerHeight() - $('.black-words-list').find('.panel-heading').outerHeight() - $('.black-words-list').find('.panel-footer').outerHeight())
        );

        $('[data-toggle="tooltip"]').tooltip()
    })();

    

    function addBarrageToCheck(obj, data) {
                                        
        var $media = $("<div>",{
            'class' : 'media',
            'openid' : data.openid,
            'activityId': data.activityId,
            'position': data.position
        });

        $('<input>', {
            'type': 'hidden',
            'name': 'color',
            'value': data.color ? data.color: ''
        }).appendTo($media);

        // media-left部分
        var $mediaLeft = $("<div>",{
            'class' : 'media-left'
        });
        var $a = $('<a>', {
            'href': 'javascript:void(0)'
        });
        var $img = $('<img>', {
            'class': 'media-object',
            'src': data.face
        });
        $img.appendTo($a);
        $a.appendTo($mediaLeft);
        $mediaLeft.appendTo($media);

        // media-body部分
        var $mediaBody = $('<div>', {
            'class': 'media-body'
        });
        var $h4 = $('<h4>', {
            'class': 'media-heading',
            'text': data.nickname ? data.nickname : "新增用户"
        });
        var $strong = $('<strong>', {
            'style': 'color: ' + data.color,
            'text' : data.text
        });
        $h4.appendTo($mediaBody);
        $strong.appendTo($mediaBody);
        $mediaBody.appendTo($media);

        // 按钮部分
        $p = $('<p>');
        $('<button>', {
            'class': 'button-small button-raised button-caution addBlackUser',
            'text': '拉黑'
        }).appendTo($p);
        $('<button>', {
            'class': 'button-small button-raised pull-right clearBarrage',
            'text': '清除'
        }).appendTo($p);
        $('<button>', {
            'class': 'button-small button-raised button-action pull-right barrageToIndex',
            'text': '通过'
        }).appendTo($p);

        $p.appendTo($media);
        if (data.type == 1) {
            obj.prepend($media);
        } else {
            $media.appendTo(obj);
        }
    }

    // 添加黑名单用户
    (function (barrageList, className) {
        barrageList.on('click', className, function (event) {
            event.preventDefault();
            var media = $(this).parent().parent();
            $.ajax({
                url: 'addBlackUser',
                type: 'POST',
                data: {
                    openid: media.attr('openid'),
                    activityId: media.attr('activityId'),
                    face: media.find('img').attr('src'),
                    nickname: media.find('h4').html()
                },
                beforeSend: function () {
                    flag = false;
                },
                success: function (response) {
                    flag = true;
                    if (response.status === 200) {
                        var $listGroupItem = $('<li>', {
                            'class': 'list-group-item'
                        });
                        $('<img>', {
                            'src': media.find('img').attr('src')
                        }).appendTo($listGroupItem);
                        $('<strong>', {
                            'text': media.find('h4').html()
                        }).appendTo($listGroupItem);
                        $('<button>', {
                            'class': 'button button-small button-raised button-primary pull-right',
                            'text': '移除',
                            'data-id': media.attr('openid')
                        }).appendTo($listGroupItem);

                        if ($('.black-user-empty').length != 0) {
                            $('.black-user-empty').remove();
                            var $listGroup = $('<ul>', {
                                'class': 'list-group',
                                'style': 'overflow: scroll; max-height: 134px;'
                            });
                            $listGroupItem.css('display', 'none').appendTo($listGroup);
                            $listGroup.appendTo($('.black-user-list'));
                        } else {
                            var $listGroup = $('.black-user-list').find('.list-group');
                            $listGroupItem.css('display', 'none').appendTo($listGroup)
                        }
                        media.slideUp(200, function () {
                            var openid = media.attr('openid');
                            media.remove();
                            $listGroupItem.slideDown(200, function () {
                                $(this).fadeIn();  
                            });
                            $.each($('.media'), function (index, _media) {
                                if ($(_media).attr('openid') == openid) {
                                    $(_media).remove();
                                }
                            });
                        });
                    } else {
                        alert(response.info);
                    }
                 }
            });
        });
    })(barrageList, '.addBlackUser');


    // 添加屏蔽词汇
    (function addBlackWord(element) {
        element.on('click', function (event) {
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
                        $('<strong>', {
                            'text': blackWord,
                            'class': 'blackWord',
                            'style': 'background-color: '+ response.data.color,
                            'data-id': response.data.id
                        }).appendTo($('.black-words-list').find('.panel-body'));
                    } else {
                        alert(response.info);
                    }
                }
            });
        });
    })($('.addBlackWord'));
    

    // 删除屏蔽词汇
    $('.black-words-list').on('dblclick', '.blackWord', function (event) {
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
                    self.fadeOut(100, function () {
                        self.remove();
                    })
                } else {
                    alert(response.info);
                }
            }
        })
    });

    // 清空一条弹幕
    (function (barrageList, className) {
        barrageList.on("click", className, function(){
            $(this).parent().parent().slideUp(150, function() {
                $(this).remove();
            });
        });
    })(barrageList, '.clearBarrage');

    // 清空所有弹幕
    $('.clearAllBarrage').on('click', function () { 
        $('.media').remove();
    });

    (function (barrageList, className) {
        // 通过一条弹幕
        barrageList.on("click", className, function (event){
            var that = $(this).parent().parent();
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
                            that.slideUp(150, function() {
                                that.remove();
                            });
                        } else {
                            alert(response.info);
                        }
                    }
                });
            }
        });
    })(barrageList, '.barrageToIndex');


    // 通过所有弹幕
    $(".allBarrageToIndex").on("click", allBarrageToIndex);
    

    function allBarrageToIndex() {
        var medias = $(".media");
        if (medias.length > 70) {
            var group = medias.length / 70;
            // 如果为整数
            if (parseInt(group) == group) {
                for (var i = 0; i < group; i++) {
                   _allBarrageToIndex(medias.slice(i * 70, (i + 1) * 70));
                }
            } else {
                group = parseInt(group);
                for (var i = 0; i < group; i++) {
                   _allBarrageToIndex(medias.slice(i * 70, (i + 1) * 70));
                }
                _allBarrageToIndex(medias.slice(group * 70));
            }
        } else {
            _allBarrageToIndex(medias);
        }
    
        function _allBarrageToIndex(medias) {
            var data = [];
            $.each(medias, function (index, _media) {
                data.push(getBarrageInfo($(_media)));
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
                            $(".media").remove();
                        } else {
                            alert(response.info);
                        }
                    }
                });
            }
        }
    }


    // 开启/关闭自动审核
    $('.openAutoCheck').on('switch-change', function (e, data) {
        if (!autoCheck) {
            autoCheck = true;
            console.log(autoCheck);
        } else {
            autoCheck = false;
            console.log(autoCheck);
        }
    });

    // 执行自动审核
    setInterval(function () {
        if (autoCheck) allBarrageToIndex();
    }, 2000);


    function getBarrageInfo(media) {
        return {
            activityId: media.attr('activityId'),
            openid: media.attr('openid'),
            text: media.find('strong').html(),
            nickname: media.find('h4').html(),
            face: media.find('img').attr('src'),
            color: media.find('input[name=color]').val(),
            position: media.attr('position') ? media.attr('position') : ''
        }
    }

    function sendBarrage() {

        $('select[name=color]').change(function () {
            $(this).css('color', $(this).find('option:selected').val());
        });
        
        var flag = true;
        
        $('.button-rounded').on('click', function (event) {
            event.preventDefault();
            if (!flag) return;
            if ($.trim($('textarea').val()) == '') {
                alert('弹幕内容不能为空!');
                return;   
            }
            $.ajax({
                url: "barrageToCheck",
                type: 'POST',
                data: {
                    activityId: $.cookie('id'),
                    openid: 1111111111111111,
                    face: 'http://202.202.43.125/chat_video/images/redrock-face.png',
                    nickname: '弹幕君',
                    color: $('select[name=color]').val(),
                    text: $('textarea').val(),
                    position: $('select[name=position]').val(),
                    type: 1
                },
                beforeSend: function () {
                    flag = false;
                    self.addClass('disabled');
                },
                success: function (response) {
                    $('textarea').val('');
                    if (response.status != 200) {
                        flag = true;
                        self.removeClass('disabled');
                    } else {
                        setTimeout(function () {
                            flag = true;
                            self.removeClass('disabled');
                        }, 400);
                    }
                }
            });
        })
    }

    // socket事件监听
    socket.on('barrageToCheck', function (data) {
        commentnum.html(parseInt(commentnum.html()) + data.barrageCount);
        delete data['barrageCount'];
        addBarrageToCheck($(".main").find('.panel-body'), data);    
    });

