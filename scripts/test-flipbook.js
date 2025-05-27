// Test script for flipbook viewer
import puppeteer from 'puppeteer';

async function testFlipbookViewer() {
  console.log('Starting flipbook viewer test...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    
    // Navigate to the story view page
    console.log('Navigating to the story page...');
    await page.goto('http://localhost:5174/view-story/1', { waitUntil: 'networkidle2' });
    
    // Wait for the flipbook viewer to load
    await page.waitForSelector('[data-testid="flipbook-viewer"]', { timeout: 10000 });
    console.log('Flipbook viewer loaded successfully');
    
    // Take a screenshot of the first page (single page)
    console.log('Taking screenshot of the first page...');
    await page.screenshot({ path: './first-page.png' });
    
    // Navigate to the second page
    console.log('Navigating to the second page...');
    const nextButton = await page.$('[aria-label="Next page"]');
    await nextButton.click();
    
    // Wait for the animation to complete
    await page.waitForTimeout(1000);
    
    // Take a screenshot of the second page (should be a double-page spread)
    console.log('Taking screenshot of the second page...');
    await page.screenshot({ path: './second-page.png' });
    
    // Navigate to the last page
    console.log('Trying to navigate to the last page...');
    const lastPageButton = await page.$('[aria-label="Last page"]');
    await lastPageButton.click();
    
    // Wait for the animation to complete
    await page.waitForTimeout(1000);
    
    // Take a screenshot of the last page (single page)
    console.log('Taking screenshot of the last page...');
    await page.screenshot({ path: './last-page.png' });
    
    console.log('Test completed successfully!');
    console.log('Screenshots saved: first-page.png, second-page.png, last-page.png');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testFlipbookViewer();