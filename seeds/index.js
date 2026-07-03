if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
    require('dns').setServers(['8.8.8.8', '8.8.4.4']);
}

const mongoose = require('mongoose');
const Campground = require('../models/campground');
const User = require('../models/user');

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

mongoose.connect(dbUrl)
    .then(() => console.log("Conexión abierta para sembrar datos masivos en:", dbUrl.includes('mongodb+srv') ? 'MongoDB Atlas ☁️' : 'Local 💻'))
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
    // 0. Buscamos o creamos un usuario autor por defecto en Atlas
    await User.deleteMany({});
    const user = new User({ email: 'jose@yelpcamp.com', username: 'josealvarez' });
    const registeredUser = await User.register(user, 'password123');
    const authorId = registeredUser._id;

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
            // Autor real creado dinámicamente en Atlas
            author: authorId,
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