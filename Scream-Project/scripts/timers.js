let _interval;
let _counter = 0;
let _currentUrl;
let _previousUrl;
const _tabIdStorage = {};
const _timeStorage = {};
// const _ready = status === 'complete' && !url.startsWith('chrome://');

document.addEventListener('DOMContentLoaded', () => {

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    // tabInfo contains tabId, url, active bool, status and other properties
    // https://developer.chrome.com/extensions/tabs#event-onUpdated
    const { active, id, status, url } = tabInfo; // status: "complete"/"loading"
    if (status === 'complete' && !url.startsWith('chrome://')) {
      _currentUrl = getDomainNoPrefix(url);
      _tabIdStorage.hasOwnProperty(_currentUrl) ? _tabIdStorage[_currentUrl].add(id) : _tabIdStorage[_currentUrl] = new Set([id]);
      console.log('urlStorage', _tabIdStorage)
      // interval(); // start counting when page is loaded
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
          _currentUrl = domain;
          interval()
          console.log(_tabIdStorage)
        }
      }
    }
  });

  chrome.tabs.onRemoved.addListener(tabId => {
    // console.log('Removed!')
    // console.log('tabId', tabId);
  });
});


// function countUp() {
//   // _counter++;
//   _timeStorage.hasOwnProperty(_currentUrl) ? _timeStorage[_currentUrl].browsingTime++ : _timeStorage[_currentUrl] = { browsingTime: 0 };
//   // console.log(_timeStorage)
// }

// get url's total time form chrome storage
function getBrowsingTime() {
  chrome.storage.sync.get(null, (items) => {
    if (items.hasOwnProperty(_currentUrl)) {
      console.log(items[_currentUrl]);
    } else {
      chrome.storage.sync.set({ [_currentUrl]: { browsingTime: 0 } }, () => {
        console.log(items)
      });
    }
  });
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
        _timeStorage.hasOwnProperty(_currentUrl) ? _timeStorage[_currentUrl].browsingTime++ : _timeStorage[_currentUrl] = { browsingTime: 0 };
        console.log(_timeStorage)
      }, 1000);
    });
}


// let _startTime = {};
// let _currentUrl;
// let _isFocused = {}; // {tabId: boolean}
// let _browsingTime;
// let _interval;
// let _currentTabId;
// let _stopTime = false;
// let _currentUrlObject;
// let _trackUrlTimer = new Set();

// // clear storage
// // chrome.storage.sync.clear(() => console.log('all gone!'));

// document.addEventListener('DOMContentLoaded', () => {

//   // starts timer when page loads for the first time
//   chrome.tabs.onUpdated.addListener(() => {
//     getBrowsingTime(); // get browsing time for every site from storage
//     _stopTime = false;
//     getCurrentTabUrl(startTimer);
//   });

//   // stops timer and writes time to storage when page is closed
//   chrome.tabs.onRemoved.addListener(() => {
//     chrome.alarms.clearAll(() => {});
//     _stopTime = true;
//     let newTime = _startTime[_currentUrl] + _browsingTime;
//     let addBrowsingTime = {
//       browsingTime: newTime,
//     };
//     _trackUrlTimer.delete(_currentUrl);

//     let newObj = Object.assign({}, _currentUrlObject, addBrowsingTime);
//     _isFocused[_currentTabId] = false;

//     chrome.storage.sync.set({ [_currentUrl]: newObj }, () => {
//       clearInterval(_interval);
//     });
//   });

//   // checks if tab is active/highlighted
//   chrome.tabs.onHighlighted.addListener((highlightInfo) => {
//     _isFocused[_currentTabId] = highlightInfo.tabIds[0] === _currentTabId;
//   });

//   chrome.tabs.onActivated.addListener(tab => {
//     let { tabId } = tab;
//     _currentTabId = tabId;
//   });
// });

// function getCurrentTabUrl(callback) {
//   let queryInfo = {
//     active: true,
//     currentWindow: true
//   };

//   chrome.tabs.query(queryInfo, (tabs) => {
//     let tab = tabs[0];
//     let url = tab.url;

//     _currentTabId = tab.id;
//     console.assert(typeof url === 'string', 'tab.url should be a string');
//     callback(url);
//   });
// }

// function getDomainNoPrefix(url) {
//   let link = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
//   let output = (link.split('.').length > 2) ? link.split('.').slice(-2).join('.') : link;

//   return output;
// }

// function startTimer(url) {
//   if (url.startsWith('chrome://')) {
//     return;
//   }

//   _startTime[_currentUrl] = 0;
//   _isFocused[_currentTabId] = true;
//   _currentUrl = getDomainNoPrefix(url);

//   if (_trackUrlTimer.has(_currentUrl)) return;
//   _trackUrlTimer.add(_currentUrl);

//   firstAlarm(); // initialize alarms from alarms.js

//   const clearIntervalPromise = new Promise((resolve, reject) => {
//     resolve(clearInterval(_interval));
//   });

//   clearIntervalPromise
//     .then(() => {
//       _interval = setInterval(countUp, 1000);
//     });
// }

// // increment timer
// function countUp() {
//   if (_stopTime === true) {
//     return;
//   }
//   if (_isFocused[_currentTabId]) {
//     _startTime[_currentUrl] >= 0 ? _startTime[_currentUrl]++ : _startTime[_currentUrl] = 0;
//   }
// }

// // get url's total time form chrome storage
// function getBrowsingTime() {
//   chrome.storage.sync.get(null, (items) => {
//     if (items.hasOwnProperty(_currentUrl)) {
//       _currentUrlObject = items[_currentUrl];
//       _browsingTime = items[_currentUrl].browsingTime;
//     } else {
//       chrome.storage.sync.set({ [_currentUrl]: { browsingTime: 0 } }, () => {
//         _browsingTime = 0;
//       });
//     }
//   });
// }
