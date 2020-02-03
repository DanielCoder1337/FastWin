const express = require('express');
const handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const session = require('express-session');
const path = require('path');
const hubsManager = require("../bll/hubsManager")
const dashboardContent = require("./js/dashboard-sidemenu");
const bodyParser = require("body-parser");
const redis = require("redis");
const redisClient = redis.createClient({host: 'redis', port: 6379});
const redisStore = require("connect-redis")(session)

//TODO: ADD dashboardContent into a cookie and modify when needed, that way we wont have to run the function everytime we 
//render a view.

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

//Initialize handlebars
app.engine('hbs', exphbs({
    extname: 'hbs',
    defaultLayout: 'base',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/'
}));
app.set('views', path.join(__dirname , '/views/'));
app.set('view engine', 'hbs');
//static folders
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/js'));

//bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json());

//session

app.use(session({
    store: new redisStore({client: redisClient}),
    secret: "something secret",
    saveUninitialized: false,
    resave: false
}))


//cookieparser
app.use(cookieParser());

//csrf
app.use(csrf({ cookie: true }));

app.use(function (req, res, next) {
    res.locals.loggedIn = req.session.loggedin;
    res.locals.userId = req.session.userId;
    res.locals.csrfToken = req.csrfToken();
    next();
});

//routers
const usersRouter = require('./routers/usersRouter');
const hubsRouter = require("./routers/hubs-router");
const tournamentsRouter = require("./routers/tournaments-router");
//use routers
app.use("/hubs", hubsRouter)
app.use("/users", usersRouter);
app.use("/tournaments", tournamentsRouter)
app.get('/', (req, res) => {
    //When user and session is implemented switch to getDashboardContent(userId, callback)
    /*
    try{
        dashboardContent.getDashboardContent(userId, function(hubs, tournaments){
            const model = {title: "Home", hubs, tournaments}
            console.log(model);
            res.render("home", model);
        })
    }
    catch(error){
        const model = {title: "Error", error}
        res.render("error.hbs", model);
    }
    */
    hubsManager.getAllHubs(function(hubs){

        const model = {title: "Home", hubs}
        console.log(model)
        res.render("home", model);
    })
});

app.get('/login', (req, res) => {
    const model = {title: "Login"}
    res.render("login", model);
});

const usersManager = require('../bll/usersManager')

app.post('/login', (req, res) => {
    const email = req.body.loginEmail
    const password = req.body.loginPassword
    usersManager.loginUser(email, password, function(loginErrors) {
        if (loginErrors.length > 0) {
            const modal = {
                loginEmail: email,
                loginErrors
            }
            res.render("login", modal)
        } else {
            res.redirect("/")
        }
    })
    
})

/*
app.post("/search", function(req,res){
    const searchWord = request.query.queryString;
    let schema = "SELECT * FROM Posts WHERE title LIKE ? OR Time Like ?";
    const pattern = '%' + searchWord + '%';
    let insertVariables = [pattern, pattern];
    let prevPage = request.query.p - 1;
    let nextPage = prevPage + 2;
    let showPosts = [];
    const postsCount = 3;
    const numberOfPages = Math.ceil(posts.length / postsCount);
    let offset = request.query.p * postsCount;
    if (nextPage >= numberOfPages) nextPage = numberOfPages - 1;
    if (prevPage < 0) prevPage = 0;
    for (var i = offset; i < offset + postsCount; i++) {
        if (posts[i]) showPosts.push(posts[i]);
    }
    let pages = [];
    for (i = 0; i < numberOfPages; i++) {
        pages.push(i + 1);
    }
    response.render('AllPosts', { posts: showPosts, previousPage: prevPage, nextPage: nextPage, pages: pages, errorList: error, q: searchWord });
})
*/


app.listen(PORT, HOST);
