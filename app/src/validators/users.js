const { body } = require('express-validator');

const loginValidator = [
    // express-validator ile gelen veriyi doğrulama
    body('email').notEmpty().isEmail().withMessage('Geçerli bir e-posta adresi girin'),
    body('password').notEmpty().isLength({ min: 8 }).withMessage('Şifre en az 8 karakter olmalı'),
]

const registerValidator = [
    // express-validator ile gelen veriyi doğrulama
    body('full_name').notEmpty().withMessage('Lütfen ad soyad bilgisini boş bırakmayın'),
    body('birthday').notEmpty().withMessage('Lütfen doğum gününüzü boş bırakmayın'),
    body('email').notEmpty().isEmail().withMessage('Geçerli bir e-posta adresi girin'),
    body('password').notEmpty().isLength({ min: 8 }).withMessage('Şifre en az 8 karakter olmalı'),
    body('confirmPassword').notEmpty().isLength({ min: 8 }).withMessage('Şifre Tekrarı en az 8 karakter olmalı'),
]

module.exports = {
    loginValidator,
    registerValidator
}