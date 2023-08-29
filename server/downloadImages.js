import puppeteer from 'puppeteer';
import https from 'https'
import fs from 'fs'
import path from 'path';
import { v4 as uuidv4 } from 'uuid'

async function processImages (page){
  const selector = 'div[data-testid="photo-viewer-section"] button[id^="scrollTo"]';
  
  try {

    await page.waitForSelector(selector);

    const elements = await page.$$(selector);
    const imageUrls = [];

    // iterate for all the childrend finded with the selector
    for (const child of elements) {
      // wait for the div with img rol in dom
      await child.waitForSelector('div[role="img"]');
      // set autoscrolling because it has lazy loading
      await child.$eval('div[role="img"]:last-child', e => {
        e.scrollIntoView();
      });
      // setting a timer to ensure that pictures elements are loaded
      await new Promise(resolve => setTimeout(resolve, 500));
      const pictures = await child.$$('picture');
      // iterate through divs that has picture attribute
      for (const picture of pictures) {
        // wait for img to load
        const img = await picture.$('img');
        //get all the images elemnts 
        const imgAttrs = await img.evaluate(el => {
          return {
            alt: el.getAttribute('alt'),
            src: el.getAttribute('src')
          };
        });
        console.log(imgAttrs);
        // push it to imageUrls Array
        imageUrls.push(imgAttrs.src);
      }
    }

    return imageUrls;

  } catch (error) {
    throw error;
  }
}

async function getImages(roomId) {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  try {
    await page.goto(`https://www.airbnb.mx/rooms/${roomId}?modal=PHOTO_TOUR_SCROLLABLE`);
    const imageUrls = await processImages(page);

    //for every image url in the array download it
    imageUrls.map(image => downloadImage(image));

    return imageUrls;

  } catch (error) {
    throw error;
  } finally {
    await browser.close();
  }
}

const getImagess = async () => {

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(`https://www.airbnb.mx/rooms/661458889608859517?modal=PHOTO_TOUR_SCROLLABLE`);

  const selector = 'div[data-testid="photo-viewer-section"] button[id^="scrollTo"]';

  // Get element

  let elements;
  try {
    await page.waitForSelector(selector);
    elements = await page.$$(selector);
  } catch (error) {
    throw error
  }

  // img elements Array
  const imageUrls = [];
  try {
    // iterate for all the childrend finded with the selector
    for (const child of elements) {
      // wait for the div with img rol in dom
      await child.waitForSelector('div[role="img"]');
      // set autoscrolling because it has lazy loading
      await child.$eval('div[role="img"]:last-child', e => {
        e.scrollIntoView();
      });
      // setting a timer to ensure that pictures elements are loaded
      await new Promise(resolve => setTimeout(resolve, 500));
      const pictures = await child.$$('picture');
      // iterate through divs that has picture attribute
      for (const picture of pictures) {
        // wait for img to load
        const img = await picture.$('img');
        //get all the images elemnts 
        const imgAttrs = await img.evaluate(el => {
          return {
            alt: el.getAttribute('alt'),
            src: el.getAttribute('src')
          };
        });
        console.log(imgAttrs);
        // push it to imageUrls Array
        imageUrls.push(imgAttrs.src);
      }
    }
  } catch (error) {
    throw error
  }
  //for every image url in the array download it
  imageUrls.map(image => downloadImage(image));

  await browser.close();
};

function isValidImageExtension(extension) {
  const acceptedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'];
  return acceptedExtensions.includes(extension.toLowerCase());
}

function getCleanExtension(url) {
  const extensionMatch = url.match(/\.([a-z0-9]+)(\?.*)?$/i);
  if (extensionMatch) {
    const extension = `.${extensionMatch[1]}`;
    return isValidImageExtension(extension) ? extension : '';
  }
  return '';
}

function downloadImage(imageUrl) {
  //cleant extension
  const extension = getCleanExtension(imageUrl);
  //generate a file name
  const uniqueFilename = `${uuidv4()}${extension}`;
  const publicFolderPath = path.join('public');

  if (!fs.existsSync(publicFolderPath)) {
    fs.mkdirSync(publicFolderPath);
  }

  const downloadPath = path.join(publicFolderPath, uniqueFilename);
  //create a file stream
  const fileStream = fs.createWriteStream(downloadPath);

  //get images and save it
  https.get(imageUrl, (response) => {
    response.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Image downloaded as ${uniqueFilename}`);
    });
  }).on('error', (err) => {
    fs.unlink(downloadPath, () => { });
    console.error('Error downloading image:', err);
  });
}

export default getImages;
