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
      console.log(bedtime)
      console.log(currentTime)
      if ((currentTime >= bedtime) && !flag) {
        chrome.tabs.update({ url: bedtimeUrl })
      }
      else if ("YOU'RE 10 MINS FROM YOUR BEDTIME") {
        new Notification ('', {
          body: `\nYou are almost at your bedtime!`,
          title: 'Hello,',
          icon: 'images/littlegnome.png',
          requireInteraction: true
        })
      }
    }
  })
})
