/*
    Models
*/
const User = require("../../models").User;
const Blog = require("../../models").Blog;
const Category = require("../../models").Category;
const Comment = require("../../models").Comment;
const { sequelize } = require("../../models");
const { Op } = require('sequelize');

const { elasticClient } = require("./../../libs/elasticClient");

const lists = async (req, res) => {
  const { type, categoryId, title } = req.query;
  console.log("asd", type, categoryId);
  try {
    const wh = {};

    // eğer last gelirde type da tüm bloglar listelenir. ama gelmezse my blogs lar olur
    if (type != 'last') wh.UserId = req.auth.user.id;

    if (categoryId) wh.CategoryId = categoryId;
    if (title) wh.title = { [Op.iLike]: '%' + title + '%' };

    const blogLists = await Blog.findAll({
      where: wh,
      include: [
        {
          model: Comment,
          as: 'comments',
          attributes: ['content', 'createdAt'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['full_name']
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['full_name']
        },
        {
          model: Category,
          as: 'categories',
          attributes: ['name']
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Comment, as: 'comments' }, 'updatedAt', 'DESC']
      ],
    });

    return res.json({ status: true, message: 'Başarıyla listelendi', data: blogLists });
  } catch (error) {
    return res.status(500).json({ status: false, errors: [{ msg: error.message }] });
  }
}

const create = async (req, res) => {
  const { category_id, title, content } = req.body;

  try {
    // Kategori kontrolü yapıyorum
    const category = await Category.findByPk(category_id);

    if (!category) return res.status(404).json({ status: false, code: 3001, errors: [{ msg: 'Geçersiz kategori' }] });

    // Kategori varsa blog ekliyorum ve son eklenen blog bilgisini geri dönüyorum
    const newBlog = await Blog.create({
      title,
      content,
      CategoryId: category.id,
      UserId: req.auth.user.id,
    });

    return res.json({ status: true, message: 'Başarıyla oluşturuldu', data: newBlog });
  } catch (error) {
    return res.status(500).json({ status: false, errors: [{ msg: error.message }] });
  }
}

const createComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    // Kategori kontrolü yapıyorum
    const blogExists = await Blog.findByPk(id);

    if (!blogExists) return res.status(404).json({ status: false, code: 4001, errors: [{ msg: 'Blog Bulunamadı' }] });

    // Bulunan blog a yorum ekliyorum son oluşturulan yorumu geriye dönüyorum
    const newComment = await Comment.create({
      content,
      BlogId: blogExists.id,
      UserId: req.auth.user.id,
    });

    return res.json({ status: true, message: 'Başarıyla oluşturuldu', data: newComment });
  } catch (error) {
    return res.status(500).json({ status: false, errors: [{ msg: error.message }] });
  }
}

const update = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    // blogun var olup olmadığını kontrol ediyorum ve güncelleme olduğu için kendi bloglarını güncelleyebilmeli sadece
    const blogExists = await Blog.findOne({
      where: {
        id: id,
        UserId: req.auth.user.id,
      },
    });

    if (!blogExists) return res.status(404).json({ status: false, code: 3002, errors: [{ msg: 'Blog bulunamadı' }] });

    // Blog bilgilerini güncelliyorum eğer güncelleme bilgisi gönderildiyse
    if (title) blogExists.title = title;
    if (content) blogExists.content = content;

    // Güncellenmiş blogu kaydediyorum
    await blogExists.save();
    return res.json({ status: true, message: 'Başarıyla güncellendi', data: blogExists });

  } catch (error) {
    console.error('Hata:', error);
    return res.status(500).json({ status: false, errors: [{ msg: error.message }] });
  }

}

const del = async (req, res) => {
  const { id } = req.params;

  try {

    // transaction başlatıyoruz birden fazla bağlantılı işlem yaptığımız için bir işlemde sorun olursa yapmasın istiyorum
    await sequelize.transaction(async (t) => {

      const blogExists = await Blog.findOne({
        where: {
          id: id,
          UserId: req.auth.user.id,
        },
        transaction: t,
      })

      if (!blogExists) return res.status(404).json({ status: false, code: 3003, errors: [{ msg: 'Blog bulunamadı' }] });

      // Bloga ait tüm yorumları siliyorum.
      await Comment.destroy({
        where: {
          BlogId: id,
        },
        transaction: t,
      });

      // Blogu silme işlemini yapıyoruz. Yukarıda user kontrolü yaptığımız için zadece id üzerinden silme işlemnini yapabiliriz.
      await Blog.destroy({
        where: {
          id: blogExists.id
        },
        transaction: t
      });
    });

    return res.json({ status: true, message: 'Başarıyla silindi' });

  } catch (error) {
    return res.status(500).json({ status: false, errors: [{ msg: error.message }] });
  }
}


const postByTime = async (req, res) => {
  
  const response = await elasticClient.search({
    index: 'posts',
    body: {
      size: 0,
      aggs: {
        categories: {
          terms: {
            field: "category.keyword",
            size: 4
          },
          aggs: {
            by_week: {
              date_histogram: {
                field: "createdAt",
                calendar_interval: "week",
                format: "yyyy-MM-dd",
              }
            },
            by_month: {
              date_histogram: {
                field: "createdAt",
                calendar_interval: "month",
                format: "yyyy-MM-dd"
              }
            },
            by_year: {
              date_histogram: {
                field: "createdAt",
                calendar_interval: "year",
                format: "yyyy-MM-dd"
              }
            }
          }
        }
      }
    }
  });

  const data = response.aggregations.categories.buckets;
  
  return res.json({ status: true, message: 'User Stats ElasticSearch Successfuly', data });
}

module.exports = {
  lists,
  create,
  createComment,
  update,
  del,
  postByTime
};