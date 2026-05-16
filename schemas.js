const Joi = require('joi');

// Exportamos nuestro libro de reglas para poder usarlo en index.js
module.exports.campgroundSchema = Joi.object({
    // Le decimos que todo debe venir dentro de un objeto llamado "campground"
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0), // El precio debe ser un número y mínimo 0 (no hay precios negativos)
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        // La calificación es obligatoria y debe ser un número entre 1 y 5
        rating: Joi.number().required().min(1).max(5),
        // El texto es obligatorio
        body: Joi.string().required()
    }).required()
});