let _blacklistGoals = {};

function timeConverter(obj) {
  let hrToSec = obj.goalHrs * 3600;
  let minToSec = obj.goalMins * 60;
  return hrToSec + minToSec;
}

// get goal time from storage
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(null, (items) => {
    for (let domain in items) {
      if (items.hasOwnProperty(domain)) {
        if (items[domain].type === 'red') {
          _blacklistGoals[domain] = timeConverter(items[domain]);
        }
      }
    }
  });
});

function firstAlarm() {
  chrome.alarms.create('firstWarning', { delayInMinutes: 0.1 });
}

function secondAlarm() {
  chrome.alarms.create('secondWarning', { delayInMinutes: 0.1 });
}

function thirdAlarm() {
  chrome.alarms.create('thirdWarning', { delayInMinutes: 0.1 });
}

function assignNotification() {
  let notification = new Notification('Hey, you!', {
    body: `URL: ${_currentUrl[_currentTabId]}`,
    title: 'Hello',
    requireInteraction: true
  });
}
function notifyMe() {
  if (!('Notification' in window)) {
    alert("This browser doesn't support notifications.");
  } else if (Notification.permission === 'granted') {
    //notification instance
    assignNotification();
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission(permission => {
      if (permission === 'granted') {
        assignNotification();
      }
    });
  }
}

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'firstWarning') {
    //secondAlarm();
    notifyMe();
  }
  // } else if (alarm.name === 'secondWarning') {
  //   thirdAlarm();
  //   alert(localStorage.getItem('domain'));
  // } else if (alarm.name === 'thirdWarning') {
  //   alert('third');
  // }
  //make more modular.
});
