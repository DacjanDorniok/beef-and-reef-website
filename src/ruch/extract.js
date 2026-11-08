const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'build.js'), 'utf8');
const cut = src.indexOf('const write =');
let code = src.slice(0, cut).replace(/^#!.*\n/, '');
code = code.replace("const DIST = path.join(__dirname, '..', 'docs');", "const DIST = '" + path.join(__dirname, '..', '..', 'docs') + "';")
           .replace("path.join(__dirname, 'menu-source.dc.html')", "'" + path.join(__dirname, '..', 'menu-source.dc.html') + "'");
code += `
const captured = {};
legalShell = function (ctx, o) { captured[ctx.page + '_' + ctx.lang] = o; return ''; };
['pl','en'].forEach(l => { privacyPage(l); cookiesPage(l); });
module.exports = { T, HOME, HOME_X, EVENT, PARTY, MENU, CATS, PAGES, legal: captured, menuHtml: { pl: renderMenu('pl'), en: renderMenu('en') } };`;
code = code.replace('function legalShell(', 'var legalShell = function legalShell(');
const tmp = path.join(require('os').tmpdir(), 'br-content.js');
fs.writeFileSync(tmp, code);
const m = require(tmp);
fs.writeFileSync(path.join(__dirname, 'content.json'), JSON.stringify(m, null, 1));
console.log(Object.keys(m.legal), m.PAGES);
