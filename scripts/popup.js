function localizeHtmlPage()
{
    //Localize by replacing __MSG_***__ meta tags
    //From: http://stackoverflow.com/questions/25467009/internationalization-of-html-pages-for-my-google-chrome-extension
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++)
    {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH != valStrH)
        {
            obj.innerHTML = valNewH;
        }
    }
}


(function ($) {
    $(document).ready(function () {
        var localStorageId = 'SecurityMessageViewer',
            iFrame = '<iframe frameborder="0" allowtransparency="true" scrolling="no" src="https://money.yandex.ru/embed/shop.xml?account=410013247085243&quickpay=shop&payment-type-choice=on&mobile-payment-type-choice=on&writer=seller&targets=%D0%9F%D0%BE%D0%B4%D0%B4%D0%B5%D1%80%D0%B6%D0%B0%D1%82%D1%8C&targets-hint=&default-sum=20&button-text=03&successURL=" width="450" height="198"></iframe>';

        function setTextAndIcon(state) {
            if (state) {
                $('.switch-state').text('ON');
                chrome.browserAction.setIcon({
                    path: 'icons/128x128.png'
                });
            } else {
                $('.switch-state').text('OFF');
                chrome.browserAction.setIcon({
                    path: 'icons/disabled.png'
                });
            }
        }

        chrome.storage.sync.get(localStorageId, function (item) {
            var state;
            if (item) {
                state = item[localStorageId]
            }
            $('input#enable-checkbox').prop('checked', !!state);
            setTextAndIcon(!!state);
        });

        $('.yandex_money_form').append(iFrame);

        $('input#enable-checkbox').on('change', function (event) {
            var that = this;
            chrome.storage.sync.set({ 'SecurityMessageViewer': that.checked }, function () { });
            chrome.tabs.query({ 'active': true, 'currentWindow': true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { state: that.checked }, function (response) { });
            });
            setTextAndIcon(that.checked);
        })

        $('.donate_link').on('click', function(event){
            $('.yandex_money_form').toggleClass('active')
        })

        localizeHtmlPage();
    })

})(jQuery)