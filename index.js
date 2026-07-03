if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// El DNS del router a veces bloquea consultas SRV de MongoDB Atlas; Google DNS las resuelve.
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const app = express();
const userRoutes = require('./routes/users');
const helmet = require('helmet');
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';
const mongoSanitize = require('express-mongo-sanitize');

mongoose.connect(dbUrl)
    .then(() => {
        console.log("¡BÓVEDA DE YELPCAMP CONECTADA! 🏕️");
    })
    // ...
    .catch(err => {
        console.log("¡ERROR DE CONEXIÓN A MONGO! 💥", err);
    });

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'un_secreto_temporal_para_desarrollo'
    }
});

store.on("error", function (e) {
    console.log("ERROR EN LA TIENDA DE SESIONES", e)
});
const sessionConfig = {
    store,
    name: 'session',
    secret: process.env.SECRET || 'un_secreto_temporal_para_desarrollo',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    sessionConfig.cookie.secure = true;
}

app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        value: { ...req.query },
        writable: true,
        configurable: true,
        enumerable: true
    });
    next();
});

app.use(mongoSanitize({
    replaceWith: '_'
}));

// 👇 LA LISTA VIP DE ENLACES PERMITIDOS 👇
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/douqbebwk/",
                "https://res.cloudinary.com/",
                "https://images.unsplash.com/",
                "https://api.maptiler.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});
app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`¡SERVIDOR YELPCAMP ESCUCHANDO EN EL PUERTO ${port}! 🚀`);
});