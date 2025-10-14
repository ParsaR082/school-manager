const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Icon sizes to generate
const iconSizes = [48, 72, 96, 144, 192, 512];

async function convertSvgToPng() {
  console.log('🎨 شروع تبدیل آیکون‌های SVG به PNG...\n');

  try {
    // Convert main icons
    for (const size of iconSizes) {
      const svgPath = path.join(publicDir, `icon-${size}x${size}.svg`);
      const pngPath = path.join(publicDir, `icon-${size}x${size}.png`);
      
      if (fs.existsSync(svgPath)) {
        await sharp(svgPath)
          .resize(size, size)
          .png()
          .toFile(pngPath);
        
        console.log(`✅ تبدیل شد: icon-${size}x${size}.png`);
      } else {
        console.log(`❌ فایل یافت نشد: icon-${size}x${size}.svg`);
      }
    }

    // Convert apple-touch-icon
    const appleSvgPath = path.join(publicDir, 'apple-touch-icon.svg');
    const applePngPath = path.join(publicDir, 'apple-touch-icon.png');
    
    if (fs.existsSync(appleSvgPath)) {
      await sharp(appleSvgPath)
        .resize(180, 180)
        .png()
        .toFile(applePngPath);
      
      console.log('✅ تبدیل شد: apple-touch-icon.png');
    }

    // Create favicon.ico from 48x48 PNG
    const favicon48Path = path.join(publicDir, 'icon-48x48.png');
    const faviconPath = path.join(publicDir, 'favicon.ico');
    
    if (fs.existsSync(favicon48Path)) {
      await sharp(favicon48Path)
        .resize(32, 32)
        .png()
        .toFile(path.join(publicDir, 'favicon-32x32.png'));
      
      await sharp(favicon48Path)
        .resize(16, 16)
        .png()
        .toFile(path.join(publicDir, 'favicon-16x16.png'));
      
      console.log('✅ تبدیل شد: favicon-32x32.png و favicon-16x16.png');
    }

    console.log('\n🎉 تمام آیکون‌ها با موفقیت تبدیل شدند!');
    
  } catch (error) {
    console.error('❌ خطا در تبدیل آیکون‌ها:', error);
    process.exit(1);
  }
}

convertSvgToPng();