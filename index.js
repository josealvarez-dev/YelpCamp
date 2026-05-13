const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

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
app.post('/campgrounds', async (req, res) => {
    // Creamos el nuevo campamento con los datos del formulario
    const campground = new Campground(req.body.campground);
    // El guardia lo guarda en la bóveda
    await campground.save();
    // Redirigimos a la página de detalles de este nuevo campamento
    res.redirect(`/campgrounds/${campground._id}`);
});

// Ruta para ver UN SOLO campamento a detalle (Show)
app.get('/campgrounds/:id', async (req, res) => {
    // 1. El guardia busca el campamento por su ID
    const campamentoEncontrado = await Campground.findById(req.params.id);

    // 2. Se lo mandamos al pintor, a un archivo llamado 'show'
    res.render('campgrounds/show', { campground: campamentoEncontrado });
});
// 1. Ruta para MOSTRAR el formulario de edición (busca por el DNI)
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campamento = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground: campamento });
});

// 2. Ruta PUT secreta para GUARDAR los cambios en la bóveda
app.put('/campgrounds/:id', async (req, res) => {
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

// 4. ENCENDIENDO EL SERVIDOR
app.listen(3000, () => {
    console.log("¡SERVIDOR YELPCAMP ESCUCHANDO EN EL PUERTO 3000! 🚀");
});