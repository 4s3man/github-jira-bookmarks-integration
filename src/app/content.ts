chrome.runtime.sendMessage({}, (response) => {
    var checkReady = setInterval(() => {
        if (document.readyState === "complete") {
            clearInterval(checkReady);

            // chrome.bookmarks.getTree(treeNode => console.log(treeNode));

            console.log(chrome.bookmarks);
            console.log("We're in the injected content script!")
        }
    })
})

