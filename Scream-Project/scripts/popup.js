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
        if (typeof value === 'object') {
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

//fetch to get package data from deployed database
async function getPackages() {
  let packages = await window.fetch('https://frozen-castle-90148.herokuapp.com/api/packages').then(function (response) {
    let contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }
    throw new TypeError("no JSON");
  })
  return packages;
}


//wait for DOM to load
document.addEventListener('DOMContentLoaded', async () => {

  // getting package data from deployed database
  let packages = await getPackages();

  // click listener to load & populate all user data fields when expand button is clicked
  let settingsButton = document.getElementById('initial-view-toggle-button');
  settingsButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleSettings();

    // populating package dropdown
    let packageDropdown = document.getElementById('packageList-form');
    let packageHTML = "";
    if (!!packages) {
      packages.forEach((item) => {
        packageHTML += "<option value=" + item.name + ">" + item.name + "</option>";
        packageDropdown.innerHTML = packageHTML
      })
    }
  })

  // populating user data from chrome storage into expanded section
  let { items } = await getInput()
    let waketime, bedtime;
    let redListDropDown = document.getElementById('redlist-form-dropdown-options');
    let greenListDropDown = document.getElementById('greenlist-form-dropdown-options');
    let bedtimeArea = document.getElementById('bedtime-set');
    let waketimeArea = document.getElementById('waketime-set');
    let militaryWaketime = items.waketime;
    let militaryBedtime = items.bedtime;
    militaryWaketime ? waketime = convertTime(items.waketime) : waketime = 'Not set';
    militaryBedtime ? bedtime = convertTime(items.bedtime) : bedtime = 'Not set';
    let redHTML = '';
    let greenHTML = '';
    if (!!items) {
      for (let url in items) {
        if (items[url].type === "red") redHTML += "<option value" + url + ">" + url + "</option>";
        if (items[url].type === "green") greenHTML += "<option value" + url + ">" + url + "</option>";
      }
    }
    redListDropDown.innerHTML = redHTML;
    greenListDropDown.innerHTML = greenHTML;
    bedtimeArea.innerHTML = bedtime;
    waketimeArea.innerHTML = waketime;

  let redlistForm = document.getElementById('redlist-form')
  let greenlistForm = document.getElementById('greenlist-form')
  let redlistButton = document.getElementById('redlist-form-submit')
  let greenlistButton = document.getElementById('greenlist-form-submit')
  let greenlistEdit = document.getElementById('greenlist-edit-btn')
  let greenlistDelete = document.getElementById('greenlist-delete-btn')
  let redlistEdit = document.getElementById('redlist-edit-btn')
  let redlistDelete = document.getElementById('redlist-delete-btn')
  let oneClickGreen = document.getElementById('initial-view-oneclickadd-greenlist')
  let oneClickRed = document.getElementById('initial-view-oneclickadd-redlist')
  let packageSubmit = document.getElementById('packageList-form-submit')

  // adding a selected package to current user on submit!
  packageSubmit.addEventListener('click', (e) => {
    packages.forEach((package) => {
      let dropdown = document.getElementById('packageList-form').value
      if (package.name.includes(dropdown)) {
        package.sites.forEach(site => {
          savePackageToChromeDB(site.url, site.type, site.goalHrs, site.goalMins)
          appendToOptionsFromPackageSubmit(e, site.url, site.type)
        })
      }
    })
  })

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
    clearListonDelete(e, 'green')
  });

  redlistDelete.addEventListener('click', (e) => {
    e.preventDefault();
    deleteInput(e, 'red');
    clearListonDelete(e, 'red')
  });

  oneClickGreen.addEventListener('click', (e) => {
    e.preventDefault();
    saveSiteOneClick(e, 'green')

  });

  oneClickRed.addEventListener('click', (e) => {
    e.preventDefault();
    saveSiteOneClick(e, 'red')
  });


  let bedtimeForm = document.getElementById('bedtime-form');
  bedtimeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveTime(e, 'bedtime');
    appendBedTime(e);
    clearBedTime(e);
  });

  let waketimeForm = document.getElementById('waketime-form');
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
  let url = getDomain(document.getElementById(`${type}list-form-url`).value);
  let hrs = document.getElementById(`${type}list-form-hrs`).value;
  let mins = document.getElementById(`${type}list-form-mins`).value;
  let urlObj = {
    type: type,
    goalHrs: +hrs,
    goalMins: +mins,
    browsingTime: 0
  }
  chrome.storage.sync.set({ [url]: urlObj }, () => {
  })
}

function savePackageToChromeDB(url, type, hrs, mins) {
  type = type.toLowerCase()
  url = getDomainNoPrefix(url)
  let urlObj = {
    url: url,
    type: type,
    goalHrs: hrs,
    goalMins: mins,
    browsingTime: 0
  }
  chrome.storage.sync.set({ [url]: urlObj }, () => {
    console.log('saved', urlObj)
  })
}


function saveTime(e, type) {
  e.preventDefault()
  let setTime = e.target.timeInput.value
  chrome.storage.sync.set({ [type]: setTime }, () => {
  })
}

async function editInput(e, type) {
  e.preventDefault()
  let selectElem = document.getElementById(`${type}list-form-dropdown-options`);
  let optionValue = selectElem.options[selectElem.selectedIndex].value;
  let formUrl = document.getElementById(`${type}list-form-url`);
  let formHrs = document.getElementById(`${type}list-form-hrs`);
  let formMins = document.getElementById(`${type}list-form-mins`);
  let { items } = await getInput();
  formUrl.value = optionValue;
  formHrs.value = items[optionValue].goalHrs;
  formMins.value = items[optionValue].goalMins;
  deleteInput(e, type);
}

function deleteInput(e, type) {
  e.preventDefault();
  let selectElem = document.getElementById(`${type}list-form-dropdown-options`);
  let optionValue = selectElem.options[selectElem.selectedIndex].value;
  chrome.storage.sync.remove(optionValue)
}

//parse url for domain
function getDomain(url) {
  return url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
}

function appendToOptions(e, type) {
  e.preventDefault();
  type = type.toLowerCase()
  let url = getDomain(document.getElementById(`${type}list-form-url`).value);
  let option = document.createElement("option");
  let text = document.createTextNode(url);
  option.appendChild(text)
  document.getElementById(`${type}list-form-dropdown-options`).appendChild(option)
}

function appendToOptionsFromPackageSubmit(e, url, type) {
  e.preventDefault();
  type = type.toLowerCase()
  url = getDomain(url)
  let option = document.createElement("option");
  let text = document.createTextNode(url);
  option.appendChild(text)
  document.getElementById(`${type}list-form-dropdown-options`).appendChild(option)
}

function clearInput(e, type) {
  e.preventDefault();
  let url = document.getElementById(`${type}list-form-url`);
  let hrs = document.getElementById(`${type}list-form-hrs`);
  let mins = document.getElementById(`${type}list-form-mins`);
  url.value = "";
  if (type === 'green') {
    document.getElementById(`${type}list-form-url`).placeholder = "www.nytimes.com";
  }
  if (type === "red") {
    document.getElementById(`${type}list-form-url`).placeholder = "www.facebook.com";
  }

  hrs.value = null;
  mins.value = null;
}

function clearBedTime(e) {
  e.preventDefault();
  let timeInput = document.getElementById('bedtime-form-input')
  timeInput.value = "";
}

function clearWakeTime(e) {
  e.preventDefault();
  let timeInput = document.getElementById('waketime-form-input')
  timeInput.value = "";
}

function appendBedTime(e) {
  let timeInput = document.getElementById('bedtime-form-input');
  document.getElementById('bedtime-set').innerHTML = convertTime(timeInput.value)
}

function appendWakeTime(e) {
  let timeInput = document.getElementById('waketime-form-input');
  document.getElementById('waketime-set').innerHTML = convertTime(timeInput.value)
}

function clearListonDelete(e, type) {
  e.preventDefault()
  let selectElem = document.getElementById(`${type}list-form-dropdown-options`);
  selectElem.removeChild(selectElem.childNodes[0])
}


function getDomainNoPrefix(url) {
  let link = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
  let output = (link.split('.').length > 2) ? link.split('.').slice(-2).join('.') : link;

  return output;
}

function saveSiteOneClick(e, type) {
  e.preventDefault()
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    let url = getDomainNoPrefix(tabs[0].url);
    let urlObj = {
      url: url,
      type: type,
      goalHrs: 1,
      goalMins: 0,
      browsingTime: 0
    }
    chrome.storage.sync.set({ [url]: urlObj }, () => {
      let colorList;
      if (type === 'red') {
        colorList = 'black';
      } else {
        colorList = 'white';
      }
      const notification = new Notification('', {
        body: `\n${url} is now on ${colorList}list`,
        icon: 'images/littlegnome.png',
        requireInteraction: false
      })
    })
  })
}


