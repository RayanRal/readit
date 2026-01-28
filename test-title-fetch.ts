
async function testFetch(url: string) {
    try {
        console.log(`Fetching ${url}...`);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Readit/0.1; +http://localhost:3000)'
            }
        });
        if (response.ok) {
            const text = await response.text();
            const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (match && match[1]) {
                console.log(`Found title: ${match[1].trim()}`);
            } else {
                console.log('No title found.');
            }
        } else {
            console.log(`Failed to fetch: ${response.status}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function run() {
    await testFetch('https://example.com');
    await testFetch('https://google.com');
}

run();
