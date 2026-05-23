const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Un atajo para no escribir mongoose.Schema todo el tiempo
const Review = require('./review');

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }, // <--- ¡ESTA ES LA COMA QUE FALTABA!
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});
// ==========================================
// MIDDLEWARE DE ELIMINACIÓN EN CASCADA
// ==========================================
// Le decimos: "DESPUÉS (post) de que alguien borre un campamento (findOneAndDelete)..."
CampgroundSchema.post('findOneAndDelete', async function (campamentoEliminado) {

    // Si realmente se borró un campamento y ese campamento tenía reseñas en su lista...
    if (campamentoEliminado.reviews.length) {

        // ...ve a la colección de Review y ELIMINA TODAS las reseñas 
        // cuyo DNI esté INCLUIDO ($in) dentro de la lista del campamento eliminado.
        await Review.deleteMany({
            _id: {
                $in: campamentoEliminado.reviews
            }
        });
        console.log("¡Se borró el campamento y su basura de reseñas automáticamente!");
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);