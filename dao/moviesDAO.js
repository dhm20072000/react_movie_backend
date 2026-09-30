import { ObjectId } from "mongodb";
import axios from 'axios';
import movieTrailer from 'movie-trailer';

let movies;

export default class MoviesDAO{
    static async injectDB(conn){
        if(movies){
            return;
        }
        try{
            movies = await conn.db(process.env.MOVIEREVIEWS_NS).collection('movies');
        }
        catch(e){
            console.error(`Unable to connect in MoviesDAO: ${e}`);
        }
    };

    static async getAllMovies({filters,page}){
        let cursor, query;

        if(filters.title !== '' && filters.rated === 'All Ratings'){
            query = {"title": {$regex: filters['title'], $options: 'i'}};
        }
        else if(filters.title === '' && filters.rated === 'All Ratings'){
            query = {};
        }
        else if(filters.title === '' && filters.rated !== 'All Ratings'){
            query = {"rated": {$eq: filters['rated']}};
        }
        else{
            query = {"title": {$regex: filters['title'], $options: 'i'}, "rated": {$eq: filters['rated']}};
        }

        try{
            cursor = await movies.find(query).limit(20).skip((page - 1) * 20);
            const moviesList = await cursor.toArray();
            const totalNumMovies = await movies.countDocuments(query);
            return {moviesList, totalNumMovies};
        }
        catch(e){
            console.log(e);
            return {e};
        }
    }

    // static async getIMDBMovieDetails(title){
    //     try{
    //         movieTrailer(title).then(response => {
    //             console.log(response);
    //             return response;
    //         });
    //     }
    //     catch(e){
    //         console.log(e);
    //         return {e};
    //     }
        
    // }

    static async getMovies({
        filters = null,
        page = 0,
        moviesPerPage = 20
    } = {}){
        let query;
        if(filters){
            if('title' in filters){
                query = {$text: {$search: filters['title']}};
            }
            else{
                query = {"rated": {$eq: filters['rated']}};
            }
        }
        let cursor;
        try{
            cursor = await movies.find(query).limit(moviesPerPage).skip(moviesPerPage * page);
            const moviesList = await cursor.toArray();
            const totalNumMovies = await movies.countDocuments(query);
            return {moviesList, totalNumMovies}
        }
        catch(e){
            console.error(`Unable to issue find command, ${e}`);
            return {moviesList: [], totalNumMovies: 0};
        }
    };

    static async getMovieById(id){
        try{
            return await movies.aggregate([
                {
                    $match:{
                        _id: new ObjectId(id)
                    }
                },
                {$lookup:
                    {
                        from: 'comments',
                        localField: '_id',
                        foreignField: 'movie_id',
                        as: 'comments'
                    }
                }
            ]).next();
        }
        catch(e){
            console.error(`Something went wrong in getMovieById: ${e}`);
            throw e;
        }
    }

    static async getRatings(){
        let ratings = [];
        try{
            ratings = await movies.distinct('rated');
            return ratings;
        }
        catch(e){
            console.error(`Unable to get rating, ${e}`);
            return ratings;
        }
    };

};