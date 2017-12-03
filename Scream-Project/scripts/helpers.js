function getDomainNoPrefix(url) {
  let link = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
  let output = (link.split('.').length > 2) ? link.split('.').slice(-2).join('.') : link;

  return output;
}

// clears old interval and starts new interval
function interval() {
  _counter = 0;
  const clearIntervalPromise = new Promise((resolve, reject) => {
    resolve(clearInterval(_interval));
  });

  clearIntervalPromise
    .then(() => {
      _interval = setInterval(() => {
        // increment or start browsing time in timer storage
        _timeStorage.hasOwnProperty(_currentUrl) ? _timeStorage[_currentUrl].browsingTime++ : _timeStorage[_currentUrl] = { browsingTime: 0 };
        console.log(_currentUrl, _timeStorage[_currentUrl])
      }, 1000);
    });
}
