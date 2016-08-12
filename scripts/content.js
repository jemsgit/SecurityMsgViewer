(function ($) {
    $(document).ready(function () {
        var $body = $('body'),
            localStorageId = 'SecurityMessageViewer',
            $tooltip = $body.find('.unread-message-tooltip'),
            $contentArea = $body.find('.im-page'),
            $messageArea = $contentArea.find('._im_page_history'),
            showTimer,
            hideTimer,
            dataPeer,
            isShowing = false,
            showInterval = 300,
            hideInterval = 600,
            TOP_DIRECTION = 'top',
            BOTTOM_DIRECTION = 'bottom',
            LEFT_DIRECTION = 'left',
            RIGHT_DIRECTION = 'right',
            TOOLTIP_DIRECTIONS = [TOP_DIRECTION, BOTTOM_DIRECTION, LEFT_DIRECTION, RIGHT_DIRECTION];

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
            var x = context.eventX,
                y = context.eventY;
            var containerHeight = context.containerHeight;
            var containerWidth = context.containerWidth;
            var tooltipWidth = context.tooltipWidth;
            var tooltipHeight = context.tooltipHeight;
            var elementWidth = 0;
            var elementHeight = context.elementHeight;
            var hasSpaceBefore = (x - Math.round((tooltipWidth - elementWidth) / 2)) >= 0;
            var hasSpaceAfter = (x + elementWidth + Math.round((tooltipWidth - elementWidth) / 2)) < containerWidth;
            if (hasSpaceBefore && hasSpaceAfter) {
                if (y + elementHeight + tooltipHeight < containerHeight) {
                    return BOTTOM_DIRECTION;
                }
                return TOP_DIRECTION;
            } else if (x - tooltipWidth >= 0) {
                return LEFT_DIRECTION;
            } else if (x + elementWidth + tooltipWidth < containerWidth) {
                return RIGHT_DIRECTION;
            }
            return BOTTOM_DIRECTION;
        }

        function calculatePosition(context) {
            var x = context.eventX,
                y = context.eventY;

            var tooltipWidth = context.tooltipWidth,
                tooltipHeight = context.tooltipHeight;
            var elementWidth = context.elementWidth,
                elementHeight = context.elementHeight;
            var positionX = x;
            var positionY = y;
            var direction = context.direction;
            switch (direction) {
                case BOTTOM_DIRECTION:
                    //positionX -= Math.round(tooltipWidth / 2);
                    positionY += elementHeight;
                    break;
                //case TOP_DIRECTION:
                //    //positionX -= Math.round(tooltipWidth / 2);
                //    positionY -= (tooltipHeight);
                //    break;
                //case LEFT_DIRECTION:
                //    //positionX -= (tooltipWidth);
                //    positionY -= Math.round(elementHeight);
                //    break;
                //case RIGHT_DIRECTION:
                //    positionY -= Math.round(elementHeight);
                //    break;
            }
            return {
                x: positionX,
                y: positionY
            };
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

        function processData(data, event) {
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
                $messageArea.fadeTo('fast', 1);
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
                processData(data, event);
            });
        }

        var newIntefaceMouseenter = function (event) {
            var target = $(event.target);
            if (target.find('.nim-dialog--preview').length === 0) {
                target = target.parents('.nim-dialog');
            }
            if (!target.hasClass('_im_dialog')) {
                target = target.parents('._im_dialog');
            }

            dataPeer = target.attr('data-peer');
            isShowing = true;
            $.when(sendRequest(dataPeer)).then(function (data) {
                processData(data, event);
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
            $body.on('mouseenter', '.dialogs_row', oldIntefaceMouseenter);
            $body.on('mouseenter', 'ul.im-page--dcontent .nim-dialog', newIntefaceMouseenter);

            $body.on('mouseleave', 'ul.im-page--dcontent .nim-dialog, .dialogs_row', mouseLeaveHandler);
            $('ul.im-page--dcontent .nim-dialog').on('click', mouseClickHandler);

            $body.on('mouseenter', '.unread-message-tooltip', tooltipMouseenter);
            $body.on('mouseleave', '.unread-message-tooltip', tooltipMouseleave);
        }


        function unbindEvents() {
            $body.off('mouseenter', '.dialogs_row', oldIntefaceMouseenter);
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