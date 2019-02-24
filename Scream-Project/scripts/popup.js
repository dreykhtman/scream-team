togglePopup = () => {
  const settings = document.querySelector('#settings');
  const usage = document.querySelector('#usage');

  switch (settings.className) {
    case 'hide':
      settings.className = 'show';
      usage.className = 'hide';
      break;
    case 'show':
      settings.className = 'hide';
      usage.className = 'show';
      break;
    default: return;
  }
};

//get all user data from chrome storage
getInput = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, (items) => {
      if (!items) {
        reject(new Error('no data found'));
      }

      //re-structure chrome storage output for d3 array input
      let dataForChart = [];
      for (let site in items) {
        let obj = typeof items[site] === 'object' ? items[site] : null;
        dataForChart.push({ ...obj, 'url': site });
      }

      resolve({ dataForChart, items })
    })
  })
};

formatTime = (time) => {
  let hr = time.slice(0, 2);
  let min = time.slice(2);
  if (hr > 12) {
    hr %= 12
    time = hr + min + 'PM'
  } else {
    time = hr + min + 'AM';
  }
  return time;
};

//get package data from deployed database api
getPackages = async () => {
  const packages = await window.fetch('https://frozen-castle-90148.herokuapp.com/api/packages')
    .then((response) => {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        throw new TypeError("no JSON");
      };
    });

  return packages;
};

//on DOM load...
document.addEventListener('DOMContentLoaded', async () => {
  const packages = await getPackages();
  const { items } = await getInput();
  let settingsButton = document.querySelector('#usage-toggle-btn');
  let redListDropDown = document.querySelector('#redlist-form-dropdown-options');
  let greenListDropDown = document.querySelector('#greenlist-form-dropdown-options');
  let bedtimeArea = document.querySelector('#bedtime-set');
  let waketimeArea = document.querySelector('#waketime-set');
  let redlistForm = document.querySelector('#redlist-form');
  let greenlistForm = document.querySelector('#greenlist-form');
  let greenlistEdit = document.querySelector('#greenlist-edit-btn');
  let greenlistDelete = document.querySelector('#greenlist-delete-btn');
  let redlistEdit = document.querySelector('#redlist-edit-btn');
  let redlistDelete = document.querySelector('#redlist-delete-btn');
  let oneClickGreen = document.querySelector('#initial-view-oneclickadd-greenlist');
  let oneClickRed = document.querySelector('#initial-view-oneclickadd-redlist');
  let packageSubmit = document.querySelector('#packageList-form-submit');
  let packageList = document.querySelector('#packageList-form');

  //togglePopup() on button click
  settingsButton.addEventListener('click', (e) => {
    e.preventDefault();
    togglePopup();
    let packageOptions = "";
    if (!!packages) {
      packages.forEach((package) => {
        packageOptions += `<option value=${package.name}>${package.name}</option>`;
        packageList.innerHTML = packageOptions;
      })
    }
  });

  // populating user data from chrome storage into expanded section
  const waketime = items.waketime ? formatTime(items.waketime) : 'Not set';
  const bedtime = items.bedtime ? formatTime(items.bedtime) : 'Not set';
  let redHTML = '';
  let greenHTML = '';

  if (!!items) {
    for (let url in items) {
      const option = `<option value=${url}>${url}</option>`;
      switch (items[url].type) {
        case 'red':
          redHTML += option;
          break;
        case 'green':
          greenHTML += option;
          break;
      }
    }
  };

  redListDropDown.innerHTML = redHTML;
  greenListDropDown.innerHTML = greenHTML;
  bedtimeArea.innerHTML = bedtime;
  waketimeArea.innerHTML = waketime;

  // adding a selected package to current user on submit!
  packageSubmit.addEventListener('click', (e) => {
    packages.forEach((package) => {
      let dropdown = document.querySelector('#packageList-form').value
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


  let bedtimeForm = document.querySelector('#bedtime-form');
  bedtimeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveTime(e, 'bedtime');
    appendBedTime(e);
    clearBedTime(e);
  });

  let waketimeForm = document.querySelector('#waketime-form');
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
  let url = getDomain(document.querySelector(`#${type}list-form-url`).value);
  let hrs = document.querySelector(`#${type}list-form-hrs`).value;
  let mins = document.querySelector(`#${type}list-form-mins`).value;
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
  let selectElem = document.querySelector(`#${type}list-form-dropdown-options`);
  let optionValue = selectElem.options[selectElem.selectedIndex].value;
  let formUrl = document.querySelector(`#${type}list-form-url`);
  let formHrs = document.querySelector(`#${type}list-form-hrs`);
  let formMins = document.querySelector(`#${type}list-form-mins`);
  let { items } = await getInput();
  formUrl.value = optionValue;
  formHrs.value = items[optionValue].goalHrs;
  formMins.value = items[optionValue].goalMins;
  deleteInput(e, type);
}

function deleteInput(e, type) {
  e.preventDefault();
  let selectElem = document.querySelector(`#${type}list-form-dropdown-options`);
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
  let url = getDomain(document.querySelector(`#${type}list-form-url`).value);
  let option = document.createElement("option");
  let text = document.createTextNode(url);
  option.appendChild(text)
  document.querySelector(`#${type}list-form-dropdown-options`).appendChild(option)
}

function appendToOptionsFromPackageSubmit(e, url, type) {
  e.preventDefault();
  type = type.toLowerCase()
  url = getDomain(url)
  let option = document.createElement("option");
  let text = document.createTextNode(url);
  option.appendChild(text)
  document.querySelector(`#${type}list-form-dropdown-options`).appendChild(option)
}

function clearInput(e, type) {
  e.preventDefault();
  let url = document.querySelector(`#${type}list-form-url`);
  let hrs = document.querySelector(`#${type}list-form-hrs`);
  let mins = document.querySelector(`#${type}list-form-mins`);
  url.value = "";
  if (type === 'green') {
    document.querySelector(`#${type}list-form-url`).placeholder = "www.nytimes.com";
  }
  if (type === "red") {
    document.querySelector(`#${type}list-form-url`).placeholder = "www.facebook.com";
  }

  hrs.value = null;
  mins.value = null;
}

function clearBedTime(e) {
  e.preventDefault();
  let timeInput = document.querySelector('#bedtime-form-input')
  timeInput.value = "";
}

function clearWakeTime(e) {
  e.preventDefault();
  let timeInput = document.querySelector('#waketime-form-input')
  timeInput.value = "";
}

function appendBedTime(e) {
  let timeInput = document.querySelector('#bedtime-form-input');
  document.querySelector('#bedtime-set').innerHTML = formatTime(timeInput.value)
}

function appendWakeTime(e) {
  let timeInput = document.querySelector('#waketime-form-input');
  document.querySelector('#waketime-set').innerHTML = formatTime(timeInput.value)
}

function clearListonDelete(e, type) {
  e.preventDefault()
  let selectElem = document.querySelector(`#${type}list-form-dropdown-options`);
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
