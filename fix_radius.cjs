const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css') || file.endsWith('.html')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const initial = content;
  
  // Replace 2xl, 3xl, 4xl, 5xl with xl (which is 12px in tailwind)
  content = content.replace(/\brounded(-[tblr])?-(2xl|3xl|4xl|5xl)\b/g, 'rounded$1-xl');
  
  // Replace arbitrary pixel values > 12px with xl
  content = content.replace(/\brounded(-[tblr])?-\[(\d+)px\]\b/g, (match, pos, val) => {
    return parseInt(val) > 12 ? `rounded${pos || ''}-xl` : match;
  });
  
  // Replace arbitrary rem values > 0.75rem (12px) with xl
  content = content.replace(/\brounded(-[tblr])?-\[([\d.]+)rem\]\b/g, (match, pos, val) => {
    return parseFloat(val) > 0.75 ? `rounded${pos || ''}-xl` : match;
  });

  if (content !== initial) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});

console.log('Fixed border radius across ' + changedCount + ' files.');
