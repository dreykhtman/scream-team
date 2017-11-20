//expand and shrinking app
function toggleSettings(){
  let settings = document.getElementById('settings');
  console.log('settings.className= ',settings.className)
  if (settings.className === 'hide') {
    settings.className = 'show';
  } else {
    settings.className = 'hide';
  }
}

function getInput() {

  chrome.storage.sync.get(null, function(items) {
    // var allKeys = Object.keys(items)
    console.log('this is what comes back', items);
  })
}

//wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

      let settingsButton = document.getElementById('settings-button');
      settingsButton.addEventListener('click', () => {
        toggleSettings();
        getInput()
      });

    });

//parse url for domain
function getDomain(url) {
  return url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
}


let data = {};

function saveInput(event) {

  let urlObj = {
    type: '',
    goalHrs: 0,
    goalMins: 0,
    browsingTime: 0
  }

  event.preventDefault()
  let url = getDomain(document.getElementById('blacklist-url').value);
  urlObj.type = 'redlight'
  data[url] = urlObj
  console.log('redlight', data)
  chrome.storage.sync.set({[url]: data}, () => {
    console.log('this has been saved ')
  })
}



let form = document.getElementById('form');

form.addEventListener('submit', (e) => {
  e.preventDefault()
    saveInput(e)
    getInput()
})





