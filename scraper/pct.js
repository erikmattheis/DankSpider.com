let pct = "1234";
pct = pct + '';
console.log(pct);
pct = pct.replace('.', '')
console.log(pct);
pct = parseInt(pct)
console.log(pct);
pct = (pct / 1000).toFixed(2);

console.log(pct);