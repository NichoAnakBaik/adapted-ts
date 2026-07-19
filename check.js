const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const key = env.split('GEMINI_API_KEY=')[1].split('\n')[0].trim();
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
  .then(r => r.json())
  .then(d => {
    if (d.error) {
      console.error(d.error);
    } else {
      console.log(d.models.map(m => m.name).join('\n'));
    }
  }).catch(e => console.error(e));
