const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const fixturePath = process.argv[2] || 'fixtures/detection.json';
const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const context = {};
vm.createContext(context);
vm.runInContext(html.match(/<script id="redaction-engine">([\s\S]*?)<\/script>/)[1], context);

const metrics = new Map();
const names = new Map();
let truePositive = 0, falsePositive = 0, falseNegative = 0;
for (const fixture of fixtures) {
 const expected = (fixture.expected || []).map(item => {
  let start = 0;
  for (let i = 0; i < (item.occurrence || 0); i++) {
   const previous = fixture.text.indexOf(item.value, start);
   if (previous < 0) throw new Error(`${fixture.name}: cannot find occurrence ${item.occurrence} of ${item.value}`);
   start = previous + item.value.length;
  }
  const index = fixture.text.indexOf(item.value, start);
  if (index < 0) throw new Error(`${fixture.name}: expected value not found: ${item.value}`);
  return {type:item.type,start:index,end:index+item.value.length,value:item.value};
 });
 const actual = context.detectPII(fixture.text, fixture.custom || []);
 const used = new Set();
 for (const item of expected) {
  const key = item.type;
  names.set(key,(names.get(key)||0)+1);
  if (!metrics.has(key)) metrics.set(key,{tp:0,fp:0,fn:0});
  const found = actual.findIndex((prediction,index) => !used.has(index) && prediction.type===item.type && prediction.start===item.start && prediction.end===item.end);
  if (found >= 0) { used.add(found); metrics.get(key).tp++; truePositive++; }
  else { metrics.get(key).fn++; falseNegative++; console.error(`MISS ${fixture.name}: ${item.type} at ${item.start} (${item.value.replace(/\n/g,'\\n')})`); }
 }
 actual.forEach((prediction,index) => {
  if (used.has(index)) return;
  const key=prediction.type;
  if (!metrics.has(key)) metrics.set(key,{tp:0,fp:0,fn:0});
  metrics.get(key).fp++; falsePositive++;
  console.error(`EXTRA ${fixture.name}: ${prediction.type} at ${prediction.start} (${prediction.value.replace(/\n/g,'\\n')})`);
 });
}
console.log('Synthetic detection benchmark (exact span and category match)');
console.log('Category             TP    FP    FN  Precision  Recall');
for (const [type,{tp,fp,fn}] of [...metrics.entries()].sort(([a],[b])=>a.localeCompare(b))) {
 const precision=tp+fp ? tp/(tp+fp) : 1, recall=tp+fn ? tp/(tp+fn) : 1;
 console.log(`${type.padEnd(20)} ${String(tp).padStart(3)}   ${String(fp).padStart(3)}   ${String(fn).padStart(3)}     ${(precision*100).toFixed(1).padStart(5)}%   ${(recall*100).toFixed(1).padStart(5)}%`);
}
console.log(`Overall exact spans: TP ${truePositive}, FP ${falsePositive}, FN ${falseNegative}. Synthetic fixtures are illustrative and do not predict production accuracy.`);
