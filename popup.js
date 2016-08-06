(function ($) {
    debugger;
    

    chrome.storage.sync.get('SecurityMessageViewer', function (item) {
        var state;
        if (item) {
            state = item['SecurityMessageViewer']
        }
        $('input#enable-checkbox').prop('checked', !!state);
    });


    $('input#enable-checkbox').on('change', function (event) {
        var that = this;
        chrome.storage.sync.set({ 'SecurityMessageViewer': that.checked }, function () { });

        chrome.tabs.query({ 'active': true, 'currentWindow': true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { state: that.checked }, function (response) { });
        });
    })


})(jQuery)