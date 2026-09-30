import express from 'express';
import MoviesController from './movies.controller.js';
import ReviewsController from './reviews.controller.js';

const router = express.Router();
router.route('/').get(MoviesController.apiGetMovies);
router.route('/all').post(MoviesController.apiGetAllMovies);
// router.route('/getIMDBMovieDetails').get(MoviesController.getIMDBMovieDetails);
router.route('/getMovieImages/:id').get(MoviesController.getScrapedImages);
router.route('/getActorDetails/:id').get(MoviesController.getScrapedActors);
router.route('/getTrailers/:id').get(MoviesController.getScrapedTrailers);
router.route('/id/:id').get(MoviesController.apiGetMovieById);
router.route('/ratings').get(MoviesController.apiGetRatings);
router.route('/review')
.get(ReviewsController.apiGetReview)
.post(ReviewsController.apiPostReview)
.put(ReviewsController.apiUpdateReview)
.delete(ReviewsController.apiDeleteReview);

export default router;