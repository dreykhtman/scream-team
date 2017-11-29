let flag = false;

function getInput() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, function (items) {
      if (!items) reject(new Error('no data found'))
      let bedtime = items.bedtime;
      let waketime = items.waketime;
      resolve({ bedtime, waketime, items })
    })
  })
}

chrome.tabs.onCreated.addListener(() => {
  getInput()
    .then(({ bedtime, waketime }) => {
      let bedtimeUrl = 'https://i.ytimg.com/vi/0R8SmeKDvjg/maxresdefault.jpg'
      let currentTime = new Date().toTimeString().split(' ')[0].slice(0, -3);
      if (bedtime) {
        if ((currentTime >= bedtime) && !flag) {
          chrome.tabs.update({ url: bedtimeUrl })
        }
      }
    })
})

// function assignNotification() {
//   let notification = new Notification('', {
//     body: `\nYou are halfway through your total time of ${_blacklistGoals[_currentUrl] / 60} minutes on ${_currentUrl}`,
//     title: 'Hello',
//     icon: 'littlegnome.png',
//     requireInteraction: true
//   });
// }
