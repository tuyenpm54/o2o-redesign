const fs = require('fs');
const css = fs.readFileSync('discovery_raw.css', 'utf-8');

const regexH = /\.Header-module__ldgnoG__([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;
const regexM = /\.MemberLobby-module__Y_DmDG__([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;

let match;
let output = '\n/* Header Styles */\n';

while ((match = regexH.exec(css)) !== null) {
    output += `.${match[1]} {\n  ${match[2].trim()}\n}\n\n`;
}

output += '\n/* MemberLobby Styles */\n';
while ((match = regexM.exec(css)) !== null) {
    output += `.${match[1]} {\n  ${match[2].trim()}\n}\n\n`;
}

fs.appendFileSync('src/app/discovery/page.module.css', output);
console.log("Appended other module styles");
