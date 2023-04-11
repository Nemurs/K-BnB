import "./ReviewAggText.css";

const ReviewAggText = ({ spot, includeReviewCount}) => {
    return (
        <div className="review-agg-text">
            <span className='review-agg-text-rating'>
                <i className='fas fa-star'></i>
                {` ${spot.avgRating ? Number.parseFloat(spot.avgRating).toFixed(2) : "New"}`}
            </span>
            {includeReviewCount && <span className='review-agg-text-review-count'>
                {`${spot.numReviews} reviews`}
            </span>}
        </div>
    )
}

export default ReviewAggText;
