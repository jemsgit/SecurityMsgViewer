(function ($) {
    debugger;
    var $body = $('body'),
        elementClass = 'unread-message-tooltip',
        $tooltip = $body.find('.' + elementClass),
        showTimer,
        hideTimer,
        dataPeer,
        isShowing = false,
        showInterval = 300,
        hideInterval = 600;

    function setTooltip() {
        if (!$tooltip.length) {
            $tooltip = $('<div class = "' + elementClass + '"></div>');
            $body.append($tooltip);
        }
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
            allUnread,
            items = [];
        data = data.substr(from, to - from + 1);
        data = JSON.parse(data);
        allUnread = $(data.history).filter(function () {
            return $(this).hasClass("_im_unread_bar_row");
        })

        if (allUnread) {
            for (var i = 0; i < allUnread.length; i++) {
                var item = $(allUnread[i]);
                item = item.next().next();
                if (item.attr('data-peer') == dataPeer || item.find('[data-peer]').attr('data-peer') == dataPeer) {
                    items.push(item);
                }
            }
        }

        if (item.length > 0 && hideTimer) {
            clearTimeout(hideTimer)
        }
        if (showTimer) {
            clearTimeout(showTimer);
        }
        if (isShowing) {
            showTimer = setTimeout(function () {
                if (item.length > 0) {
                    $tooltip.html(item);
                    $tooltip.show();
                }
            }, showInterval);
        }

    }

    function hideBlock() {
        if (showTimer) {
            clearTimeout(showTimer);
        }
        if (hideTimer) {
            clearTimeout(hideTimer);
        }
        hideTimer = setTimeout(function () {
            $tooltip.hide();
            $tooltip.html("");
        }, hideInterval)
    }

    var oldIntefaceMouseenter = function (event) {
        var target = $(event.target);
        if (target.find('table').length === 0) {
            target = target.parents('.dialogs_row');
        }
        dataPeer = target.attr('id').split('im_dialog')[1];
        isShowing = true;
        $.when(sendRequest(dataPeer)).then(function (data) {
            processData(data);
        });
    }

    var newIntefaceMouseenter = function (event) {
        var target = $(event.target);
        if (target.find('.nim-dialog--preview').length === 0) {
            target = target.parents('.nim-dialog');
        }
        var classList = target.attr('class');
        if (classList.indexOf('_im_dialog') < 0) {
            target = target.parents('._im_dialog');
        }

        dataPeer = target.attr('data-peer');
        isShowing = true;
        $.when(sendRequest(dataPeer)).then(function (data) {
            processData(data);
        });
    }

    var mouseLeaveHandler = function (event) {
        var e = event.toElement || event.relatedTarget;
        if (e && e.parentNode == this || e == this) {
            return;
        }
        isShowing = false;
        hideBlock();
    }

    var tooltipMouseenter = function (event) {
        if (hideTimer) {
            clearTimeout(hideTimer)
        };
        isShowing = true;
    }

    var tooltipMouseleave = function (event) {
        isShowing = false;
        hideBlock();
    }

    function bindEvents() {

        $body.on('mouseenter', '.dialogs_row', oldIntefaceMouseenter);
        $body.on('mouseenter', 'ul.im-page--dcontent .nim-dialog', newIntefaceMouseenter);

        $body.on('mouseleave', 'ul.im-page--dcontent .nim-dialog, .dialogs_row', mouseLeaveHandler)

        $body.on('mouseenter', '.unread-message-tooltip', tooltipMouseenter);
        $body.on('mouseleave', '.unread-message-tooltip', tooltipMouseleave);
    }


    function unbindEvents() {
        $body.off('mouseenter', '.dialogs_row', oldIntefaceMouseenter);
        $body.off('mouseenter', 'ul.im-page--dcontent .nim-dialog', newIntefaceMouseenter);

        $body.off('mouseleave', 'ul.im-page--dcontent .nim-dialog, .dialogs_row', mouseLeaveHandler);

        $body.off('mouseenter', '.unread-message-tooltip', tooltipMouseenter);
        $body.off('mouseleave', '.unread-message-tooltip', tooltipMouseleave);
    }

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request && request.state) {
                setTooltip();
                bindEvents();
            } else {
                unbindEvents();
            }
    });

    var state;

    chrome.storage.sync.get('SecurityMessageViewer', function (item) {
        // Notify that we saved.
        if (item) {
            state = item['SecurityMessageViewer']
        }

        if (state) {
            setTooltip();
            bindEvents();
        }
    });

    
    

})(jQuery)