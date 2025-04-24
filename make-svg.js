const fs = require('fs');
const https = require('https');

const GIST_ID = process.env.GIST_ID;
const GH_TOKEN = process.env.GH_TOKEN;

if (!GIST_ID || !GH_TOKEN) {
  console.error('Missing GIST_ID or GH_TOKEN');
  process.exit(1);
}

const options = {
  hostname: 'api.github.com',
  path: `/gists/${GIST_ID}`,
  headers: {
    'User-Agent': 'productive-box-svg-generator',
    'Authorization': `token ${GH_TOKEN}`
  }
};

https.get(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const gist = JSON.parse(data);
    const file = Object.values(gist.files)[0];
    const lines = file.content.split('\n');

    const svgLines = lines.map((line, idx) => `    <text x=\"10\" y=\"${30 + idx * 20}\">${line}</text>`).join('\n');

    const svg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<svg width=\"400\" height=\"${30 + lines.length * 20}\" xmlns=\"http://www.w3.org/2000/svg\">
  <style>
    text {
      font-family: monospace;
      font-size: 16px;
      fill: #333;
    }
  </style>
${svgLines}
</svg>`;

    fs.writeFileSync('production.svg', svg);
    console.log('✅ production.svg created successfully!');
  });
}).on('error', err => {
  console.error('Failed to fetch gist:', err);
});
