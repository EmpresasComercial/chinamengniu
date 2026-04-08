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

// Regex to capture shadow and drop-shadow tailwind classes with preceding spaces
const regex = /\b(shadow|drop-shadow)(-[a-zA-Z0-9\-\/\[\]#%]+)?\b/g;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const initial = content;
  
  content = content.replace(regex, '');
  
  // Some cleanup for double spaces inside class definitions if necessary, but safe to ignore
  content = content.replace(/ className=" /g, ' className="');
  content = content.replace(/  "/g, '"');

  if (content !== initial) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});

console.log('Removed shadows across ' + changedCount + ' files.');
