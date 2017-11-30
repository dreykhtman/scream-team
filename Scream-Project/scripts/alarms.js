let _blacklistGoals = {};
let _whiteList = [];

function timeConverter(obj) {
  let hrToSec = obj.goalHrs * 3600;
  let minToSec = obj.goalMins * 60;
  return hrToSec + minToSec;
}

// get goal times from storage
function goalGetter() {
  chrome.storage.sync.get(null, (items) => {
    for (let domain in items) {
      if (items.hasOwnProperty(domain)) {
        if (items[domain].type === 'red') {
          _blacklistGoals[domain] = timeConverter(items[domain]);
        } else if (items[domain].type === 'green') {
          _whiteList.push(domain);
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  goalGetter();

  chrome.storage.onChanged.addListener(() => {
    goalGetter();
  });
});

// get time in minuts for alarms
function getBlacklistGoal() {
  return Math.floor(_blacklistGoals[_currentUrl] / 60);
}

function firstAlarm() {
  if (_blacklistGoals.hasOwnProperty(_currentUrl)) {
    chrome.alarms.create('firstWarning', { delayInMinutes: getBlacklistGoal() * 0.5 });
  }
}

function secondAlarm() {
  chrome.alarms.create('secondWarning', { delayInMinutes: getBlacklistGoal() * 0.2 });
}

function thirdAlarm() {
  chrome.alarms.create('thirdWarning', { delayInMinutes: getBlacklistGoal() * 0.01 });
}

function assignNotification() {
  let notification = new Notification('', {
    body: `\nHalfway through ${_blacklistGoals[_currentUrl] / 60} minutes on ${_currentUrl}`,
    title: 'Hello',
    icon: 'images/littlegnome.png',
    requireInteraction: false
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
    chrome.tabs.update(_currentTabId, { url: randomUrl });
  }
});
