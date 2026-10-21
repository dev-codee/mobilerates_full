const fs = require('fs');
const file = 'e:/zozo_frontend/app/admin/phones/components/AdminPhoneForm.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('{/* AI-Generated SEO Fields */}'));
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) {
    if (lines[i].includes('</section>')) {
        endIdx = i + 1;
        break;
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    const aiBlock = lines.splice(startIdx, endIdx - startIdx);
    
    // Insert it before 'AI Automations (Moderation Flags)'
    const insertIdx = lines.findIndex(l => l.includes('AI Automations (Moderation Flags)')); 
    
    // adjust insertIdx to find the <section>
    let actualInsertIdx = insertIdx;
    while(actualInsertIdx > 0 && !lines[actualInsertIdx].includes('<section')) {
        actualInsertIdx--;
    }

    lines.splice(actualInsertIdx, 0, ...aiBlock);
    
    fs.writeFileSync(file, lines.join('\n'));
    console.log('Moved AI Block successfully');
} else {
    console.log('Could not find start or end', startIdx, endIdx);
}
