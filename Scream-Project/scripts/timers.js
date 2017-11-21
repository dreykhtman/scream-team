let _startTime;
let _endTime;
let browsingTime;
let _currentUrl;

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.onActivated.addListener(() => {
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
    _startTime = new Date().getTime();
  }
  // localStorage.setItem('domain', _startTime);
  // firstAlarm();

  console.log(chrome.extension.getURL)
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
