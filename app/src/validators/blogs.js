const { body } = require('express-validator');

const createValidator = [
    // express-validator ile gelen veriyi doğrulama yapıyorum
    body('category_id').notEmpty().withMessage('Lütfen category_id alanını boş bırakmayınız'),
    body('title').notEmpty().withMessage('Lütfen title alanını boş bırakmayınız'),
    body('content').notEmpty().withMessage('Lütfen content alanını boş bırakmayınız'),
]

const createCommentValidator = [
    // express-validator ile gelen veriyi doğrulama yapıyorum
    body('content').notEmpty().withMessage('Lütfen content alanını boş bırakmayınız')
]

const updateValidator = [
    // express-validator ile gelen veriyi doğrulama yapıyorum
    body('title').notEmpty().withMessage('Lütfen title alanını boş bırakmayınız'),
    body('content').notEmpty().withMessage('Lütfen content alanını boş bırakmayınız'),
]

module.exports = {
    createValidator,
    createCommentValidator,
    updateValidator
}