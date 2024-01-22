const { elasticClient } = require("./../../libs/elasticClient");
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
    const response = await elasticClient.search({
        index: 'posts',
        body: {
            size: 0,
            aggs: {
                category: {
                    terms: {
                        field: 'category.keyword',
                        size: 4
                    }
                }
            }
        }
    });

    const total = response.hits.total.value;
    let rates = response.aggregations.category.buckets;

    rates = rates.map(item => {
        item.percent = '%' + (item.doc_count / total * 100).toFixed(1);
        return item;
    });

    return res.json({ status: true, message: 'Category Rates ElasticSearch Successfuly', data: rates });
}

module.exports = {
    lists,
    rates
};