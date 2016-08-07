(function ($) {
    $(document).ready(function () {
        function setText(state) {
            if (state) {
                $('.switch-state').text('ON');
            } else {
                $('.switch-state').text('OFF');
            }
        }

        chrome.storage.sync.get('SecurityMessageViewer', function (item) {
            var state;
            if (item) {
                state = item['SecurityMessageViewer']
            }
            $('input#enable-checkbox').prop('checked', !!state);
            setText(!!state);
        });

        $('input#enable-checkbox').on('change', function (event) {
            var that = this;
            chrome.storage.sync.set({ 'SecurityMessageViewer': that.checked }, function () { });
            chrome.storage.local.set({ 'SecurityMessageViewer': that.checked });
            chrome.tabs.query({ 'active': true, 'currentWindow': true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { state: that.checked }, function (response) { });
            });
            setText(that.checked);
        })

        $('.yandex_money_form').append(
            '<iframe frameborder="0" allowtransparency="true" scrolling="no" src="https://money.yandex.ru/embed/shop.xml?account=410013247085243&quickpay=shop&payment-type-choice=on&mobile-payment-type-choice=on&writer=seller&targets=%D0%9F%D0%BE%D0%B4%D0%B4%D0%B5%D1%80%D0%B6%D0%B0%D1%82%D1%8C&targets-hint=&default-sum=15&button-text=03&successURL=" width="450" height="198"></iframe>')
        });
    
        $('.donate_link').on('click', function(event){
            $('.yandex_money_form').toggleClass('active')
        })

})(jQuery)