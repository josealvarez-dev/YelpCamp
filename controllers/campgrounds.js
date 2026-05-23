const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id; // Le asignamos el dueño
    await campground.save();
    req.flash('success', '¡Campamento creado exitosamente!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const campamentoEncontrado = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');

    if (!campamentoEncontrado) {
        req.flash('error', '¡No se pudo encontrar ese campamento!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground: campamentoEncontrado });
};

module.exports.renderEditForm = async (req, res) => {
    const campamento = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground: campamento });
};

module.exports.updateCampground = async (req, res) => {
    const campamentoActualizado = await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
    res.redirect(`/campgrounds/${campamentoActualizado._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
};