/*
    Models
*/
const User = require("../../models").User;
const Blog = require("../../models").Blog;
const Category = require("../../models").Category;
const Comment = require("../../models").Comment;


const lists = async (req, res) => {
    try {

        const blogLists = await Blog.findAll({
          include: [
            {
              model: Comment,
              as: 'comments',
              include: [
                {
                  model: User,
                  as: 'User',
                  attributes: ['full_name']
                },
              ],
            },
            {
              model: User,
              as: 'User', 
              attributes: ['full_name']
            },
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

const update = async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    try {
        // blogun var olup olmadığını kontrol ediyorum
        const blogExists = await Blog.findByPk(id, {
            include: Category,
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
        // blogun var olup olmadığını kontrol ediyorum
        const blogExists = await Blog.findByPk(id);

        if (!blogExists) return res.status(404).json({ status: false, code: 3003, errors: [{ msg: 'Blog bulunamadı' }] });

        // Bulunan bloğu siliyorum soft-deletion ile.
        await blogExists.destroy();
        return res.json({ status: true, message: 'Başarıyla silindi' });

    } catch (error) {
        return res.status(500).json({ status: false, errors: [{ msg: error.message }] });
    }
}

module.exports = {
    lists,
    create,
    update,
    del
};