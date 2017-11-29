let browsingTime = 0;
let currentUrl;

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.onActivated.addListener(() => {

    //get current URL
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      currentUrl = getDomainNoPrefix(tabs[0].url);
      startTimer(currentUrl)
    });
  })
})

function startTimer(url) {
  if (url.startsWith('chrome://')) {
    return;
  }
  browsingTime = setInterval(countUp, 1000);
}

function countUp() {
  browsingTime++;
  console.log(browsingTime)
}


function getDomainNoPrefix(url) {
  let link = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
  let output = (link.split('.').length > 2) ? link.split('.').slice(-2).join('.') : link;

  return output;
}

