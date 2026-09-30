import ReviewsDAO from '../dao/reviewsDAO.js';

export default class ReviewsController{

    static async apiGetReview(req,res,next){
        let reviews = await ReviewsDAO.getReviews();
        return res.json({reviews: reviews});
    }

    static async apiPostReview(req,res,next){
        try{
            const movieId = req.body.movie_id;
            const review = req.body.text;
            const email = req.body.email;
            const userInfo = {
                name: req.body.name,
                _id: req.body.user_id
            }

            const date = new Date();

            const ReviewResponse = await ReviewsDAO.addReview(
                movieId,
                userInfo,
                review,
                date,
                email
            );

            res.json({status: ReviewResponse});

        }
        catch(e){
            res.status(500).json({error: e.message});
        }
    };

    static async apiUpdateReview(req,res,next){
        try{
            const reviewId = req.body.review_id;
            const review = req.body.text;

            const date = new Date();

            const ReviewResponse = await ReviewsDAO.updateReview(
                reviewId,
                req.body.user_id,
                review,
                date
            );

            var {error} = ReviewResponse;
            if(error){
                res.status(500).json({error});
            }

            if(ReviewResponse.modifiedCount === 0){
                throw new Error('Unable to update review. User may not be the original poster');
            }

            res.json({status: 'success'});

        }
        catch(e){
            res.status(500).json({error: e.message});
        }
    }

    static async apiDeleteReview(req,res,next){
        try{
            const reviewId = req.body.review_id;
            const userId = req.body.user_id;
            const ReviewReponse = await ReviewsDAO.deleteReview(
                reviewId,
                userId
            );

            const {error} = ReviewReponse;
            if(error){
                res.status(500).json({error});
            }

            res.json({status: 'success'});

        }
        catch(e){
            res.status(500).json({error: e.message});
        }
    }

}