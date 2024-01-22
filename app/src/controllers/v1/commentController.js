/*
    Models
*/
const Blog = require("../../models").Blog;
const Comment = require("../../models").Comment;
const Category = require("../../models").Category;

const lists = async (req, res) => {
    try {

        const commentLists = await Comment.findAll({
          where: {
            UserId: req.auth.user.id,
          },
          order: [['createdAt', 'DESC']],
          include: [
            {
              model: Blog,
              as: 'blogs',
              order: [['createdAt', 'DESC']],
              include: [
                {
                  model: Category,
                  as: 'categories',
                  attributes: ['name']
                },
              ]
            },
          ],
        });
    
        return res.json({ status: true, message: 'Başarıyla listelendi', data: commentLists });
      } catch (error) {
        return res.status(500).json({ status: false, errors: [{ msg: error.message }] });
      }
}

const del = async (req, res) => {
  const { id } = req.params;

  try {
    // yorumun var olup olmadığını kontrol ediyorum ve token sahibi kullanıcıya ait olup olmadığını da sorguluyorum
    const commentExists = await Comment.findOne({
      where: {
        id: id,
        UserId: req.auth.user.id,
      },
    });

    if (!commentExists) return res.status(404).json({ status: false, code: 3003, errors: [{ msg: 'Yorum bulunamadı' }] });

    // Bulunan yorumu siliyorum soft-deletion ile.
    await commentExists.destroy();
    return res.json({ status: true, message: 'Başarıyla silindi' });

  } catch (error) {
    return res.status(500).json({ status: false, errors: [{ msg: error.message }] });
  }
}

module.exports = {
    lists,
    del
};