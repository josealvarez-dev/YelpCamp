const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Un truco para no escribir mongoose.Schema a cada rato

const reviewSchema = new Schema({
    body: String,   // Aquí se guardará el comentario del usuario
    rating: Number  // Aquí guardaremos la puntuación (ej. 5 estrellas)
});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('Review', reviewSchema);