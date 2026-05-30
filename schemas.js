const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// 1. Creamos una extensión para Joi que use sanitize-html
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '¡Oye! ¡Nada de código HTML malicioso aquí!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                // Limpiamos el texto, no permitimos NI UNA SOLA etiqueta HTML
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                // Si el texto limpio es diferente al original, significa que intentaron inyectar HTML
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

// 2. Le agregamos nuestro nuevo poder a Joi
const Joi = BaseJoi.extend(extension);

// 3. Aplicamos el poder (.escapeHTML) a TODOS los campos de texto
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(), <-- Recuerda que esto ya lo quitamos antes
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});