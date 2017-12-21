const app = require('./server');
const db = require('./db').db;

db.sync()
    .then(() => {
        let server = app.listen(process.env.PORT || 5000, function () {
            let port = server.address().port;
            console.log('App now running on port', port);
        });
    });
