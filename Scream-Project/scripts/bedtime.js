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

function timeToSecs(time) {
  let timeArr = String(time).split(':');
  let hrToSec = timeArr[0] * 3600;
  let minToSec = timeArr[1] * 60;
  return hrToSec + minToSec;
}

function calculateTimeDiff(t1, t2) {
  let t1Secs = timeToSecs(t1);
  let t2Secs = timeToSecs(t2);
  let diffMins = (t1Secs - t2Secs) / 60;
  return diffMins;
}

chrome.tabs.onCreated.addListener(() => {
  getInput()
    .then(({ bedtime, waketime }) => {
      let bedtimeUrl = 'https://i.ytimg.com/vi/0R8SmeKDvjg/maxresdefault.jpg'
      let currentTime = new Date().toTimeString().split(' ')[0].slice(0, -3);
      if (bedtime) {
        let timeDiff = calculateTimeDiff(bedtime, currentTime)
        if (timeDiff > 0 && timeDiff < 20) {
          new Notification('', {
            body: `\nYou're almost at your bedtime!`,
            icon: 'littlegnome.png',
            requireInteraction: true
          })
        }
        else if ((currentTime >= bedtime) && !flag) {
          chrome.tabs.update({ url: bedtimeUrl })
        }
      }
    })
})
