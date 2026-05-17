const express = require('express');
const router = express.Router();

// 1. PRIMERO LAS HERRAMIENTAS
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas.js');

// 2. EL CADENERO (Middleware)
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// ==========================================
// 3. RUTAS DE CAMPAMENTOS
// ==========================================

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();

    // Aqui el flash
    req.flash('success', '¡Campamento creado exitosamente!');

    res.redirect(`/campgrounds/${campground._id}`);
}));

router.get('/:id', catchAsync(async (req, res) => {
    const campamentoEncontrado = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground: campamentoEncontrado });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const campamento = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground: campamento });
}));

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const id = req.params.id;
    const campamentoActualizado = await Campground.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campgrounds/${campamentoActualizado._id}`);
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// ==========================================
// 4. ¡EXPORTACIÓN HASTA EL FINAL!
// ==========================================
module.exports = router;