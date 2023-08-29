import express, { text } from 'express'
import cors from 'cors';
import jsdom from 'jsdom';
import getImages from './downloadImages.js';

const app = express();
const port = 3000; 
const { JSDOM } = jsdom;

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.get('/getAirbnbHtml/:id', async (req, res) => {
    const modal = 'PHOTO_TOUR_SCROLLABLE';
    const airbnbUrl = `https://www.airbnb.mx/rooms/${req.params.id}?modal=PHOTO_TOUR_SCROLLABLE`;
    
    try {
        const images = await getImages(req.params.id);
        res.send(JSON.stringify(images, null, 2));

    } catch (error) {
        res.status(500).send('Error fetching Airbnb HTML', error);
    }
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});