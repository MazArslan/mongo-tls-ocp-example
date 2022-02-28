let express = require('express');
let path = require('path');
let mongoose = require('mongoose');
var fs = require('fs');
let cors = require('cors');
let bodyParser = require('body-parser');
const mongoDb = require('./database/db');


mongoose.Promise = global.Promise;
// console.log(mongoDb.ca);
// console.log(mongoDb.cert);
// console.log(mongoDb.db);
mongoose.connect(mongoDb.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    // tls cert key file location
    tlsCAFile: mongoDb.ca,
    // tls cert auth file location
    tlsCertificateKeyFile: mongoDb.cert
}).then(()=> {
    console.log('Database sucessfully connected ')
    }, error => {
        console.log('Database error: ' + error)
    }
)

const taskRoute = require('./routes/task.routes');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cors())

app.use(express.static(path.join(__dirname, 'dist/angular-mean-crud-tutorial')));

app.use('/api', taskRoute)

const port = process.env.PORT || 8000;
app.listen(port, ()=> {
    console.log('Listening on port ' + port)
})

// 404
app.use((req, res, next) => {
    next(createError(404));
});

// Base Route
app.get('/', (req, res) => {
    res.send('invaild endpoint');
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/angular-mean-crud-tutorial/index.html'));
});
   
// error handler
app.use(function (err, req, res, next) {
    console.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});