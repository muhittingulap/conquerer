const jwt = require('jsonwebtoken');
const bcryptjs = require("bcryptjs");

const SECRET_KEY = process.env.JWT_SECRET_KEY;
/*
    Models
*/
const User = require("./../../models").User;
const Session = require("./../../models").Session;

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

        // data modellemesini yapıyorum
        const data = {
            username: full_name,
            full_name,
            email,
            password: passwordHash,
            birthday
        }

        // veritabanına kaydı atıyopruz
        await User.create(data)
            .then(function (user) {
                res.json({ status: true, message: 'Kullanıcı başarıyla oluşturuldu.', user });
            }).catch(function (err) {
                res.status(400).json({ status: false, code: 1005, errors: [{ msg: err }] });
            });

    } catch (error) {
        res.status(500).json({ status: false, code: 9001, error });
    }
}

const update = async (req, res) => {
    return res.json({ status: true, message: 'Update Successful', auth: req.auth });
}

const del = async (req, res) => {
    return res.json({ status: true, message: 'Delete Successful', auth: req.auth });
}

module.exports = {
    login,
    register,
    del,
    update
};