const me = async (req, res) => {
    return res.json({ status: true, message: 'Successful' });
};

module.exports = {
    me
};