const jwt = require('jsonwebtoken');
const bcryptjs = require("bcryptjs");

const SECRET_KEY = process.env.JWT_SECRET_KEY;
/*
    Models
*/
const User = require("./../../models").User;
const Session = require("./../../models").Session;
const Blog = require("./../../models").Blog;
const Comment = require("./../../models").Comment;
const { sequelize } = require("./../../models");

const { elasticClient } = require("./../../libs/elasticClient");

const { generateUsername } = require("./../../helpers");

const login = async (req, res) => {
    const { email, password, device, os } = req.body;

    try {
        // Email adresine ait bir üye varmı kontrol ediliyor
        const user = await User.findOne({ where: { email: email } });
        if (!user) return res.status(401).json({ status: false, code: 2001, errors: [{ msg: 'Kullanıcı bulunamadı.' }] });

        // password kontrolü yapılıyor.
        if (!await bcryptjs.compare(password, user.password)) return res.status(401).json({ status: false, code: 2002, errors: [{ msg: 'Geçersiz şifre.' }] });

        // Oturum token oluştur (Dokümanda 1 saatlik oturum olması gerektiği söylendiği için token ona göre oluşturuluyor.)
        const token = jwt.sign({ email: user.email, createdAt: new Date() }, SECRET_KEY, { expiresIn: '1h' });

        if (!token) return res.status(401).json({ status: false, code: 2003, errors: [{ msg: 'Token oluşturulamadı.' }] });

        /* geçmiş oturumları öncelikle kapatıyorum. ve tokeni geçeriz kılıyorum. 
        yeni oturum henüz eklenmediği için mevcut kullanıcının tüm oturumlarını statuslarını güncellemek yeterkli olacaktır.
        */
        await Session.update(
            {
                status: false
            },
            {
                where: {
                    UserId: user.id,
                }
            }).catch(function (err) {
                res.status(400).json({ status: false, code: 2004, errors: [{ msg: err }] });
            });

        /* Oturumu veritabanına kaydediyorum.
        Oturum geçmişini takip edebilmek için ve önceki jwt tokenleri pasif edebilmek için session kayıt altında tutuyorum 
        */
        const data = {
            token: token,
            UserId: user.id,
            device,
            os
        }

        // oturumu oluşturuyorum
        await Session.create(data)
            .then(function (session) {
                res.json({ status: true, message: 'Giriş başarılı', data: { token: session?.token } });
            }).catch(function (err) {
                res.status(400).json({ status: false, code: 2005, errors: [{ msg: err }] });
            });

    } catch (error) {
        res.status(500).json({ status: false, code: 9001, errors: [{ msg: error }] });
    }

}

const register = async (req, res) => {
    const { full_name, email, password, confirmPassword, birthday } = req.body;

    try {
        // Parolaraların birbirne eşleşip eşleşmediğini kontrol ediyoruz.
        if (password != confirmPassword) return res.status(400).json({ status: false, code: 1003, errors: [{ msg: 'Şifreler uyuşmuyor.' }] });

        const userExists = await User.findOne({ where: { email: email } });

        // Email ile kayıtlı bir üye varmı kontrol ediyorum
        if (userExists) return res.status(400).json({ status: false, code: 1004, errors: [{ msg: 'Email adresi sistemde zaten kayıtlı.' }] });

        // Parolayı veritabanında şifreli bir şekilde tutuyorum
        const passwordHash = await bcryptjs.hash(password, 10);
        const username = await generateUsername(full_name);

        // data modellemesini yapıyorum
        const data = {
            username,
            full_name,
            email,
            password: passwordHash,
            birthday
        }

        // veritabanına kaydı atıyopruz
        await User.create(data)
            .then(function (user) {
                res.json({ status: true, message: 'Kullanıcı başarıyla oluşturuldu.' });
            }).catch(function (err) {
                res.status(400).json({ status: false, code: 1005, errors: [{ msg: err }] });
            });

    } catch (error) {
        res.status(500).json({ status: false, code: 9001, error });
    }
}

const update = async (req, res) => {
    const id = req.auth.user.id;
    const { full_name, password, confirmPassword, birthday } = req.body;

    try {

        let data = {};

        // İlgili veriler gönderildiyse güncelleme için topluyorum
        if (full_name) data.full_name = full_name;
        if (birthday) data.birthday = birthday;

        // password varsa confirmpassword de olmalı ve ikisi birbirine eşit olmu kontrolleriniyapıyorum
        if (password) {
            if (password != confirmPassword) return res.status(400).json({ status: false, code: 3002, errors: [{ msg: 'Şifreler uyuşmuyor.' }] });
            data.password = await bcryptjs.hash(password, 10);
        }

        // eğer hiç data gönderilmediyse güncellenecek veri olmadığından veritabanı işlemlerinin yapılmamasını sağlıyorum
        if (Object.keys(data).length === 0) return res.status(400).json({ status: false, code: 3003, errors: [{ msg: 'Güncellenebilecek bir alan göndermediniz.' }] });

        // kullanıcıyı güncelliyorum
        await User.update(data, {
            where: { id: id },
        });

        // şifre değiştirildi ise tüm oturumları geçersiz kılıyorum.
        if (data.password) {
            await Session.update({ status: false },
                {
                    where: {
                        UserId: id,
                    }
                }).catch(function (err) {
                    res.status(400).json({ status: false, code: 2004, errors: [{ msg: err }] });
                });
        }

        return res.json({ status: true, message: 'Başarıyla güncellendi.' });

    } catch (error) {
        console.error('Hata:', error);
        return res.status(500).json({ status: false, errors: [{ msg: error.message }] });
    }
}

const del = async (req, res) => {
    try {
        // transaction başlatıyoruz birden fazla bağlantılı işlem yaptığımız için bir işlemde sorun olursa yapmasın istiyorum
        await sequelize.transaction(async (t) => {

            // Kullanıcıyı siliyorum (soft-deletion)
            await User.destroy({
                where: {
                    id: req.auth.user.id,
                },
                transaction: t
            });

            // Kullanıcıya ait olan tüm sessionları siliyorum tamamen kaldırıyorum.
            await Session.destroy({
                where: {
                    UserId: req.auth.user.id,
                },
                transaction: t
            });

            //  Kullanıcıya ait olan tüm blogları siliyorum (soft-deletion)
            await Blog.destroy({
                where: {
                    UserId: req.auth.user.id,
                },
                transaction: t
            });

            // Kullanıcıya ait olan tüm yorumları siliyorum (soft-deletion)
            await Comment.destroy({
                where: {
                    UserId: req.auth.user.id,
                },
                transaction: t,
            });

            return res.json({ status: true, message: 'Başarıyla silindi' });
        });


    } catch (error) {
        return res.status(500).json({ status: false, errors: [{ msg: error.message }] });
    }
}

const stats = async (req, res) => {

    // postu olan kullanıcı sayısını buluyorum
    const responsePost = await elasticClient.search({
        index: 'posts',
        body: {
            size: 0,
            aggs: {
                posts: {
                    filter: {
                        exists: {
                            field: 'profile.username.keyword'
                        }
                    },
                    aggs: {
                        blogger: {
                            cardinality: {
                                field: 'profile.username.keyword'
                            }
                        }
                    }
                }
            }
        }
    });

    // kullanıcı totalini buluyorum
    const responseUser = await elasticClient.search({
        index: 'users'
    });

    const total = responseUser.hits.total.value;
    const data = {
        total,
        blogger: responsePost.aggregations.posts.blogger.value,
        reader: total - responsePost.aggregations.posts.blogger.value // toplam kullanıcı sayısından postu olan kullanıcı sayısını çıkarıp sadece okuyucularu buluyorum
    }
    return res.json({ status: true, message: 'User Stats ElasticSearch Successfuly', data });
}

module.exports = {
    login,
    register,
    del,
    update,
    stats
};