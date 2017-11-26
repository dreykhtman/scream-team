let _startTime = 0;
let _isFocused = true;
let _browsingTime;
let _currentUrl;
let _interval;
let _currentTabId;

//clear storage
// chrome.storage.sync.clear(() => console.log('all gone!'));

document.addEventListener('DOMContentLoaded', () => {
  // starts timer when page loads for the first time
  chrome.tabs.onUpdated.addListener(() => {
    getCurrentTabUrl(startTimer);
  });

  // stops timer and writes time to storage when page is closed
  chrome.tabs.onRemoved.addListener(() => {
    let newTime = _startTime + _browsingTime;
    let newObj = {
      browsingTime: newTime
    };
    _isFocused = false;

    chrome.storage.sync.set({ [_currentUrl]: newObj }, () => {
      clearInterval(_interval);
      console.log('browsing time: ', _browsingTime);
    });
  });

  // checks if tab is active/highlighted
  chrome.tabs.onHighlighted.addListener((highlightInfo) => {
    _isFocused = highlightInfo.tabIds.includes(_currentTabId);
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

  _isFocused = true;
  _currentUrl = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
  // let urlTime = {
  //   url: _currentUrl,
  //   time: _startTime,
  //   currentTime: 0
  // };

  getBrowsingTime();
  _interval = setInterval(countUp, 1000);
}

// increment timer
function countUp() {
  if (_isFocused) {
    _startTime++;
  }

  console.log(_currentUrl, _startTime)
}

// get url's total time form chrome storage
function getBrowsingTime() {
  chrome.storage.sync.get(null, (items) => {
    console.log('STORAGE: ', items)
    if (items.hasOwnProperty(_currentUrl)) {
      _browsingTime = items[_currentUrl].browsingTime;
    } else {
      chrome.storage.sync.set({ [_currentUrl]: { browsingTime: 0 } }, () => {
        _browsingTime = 0;
      });
    }
  });
}
