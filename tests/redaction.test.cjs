const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(html.match(/<script id="redaction-engine">([\s\S]*?)<\/script>/)[1], context);
const { detectPII, redactText, createRestorationMap, restoreText } = context;
test('redacts email and preserves repeated identity', () => {
 const input = 'Email alex@example.com, then cc alex@example.com.';
 assert.equal(redactText(input, detectPII(input), 'mask'), 'Email [EMAIL_1], then cc [EMAIL_1].');
});
test('detects international phones, SSNs, IPv4 and validated cards', () => {
 const input = '+61 412 345 678; (415) 555-0132; 123-45-6789; 192.168.1.12; 4111 1111 1111 1111';
 const types = detectPII(input).map(x => x.type);
 assert.deepEqual(Array.from(types), ['PHONE', 'PHONE', 'ID', 'IP', 'CARD']);
});
test('ignores invalid cards and IP addresses', () => {
 assert.equal(detectPII('4111 1111 1111 1112 and 999.999.999.999').length, 0);
});
test('detects contextual names and street addresses without swallowing surrounding text', () => {
 const input = 'My name is Alex Morgan. I live at 42 Maple Street, Sydney. Please help.';
 assert.equal(redactText(input, detectPII(input), 'mask'), 'My name is [NAME_1]. I live at [ADDRESS_1], Sydney. Please help.');
});
test('supports custom phrases with partial redaction', () => {
 const input = 'Project A+B belongs to alex@example.com.';
 assert.equal(redactText(input, detectPII(input, ['Project A+B']), 'redact'), 'Pr*******+B belongs to a**x@example.com.');
});
test('leaves ordinary text and markup as literal text', () => {
 const input = '<img src=x onerror=alert(1)> Write a poem about autumn.';
 assert.equal(redactText(input, detectPII(input), 'mask'), input);
});
test('protects repeated full names learned from a contextual cue', () => {
 const input = 'Name: Alex Morgan. Please send Alex Morgan an update.';
 assert.equal(redactText(input, detectPII(input)), 'Name: [NAME_1]. Please send [NAME_1] an update.');
});
test('custom phrases cannot expose the remainder of an overlapping detected name', () => {
 const input = 'Name: Alex Morgan.';
 assert.equal(redactText(input, detectPII(input, ['Alex'])), 'Name: [CUSTOM_1].');
});
test('protects UNC shares, SMB URLs and mapped-drive paths consistently', () => {
 const input = String.raw`Open \\fileserver\payroll\October.xlsx then \\fileserver\payroll\October.xlsx. Try smb://school.local/students/report.csv or P:\Payroll\staff.csv.`;
 assert.equal(redactText(input, detectPII(input)), 'Open [PATH_1] then [PATH_1]. Try [PATH_2] or [PATH_3].');
 const redacted = redactText(input, detectPII(input), 'redact');
 assert.doesNotMatch(redacted, /fileserver|payroll|October|school\.local|students|staff/);
 assert.match(redacted, /\*/);
});
test('protects quoted paths containing spaces without consuming surrounding prose', () => {
 const input = String.raw`Check "\\school-server\Student Records\Jamie Smith.docx" and 'S:\Payroll Reports\October 2026.xlsx', please.`;
 assert.equal(redactText(input, detectPII(input)), 'Check "[PATH_1]" and \'[PATH_2]\', please.');
});
test('protects complete paths even when a server IP or email is also detected', () => {
 const input = String.raw`See \\192.168.1.12\users\alex@example.com\report.txt.`;
 assert.equal(redactText(input, detectPII(input)), 'See [PATH_1].');
});
test('ordinary URLs and sentences are not mistaken for drive paths', () => {
 const input = 'Read https://example.com/docs. Meeting at 9:30. Option A: review the report.';
 assert.equal(redactText(input, detectPII(input)), input);
});
test('recognizes student and employee name labels', () => {
 const input = 'Student: Jamie Smith\nEmployee: Taylor Reed';
 assert.equal(redactText(input, detectPII(input)), 'Student: [NAME_1]\nEmployee: [NAME_2]');
});
test('Mask uses a placeholder while Redact partially conceals the email username', () => {
 const input = 'iwan.kelaiah@gmail.com';
 assert.equal(redactText(input, detectPII(input), 'mask'), '[EMAIL_1]');
 assert.equal(redactText(input, detectPII(input), 'redact'), 'iw********ah@gmail.com');
});
test('redacts short values without revealing their complete contents', () => {
 assert.equal(redactText('a@example.com ab@example.com abc@example.com', detectPII('a@example.com ab@example.com abc@example.com'), 'redact'), '*@example.com **@example.com a*c@example.com');
});
test('partial redaction keeps only the final four digits of phones, cards and SSNs', () => {
 const input = '+61 412 345 678; 4111 1111 1111 1111; 123-45-6789';
 assert.equal(redactText(input, detectPII(input), 'redact'), '+** *** **5 678; **** **** **** 1111; ***-**-6789');
});
test('restores repeated, escaped Markdown and unknown labels without recursive substitution', () => {
 const original = 'Name: Jamie Smith\nEmail: jamie@example.com';
 const map = createRestorationMap(detectPII(original), 'mask');
 const result = restoreText(String.raw`Hello [NAME_1]. Email [EMAIL\_1]. [NAME_1] has [NAME_99].`, map);
 assert.equal(result.text, 'Hello Jamie Smith. Email jamie@example.com. Jamie Smith has [NAME_99].');
 assert.equal(result.restored, 3);
 assert.equal(result.unknown, 1);
 const tricky = 'Use [EMAIL_1] literally';
 const trickyMap = createRestorationMap(detectPII(tricky, [tricky]), 'mask');
 assert.equal(restoreText('[CUSTOM_1]', trickyMap).text, tricky);
});
test('restores unique partial redactions but leaves collisions unchanged', () => {
 const input = 'iwan.kelaiah@gmail.com iwan.xxxxxah@gmail.com';
 const map = createRestorationMap(detectPII(input), 'redact');
 const result = restoreText('Send to iw********ah@gmail.com.', map);
 assert.equal(result.text, 'Send to iw********ah@gmail.com.');
 assert.equal(result.ambiguous, 1);
 const uniqueMap = createRestorationMap(detectPII('iwan.kelaiah@gmail.com'), 'redact');
 assert.equal(restoreText('Send to iw********ah@gmail.com.', uniqueMap).text, 'Send to iwan.kelaiah@gmail.com.');
});
test('does not replace Markdown decoration with short fully hidden values', () => {
 const input = 'Hi AB';
 const map = createRestorationMap(detectPII(input, ['AB']), 'redact');
 assert.equal(restoreText('**Review the reply**', map).text, '**Review the reply**');
});
test('restores escaped asterisks and refuses a partial redaction inside a changed value', () => {
 const map = createRestorationMap(detectPII('iwan.kelaiah@gmail.com'), 'redact');
 assert.equal(restoreText(String.raw`Email iw\*\*\*\*\*\*\*\*ah@gmail.com.`, map).text, 'Email iwan.kelaiah@gmail.com.');
 assert.equal(restoreText('Email xiw********ah@gmail.com or iw********ah@gmail.com.au.', map).restored, 0);
});
test('leaves replies without protected fields unchanged in both modes', () => {
 const original = 'Name: Jamie Smith\nEmail: jamie@example.com';
 const reply = 'Check the permissions, reconnect the drive, and try again.';
 for (const mode of ['mask', 'redact']) {
  const result = restoreText(reply, createRestorationMap(detectPII(original), mode));
  assert.equal(result.text, reply);
  assert.equal(result.restored, 0);
  assert.equal(result.unknown, 0);
  assert.equal(result.ambiguous, 0);
 }
});
test('restores only fields present in a mixed AI reply without inserting omitted ones', () => {
 const original = 'Name: Jamie Smith\nEmail: jamie@example.com\nPhone: +61 412 345 678';
 const result = restoreText('Send the update to [EMAIL_1]. Thank the caller.', createRestorationMap(detectPII(original), 'mask'));
 assert.equal(result.text, 'Send the update to jamie@example.com. Thank the caller.');
 assert.equal(result.restored, 1);
 assert.doesNotMatch(result.text, /Jamie Smith|412/);
});
