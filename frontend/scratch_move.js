const fs = require('fs');
const file = 'e:/zozo_frontend/app/admin/phones/components/AdminPhoneForm.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldAiSectionRegex = /<section className="bg-white p-5 rounded-xl border shadow-sm md:col-span-2">\s*<h3 className="font-bold mb-3">AI Generated Content<\/h3>\s*<div className="grid grid-cols-1 md:grid-cols-2 gap-6">\s*\{Object\.keys\(DEFAULT_EXTRA_SPECS\.ai_generated_content\)\.map\(key => renderInput\(key, \(formData\.specs\.extra_specs as any\)\.ai_generated_content\[key\], v => handleNestedExtraSpec\('ai_generated_content', key, v\), 'textarea'\)\)\}\s*<\/div>\s*<\/section>/;

const match1 = content.match(oldAiSectionRegex);
if (!match1) {
  console.log('Could not find old AI section');
  process.exit(1);
}

const newSeoAiRegex = /\{\/\* AI-Generated SEO Fields \*\/\}\s*<section className="bg-gradient-to-r[\s\S]*?<\/section>\n/;
const match2 = content.match(newSeoAiRegex);
if (!match2) {
  console.log('Could not find new SEO AI section');
  process.exit(1);
}

const seoContent = match2[0];
content = content.replace(match2[0], '');
content = content.replace(oldAiSectionRegex, seoContent.trim());

fs.writeFileSync(file, content);
console.log('Successfully swapped sections!');
