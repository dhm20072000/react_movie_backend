import MoviesDAO from '../dao/moviesDAO.js'
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';

export default class MoviesController{

    static async apiGetAllMovies(req,res,next){

        const filters= {
            title: req.body.title,
            rated: req.body.rated,
        };

        const page = req.body.page;

        const {moviesList, totalNumMovies} = await MoviesDAO.getAllMovies({filters,page});
        const response = {
            movies: moviesList,
            total_results: totalNumMovies
        };
        res.json(response);
    }

    static async apiGetMovies(req,res,next){
        const moviesPerPage = req.query.moviesPerPage ? parseInt(req.query.moviesPerPage) : 20;
        const page = req.query.page ? parseInt(req.query.page) : 0;

        let filters = {};
        if(req.query.rated){
            filters.rated = req.query.rated;
        }
        else if(req.query.title){
            filters.title = req.query.title;
        }

        const { moviesList, totalNumMovies } = await MoviesDAO.getMovies({filters, page, moviesPerPage});
        let response = {
            movies: moviesList,
            page: page,
            filters: filters,
            entries_per_page: moviesPerPage,
            total_results: totalNumMovies
        };
        res.json(response);
    };

    // static async getIMDBMovieDetails(req,res,next){
    //     try{
    //         const title = req.query.title;
    //         const movieDetails = await MoviesDAO.getIMDBMovieDetails(title);
    //         res.json(movieDetails);
    //     }
    //     catch(e){
    //         console.log(e);
    //         res.status(500).json({error: e});
    //     }
    // }

    static async apiGetMovieById(req,res,next){
        try{
            let id = req.params.id || {};
            let movie = await MoviesDAO.getMovieById(id);
            if(!movie){
                res.status(404).json({error: 'Not found'});
                return;
            }
            res.json(movie);
        }
        catch(e){
            console.log(`api, ${e}`);
            res.status(500).json({error: e});
        }
    };

    static async apiGetRatings(req,res,next){
        try{
            let propertyTypes = await MoviesDAO.getRatings();
            res.json(propertyTypes);
        }
        catch(e){
            console.log(`api, ${e}`);
            res.status(500).json({error: e});
        }
    }

    static async getScrapedImages(req,res,next){
        const id = req.params.id;
        const idWithZeros = MoviesController.padWithLeadingZeros(id,7);
        // const url = `https://www.imdb.com/title/tt${idWithZeros}/`;
        let ImageSrcs = [];
        const pages = 5;
        let options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
            }
        };
        try{
            for(let i = 1;i <= pages;i++){
                await axios.get(`https://www.imdb.com/title/tt${idWithZeros}/mediaindex?page=${i}`,options).then((response) => {
                    const body = response.data;
                    const $ = cheerio.load(body);
                    $('#media_index_thumbnail_grid a img').each((index,el) => {
                        let img = el.attribs['src'].split('_')[0];
                        ImageSrcs.push(img + 'jpg'); // $(el).attr('src')
                    });
                }).catch(e => {
                    // console.log(e);
                })
                
            }
            
            res.json(ImageSrcs);
        }
        catch(e){
            console.log(e);
            res.status(500).json({error: e});
        }
    }

    static async getScrapedActors(req,res,next){
        const id = req.params.id;
        const idWithZeros = MoviesController.padWithLeadingZeros(id,7);
        const url = `https://www.imdb.com/title/tt${idWithZeros}/`;
        // const url = idLength > 6 ? `https://www.imdb.com/title/tt${id}/` : idLength > 5 ? `https://www.imdb.com/title/tt0${id}/` : `https://www.imdb.com/title/tt00${id}/`;
        let ActorSrcs = [];
        let options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
            }
        };
        try{
            await axios.get(url,options).then((response) => {
                const body = response.data;
                const $ = cheerio.load(body);
                let actorDetails;
                $('[data-testid="title-cast-item"]').each((index,el) => {
                    if($(el).find('img').length > 0){
                        actorDetails = {
                            image: $(el).find('img').attr('src'),
                            href: 'https://www.imdb.com' + $(el).find('[data-testid="title-cast-item__actor"]').attr('href'),
                            name: $(el).find('[data-testid="title-cast-item__actor"]').text(),
                            character: $(el).find('.title-cast-item__char span').text()
                        }
                    }
                    else{
                        actorDetails = {
                            image: 'No Image',
                            href: 'https://www.imdb.com' + $(el).find('[data-testid="title-cast-item__actor"]').attr('href'),
                            name: $(el).find('[data-testid="title-cast-item__actor"]').text(),
                            character: $(el).find('.title-cast-item__char span').text()
                        }
                    }
                    // href: 'https://www.imdb.com' + $(el).find('a').attr('href'),
                    // name: $(el).find('a').attr('aria-label'),
                    ActorSrcs.push(actorDetails);
                })
            }).catch(e => {

            });
            res.json(ActorSrcs);
        }
        catch(e){
            console.log(e);
            res.status(500).json({error: e});
        }
    }

    static async getScrapedTrailers(req,res,next){
        const id = req.params.id;
        const idWithZeros = MoviesController.padWithLeadingZeros(id,7);
        let TrailerSrcs = [];
        const pages = 5;
        let options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
            }
        };
        try{
            for(var i = 1;i <= pages;i++){
                await axios.get(`https://www.imdb.com/title/tt${idWithZeros}/videogallery?page=${i}`,options).then((response) => {
                    const body = response.data;
                    const $ = cheerio.load(body);
                    $('#video_gallery_content .search-results ol li h2 a').each((index,el) => {
                        // console.log($(el).attr('href'));
                        TrailerSrcs.push(el.attribs['href'].split('/')[2]);
                    });
                }).catch(e => {

                })
            }
            res.json([...new Set(TrailerSrcs)]);
        }
        catch(e){
            console.log(e);
            res.status(500).json({error: e});
        }
    }

    static padWithLeadingZeros(num, totalLength){
        const numStr = '' + num;
        return numStr.padStart(totalLength, '0');
    }

}