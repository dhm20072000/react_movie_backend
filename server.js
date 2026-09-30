import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import movies from './api/movies.route.js';

const app = express();

app.use(cors());
// app.use(bodyParser.json({limit: '50mb'}));
// app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/v1/movies', movies);
app.use('*', (req,res) => {
    res.status(400).json({error: 'not found'});
});

export default app;
