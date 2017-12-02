function getDomainNoPrefix(url) {
  let link = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im)[1];
  let output = (link.split('.').length > 2) ? link.split('.').slice(-2).join('.') : link;

  return output;
}

// clears old interval and starts new interval
function interval() {
  _counter = 0;
  const clearIntervalPromise = new Promise((resolve, reject) => {
    resolve(clearInterval(_interval));
  });

  clearIntervalPromise
    .then(() => {
      _interval = setInterval(countUp, 1000);
    });
}
