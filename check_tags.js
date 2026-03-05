const fs = require('fs');
const filePath = '/Users/tuyenpham712/Work/o2o-redesign/src/app/admin/display/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const stack = [];
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // This regex matches <tag, </tag, but avoids < and > inside strings or comments (mostly)
    const regex = /<(\/?[a-zA-Z1-6]+)([^>]*?)(\/?)>/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
        const tagName = match[1].toLowerCase();
        const isClosing = tagName.startsWith('/');
        const isSelfClosing = match[3] === '/';

        if (isSelfClosing) continue;
        
        // Filter for common HTML tags to avoid matching generic <T> in TS
        const htmlTags = ['div', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'button', 'input', 'select', 'option', 'label', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'iframe', 'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'];
        const tagToTest = isClosing ? tagName.substring(1) : tagName;
        if (!htmlTags.includes(tagToTest)) continue;

        if (isClosing) {
            const actualTag = tagName.substring(1);
            if (stack.length === 0) {
                console.log(`Extra closing tag </${actualTag}> at line ${i + 1}`);
            } else {
                const last = stack.pop();
                if (last.tag !== actualTag) {
                    console.log(`Tag mismatch at line ${i + 1}: expected </${last.tag}> (from line ${last.line}), got </${actualTag}>`);
                }
            }
        } else {
            stack.push({ tag: tagName, line: i + 1 });
        }
    }
}

if (stack.length > 0) {
    console.log("Unclosed tags:");
    stack.forEach(s => console.log(`${s.tag} on line ${s.line}`));
} else {
    console.log("All tags balanced!");
}
