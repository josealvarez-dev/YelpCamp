const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Un atajo para no escribir mongoose.Schema todo el tiempo

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: String,
    description: String,
    location: String
});

module.exports = mongoose.model('Campground', CampgroundSchema);