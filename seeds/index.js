const mongoose = require('mongoose');
const Campground = require('../models/campground'); // Subimos un nivel para buscar la carpeta models

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => console.log("Conexión abierta para sembrar datos"))
    .catch(err => console.log(err));

const seedDB = async () => {
    // Primero borramos todo lo que haya para empezar limpios
    await Campground.deleteMany({});

    // Creamos un campamento de prueba
    const camp = new Campground({
        title: 'Bosque Dorado',
        price: '$20',
        description: 'Un lugar increíble para acampar bajo las estrellas.',
        location: 'Arequipa, Perú'
    });

    await camp.save();
    console.log("¡Campamento de prueba sembrado!");
};

// Ejecutamos la función y cerramos la conexión al terminar
seedDB().then(() => {
    mongoose.connection.close();
});