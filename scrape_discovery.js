const fs = require('fs');

async function scrape() {
    const jsdom = require("jsdom");
    const { JSDOM } = jsdom;
    
    // Fetch HTML
    const response = await fetch('https://o2o-redesign.netlify.app/modular-demo/discovery');
    const html = await response.text();
    fs.writeFileSync('discovery_raw.html', html);
    
    // parse DOM
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Find all mapped CSS files
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    let cssContent = '';
    for (let link of links) {
        if (link.href.startsWith('http')) {
            const res = await fetch(link.href);
            cssContent += (await res.text()) + '\n';
        } else {
            const res = await fetch('https://o2o-redesign.netlify.app' + (link.href.startsWith('/') ? '' : '/') + link.href);
            cssContent += (await res.text()) + '\n';
        }
    }
    fs.writeFileSync('discovery_raw.css', cssContent);
    
    // Extract main elements for easier reading
    console.log("HTML and CSS downloaded to discovery_raw.html and discovery_raw.css");
}

scrape().catch(console.error);
