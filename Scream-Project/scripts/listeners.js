let _interval;
let _currentUrl;
let _windowId;
let _yesterdayDate;
let _timeStorage = {}; // used in helpers.js
const _tabIdStorage = {};

// clear storage
// chrome.storage.sync.clear(() => console.log('all gone!'));

document.addEventListener('DOMContentLoaded', () => {

  getBrowsingTime();
  getGoals();

  chrome.storage.sync.get(null, (items) => {
    const newDate = new Date();
    const todayDate = newDate.toLocaleDateString();

    if (!items.yesterday) {
      chrome.storage.sync.set({ yesterday: {date: todayDate} }, () => {
        _yesterdayDate = todayDate;
      });
    } else {
      _yesterdayDate = items.yesterday.date;
    }

    if (_yesterdayDate !== todayDate) {
      resetBrowsingTimes();
    }
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    // tabInfo contains tabId, url, active bool, status and other properties
    // https://developer.chrome.com/extensions/tabs#event-onUpdated
    const { active, id, status, url, windowId } = tabInfo; // status: "complete"/"loading"
    _windowId = windowId;

    if (status === 'complete' && !url.startsWith('chrome://')) {
      _currentUrl = getDomainNoPrefix(url);
      _tabIdStorage.hasOwnProperty(_currentUrl) ? _tabIdStorage[_currentUrl].add(id) : _tabIdStorage[_currentUrl] = new Set([id]);
    }

    if (status === 'complete' && !url.startsWith('chrome://') && active) {
      interval();
    }
  });

  chrome.tabs.onActivated.addListener(selectInfo => {
    const id = selectInfo.tabId;
    for (let domain in _tabIdStorage) {
      if (_tabIdStorage.hasOwnProperty(domain)) {
        if (_tabIdStorage[domain].has(id)) {
          // start/resume counter when tab is active
          _currentUrl = domain;
          interval(); // from helpers.js
        } else {
          // clear counter when url is invalid
          clearInterval(_interval);
        }
      }
    }
  });

  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
    chrome.storage.sync.set(_timeStorage, () => {
      console.log('Saved to storage!');
    });
    //removeInfo.isWindowClosing = true/false
  });

  chrome.windows.onFocusChanged.addListener(windowId => {
    windowId !== _windowId ? clearInterval(_interval) : interval();
  });

  chrome.storage.onChanged.addListener(() => {
    getBrowsingTime();
    getGoals();
  });

  // every alarm triggers the next one
  chrome.alarms.onAlarm.addListener(alarm => {
    let randomUrl = 'http://' + _whiteList[Math.floor(Math.random() * _whiteList.length)];
    if (alarm.name === 'firstWarning') {
      secondAlarm();
      notifyMe();
    } else if (alarm.name === 'secondWarning') {
      thirdAlarm();
      alert(`Your time on ${_currentUrl} is almost up!`);
    } else if (alarm.name === 'thirdWarning') {
      chrome.tabs.update({ url: randomUrl });
    }
  });
});
