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
  let bedtimeArea = document.getElementById('settings-bedtime-section-load-bedtime');
  let waketimeArea = document.getElementById('settings-bedtime-section-load-waketime');

  chrome.storage.sync.get(null, function(items) {
console.log("WHATS UP BIATCHACHACHA?!?!", items)

    let waketime = convertTime(items.waketime)
    let bedtime = convertTime(items.bedtime)
    let redHTML='';
    let greenHTML='';

    for(let url in items){
      if(items[url].type === "red") redHTML += "<option value"+url+">"+url+"</option>";
      if(items[url].type === "green") greenHTML += "<option value"+url+">"+url+"</option>";
    }

    redListDropDown.innerHTML = redHTML;
    greenListDropDown.innerHTML = greenHTML;
    bedtimeArea.innerHTML = bedtime;
    waketimeArea.innerHTML = waketime;
  })
}

function convertTime(time){
  let hr = time.slice(0,2);
  let min = time.slice(2);
  if(hr > 12){
    hr %= 12
    time = hr + min + 'PM'
  } else {
    time = hr + min + 'AM'
  }
  return time;
}

// //wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  let settingsButton = document.getElementById('initial-view-toggle-button');
  settingsButton.addEventListener('click', (e) => {
    e.preventDefault()
    toggleSettings();
    getInput()
  });

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

  let bedtimeForm = document.getElementById('settings-bedtime-section-form')
  bedtimeForm.addEventListener('submit', (e) => {
    e.preventDefault()
    saveTime(e, 'bedtime')
  })

  let waketimeForm = document.getElementById('settings-bedtime-section-waketime-form')
  waketimeForm.addEventListener('submit', (e) => {
    e.preventDefault()
    saveTime(e, 'waketime')
  })
});

function saveInput(e, type) {
  e.preventDefault()
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

function saveTime(e, type) {
  e.preventDefault()
  let setTime = e.target.timeInput.value
  chrome.storage.sync.set({[type]: setTime}, () => {
  })
}

//parse url for domain
function getDomain(url) {
  return url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
}








