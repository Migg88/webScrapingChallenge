import express from 'express'
import cors from 'cors';
import fetch from 'node-fetch';


const app = express();
const port = 3000; 

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.get('/getAirbnbHtml/:id', async (req, res) => {
    const modal = 'PHOTO_TOUR_SCROLLABLE';
    const airbnbUrl = `https://www.airbnb.mx/rooms/${req.params.id}?modal=PHOTO_TOUR_SCROLLABLE`;
    
    try {
        const response = await fetch(airbnbUrl);
        console.log(JSON.stringify(await response.text(),null, 2));
        //res.send(await response.text());
    } catch (error) {
        res.status(500).send('Error fetching Airbnb HTML');
    }
});

app.listen(port, () => {
    console.log(`Proxy server listening at http://localhost:${port}`);
});