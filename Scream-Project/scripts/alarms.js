let _blacklistGoals = {};
let _whiteList = [];
let _totalBrowsingTime = {};


// get goal times from storage
function getGoals() {
  getData()
    .then((data) => {
      _blacklistGoals = data._blacklistGoals;
      _whiteList = data._whiteList;
    });
}

function getData() {
  const newDate = new Date();
  const todayDate = newDate.toLocaleDateString();

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

      if (!items.yesterday.date) {
        chrome.storage.sync.set({ yesterday: {date: todayDate} }, () => {
          _yesterdayDate = todayDate;
        });
      } else {
        _yesterdayDate = items.yesterday.date;
      }

      if (_yesterdayDate !== todayDate) {
        resetBrowsingTimes();
      }

      resolve({ _blacklistGoals, _whiteList, _yesterdayDate });
    });
  });
}


// get time in minuts for alarms
function getBlacklistGoal() {
  let minutes = (_blacklistGoals[_currentUrl] - _totalBrowsingTime[_currentUrl]) / 60;
  return minutes;
}

function firstAlarm() {
  // navigate away if browsing time is greater than goal time
  if (_totalBrowsingTime[_currentUrl] >= _blacklistGoals[_currentUrl]) {
    chrome.alarms.clearAll(() => { });
    let randomUrl = 'http://' + _whiteList[Math.floor(Math.random() * _whiteList.length)];
    chrome.tabs.update({ url: randomUrl });
  } else if (_blacklistGoals.hasOwnProperty(_currentUrl)) {
    chrome.alarms.create('firstWarning', { delayInMinutes: getBlacklistGoal() * 0.5 });
  }
}

function secondAlarm() {
  chrome.alarms.create('secondWarning', { delayInMinutes: getBlacklistGoal() * 0.2 });
}

function thirdAlarm() {
  chrome.alarms.create('thirdWarning', { delayInMinutes: 0 });
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
