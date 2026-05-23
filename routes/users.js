const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);

        // ¡NUEVO! Iniciamos sesión automáticamente al usuario recién creado
        req.login(registeredUser, err => {
            if (err) return next(err); // Si algo falla al loguearlo
            req.flash('success', '¡Bienvenido a YelpCamp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));


router.get('/login', (req, res) => {
    res.render('users/login');
});
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', '¡Qué bueno verte de nuevo!');

    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    // Si el guardia de arriba te deja pasar, significa que la contraseña era correcta.
    req.flash('success', '¡Qué bueno verte de nuevo!');
    res.redirect('/campgrounds');
});


router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', '¡Adiós! Esperamos verte pronto.');
        res.redirect('/campgrounds');
    });
});
module.exports = router;