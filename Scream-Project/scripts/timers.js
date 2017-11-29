let _startTime = {};
let _currentUrl;
let _isFocused = {}; // {tabId: boolean}
let _browsingTime;
let _interval;
let _currentTabId;
let _stopTime = false;
let _currentUrlObject;

// clear storage
// chrome.storage.sync.clear(() => console.log('all gone!'));

document.addEventListener('DOMContentLoaded', () => {
  // starts timer when page loads for the first time
  chrome.tabs.onUpdated.addListener(() => {
    _stopTime = false;
    getCurrentTabUrl(startTimer);
  });

  // stops timer and writes time to storage when page is closed
  chrome.tabs.onRemoved.addListener(() => {
    _stopTime = true;
    let newTime = _startTime[_currentUrl] + _browsingTime;
    let addBrowsingTime = {
      browsingTime: newTime,
    };

    let newObj = Object.assign({}, _currentUrlObject, addBrowsingTime);
    _isFocused[_currentTabId] = false;

    chrome.storage.sync.set({ [_currentUrl]: newObj }, () => {
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

function getDomainNoPrefix(url) {
  let link = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
  let output = (link.split('.').length > 2) ? link.split('.').slice(-2).join('.') : link;

  return output;
}

function startTimer(url) {
  if (url.startsWith('chrome://')) {
    return;
  }

  _startTime[_currentUrl] = 0;
  _isFocused[_currentTabId] = true;
  _currentUrl = getDomainNoPrefix(url);
  firstAlarm(); // initialize alarms from alarms.js
  getBrowsingTime();
  _interval = setInterval(countUp, 1000);
}

// increment timer
function countUp() {
  if (_stopTime === true) {
    return;
  }
  if (_isFocused[_currentTabId]) {
    _startTime[_currentUrl]++;
  }
}

// get url's total time form chrome storage
function getBrowsingTime() {
  chrome.storage.sync.get(null, (items) => {
    if (items.hasOwnProperty(_currentUrl)) {
      _currentUrlObject = items[_currentUrl];
      _browsingTime = items[_currentUrl].browsingTime;
    } else {
      chrome.storage.sync.set({ [_currentUrl]: { browsingTime: 0 } }, () => {
        _browsingTime = 0;
      });
    }
  });
}
