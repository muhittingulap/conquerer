const User = require("./../models").User;

const generateSlug = (text) => {
    const turkishChars = {
        ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
        Ç: 'C', Ğ: 'G', I: 'I', Ö: 'O', Ş: 'S', Ü: 'U'
    };

    const slug = text.replace(/[^a-zA-Z0-9]/g, (char) => turkishChars[char] || '');
    return slug.toLowerCase();
}

const checkIfUsernameExists = async (username) => {
    try {
        const userExists = await User.findOne({
            where: {
                username: username,
            },
            paranoid: false // silinmiş kullanıcılarında username kontrolünü yapmam gerektiği için ekledim
        });

        return userExists !== null;
    } catch (error) {
        return true;
    }
}

const generateUsername = async (fullname) => {
    let username = (generateSlug(fullname)).toLowerCase();

    let count = 1;
    while (await checkIfUsernameExists(username)) {
        let rand = Math.floor(Math.random() * 900) + 100;
        username = (generateSlug(fullname) + rand + count).toLowerCase();
        count++;
    }

    return username;
}

module.exports = {
    generateUsername
}