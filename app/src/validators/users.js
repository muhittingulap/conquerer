const { body } = require('express-validator');

const loginValidator = [
    // express-validator ile gelen veriyi doğrulama yapıyorum
    body('email').notEmpty().isEmail().withMessage('Geçerli bir e-posta adresi girin'),
    body('password').notEmpty().isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }).withMessage('Şifre en az 8 karakter uzunluğunda ve özel karakter, Büyük küçük harf içermelidir'),
]

const registerValidator = [
    // express-validator ile gelen veriyi doğrulama yapıyorum
    body('full_name').notEmpty().withMessage('Lütfen ad soyad bilgisini boş bırakmayın'),
    body('birthday').notEmpty().withMessage('Lütfen doğum gününüzü boş bırakmayın'),
    body('email').notEmpty().isEmail().withMessage('Geçerli bir e-posta adresi girin'),
    body('password').notEmpty().isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }).withMessage('Şifre en az 8 karakter uzunluğunda ve özel karakter, Büyük küçük harf içermelidir'),
    body('confirmPassword').notEmpty().isLength({ min: 8 }).withMessage('Şifre Tekrarı en az 8 karakter olmalı'),
]

const updateValidator = [
    // express-validator ile gelen veriyi doğrulama yapıyorum
    body('password').optional().isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }).withMessage('Şifre en az 8 karakter uzunluğunda ve özel karakter, Büyük küçük harf içermelidir'),
    body('confirmPassword').optional().isLength({ min: 8 }).withMessage('Şifre Tekrarı en az 8 karakter olmalı'),
]

module.exports = {
    loginValidator,
    registerValidator,
    updateValidator
}