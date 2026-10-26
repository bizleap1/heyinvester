import fs from 'fs';
import path from 'path';

async function main() {
  const filePath = 'C:/Users/prave/.gemini/antigravity-ide/brain/f46ce060-ca77-4b73-aca4-4a8ff443055c/.system_generated/steps/1092/content.md';
  const content = fs.readFileSync(filePath, 'utf8');

  // Search for og:image
  const ogMatch = content.match(/property="og:image"\s+content="([^"]+)"/);
  if (!ogMatch) {
    console.error('og:image not found');
    return;
  }

  let imgUrl = ogMatch[1].replace(/&amp;/g, '&');
  console.log('Found og:image URL:', imgUrl);

  // Check if uncropped/full size URL exists in the HTML
  // Often there is an uncropped or 1080x1080 version
  const allCdnUrls = content.match(/https:\/\/[^"'\s<>]+cdninstagram\.com\/[^"'\s<>]+/g) || [];
  const cleanUrls = [...new Set(allCdnUrls.map(u => u.replace(/&amp;/g, '&')))].filter(u => u.includes('t51.82787-15') || u.includes('.jpg'));
  console.log('All candidate image URLs:', cleanUrls);

  // Download the best image URL
  const targetUrl = cleanUrls[0] || imgUrl;
  console.log('Downloading from:', targetUrl);

  const res = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const destPath = path.resolve('public/images/generated/koradi.jpg');
  fs.writeFileSync(destPath, buffer);
  console.log(`Saved image (${buffer.length} bytes) to ${destPath}`);

  // Also save a backup copy
  fs.writeFileSync(path.resolve('public/images/generated/koradi_insta.jpg'), buffer);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
