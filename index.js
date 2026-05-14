const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const { campgroundSchema } = require('./schemas.js');

const app = express();

// 1. CONEXIÓN A MONGO (Creamos la nueva bóveda para los campamentos)
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log("¡BÓVEDA DE YELPCAMP CONECTADA! 🏕️");
    })
    .catch(err => {
        console.log("¡ERROR DE CONEXIÓN A MONGO! 💥", err);
    });

// 2. CONFIGURACIÓN VISUAL (Pintor EJS)
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));

// Nuestro Cadenero VIP para validar campamentos
const validateCampground = (req, res, next) => {
    // Le pasamos los datos que envió el usuario (req.body) a JOI para que los revise
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        // Si JOI encuentra un error (ej. falta el precio), extraemos el mensaje exacto
        const msg = error.details.map(el => el.message).join(',');
        // Y lanzamos nuestra propia alarma de ExpressError (Error 400 = Bad Request)
        throw new ExpressError(msg, 400);
    } else {
        // Si todo está perfecto, le decimos "puedes pasar" con next()
        next();
    }
}

// 3. RUTA DE INICIO (Home)
app.get('/', (req, res) => {
    res.send("¡Bienvenidos al proyecto gigante de YelpCamp!");
});

// Ruta para ver TODOS los campamentos
app.get('/campgrounds', async (req, res) => {
    // El guardia busca todos los campamentos en Mongo
    const campgrounds = await Campground.find({});
    // Se los mandamos al pintor EJS (que vivirá en una carpeta llamada 'campgrounds')
    res.render('campgrounds/index', { campgrounds });
});

// 1. Ruta para MOSTRAR el formulario
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

// 2. Ruta POST para ATRAPAR los datos y guardarlos
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // Tu código de guardar el campamento sigue intacto aquí adentro
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// OJO: Envolvemos TODO dentro de catchAsync(...)
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campamentoEncontrado = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground: campamentoEncontrado });
}));
// 1. Ruta para MOSTRAR el formulario de edición (busca por el DNI)
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campamento = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground: campamento });
});

// 2. Ruta PUT secreta para GUARDAR los cambios en la bóveda
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const id = req.params.id;
    // Buscamos por DNI y actualizamos con los datos nuevos que llegaron en req.body.campground
    const campamentoActualizado = await Campground.findByIdAndUpdate(id, req.body.campground);
    // Lo mandamos a ver su campamento recién editado
    res.redirect(`/campgrounds/${campamentoActualizado._id}`);
});

// Ruta DELETE para eliminar un campamento
app.delete('/campgrounds/:id', async (req, res) => {
    const id = req.params.id;
    // El guardia busca el campamento por su DNI y lo aniquila
    await Campground.findByIdAndDelete(id);
    // Redirigimos al usuario a la vitrina principal
    res.redirect('/campgrounds');
});


// EL NUEVO PARAMÉDICO (Más inteligente)
app.use((err, req, res, next) => {
    // 1. Extraemos el número de error (si no tiene, usamos el 500 por defecto)
    const { statusCode = 500 } = err;

    // 2. Extraemos el mensaje (si no tiene, usamos uno por defecto)
    if (!err.message) err.message = '¡Oh no, algo salió mal!';

    // 3. Le mostramos AL USUARIO el error real en la pantalla
    res.status(statusCode).send(err.message);
})


// 4. ENCENDIENDO EL SERVIDOR
app.listen(3000, () => {
    console.log("¡SERVIDOR YELPCAMP ESCUCHANDO EN EL PUERTO 3000! 🚀");
});