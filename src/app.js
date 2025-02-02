import express from 'express';
import cors from 'cors';
import faqRoutes from './routes/faq.routes.js';
import {redisClient} from './middleware/cache.middleware.js';

const app = express();


app.use(cors()); 
app.use(express.json()); 


app.use('/api/faqs', faqRoutes);
app.get('/api', (req, res) => {
    res.send('API is running...');
});


app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});


app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});


process.on('SIGINT', async () => {
    console.log('Closing connections...');
    try {
        if (redisClient) {
            await redisClient.quit();
            console.log('Redis connection closed');
        }
    } catch (error) {
        console.error('Error during shutdown:', error);
    }
    process.exit(0);
});


export default app;
