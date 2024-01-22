/*
    Models
*/
const Category = require("../../models").Category;

const lists = async (req, res) => {
    try {
        const categories = await Category.findAll();
        return res.json({ status: true, message: 'Lists Successful', data: categories });
    } catch (error) {
        res.status(500).json({ status: false, code: 9001, errors: [{ msg: error }] });
    }
}

const rates = async (req, res) => {
    return res.json({ status: true, message: 'rates elasticSearch' });
}

module.exports = {
    lists,
    rates
};