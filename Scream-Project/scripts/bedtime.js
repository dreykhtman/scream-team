function resetBrowsingTime (bedtime, waketime) {
  let currentTime = new Date().toTimeString().split(' ')[0].slice(0,-3);
  console.log('currentTime', currentTime)
  console.log('bedtime', bedtime);
  console.log('waketime', waketime);

  let pastBedtime = currentTime > bedtime
  // let pastWaketime = currentTime > waketime

  if (pastBedtime) {

  }

  // console.log('pastBedtime', pastBedtime)
  // console.log('pastWaketime', pastWaketime)
}
