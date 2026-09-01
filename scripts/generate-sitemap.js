const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://chengyi-group.com.tw';

// 你的 Node.js API
const API_BASE_URL = 'https://api.chengyi-group.com.tw/api';

async function getData(url) {

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error(
            `API 取得失敗: ${url} (${response.status})`
        );

    }

    return response.json();

}

function escapeXml(value) {

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

}

function createUrl(loc, priority = '0.8', changefreq = 'weekly', lastmod = null) {

    return `
    <url>

        <loc>${escapeXml(loc)}</loc>

        ${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ''}

        <changefreq>${changefreq}</changefreq>

        <priority>${priority}</priority>

    </url>`;

}

async function generateSitemap() {

    console.log('開始產生 Sitemap...');

    const products = await getData(
        `${API_BASE_URL}/products`
    );

    const articles = await getData(
        `${API_BASE_URL}/admin/articles`
    );


    console.log(
        `取得 ${products.length} 個商品`
    );

    console.log(
        `取得 ${articles.length} 篇文章`
    );

    const urls = [];


    urls.push(
        createUrl(
            `${BASE_URL}/`,
            '1.0',
            'weekly'
        )
    );


    urls.push(
        createUrl(
            `${BASE_URL}/about`,
            '0.8',
            'monthly'
        )
    );


    urls.push(
        createUrl(
            `${BASE_URL}/about/team`,
            '0.6',
            'monthly'
        )
    );


    urls.push(
        createUrl(
            `${BASE_URL}/about/vision`,
            '0.7',
            'monthly'
        )
    );


    urls.push(
        createUrl(
            `${BASE_URL}/about/location`,
            '0.6',
            'monthly'
        )
    );


    urls.push(
        createUrl(
            `${BASE_URL}/news`,
            '0.8',
            'weekly'
        )
    );


    urls.push(
        createUrl(
            `${BASE_URL}/product`,
            '0.9',
            'weekly'
        )
    );


    urls.push(
        createUrl(
            `${BASE_URL}/blog`,
            '0.8',
            'weekly'
        )
    );


    urls.push(
        createUrl(
            `${BASE_URL}/analysis`,
            '0.7',
            'monthly'
        )
    );

    products.forEach(product => {

        if (!product.id) {
            return;
        }


        urls.push(
            createUrl(
                `${BASE_URL}/product/${product.id}`,
                '0.8',
                'weekly'
            )
        );

    });

    articles.forEach(article => {

        if (!article.id) {
            return;
        }

        let lastmod = null;

        if (article.date) {

            const date = new Date(article.date);

            if (!Number.isNaN(date.getTime())) {

                lastmod =
                    date.toISOString().split('T')[0];

            }

        }


        urls.push(
            createUrl(
                `${BASE_URL}/blog/${article.id}`,
                '0.7',
                'weekly',
                lastmod
            )
        );

    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls.join('\n')}

</urlset>
`;

    const outputPath = path.join(
        process.cwd(),
        'public',
        'sitemap.xml'
    );


    fs.writeFileSync(
        outputPath,
        xml,
        'utf8'
    );


    console.log('');
    console.log('Sitemap 產生完成！');
    console.log(`共 ${urls.length} 個網址`);
    console.log(`檔案：${outputPath}`);

}


generateSitemap()
    .catch(error => {

        console.error('');
        console.error('Sitemap 產生失敗：');
        console.error(error);

        process.exit(1);

    });
