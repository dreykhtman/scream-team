//expand and shrinking app
function toggleSettings(option) {
  let settings = document.getElementById('settings');
  let initialView = document.getElementById('initial-view');
  if (settings.className === 'hide') {
    settings.className = 'show';
    initialView.className = 'hide';
  } else if (settings.className === 'show') {
    settings.className = 'hide';
    initialView.className = 'show';
  }
}

// getting data object with all user data from chrome storage
function getInput() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, function (items) {
      if (!items) reject(new Error('no data found'))
      let dataForChart = [];
      for (let site in items) {
        let value = items[site]
        value['url'] = site
        if (typeof value === 'Object') {
          dataForChart.push(value);
        }
      }
      resolve({ dataForChart, items })
    })
  })
}

//for bed/wake time section
function convertTime(time) {
  let hr = time.slice(0, 2);
  let min = time.slice(2);
  if (hr > 12) {
    hr %= 12
    time = hr + min + 'PM'
  } else {
    time = hr + min + 'AM';
  }
  return time;
}

//wait for DOM to load
document.addEventListener('DOMContentLoaded', async () => {
  //click listener to load & populate all user data fields when expand button is clicked
  let settingsButton = document.getElementById('initial-view-toggle-button');
  settingsButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleSettings();
    getInput()
      .then(({ items }) => {
        let waketime, bedtime;
        let redListDropDown = document.getElementById('settings-redlist-section-form-dropdown-options');
        let greenListDropDown = document.getElementById('settings-greenlist-section-form-dropdown-options');
        let bedtimeArea = document.getElementById('settings-bedtime-section-load-bedtime');
        let waketimeArea = document.getElementById('settings-bedtime-section-load-waketime');
        items.waketime ? waketime = convertTime(items.waketime) : waketime = 'Not Set';
        items.bedtime ? bedtime = convertTime(items.bedtime) : bedtime = 'Not Set';
        let redHTML = '';
        let greenHTML = '';
        if(!!items) {
          for (let url in items) {
          if (items[url].type === "red") redHTML += "<option value" + url + ">" + url + "</option>";
          if (items[url].type === "green") greenHTML += "<option value" + url + ">" + url + "</option>";
          }
        }
        redListDropDown.innerHTML = redHTML;
        greenListDropDown.innerHTML = greenHTML;
        bedtimeArea.innerHTML = bedtime;
        waketimeArea.innerHTML = waketime;
      })
  });

  let redlistForm = document.getElementById('settings-redlist-section-form');
  let greenlistForm = document.getElementById('settings-greenlist-section-form');
  let redlistButton = document.getElementById('settings-redlist-section-form-submit')
  let greenlistButton = document.getElementById('settings-greenlist-section-form-submit')
  let greenlistEdit = document.getElementById('greenlist-edit-btn')
  let greenlistDelete = document.getElementById('greenlist-delete-btn')
  let redlistEdit = document.getElementById('redlist-edit-btn')
  let redlistDelete = document.getElementById('redlist-delete-btn')

  redlistForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveInput(e, 'red');
    appendToOptions(e, 'red');
    clearInput(e, 'red');
  });

  greenlistForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveInput(e, 'green');
    appendToOptions(e, 'green');
    clearInput(e, 'green');
  });

  greenlistEdit.addEventListener('click', (e) => {
    e.preventDefault();
    editInput(e, 'green');

  });
  redlistEdit.addEventListener('click', (e) => {
    e.preventDefault();
    editInput(e, 'red');
  });
  greenlistDelete.addEventListener('click', (e) => {
    e.preventDefault();
    deleteInput(e, 'green');
    clearInput(e, 'green');

  });
  redlistDelete.addEventListener('click', (e) => {
    e.preventDefault();
    deleteInput(e, 'red');

  });

  let bedtimeForm = document.getElementById('settings-bedtime-section-form');
  bedtimeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveTime(e, 'bedtime');
    appendBedTime(e);
    clearBedTime(e);

  });

  let waketimeForm = document.getElementById('settings-bedtime-section-waketime-form');
  waketimeForm.addEventListener('submit', (e) => {
    e.preventDefault()
    saveTime(e, 'waketime');
    appendWakeTime(e);
    clearWakeTime(e);
  })

  let { dataForChart } = await getInput();
  loadPieChart(dataForChart)
});

function saveInput(e, type) {
  e.preventDefault();
  let url = getDomain(document.getElementById(`settings-${type}list-section-form-url`).value);
  let hrs = document.getElementById(`settings-${type}list-section-form-hrs`).value;
  let mins = document.getElementById(`settings-${type}list-section-form-mins`).value;
  let urlObj = {
    type: type,
    goalHrs: +hrs,
    goalMins: +mins,
    browsingTime: 0
  }
  chrome.storage.sync.set({ [url]: urlObj }, () => {
  })
}

function saveTime(e, type) {
  e.preventDefault()
  let setTime = e.target.timeInput.value
  chrome.storage.sync.set({ [type]: setTime }, () => {
  })
}

async function editInput (e, type) {
  e.preventDefault()
  let selectElem = document.getElementById(`settings-${type}list-section-form-dropdown-options`);
  let optionValue = selectElem.options[selectElem.selectedIndex].value;
  let formUrl = document.getElementById(`settings-${type}list-section-form-url`);
  let formHrs = document.getElementById(`settings-${type}list-section-form-hrs`);
  let formMins = document.getElementById(`settings-${type}list-section-form-mins`);
  let { items } = await getInput();
  formUrl.value = optionValue;
  formHrs.value = items[optionValue].goalHrs;
  formMins.value = items[optionValue].goalMins;
  deleteInput(e, type);
}

function deleteInput (e, type) {
  e.preventDefault();
  let selectElem = document.getElementById(`settings-${type}list-section-form-dropdown-options`);
  let optionValue = selectElem.options[selectElem.selectedIndex].value;
  chrome.storage.sync.remove(optionValue)
}

//parse url for domain
function getDomain(url) {
  return url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
}

function appendToOptions(e, type) {
  e.preventDefault();
  let url = getDomain(document.getElementById(`settings-${type}list-section-form-url`).value);
  let option = document.createElement("option");
  let text = document.createTextNode(url);
  option.appendChild(text)
  document.getElementById(`settings-${type}list-section-form-dropdown-options`).appendChild(option)
}

function clearInput(e, type) {
  e.preventDefault();
  let url = document.getElementById(`settings-${type}list-section-form-url`);
  let hrs = document.getElementById(`settings-${type}list-section-form-hrs`);
  let mins = document.getElementById(`settings-${type}list-section-form-mins`);
  url.value = "";
  document.getElementById(`settings-${type}list-section-form-url`).placeholder = "google.com";
  hrs.value = null;
  mins.value = null;
}

function clearBedTime(e) {
  e.preventDefault();
  let timeInput = document.getElementById(`settings-bedtime-section-form-input`)
  timeInput.value = "";
}

function clearWakeTime(e) {
  e.preventDefault();
  let timeInput = document.getElementById(`settings-bedtime-section-waketime-form-input`)
  timeInput.value = "";
}

function appendBedTime(e) {
  let timeInput = document.getElementById(`settings-bedtime-section-form-input`);
  document.getElementById(`settings-bedtime-section-load-bedtime`).innerHTML = convertTime(timeInput.value)
}

function appendWakeTime(e) {
  let timeInput = document.getElementById(`settings-bedtime-section-waketime-form-input`);
  document.getElementById(`settings-bedtime-section-load-waketime`).innerHTML = convertTime(timeInput.value)
}
