let _startTime = 0;
let _endTime;
let _browsingTime;
let _currentUrl;
let _interval;

// document.addEventListener('DOMContentLoaded', () => {
//   chrome.tabs.onUpdated.addListener(() => {
//     getCurrentTabUrl(getSiteInfo);
//   });
//   chrome.tabs.onRemoved.addListener(() => {
//     // alert(_startTime)
//   });
// });

chrome.tabs.onUpdated.addListener(() => {
  getCurrentTabUrl(getSiteInfo);
});

function getCurrentTabUrl(callback) {
  let queryInfo = {
    active: true,
    currentWindow: true
  };
  chrome.tabs.query(queryInfo, (tabs) => {
    let tab = tabs[0];
    let url = tab.url;
    console.assert(typeof url === 'string', 'tab.url should be a string');
    callback(url);
  });
}

function getSiteInfo(url) {
  _currentUrl = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
  // _startTime = new Date().getTime();
  //_start = 0
  // _start += end newDate() - start new Date()
  let urlTime = {
    url: _currentUrl,
    time: _startTime,
    currentTime: 0
  };

  // _interval = setInterval(() => { chrome.storage.sync.set({ [_currentUrl]: urlTime }, () => { console.log(urlTime)}); }, 10000);
  _interval = setInterval(() => { _startTime += 1000; }, 1000);
  getTimeObj();
}

function getTimeObj() {
  chrome.storage.sync.get(null, (items) => {
    if (items.hasOwnProperty(_currentUrl)) {
      _browsingTime = items[_currentUrl].browsingTime;
    } else {
      _browsingTime = 0;
    }
    console.log("ITEMS", items);
  });
}

chrome.tabs.onRemoved.addListener(() => {
  let newTime = _startTime + _browsingTime;
  let newObj = {
    browsingTime: newTime
  };

  chrome.storage.sync.set( {[_currentUrl]: newObj}, () => {

  } );
  clearInterval(_interval);
});


// function firstAlarm() {
//   chrome.alarms.create('firstWarning', { delayInMinutes: 0.1 });
// }

// function secondAlarm() {
//   chrome.alarms.create('secondWarning', { delayInMinutes: 0.1 });
// }

// function thirdAlarm() {
//   chrome.alarms.create('thirdWarning', { delayInMinutes: 0.1 });
// }

// function notifyMe() {
//   if (!('Notification' in window)) {
//     alert("This browser doesn't support notifications.");
//   } else if (Notification.permission === 'granted') {
//     //notification instance
//     let notification = new Notification('Hey, you!', {
//       body: `URL: ${_currentUrl}`,
//       title: 'Hello',
//       requireInteraction: true
//     });
//   } else if (Notification.permission !== 'denied') {
//     Notification.requestPermission(permission => {
//       if (permission === 'granted') {
//         let notification = new Notification('Hey, you!', {
//           body: `URL: ${_currentUrl}`,
//           title: 'Hello',
//           requireInteraction: true
//         });
//       }
//     });
//   }
// }

// chrome.alarms.onAlarm.addListener(alarm => {
//   if (alarm.name === 'firstWarning') {
//     //secondAlarm();
//     notifyMe();
//   }
//   // } else if (alarm.name === 'secondWarning') {
//   //   thirdAlarm();
//   //   alert(localStorage.getItem('domain'));
//   // } else if (alarm.name === 'thirdWarning') {
//   //   alert('third');
//   // }
//   //make more modular.
// });
