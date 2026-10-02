const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const context = {};
vm.createContext(context);
for (const id of ['markdown-vendor', 'markdown-engine', 'redaction-engine']) {
 const script = html.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>'));
 if (script) vm.runInContext(script[1], context);
}
test('renders headings, emphasis, nested lists, tables, quotes and fenced code', () => {
 const result = context.renderMarkdown('# Title\n\n**Bold** and *italic* and ~~removed~~.\n\n- One\n  - Nested\n\n> Quote\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n```js\nconst x = "<tag>";\n```');
 for (const tag of ['h1', 'strong', 'em', 'del', 'ul', 'blockquote', 'table', 'pre', 'code']) assert.match(result, new RegExp('<' + tag + '(?:>| )'));
 assert.match(result, /&lt;tag&gt;/);
});
test('escapes HTML and shows link and image destinations without loading them', () => {
 const result = context.renderMarkdown('<img src=x onerror=alert(1)>\n\n[click](javascript:alert%281%29) ![photo](https://example.com/pixel.png)');
 assert.doesNotMatch(result, /<(?:img|script|iframe|a)\b/i);
 assert.match(result, /&lt;img/);
 assert.match(result, /https:\/\/example.com\/pixel.png/);
});
test('protected values remain literal and highlighted inside Markdown', () => {
 const result = context.renderMarkdown('**Email:** [EMAIL_1]\n\n`al********an@example.com`\n\n[EMAIL_1]: https://example.com', [
  {token:'[EMAIL_1]', title:'Email address'}, {token:'al********an@example.com', title:'Email address'}
 ]);
 assert.match(result, /<strong>Email:<\/strong>/);
 assert.match(result, /<mark title="Email address">\[EMAIL_1\]<\/mark>/);
 assert.match(result, /<mark title="Email address">al\*{8}an@example.com<\/mark>/);
 assert.doesNotMatch(result, /<em>/);
});
test('masking and restoration preserve the original Markdown source for copying', () => {
 const input = '# Request\n\n**Email:** alex@example.com\n\n- `alex@example.com`';
 const matches = context.detectPII(input);
 const protectedText = context.redactText(input, matches);
 assert.equal(protectedText, '# Request\n\n**Email:** [EMAIL_1]\n\n- `[EMAIL_1]`');
 const restored = context.restoreText(protectedText, context.createRestorationMap(matches)).text;
 assert.equal(restored, input);
 assert.match(context.renderMarkdown(restored), /<h1>Request<\/h1>/);
});
test('autolinked emails and URLs display once and HTML cannot forge highlights', () => {
 const result = context.renderMarkdown('alex@example.com https://example.com\n\nPCMARKDOWNTOKEN0END **[EMAIL_1]**', [{token:'[EMAIL_1]',title:'"<img src=x>'}]);
 assert.equal((result.match(/alex@example.com/g) || []).length,1);
 assert.equal((result.match(/https:\/\/example.com/g) || []).length,1);
 assert.match(result, /PCMARKDOWNTOKEN0END/);
 assert.match(result, /title="&quot;&lt;img src=x&gt;"/);
 assert.doesNotMatch(result, /<img/);
});
