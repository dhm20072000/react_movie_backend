import mongodb, { ObjectId } from 'mongodb';

const objectId = mongodb.ObjectId;

let reviews;

export default class ReviewDao{
    static async injectDB(conn){
        if(reviews){
            return;
        }
        try{
            reviews = await conn.db(process.env.MOVIEREVIEWS_NS).collection('comments');
        }
        catch(e){
            console.error(`Unable to establish connection handle in reviewDAO: ${e}`);
        }
    };

    static async getReviews(){
        return await reviews.find().toArray();
    }

    static async addReview(movieId,user,review,date,email){
        try{
            const reviewDoc = {
                name: user.name,
                user_id: user._id,
                date: date,
                text: review,
                email: email,
                movie_id: new objectId(movieId)
            };
            return await reviews.insertOne(reviewDoc);
        }
        catch(e){
            console.error(`Unable to post review: ${e}`);
            return {error: e};
        }
    };

    static async updateReview(reviewId,userId,review,date){
        try{
            const updateResponse = await reviews.updateOne(
                {user_id: userId, _id: new objectId(reviewId)},
                {$set:{text: review, date: date}}
            );
            return updateResponse;
        }
        catch(e){
            console.error(`Unable to update review: ${e}`);
            return {error: e};
        }
    };

    static async deleteReview(reviewId,userId){
        try{
            const deleteResponse = await reviews.deleteOne({
                _id: new objectId(reviewId),
                user_id: userId
            });
            return deleteResponse;
        }
        catch(e){
            console.error(`Unable to delete review: ${e}`);
            return {error: e};
        }
    }

}