const fs = require('fs');
const path = require('path');
const { Client } = require('@elastic/elasticsearch');

// ElasticSearch bağlantısını yapıyorum
const elasticClient = new Client({
    node: process.env.ELASTIC_SEARCH_URL,
    auth: {
        apiKey: process.env.ELASTIC_SEARCH_API_KEY
    }
});

// Bağlantı test fonksiyonunu oluşturdum. Ve test dokümanlarını buradan ekliyorum
const elasticSearchConnection = async () => {
    const ping = await elasticClient.ping();
    console.log(ping ? 'Connected to the elasticSearch' : 'elasticSearch Connect Error');

    // eğer uuid oluştuysa başarılıdır ve dokümanlarımı aktarım yapabilirim
    if (ping) {
        // Post data ekleniyor
        elasticSearchBulkInsert('./../storage/posts.json', 'posts');
        // Users data ekleniyor
        elasticSearchBulkInsert('./../storage/users.json', 'users');
    }
}

const elasticSearchBulkInsert = async (jsonDataFilePath, indexName) => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, jsonDataFilePath), 'utf8'));

    // maping ve index işlemini yapıyorum.
    const indexExists = await elasticClient.indices.exists({ index: indexName });
    if (!indexExists) {
        const result = await elasticClient.helpers.bulk({
            refresh: true,
            datasource: data,
            onDocument: (doc) => ({
                index: { _index: indexName },
            }),
        });
        console.log('index: ' + indexName + ' =>', result.successful);
    }
}

module.exports = {
    elasticClient,
    elasticSearchConnection
}