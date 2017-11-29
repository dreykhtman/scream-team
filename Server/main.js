const app = require("./server");
const db = require('./db').db;

db.sync({force: true})
.then(() => {
    app.listen(5000)
})
