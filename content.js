(function ($) {
    var $body = $('body'),
        elementClass = 'unread-message-tooltip',
        $tooltip = $body.find('.' + elementClass),
        showTimer,
        hideTimer,
        dataPeer,
        dataMsgid;

    if (!$tooltip.length) {
        $tooltip = $('<div class = "' + elementClass + '"></div>');
        $body.append($tooltip);
    }


    function sendRequest(dataPeer) {
        return $.ajax({
            url: "https://new.vk.com/al_im.php",
            method: 'post',
            data: {
                act: 'a_start',
                al: 1,
                block: true,
                gid: 0,
                history: true,
                msgid: false,
                peer: dataPeer
            }
        })
    }

    function processData(data) {
        var from = data.indexOf('{'),
            to = data.lastIndexOf('}'),
            item;
        data = data.substr(from, to - from + 1);
        data = JSON.parse(data);
        item = $(data.history).filter(function () { return $(this).attr('data-peer') == dataPeer })
        item = item.last();
        $tooltip.html(item);
        if (item.length > 0) {
            if (hideTimer) {
                clearTimeout(hideTimer)
            }
            clearTimeout(showTimer);
            showTimer = setTimeout(function () {
                $tooltip.show();
            }, 300);
        }
    }


    $body.on('mouseenter', '.dialogs_row', function (event) {
        var target = $(event.target);
        if (target.find('table').length === 0) {
            target = target.parents('.dialogs_row');
        }
        dataPeer = target.attr('id').split('im_dialog')[1];

        $.when(sendRequest(dataPeer)).then(function (data) {
            processData(data);
        });
    });


    $body.on('mouseenter', 'ul.im-page--dcontent .nim-dialog', function (event) {
        var target = $(event.target);
        if (target.find('.nim-dialog--preview').length === 0){
            target = target.parents('.nim-dialog');
        }
        var classList = target.attr('class');
        if (classList.indexOf('_im_dialog') < 0) {
            target = target.parents('._im_dialog');
        }

        dataPeer = target.attr('data-peer');

        $.when(sendRequest(dataPeer)).then(function (data) {
            processData(data);
        });
        
    })
    $body.on('mouseleave', 'ul.im-page--dcontent .nim-dialog, .dialogs_row', function (event) {
        var e = event.toElement || event.relatedTarget;
        if (e && e.parentNode == this || e == this) {
            return;
        }
        if (showTimer) {
            clearTimeout(showTimer);
        }
        hideTimer = setTimeout(function () {
            $tooltip.html("");
            $tooltip.hide()
        }, 300)

    })

    $body.on('mouseenter', '.unread-message-tooltip', function (event) {
        if (hideTimer) {
            clearTimeout(hideTimer)
        };
    })

    $body.on('mouseleave', '.unread-message-tooltip', function (event) {
        if(showTimer) {
            clearTimeout(showTimer);
        }
        hideTimer = setTimeout(function () {
            $tooltip.html("");
            $tooltip.hide()
        }, 300)
    })

})(jQuery)