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
    console.log('Storage: ', items)
  });
});

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
  chrome.alarms.create('thirdWarning', { delayInMinutes: getBlacklistGoal() * 0.1 });
}

function assignNotification() {
  let notification = new Notification('', {
    body: `\nYou are halfway through your total time of ${_blacklistGoals[_currentUrl] / 60} minutes on ${_currentUrl}`,
    title: 'Hello',
    icon: 'littlegnome.png',
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
    secondAlarm();
    notifyMe();
  } else if (alarm.name === 'secondWarning') {
    thirdAlarm();
    alert(`Your time on ${_currentUrl} is almost up!`);
  } else if (alarm.name === 'thirdWarning') {
    alert('third');
  }
});
