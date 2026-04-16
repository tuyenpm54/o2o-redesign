const fs = require('fs');
const menus = JSON.parse(fs.readFileSync('src/data/menus.json'));
console.log(menus["100"].items.map(i => i.id));
