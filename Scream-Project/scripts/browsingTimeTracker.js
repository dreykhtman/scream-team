let browsingTime =  0;
let currentUrl;
let isActive;
let currentObj;

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.onActivated.addListener(() => {
    //get current URL
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
     currentUrl = getDomainNoPrefix(tabs[0].url);
     getBrowsingInput(currentUrl)
     .then(({storageBrowsingTime})=> {
       browsingTime += storageBrowsingTime;
     })
     console.log('line15',browsingTime)
     startTimer(currentUrl)
      isActive = true;

      chrome.tabs.onHighlighted.addListener(function(selectInfo) {
        let copyOfCurrentObj = Object.assign({}, currentObj);
        copyOfCurrentObj.browsingTime = browsingTime;

        chrome.storage.sync.set({[currentUrl]: copyOfCurrentObj}, function() {
          console.log('copy of current object',  copyOfCurrentObj)
        })
      })
     });
   })
})


  // chrome.tabs.onActivated.addListener(function(activeInfo) {
  //   // how to fetch tab url using activeInfo.tabid

  //   })
  //   chrome.tabs.get(activeInfo.tabId, function(tab){
  //      console.log('spleeeeebob,', tab.url);
  //   });



  // chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  //   console.log('booooyah', currentUrl, tab.url)
  // })

  // });




  // chrome.tabs.query({ active: false }, function (tabs) {
  //   console.log('byeeee')
  //   // clearInterval()
  //   // saveBrowsingTimeToDB()//hypothetical
  // });




function startTimer(url) {
  if (url.startsWith('chrome://')) {
    return;
  }
  browsingTime = setInterval(countUp, 1000);
}

function countUp() {
  browsingTime++;
  // console.log('this is the current time',currentUrl, browsingTime)
}

function getDomainNoPrefix(url) {
  let link = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
  let output = (link.split('.').length > 2) ? link.split('.').slice(-2).join('.') : link;

  return output;
}

function getBrowsingInput(url) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get([url], function (urlObj) {
      if (!urlObj) reject(new Error('no data found'))
      currentObj = urlObj;
      console.log('object from storage',currentObj)
      let storageBrowsingTime = urlObj.browsingTime;
      resolve({urlObj, storageBrowsingTime})
    })
  })
}



function saveTime(e, type) {
  e.preventDefault()
  let setTime = e.target.timeInput.value
  chrome.storage.sync.set({ [type]: setTime }, () => {
  })
}
