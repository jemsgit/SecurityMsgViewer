(function ($) {
    $(document).ready(function () {
        var $body = $('body'),
            localStorageId = 'SecurityMessageViewer',
            $tooltip = $body.find('.unread-message-tooltip'),
            showTimer,
            hideTimer,
            dataPeer,
            isShowing = false,
            showInterval = 300,
            hideInterval = 600,
            RIGHT_AND_BOTTOM = 'right_and_bottom',
            RIGHT_AND_TOP = 'right_and_top',
            LEFT_AND_BOTTOM = 'left_aand_bottom',
            LEFT_AND_TOP = 'left_and_top',
            TOOLTIP_DIRECTIONS = [RIGHT_AND_BOTTOM, RIGHT_AND_TOP, LEFT_AND_BOTTOM, LEFT_AND_TOP];

        function setTooltip() {
            if (!$tooltip.length) {
                $tooltip = $('<div class = "unread-message-tooltip"></div>');
                $body.append($tooltip);
            }
        }

        function setupTooltipPosition(event) {
            var tooltipSize = getTooltipSize();
            var $target = $(event.target);
            var targetOffset = $target.offset();

            if (targetOffset.left == 0 && targetOffset.top == 0) {
                return;
            }

            var context = {
                x: targetOffset.left,
                y: targetOffset.top,
                containerWidth: $(window).width(),
                containerHeight: $(window).height(),
                tooltipWidth: tooltipSize.width,
                tooltipHeight: tooltipSize.height,
                elementWidth: $target.outerWidth(),
                elementHeight: $target.outerHeight(),
                eventX: event.clientX,
                eventY: event.clientY
            };
            context.direction = calculateDirection(context);
            for (var i = 0; i < TOOLTIP_DIRECTIONS.length; i++) {
                $tooltip.removeClass(TOOLTIP_DIRECTIONS[i]);
            }
            $tooltip.addClass(context.direction);
            var tooltipPosition = calculatePosition(context);
            return $tooltip
                .css('top', tooltipPosition.y)
                .css('left', tooltipPosition.x)
                .show();
        }

        function getTooltipSize() {
            $tooltip
                .css('top', -2000)
                .css('left', -2000)
                .show();
            for (var i = 0; i < TOOLTIP_DIRECTIONS.length; i++) {
                $tooltip.removeClass(TOOLTIP_DIRECTIONS[i]);
            }
            var size = {
                width: $tooltip.outerWidth(),
                height: $tooltip.outerHeight()
            };
            $tooltip.hide();
            return size;
        }


        function calculateDirection(context) {
            var x = context.x,
                y = context.y;
            var containerHeight = context.containerHeight;
            var containerWidth = context.containerWidth;
            var tooltipWidth = context.tooltipWidth;
            var tooltipHeight = context.tooltipHeight;
            var elementWidth = 0;
            var elementHeight = context.elementHeight;
            var hasSpaceBefore = (x - Math.round((tooltipWidth - elementWidth) / 2)) >= 0;
            var hasSpaceAfter = (x + elementWidth + Math.round((tooltipWidth - elementWidth) / 2)) < containerWidth;
            if (hasSpaceBefore && hasSpaceAfter) {
                if (y + elementHeight + tooltipHeight < containerHeight || y - tooltipHeight < 0) {
                    return RIGHT_AND_BOTTOM;
                }
                return RIGHT_AND_TOP;
            } else if (x - tooltipWidth >= 0) {
                if (y + elementHeight + tooltipHeight < containerHeight) {
                    return LEFT_AND_BOTTOM;
                }
                return LEFT_AND_TOP;
            } else if (x + elementWidth + tooltipWidth < containerWidth) {
                if (y + elementHeight + tooltipHeight < containerHeight) {
                    return RIGHT_AND_BOTTOM;
                }
                return RIGHT_AND_TOP;
            }
            return RIGHT_AND_BOTTOM;
        }

        function calculatePosition(context) {
            var offset = 5,
                x = context.x,
                y = context.y,
                tooltipWidth = context.tooltipWidth,
                tooltipHeight = context.tooltipHeight,
                elementWidth = context.elementWidth,
                elementHeight = context.elementHeight,
                positionX = x,
                positionY = y,
                direction = context.direction;
            switch (direction) {
                case RIGHT_AND_BOTTOM:
                    positionX += elementWidth - offset;
                    positionY += elementHeight - offset;
                    break;
                case RIGHT_AND_TOP:
                    positionX += elementWidth - offset;
                    positionY -= tooltipHeight + offset;
                    break;
                case LEFT_AND_BOTTOM:
                    positionX -= tooltipWidth + offset;
                    positionY += elementHeight - offset;
                    break;
                case LEFT_AND_TOP:
                    positionX -= tooltipWidth + offset;
                    positionY -= tooltipHeight + offset;
                    break;
            }
            return {
                x: positionX,
                y: positionY
            };
        }

        function sendRequest(dataPeer, msgId) {
            return $.ajax({
                url: "https://vk.com/al_im.php",
                method: 'post',
                data: {
                    act: 'a_start',
                    al: 1,
                    block: true,
                    gid: 0,
                    history: true,
                    msgid: msgId,
                    peer: dataPeer
                }
            })
        }

        function processData(event, data, mesgId) {
            var from = data.indexOf('{'),
                to = data.lastIndexOf('}'),
                allUnread,
                searchMessage,
                items = [];
            data = data.substr(from, to - from + 1);
            data = JSON.parse(data);
            if (!mesgId) {
                allUnread = $(data.history).filter(function () {
                    return $(this).hasClass("_im_unread_bar_row");
                })

                if (allUnread) {
                    for (var i = 0; i < allUnread.length; i++) {
                        var item = $(allUnread[i]);
                        item = item.next();
                        if (item.hasClass('im-page--history-new-bar')) {
                            item = item.next();
                        }
                        while (!item.hasClass('im-page--history-new-bar') && item.length !== 0) {
                            if (item.attr('data-peer') == dataPeer || item.find('[data-peer]').attr('data-peer') == dataPeer) {
                                items.push(item);
                            }
                            item = item.next();
                        }
                    }
                }
            } else {
                searchMessage = $(data.history).filter(function () {
                    var messages = $(this).find(".im-mess._im_mess");
                    for (var i = 0; i < messages.length; i++) {
                        if ($(messages[i]).attr('data-msgId') == mesgId){
                            return $(messages[i]);
                        }
                    }
                })

                if (searchMessage.length > 0) {
                    items.push(searchMessage);
                }
            }


            if (items.length > 0 && hideTimer) {
                clearTimeout(hideTimer)
            }
            if (showTimer) {
                clearTimeout(showTimer);
            }
            if (isShowing) {
                showTimer = setTimeout(function () {
                    if (items.length > 0) {
                        $tooltip.html(items);
                        setupTooltipPosition(event);
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

        var newIntefaceMouseenter = function (event) {
            var target = $(event.target),
                mesgId = false;

            if (target.find('.nim-dialog--preview').length === 0) {
                target = target.parents('.nim-dialog');
            }
            if (!target.hasClass('_im_dialog')) {
                target = target.parents('._im_dialog');
            }

            if ($body.find('.im-page--dialogs_with-mess')[0]) {
                mesgId = target.attr('data-msgid');
            }
            dataPeer = target.attr('data-peer');
            isShowing = true;
            $.when(sendRequest(dataPeer, mesgId)).then(function (data) {
                processData(event, data, mesgId);
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

        var mouseClickHandler = function (event) {
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
            $body.on('mouseenter', 'ul.im-page--dcontent .nim-dialog', newIntefaceMouseenter);

            $body.on('mouseleave', 'ul.im-page--dcontent .nim-dialog, .dialogs_row', mouseLeaveHandler);
            $('ul.im-page--dcontent .nim-dialog').on('click', mouseClickHandler);

            $body.on('mouseenter', '.unread-message-tooltip', tooltipMouseenter);
            $body.on('mouseleave', '.unread-message-tooltip', tooltipMouseleave);
        }


        function unbindEvents() {
            $body.off('mouseenter', 'ul.im-page--dcontent .nim-dialog', newIntefaceMouseenter);

            $body.off('mouseleave', 'ul.im-page--dcontent .nim-dialog, .dialogs_row', mouseLeaveHandler);
            $('ul.im-page--dcontent .nim-dialog').off('click', mouseClickHandler);

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

        chrome.storage.sync.get(localStorageId, function (item) {
            var state;
            if (item[localStorageId] === undefined) {
                state = true;
                chrome.storage.sync.set({ 'SecurityMessageViewer': true }, function () { });
            } else if (item) {
                state = item[localStorageId]
            }

            if (state) {
                setTooltip();
                bindEvents();
            }
        });
    });

})(jQuery)