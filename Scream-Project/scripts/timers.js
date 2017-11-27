let _startTime = {};
let _currentUrl = {};
let _isFocused = {};
let _browsingTime;
let _interval;
let _currentTabId;

// clear storage
// chrome.storage.sync.clear(() => console.log('all gone!'));

document.addEventListener('DOMContentLoaded', () => {
  // starts timer when page loads for the first time
  chrome.tabs.onUpdated.addListener(() => {
    getCurrentTabUrl(startTimer);
  });

  // stops timer and writes time to storage when page is closed
  chrome.tabs.onRemoved.addListener(() => {
    let newTime = _startTime[_currentUrl[_currentTabId]] + _browsingTime;
    let newObj = {
      browsingTime: newTime
    };
    _isFocused[_currentTabId] = false;

    chrome.storage.sync.set({ [_currentUrl[_currentTabId]]: newObj }, () => {
      clearInterval(_interval);
    });
  });

  // checks if tab is active/highlighted
  chrome.tabs.onHighlighted.addListener((highlightInfo) => {
    _isFocused[_currentTabId] = highlightInfo.tabIds[0] === _currentTabId;
  });
});

function getCurrentTabUrl(callback) {
  let queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    let tab = tabs[0];
    let url = tab.url;
    _currentTabId = tab.id;
    console.assert(typeof url === 'string', 'tab.url should be a string');
    callback(url);
  });
}

function startTimer(url) {
  if (url.startsWith('chrome://')) {
    return;
  }

  _startTime[_currentUrl[_currentTabId]] = 0;
  _isFocused[_currentTabId] = true;
  _currentUrl[_currentTabId] = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
  // let urlTime = {
  //   url: _currentUrl,
  //   time: _startTime,
  //   currentTime: 0
  // };
  firstAlarm(); // initialize alarms from alarms.js
  getBrowsingTime();
  _interval = setInterval(countUp, 1000);
}

// increment timer
function countUp() {
  if (_isFocused[_currentTabId]) {
    _startTime[_currentUrl[_currentTabId]]++;
  }
}

// get url's total time form chrome storage
function getBrowsingTime() {
  chrome.storage.sync.get(null, (items) => {
    if (items.hasOwnProperty(_currentUrl[_currentTabId])) {
      _browsingTime = items[_currentUrl[_currentTabId]].browsingTime;
    } else {
      chrome.storage.sync.set({ [_currentUrl[_currentTabId]]: { browsingTime: 0 } }, () => {
        _browsingTime = 0;
      });
    }
  });
}
