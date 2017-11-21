//expand and shrinking app
function toggleSettings(){
  let settings = document.getElementById('settings');
  console.log('settings.className= ', settings.className)
  if (settings.className === 'hide') {
    settings.className = 'show';
    console.log('showing')
  } else if (settings.className === 'show'){
    settings.className = 'hide';
    console.log('hiding')
  }
}

function getInput() {
  chrome.storage.sync.get(null, function(items) {
    console.log('this is what comes back', items);
  })
}

function populateDropdown() {
  console.log('hiiiii')
  let redlist = [];
  let greenlist = [];

}

// //wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  let settingsButton = document.getElementById('initial-view-toggle-button');
  settingsButton.addEventListener('click', (e) => {
    e.preventDefault()
    toggleSettings();
        getInput()
        populateDropdown()

        let redlistForm = document.getElementById('settings-redlist-section-form');
        let greenlistForm = document.getElementById('settings-greenlist-section-form');
        let redlistButton  = document.getElementById('settings-redlist-section-form-submit')
        let greenlistButton = document.getElementById('settings-greenlist-section-form-submit')

        redlistForm.addEventListener('submit', (e) => {
          e.preventDefault()
            saveInput(e, 'red')
            getInput()
        })

        greenlistForm.addEventListener('submit', (e) => {
          e.preventDefault()
            saveInput(e, 'green')
            getInput()
        })
      });

      function saveInput(event, type) {

          event.preventDefault()
          console.log(type)
          let url = getDomain(document.getElementById(`settings-${type}list-section-form-url`).value);
          let hrs = document.getElementById(`settings-${type}list-section-form-hrs`).value
          let mins = document.getElementById(`settings-${type}list-section-form-mins`).value
          urlObj = {
            type: type,
            goalHrs: hrs,
            goalMins: mins,
            browsingTime: 0
          }
          data[url] = urlObj
          chrome.storage.sync.set({[url]: data[url]}, () => {
            console.log('this has been saved', urlObj)
          })
        }

    });

    function makeObject() {}


//parse url for domain
function getDomain(url) {
  return url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
}

// let data = {};






