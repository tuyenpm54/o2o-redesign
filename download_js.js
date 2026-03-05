const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

async function run() {
    const html = fs.readFileSync('discovery_raw.html', 'utf-8');
    const dom = new JSDOM(html);
    const scripts = dom.window.document.querySelectorAll('script');
    let allJs = '';
    for (let script of scripts) {
        if (script.src) {
            let url = script.src;
            if (url.startsWith('/')) url = 'https://o2o-redesign.netlify.app' + url;
            try {
                let res = await fetch(url);
                let text = await res.text();
                allJs += '\n/* --- ' + url + ' --- */\n' + text;
            } catch(e) {}
        }
    }
    fs.writeFileSync('discovery_raw.js', allJs);
    console.log("JS downloaded");
}
run();
