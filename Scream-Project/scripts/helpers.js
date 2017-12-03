function getDomainNoPrefix(url) {
  let link = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
  let output = (link.split('.').length > 2) ? link.split('.').slice(-2).join('.') : link;

  return output;
}

// clears old interval and starts new interval
function interval() {
  const clearIntervalPromise = new Promise((resolve, reject) => {
    resolve(clearInterval(_interval));
  });

  clearIntervalPromise
    .then(() => {
      _interval = setInterval(() => {
        // increment or start browsing time in timer storage
        if (_currentUrl) {
          _timeStorage.hasOwnProperty(_currentUrl) ? _timeStorage[_currentUrl].browsingTime++ : _timeStorage[_currentUrl] = { browsingTime: 0 };
        } else {
          return;
        }
        console.log(_timeStorage)
        console.log(_currentUrl, _timeStorage[_currentUrl])
      }, 1000);
    });
}

function getBrowsingTime() {
  chrome.storage.sync.get(null, (items) => {
    _timeStorage = items;
    console.log(_timeStorage)
  });
}

// function setBrowsingTime() {
//   if (_chromeStorage.hasOwnProperty())
// }
