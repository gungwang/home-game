const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'ResumeScreen.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The main grid container currently uses: grid-cols-1 lg:grid-cols-3
// Change it to: grid-cols-1 lg:grid-cols-4
content = content.replace(
    "grid-cols-1 lg:grid-cols-3 gap-6",
    "grid-cols-1 lg:grid-cols-4 gap-6"
);

// The Personnel File section currently uses: lg:col-span-2 (which was 2/3)
// Change it to: lg:col-span-3 (which makes it 3/4)
content = content.replace(
    "lg:col-span-2 border border-cyan-800",
    "lg:col-span-3 border border-cyan-800"
);

// The Leaderboard section uses: lg:col-span-1 (which was 1/3, now 1/4)
// This doesn't strictly need changing, but we should update the comment
content = content.replace(
    "{/* Personnel File Section — 2/3 width */}",
    "{/* Personnel File Section — 3/4 width */}"
);

content = content.replace(
    "{/* Leaderboard Section — 1/3 width */}",
    "{/* Leaderboard Section — 1/4 width */}"
);

fs.writeFileSync(filePath, content);
console.log("Patched ResumeScreen!");
