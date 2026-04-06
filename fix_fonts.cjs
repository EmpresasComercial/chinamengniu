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
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const initial = content;
  
  // Also clean up any lingering rounded-t-[Npx], etc.
  content = content.replace(/rounded(-[tblr])?-\[\d+px\]/g, 'rounded$1-xl');
  content = content.replace(/rounded(-[tblr])?-\[\d+rem\]/g, 'rounded$1-xl');
  
  // Find all buttons that have bg-[...], text-white or bg-[...]/something
  // Instead of matching exactly buttons, we can just replace font-bold, font-black, font-semibold globally from classNames that contain button-like features (h-10, h-12, w-full, bg- etc) OR just remove it from all components matching these words if they're blue buttons
  // To be safe, we'll strip `font-bold`, `font-semibold`, `font-black`, `font-medium` from className attributes that also contain `bg-`
  
  // Actually, replacing all font-weights from buttons is what was requested.
  // "desnegritar as palavras... de botões de cor azul. Devem ser texto normal"
  content = content.replace(/(className="[^"]*?\bbg-(?:blue|\[#000)[^"]*?")/g, (match) => {
    let newMatch = match.replace(/\bfont-(bold|semibold|black|medium)\b/g, 'font-normal');
    // Also ensuring blue buttons are rounded-xl (not rounded-full, since we might want unified buttons)
    // Actually they said "todos os elementos", so buttons might also be unified to 12px? Let's just do it.
    newMatch = newMatch.replace(/\brounded-full\b/g, 'rounded-xl');
    return newMatch;
  });

  if (content !== initial) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});

console.log('Fixed blue buttons and leftovers across ' + changedCount + ' files.');
