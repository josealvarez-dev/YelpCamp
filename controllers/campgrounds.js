const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
};
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });

    console.log(geoData.features[0].geometry);

    const campground = new Campground(req.body.campground);

    campground.geometry = geoData.features[0].geometry;

    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));

    campground.author = req.user._id;
    await campground.save();

    console.log(campground);

    req.flash('success', '¡Campamento creado exitosamente!');
    res.redirect(`/campgrounds/${campground._id}`);
}

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
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campamentoActualizado.images.push(...imgs);
    await campamentoActualizado.save();

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campamentoActualizado.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }

    req.flash('success', '¡Campamento actualizado exitosamente!');
    res.redirect(`/campgrounds/${campamentoActualizado._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
};