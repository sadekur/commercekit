(function () {
    var hidden = (window.COMMERCEKIT && window.COMMERCEKIT.hiddenHashes) || [];

    function syncMenuVisibility() {
        var menu = document.querySelector('#adminmenu .toplevel_page_commerce-kit');
        if (!menu) return;
        hidden.forEach(function (hash) {
            var anchor = menu.querySelector('a[href*="' + hash + '"]');
            if (anchor) {
                var li = anchor.closest('li');
                if (li) li.style.display = 'none';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncMenuVisibility);
    } else {
        syncMenuVisibility();
    }
})();
