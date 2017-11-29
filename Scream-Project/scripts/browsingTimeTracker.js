let browsingTime;

document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.onActivated.addListener(() => {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      let currentUrl = getDomainNoPrefix(tabs[0].url);
    });

  });
})



function getDomainNoPrefix(url) {
  let link = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
  let output = (link.split('.').length > 2) ? link.split('.').slice(-2).join('.') : link;

  return output;
}
