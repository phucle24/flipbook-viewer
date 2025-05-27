import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create sample HTML content for PDF
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Sample Story for PDF Import</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 40px;
      line-height: 1.6;
    }
    h1 {
      color: #4a2c8f;
      text-align: center;
      margin-bottom: 30px;
    }
    h2 {
      color: #674ea7;
      margin-top: 30px;
    }
    .page-break {
      page-break-after: always;
    }
    img {
      max-width: 300px;
      display: block;
      margin: 20px auto;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <h1>The Magical Forest</h1>
  <p>Once upon a time, in a forest far far away, there lived a group of magical creatures. The forest was known for its vibrant colors and enchanted trees that whispered secrets when the wind blew through their leaves.</p>
  <p>Among these creatures was a young fairy named Lily. She had delicate wings that shimmered in the sunlight and a heart full of curiosity about the world beyond the forest.</p>
  <img src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600" alt="Forest" />
  <p>Every morning, Lily would wake up at dawn to watch the sunrise paint the sky with hues of pink and gold. She believed that each sunrise brought new magic to the forest.</p>

  <div class="page-break"></div>

  <h2>Chapter 1: The Discovery</h2>
  <p>One sunny morning, as Lily was exploring the eastern edge of the forest, she discovered something unusual - a small, glowing stone nestled between the roots of an ancient oak tree.</p>
  <p>The stone pulsed with a gentle blue light, almost as if it had a heartbeat of its own. Fascinated, Lily carefully picked it up, feeling a warm tingle spread through her fingertips.</p>
  <img src="https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=600" alt="Glowing stone" />
  <p>"What could this be?" she wondered aloud. The forest seemed to grow quieter, as if listening to her question.</p>

  <div class="page-break"></div>

  <h2>Chapter 2: The Old Wise Owl</h2>
  <p>Determined to learn more about her discovery, Lily decided to visit the oldest and wisest creature in the forest - the Great Owl who lived in the hollow of the tallest tree.</p>
  <p>The journey to the Great Owl's home took Lily through winding paths and over bubbling brooks. Along the way, she noticed that the stone's glow seemed to intensify whenever she passed certain plants.</p>
  <img src="https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?w=600" alt="Owl" />
  <p>When she finally reached the massive tree, she called out, "Great Owl, may I speak with you?" There was a rustling of feathers, and then two large, amber eyes peered down at her from the darkness of the hollow.</p>

  <div class="page-break"></div>

  <h2>Chapter 3: The Legend</h2>
  <p>"Ah, young fairy," the Great Owl hooted softly, his voice deep and melodious. "I see you have found one of the lost Stones of Harmony."</p>
  <p>Lily's eyes widened with excitement. "The Stones of Harmony? What are they?"</p>
  <p>The Great Owl settled on a lower branch, his feathers gleaming silver in the dappled sunlight. "Long ago, when the forest was young, four magical stones maintained balance and peace throughout the land. Each stone controlled an element: earth, water, air, and fire."</p>
  <img src="https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600" alt="Magical forest" />
  <p>"But during a great storm many centuries ago, the stones were scattered. Without their united power, the forest has been slowly losing its magic. What you have found, little one, is the Water Stone."</p>

</body>
</html>
`;

// Function to generate PDF
async function generatePDF() {
  try {
    // Write HTML to a temporary file
    const tempHtmlPath = path.join(__dirname, 'temp-sample.html');
    fs.writeFileSync(tempHtmlPath, html);

    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: 'new'
    });
    const page = await browser.newPage();

    // Load HTML file
    await page.goto(`file:${tempHtmlPath}`, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfPath = path.join(__dirname, '../public/samples/sample-story.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    // Close browser and delete temp HTML file
    await browser.close();
    fs.unlinkSync(tempHtmlPath);

    console.log(`PDF generated successfully at: ${pdfPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

// Run the function
generatePDF();
