import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const MAX_BYTES = 300 * 1024; // 300 KB limit
const TARGET_MAX_WIDTH = 1200;

async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await processDirectory(fullPath);
      continue;
    }

    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

    const originalSize = stat.size;
    const originalKb = (originalSize / 1024).toFixed(1);

    // If already under 290 KB, verify if it needs any optimization
    if (originalSize <= 290 * 1024) {
      console.log(`[PASS] ${file} (${originalKb} KB <= 300 KB)`);
      continue;
    }

    console.log(`[OPTIMIZING] ${file} (${originalKb} KB > 300 KB)...`);
    const buffer = fs.readFileSync(fullPath);
    const metadata = await sharp(buffer).metadata();

    let targetWidth = metadata.width;
    if (targetWidth > TARGET_MAX_WIDTH) {
      targetWidth = TARGET_MAX_WIDTH;
    }

    let quality = 82;
    let optimizedBuffer;

    if (ext === '.webp') {
      optimizedBuffer = await sharp(buffer)
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();

      while (optimizedBuffer.length > MAX_BYTES && quality > 50) {
        quality -= 5;
        optimizedBuffer = await sharp(buffer)
          .resize({ width: targetWidth, withoutEnlargement: true })
          .webp({ quality, effort: 6 })
          .toBuffer();
      }
    } else if (ext === '.png') {
      let curWidth = targetWidth;
      optimizedBuffer = await sharp(buffer)
        .resize({ width: curWidth, withoutEnlargement: true })
        .png({ compressionLevel: 9, palette: true, quality: 80 })
        .toBuffer();

      while (optimizedBuffer.length > MAX_BYTES && curWidth > 600) {
        curWidth -= 100;
        optimizedBuffer = await sharp(buffer)
          .resize({ width: curWidth, withoutEnlargement: true })
          .png({ compressionLevel: 9, palette: true, quality: 75 })
          .toBuffer();
      }
    } else {
      // jpg / jpeg
      optimizedBuffer = await sharp(buffer)
        .resize({ width: targetWidth, withoutEnlargement: true })
        .jpeg({ quality, progressive: true })
        .toBuffer();

      while (optimizedBuffer.length > MAX_BYTES && quality > 50) {
        quality -= 5;
        optimizedBuffer = await sharp(buffer)
          .resize({ width: targetWidth, withoutEnlargement: true })
          .jpeg({ quality, progressive: true })
          .toBuffer();
      }
    }

    fs.writeFileSync(fullPath, optimizedBuffer);
    const newKb = (optimizedBuffer.length / 1024).toFixed(1);
    console.log(`   -> [REDUCED] ${file}: ${originalKb} KB -> ${newKb} KB (Quality: ${quality})`);
  }
}

async function convertCastoMentorImage() {
  const sourceJfif = 'd:/my-workshop/projects/vediusv/imgs/castomalimali.jfif';
  const targetWebp = 'd:/my-workshop/projects/vediusv/assets/img/castomalimali.webp';

  if (fs.existsSync(sourceJfif)) {
    console.log('[CONVERTING] castomalimali.jfif -> assets/img/castomalimali.webp...');
    const buffer = fs.readFileSync(sourceJfif);
    const optimized = await sharp(buffer)
      .resize({ width: 600, height: 600, fit: 'cover', position: 'top' })
      .webp({ quality: 85 })
      .toBuffer();
    fs.writeFileSync(targetWebp, optimized);
    console.log(`   -> Created ${targetWebp} (${(optimized.length / 1024).toFixed(1)} KB)`);
  } else {
    console.warn('[WARN] source castomalimali.jfif not found');
  }
}

async function run() {
  console.log('=== STARTING IMAGE OPTIMIZATION (MAX 300 KB RULE) ===\n');
  await convertCastoMentorImage();
  await processDirectory('d:/my-workshop/projects/vediusv/assets/img');
  await processDirectory('d:/my-workshop/projects/vediusv/assets/projects');

  console.log('\n=== VERIFYING FINAL SIZES ===');
  let failures = 0;
  for (const dir of ['assets/img', 'assets/projects']) {
    const fullDir = path.resolve('d:/my-workshop/projects/vediusv', dir);
    if (!fs.existsSync(fullDir)) continue;
    const files = fs.readdirSync(fullDir);
    for (const f of files) {
      const p = path.join(fullDir, f);
      const st = fs.statSync(p);
      const kb = st.size / 1024;
      if (kb > 300) {
        console.error(`[FAIL EXCEEDS 300KB] ${dir}/${f} is ${kb.toFixed(1)} KB`);
        failures++;
      }
    }
  }

  if (failures === 0) {
    console.log('\n[SUCCESS] ALL IMAGES ARE STRICTLY UNDER 300 KB!');
  } else {
    console.error(`\n[ERROR] ${failures} images exceed 300 KB!`);
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
