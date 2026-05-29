const mongoose = require('mongoose');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => console.log("Conexión abierta para sembrar datos masivos"))
    .catch(err => console.log(err));

// Un arsenal de ciudades peruanas con sus coordenadas centrales [Longitud, Latitud]
const ciudadesPeru = [
    { nombre: "Arequipa", coords: [-71.5369, -16.3988] },
    { nombre: "Lima", coords: [-77.0282, -12.0431] },
    { nombre: "Cusco", coords: [-71.9675, -13.5226] },
    { nombre: "Trujillo", coords: [-79.0300, -8.1159] },
    { nombre: "Piura", coords: [-80.6328, -5.1944] }
];

const seedDB = async () => {
    // 1. Limpiamos la base de datos
    await Campground.deleteMany({});

    // 2. Creamos 50 campamentos con un bucle
    for (let i = 0; i < 50; i++) {
        // Elegimos una ciudad peruana al azar
        const randomCiudad = ciudadesPeru[Math.floor(Math.random() * ciudadesPeru.length)];

        // TRUCO: Le sumamos un poquito de "ruido matemático" a las coordenadas 
        // para que los pines se esparzan por la ciudad y no caigan uno encima de otro.
        const lngRandom = randomCiudad.coords[0] + (Math.random() * 0.2 - 0.1);
        const latRandom = randomCiudad.coords[1] + (Math.random() * 0.2 - 0.1);

        const camp = new Campground({
            // 👇 ¡ATENCIÓN! Revisa que este sea tu ID de usuario real 👇
            author: '6a0d45ad8f9ba59ec43d45d9',
            title: `Campamento Oculto ${i + 1}`,
            location: `${randomCiudad.nombre}, Perú`,
            description: 'Un paraje espectacular descubierto por la comunidad.',
            price: Math.floor(Math.random() * 30) + 10,
            geometry: {
                type: "Point",
                coordinates: [lngRandom, latRandom] // Coordenadas esparcidas
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
                    filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
                }
            ]
        });

        await camp.save();
    }
    console.log("¡50 campamentos peruanos sembrados exitosamente!");
};

seedDB().then(() => {
    mongoose.connection.close();
});