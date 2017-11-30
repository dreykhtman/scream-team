let _blacklistGoals = {};
let _whiteList = [];
let _totalBrowsingTime = {};

function timeConverter(obj) {
  let hrToSec = obj.goalHrs * 3600;
  let minToSec = obj.goalMins * 60;
  return hrToSec + minToSec;
}

// get goal times from storage
function goalGetter() {
  getData()
    .then((data) => {
      _blacklistGoals = data._blacklistGoals;
      _whiteList = data._whiteList;
    });
}

function getData() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, (items) => {
      _blacklistGoals = {};
      _whiteList = [];
      _totalBrowsingTime = {};
      for (let domain in items) {
        if (items.hasOwnProperty(domain)) {
          if (items[domain].type === 'red') {
            _blacklistGoals[domain] = timeConverter(items[domain]);
            _totalBrowsingTime[domain] = items[domain].browsingTime;
          } else if (items[domain].type === 'green') {
            _whiteList.push(domain);
          }
        }
      }
      resolve({ _blacklistGoals, _whiteList });
    });
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
  let minutes = (_blacklistGoals[_currentUrl] - _totalBrowsingTime[_currentUrl]) / 60;
  return minutes;
}

function firstAlarm() {
  // navigate away if browsing time is greater than goal time
  if (_totalBrowsingTime[_currentUrl] >= _blacklistGoals[_currentUrl]) {
    chrome.alarms.clearAll(() => {});
    let randomUrl = 'http://' + _whiteList[Math.floor(Math.random() * _whiteList.length)];
    chrome.tabs.update(_currentTabId, { url: randomUrl });
  } else if (_blacklistGoals.hasOwnProperty(_currentUrl)) {
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

function uglifier() {
  document.body.style.backgroundColor = "yellow";
  document.body.style.fontFamily = "Comic Sans MS, cursive, sans-serif";
}

// every alarm triggers the next one
chrome.alarms.onAlarm.addListener(alarm => {
  let randomUrl = 'http://' + _whiteList[Math.floor(Math.random() * _whiteList.length)];
  if (alarm.name === 'firstWarning') {
    uglifier();
    secondAlarm();
    notifyMe();
  } else if (alarm.name === 'secondWarning') {
    thirdAlarm();
    alert(`Your time on ${_currentUrl} is almost up!`);
  } else if (alarm.name === 'thirdWarning') {
    chrome.tabs.update(_currentTabId, { url: randomUrl });
  }
});
