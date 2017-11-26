function firstAlarm() {
  chrome.alarms.create('firstWarning', { delayInMinutes: 0.1 });
}

function secondAlarm() {
  chrome.alarms.create('secondWarning', { delayInMinutes: 0.1 });
}

function thirdAlarm() {
  chrome.alarms.create('thirdWarning', { delayInMinutes: 0.1 });
}

function notifyMe() {
  if (!('Notification' in window)) {
    alert("This browser doesn't support notifications.");
  } else if (Notification.permission === 'granted') {
    //notification instance
    let notification = new Notification('Hey, you!', {
      body: `URL: ${_currentUrl}`,
      title: 'Hello',
      requireInteraction: true
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission(permission => {
      if (permission === 'granted') {
        let notification = new Notification('Hey, you!', {
          body: `URL: ${_currentUrl}`,
          title: 'Hello',
          requireInteraction: true
        });
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
