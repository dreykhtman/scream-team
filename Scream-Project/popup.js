//expand and shrinking app
function toggleSettings(){
  let settings = document.getElementById('settings');
  console.log('settings.className= ', settings.className)
  if (settings.className === 'hide') {
    settings.className = 'show';
  } else if (settings.className === 'show'){
    settings.className = 'hide';
  }
}

function getInput(){
  let redListDropDown = document.getElementById('settings-redlist-section-form-dropdown-options');
  let greenListDropDown = document.getElementById('settings-greenlist-section-form-dropdown-options');

  chrome.storage.sync.get(null, function(items) {
    let redHTML='';
    let greenHTML='';

    for(let url in items){
      items[url].type === "red" ? redHTML += "<option value"+url+">"+url+"</option>" :
      greenHTML += "<option value"+url+">"+url+"</option>";
    }
    redListDropDown.innerHTML = redHTML;
    greenListDropDown.innerHTML = greenHTML;
  })
}

// //wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  let settingsButton = document.getElementById('initial-view-toggle-button');
  settingsButton.addEventListener('click', (e) => {
        e.preventDefault()
        toggleSettings();
        getInput()

        let redlistForm = document.getElementById('settings-redlist-section-form');
        let greenlistForm = document.getElementById('settings-greenlist-section-form');
        let redlistButton  = document.getElementById('settings-redlist-section-form-submit')
        let greenlistButton = document.getElementById('settings-greenlist-section-form-submit')

        redlistForm.addEventListener('submit', (e) => {
          e.preventDefault()
            saveInput(e, 'red')
        })

        greenlistForm.addEventListener('submit', (e) => {
          e.preventDefault()
            saveInput(e, 'green')
        })
      });

      function saveInput(event, type) {
          event.preventDefault()
          let url = getDomain(document.getElementById(`settings-${type}list-section-form-url`).value);
          let hrs = document.getElementById(`settings-${type}list-section-form-hrs`).value
          let mins = document.getElementById(`settings-${type}list-section-form-mins`).value
          let urlObj = {
            type: type,
            goalHrs: hrs,
            goalMins: mins,
            browsingTime: 0
          }
          chrome.storage.sync.set({[url]: urlObj}, () => {
          })
        }
        loadPieChart()
    });


//parse url for domain
function getDomain(url) {
  return url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
}








