function getDomainNoPrefix(url) {
  let link = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
  let output = (link.split('.').length > 2) ? link.split('.').slice(-2).join('.') : link;

  return output;
}

// clears old interval and starts new interval, used in listeners.js
function interval() {
  const clearIntervalPromise = new Promise((resolve, reject) => {
    resolve(clearInterval(_interval));
  });

  firstAlarm(); // from alarms.js

  clearIntervalPromise
    .then(() => {
      _interval = setInterval(() => {
        // increment or start browsing time in timer storage
        if (_currentUrl) {
          _timeStorage.hasOwnProperty(_currentUrl) ? _timeStorage[_currentUrl].browsingTime++ : _timeStorage[_currentUrl] = { browsingTime: 0 };
        } else {
          return;
        }
      }, 1000);
    });
}

function getBrowsingTime() {
  chrome.storage.sync.get(null, (items) => {
    _timeStorage = items;
  });
}

function timeConverter(obj) {
  let hrToSec = obj.goalHrs * 3600;
  let minToSec = obj.goalMins * 60;
  return hrToSec + minToSec;
}
