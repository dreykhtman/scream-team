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

// let data = {};

function saveRedlistInput(event) {

  let urlObj = {
    type: '',
    goalHrs: 0,
    goalMins: 0,
    browsingTime: 0
  }

  event.preventDefault()
  let url = getDomain(document.getElementById('redlist-url').value);
  let hrs = document.getElementById('redlist-hrs').value
  let mins = document.getElementById('redlist-mins').value
  urlObj = {
    type:'redlist',
    goalHrs: hrs,
    goalMins: mins
  }
  data[url] = urlObj
  console.log('redlist', data)
  chrome.storage.sync.set({[url]: data[url]}, () => {
    console.log('this has been saved')
  })
}




function saveGreenlistInput(event) {

    let urlObj = {
      type: '',
      goalHrs: 0,
      goalMins: 0,
      browsingTime: 0
    }

    event.preventDefault()
    let url = getDomain(document.getElementById('greenlist-url').value);
    let hrs = document.getElementById('greenlist-hrs').value
    let mins = document.getElementById('greenlist-mins').value
    urlObj = {
      type:'greenlist',
      goalHrs: hrs,
      goalMins: mins
    }
    data[url] = urlObj
    console.log('greenlist', data)
    chrome.storage.sync.set({[url]: data[url]}, () => {
      console.log('this has been saved')
    })
  }


let redlistForm = document.getElementById('redlistForm');
let greenlistForm = document.getElementById('greenlistForm');

redlistForm.addEventListener('submit', (e) => {
  e.preventDefault()
    saveRedlistInput(e)
    getInput()
})

greenlistForm.addEventListener('submit', (e) => {
  e.preventDefault()
    saveGreenlistInput(e)
    getInput()
})



