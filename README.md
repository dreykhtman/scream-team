[Code is actively being refactored]

# Chrome Gnome

* Chrome Gnome is a browser extension for Google Chrome that allows you to enter goals about your internet use and then alters your browsing experience to help you meet those goals.
* Pie chart provides a visualization of sites visited
* Customizable browsing experience based on personal goals
* Bedtime feature keeps you offline late
* Lightweight with easy installation

# Installation
* Download the repository: https://github.com/dreykhtman/scream-team/tree/master/Scream-Project
* Visit chrome://extensions and click the checkbox labeled “Developer mode”
* Click “Load unpacked extension” and select the downloaded repository from your file system

# Using the App
* Click the "Chrome Gnome" icon on the upper right side of your browser (to the right of the URL bar) to open the app.
* At first, you will see a chart that aggregates and visualizes your browsing behaviors.  (If you have never used the app before, the chart will be a placeholder.)
* Click “Expand" to display a settings menu where you can specify what sites you would like to spend more or less time on, and when your bed time will be.

# Settings
* Within the settings menu (click “Expand”), you can specify which sites will be targeted.
* In the first box, type the domains of sites you’d like to spend less time on (e.g. “facebook.com”) and choose a time limit for daily browsing and click submit.
* Below, specify sites you’d like to spend more time on (e.g. “nytimes.com”) and click submit.
* Lastly, specify and submit a bedtime.

# Functionality
* As you approach your daily limit for each specified URL, Chrome Gnome alerts you of approaching quotas.
* As you approach your bed time, Chrome Gnome reminds you to get offline.
* If you meet your daily threshold for a given site, you will be redirected to a site you’d like to spend more time on.
* If you browse past your bedtime, Chrome Gnome will block access to new windows and tabs.

# Built With
* Vanilla JavaScript
* Chrome storage
* D3.js data visualization library
* Express Routing
* Sequelize Models
* Heroku API

# Authors
* @confulicious – Nicole Chu
* @dreykhtman – Dmytro Reykhtman
* @e-r-i-k-a – Erika Samuels
* @MissAnichka – Anna Medyukh
