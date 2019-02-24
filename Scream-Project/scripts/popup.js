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
getUserData = () => {
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
  const { items, dataForChart } = await getUserData();

  //populate set/waketime
  const waketime = items.waketime ? formatTime(items.waketime) : 'Not set';
  const bedtime = items.bedtime ? formatTime(items.bedtime) : 'Not set';
  grab('#bedtime-set').innerHTML = bedtime;
  grab('#waketime-set').innerHTML = waketime;

  //populate red/green dropdown options
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

  grab('#redlist-form-dropdown-options').innerHTML = redHTML;
  grab('#greenlist-form-dropdown-options').innerHTML = greenHTML;

  /**********EVENT LISTENERS BELOW **********/
  //togglePopup() button
  grab('#usage-toggle-btn').addEventListener('click', (e) => {
    e.preventDefault();
    togglePopup();
    let packageOptions = "";
    if (!!packages) {
      packages.forEach((package) => {
        packageOptions += `<option value=${package.name}>${package.name}</option>`;
        grab('#packageList-form').innerHTML = packageOptions;
      })
    }
  });

  // add a selected package to a user
  grab('#packageList-form-submit').addEventListener('click', (e) => {
    packages.forEach((package) => {
      const selectedPackage = grab('#packageList-form').value;
      if (package.name.includes(selectedPackage)) {
        package.sites.forEach(site => {
          savePackageToChromeDB(site.url, site.type, site.goalHrs, site.goalMins);
          appendOptionFromPackageSubmit(e, site.url, site.type);
        })
      }
    })
  });

  grab('#redlist-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveInput(e, 'red');
    appendOption(e, 'red');
    clearInput(e, 'red');
  });

  grab('#greenlist-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveInput(e, 'green');
    appendOption(e, 'green');
    clearInput(e, 'green');
  });

  grab('#greenlist-edit-btn').addEventListener('click', (e) => {
    e.preventDefault();
    editInput(e, 'green');

  });

  grab('#redlist-edit-btn').addEventListener('click', (e) => {
    e.preventDefault();
    editInput(e, 'red');
  });

  grab('#greenlist-delete-btn').addEventListener('click', (e) => {
    e.preventDefault();
    deleteInput(e, 'green');
    clearListonDelete(e, 'green')
  });

  grab('#redlist-delete-btn').addEventListener('click', (e) => {
    e.preventDefault();
    deleteInput(e, 'red');
    clearListonDelete(e, 'red')
  });

  grab('#initial-view-oneclickadd-greenlist').addEventListener('click', (e) => {
    e.preventDefault();
    saveSiteOneClick(e, 'green')

  });

  grab('#initial-view-oneclickadd-redlist').addEventListener('click', (e) => {
    e.preventDefault();
    saveSiteOneClick(e, 'red')
  });

  grab('#bedtime-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveTime(e, 'bedtime');
    appendBedTime(e);
    clearBedTime(e);
  });

  grab('#waketime-form').addEventListener('submit', (e) => {
    e.preventDefault()
    saveTime(e, 'waketime');
    appendWakeTime(e);
    clearWakeTime(e);
  })

  loadPieChart(dataForChart);
});

saveInput = (e, type) => {
  e.preventDefault();
  const url = getDomain(grab(`#${type}list-form-url`).value);
  const hrs = grab(`#${type}list-form-hrs`).value;
  const mins = grab(`#${type}list-form-mins`).value;
  const urlObj = {
    type,
    goalHrs: +hrs,
    goalMins: +mins,
    browsingTime: 0
  };
  chrome.storage.sync.set({ [url]: urlObj }, () => { console.log('data saved!') })
};

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
};

function saveTime(e, type) {
  e.preventDefault()
  let setTime = e.target.timeInput.value
  chrome.storage.sync.set({ [type]: setTime }, () => {
  })
};

editInput = async (e, type) => {
  e.preventDefault();
  const { items } = await getUserData();

  const selectElem = grab(`#${type}list-form-dropdown-options`);
  const optionValue = selectElem.options[selectElem.selectedIndex].value;
  const formUrl = grab(`#${type}list-form-url`);
  const formHrs = grab(`#${type}list-form-hrs`);
  const formMins = grab(`#${type}list-form-mins`);
  formUrl.value = optionValue;
  formHrs.value = items[optionValue].goalHrs;
  formMins.value = items[optionValue].goalMins;
  deleteInput(e, type);
};

function deleteInput(e, type) {
  e.preventDefault();
  let selectElem = grab(`#${type}list-form-dropdown-options`);
  let optionValue = selectElem.options[selectElem.selectedIndex].value;
  chrome.storage.sync.remove(optionValue)
};

appendOption = (e, type) => {
  e.preventDefault();
  type = type.toLowerCase();
  const url = getDomain(grab(`#${type}list-form-url`).value);
  const option = document.createElement("option");
  const text = document.createTextNode(url);
  option.appendChild(text);
  grab(`#${type}list-form-dropdown-options`).appendChild(option);
};

function appendOptionFromPackageSubmit(e, url, type) {
  e.preventDefault();
  type = type.toLowerCase()
  url = getDomain(url)
  let option = document.createElement("option");
  let text = document.createTextNode(url);
  option.appendChild(text)
  grab(`#${type}list-form-dropdown-options`).appendChild(option);
};

function clearInput(e, type) {
  e.preventDefault();
  let url = grab(`#${type}list-form-url`);
  let hrs = grab(`#${type}list-form-hrs`);
  let mins = grab(`#${type}list-form-mins`);
  url.value = "";
  if (type === 'green') {
    grab(`#${type}list-form-url`).placeholder = "www.nytimes.com";
  }
  if (type === "red") {
    grab(`#${type}list-form-url`).placeholder = "www.facebook.com";
  }

  hrs.value = null;
  mins.value = null;
};

function clearBedTime(e) {
  e.preventDefault();
  let timeInput = grab('#bedtime-form-input')
  timeInput.value = "";
};

function clearWakeTime(e) {
  e.preventDefault();
  let timeInput = grab('#waketime-form-input')
  timeInput.value = "";
};

function appendBedTime(e) {
  let timeInput = grab('#bedtime-form-input');
  grab('#bedtime-set').innerHTML = formatTime(timeInput.value)
};

function appendWakeTime(e) {
  let timeInput = grab('#waketime-form-input');
  grab('#waketime-set').innerHTML = formatTime(timeInput.value)
};

function clearListonDelete(e, type) {
  e.preventDefault()
  let selectElem = grab(`#${type}list-form-dropdown-options`);
  selectElem.removeChild(selectElem.childNodes[0])
};

function getDomainNoPrefix(url) {
  let link = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
  let output = (link.split('.').length > 2) ? link.split('.').slice(-2).join('.') : link;

  return output;
};

saveSiteOneClick = (e, type) => {
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
};

//helpers
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

getDomain = (url) => {
  return url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
};

grab = (element) => {
  return document.querySelector(element);
};
