const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

// Importamos Modelos
const Campground = require('./models/campground');
const Review = require('./models/review');

// Importamos Esquemas de Joi
const { campgroundSchema, reviewSchema } = require('./schemas.js');

const app = express();

// 1. CONEXIÓN A MONGO
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log("¡BÓVEDA DE YELPCAMP CONECTADA! 🏕️");
    })
    .catch(err => {
        console.log("¡ERROR DE CONEXIÓN A MONGO! 💥", err);
    });

// 2. CONFIGURACIÓN VISUAL
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ==========================================
// CADENEROS (Middlewares de Validación JOI)
// ==========================================
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// ==========================================
// RUTAS DE INICIO Y CAMPAMENTOS
// ==========================================
app.get('/', (req, res) => {
    res.send("¡Bienvenidos al proyecto gigante de YelpCamp!");
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    // 1. Extraemos AMBOS IDs de la URL
    const { id, reviewId } = req.params;

    // 2. LA CIRUGÍA EN EL CAMPAMENTO:
    // Usamos el operador $pull de Mongo. Le decimos: "Ve al campamento, busca en su lista 
    // de 'reviews' y ARRÁNCA ($pull) el DNI que coincida con reviewId".
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // 3. LA ELIMINACIÓN FÍSICA:
    // Ahora sí, destruimos la reseña real de la base de datos.
    await Review.findByIdAndDelete(reviewId);

    // 4. Recargamos la página del campamento
    res.redirect(`/campgrounds/${id}`);
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    // ¡AQUÍ ESTÁ LA MAGIA DEL POPULATE!
    const campamentoEncontrado = await Campground.findById(req.params.id).populate('reviews');

    res.render('campgrounds/show', { campground: campamentoEncontrado });
}));

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campamento = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground: campamento });
});


app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const id = req.params.id;
    const campamentoActualizado = await Campground.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campgrounds/${campamentoActualizado._id}`);
}));

app.delete('/campgrounds/:id', async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

// ==========================================
// RUTAS DE RESEÑAS
// ==========================================

// AQUÍ está la ruta POST correcta y aislada, con su cadenero
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));


// ==========================================
// PARAMÉDICO Y ENCENDIDO
// ==========================================
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = '¡Oh no, algo salió mal!';
    res.status(statusCode).send(err.message);
});

app.listen(3000, () => {
    console.log("¡SERVIDOR YELPCAMP ESCUCHANDO EN EL PUERTO 3000! 🚀");
});