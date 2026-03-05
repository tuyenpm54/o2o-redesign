const fs = require('fs');
const css = fs.readFileSync('discovery_raw.css', 'utf-8');

// The prefix is page-module__WLiWLW__
const prefix = 'page-module__WLiWLW__';
const regex = new RegExp(`\\.${prefix}([a-zA-Z0-9_-]+)\\s*\\{([^}]*)\\}`, 'g');

let match;
const result = {};

while ((match = regex.exec(css)) !== null) {
    const className = match[1];
    const rules = match[2].trim();
    if (!result[className]) {
        result[className] = [];
    }
    result[className].push(rules);
}

for (const [cls, rulesList] of Object.entries(result)) {
    console.log(`.${cls} {\n  ${rulesList.join('\n  ')}\n}\n`);
}
