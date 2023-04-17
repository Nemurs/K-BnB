import "./ReviewAggText.css";

const ReviewAggText = ({ spot, includeReviewCount, style}) => {
    return (
        <div className={`review-agg-text ${style === 'large' ? "large" :""}`}>
            <span className='review-agg-text-rating'>
                <i className='fas fa-star'></i>
                {` ${spot.avgRating ? Number.parseFloat(spot.avgRating).toFixed(2) : "New"}`}
            </span>
            {includeReviewCount && spot.numReviews != 0 && <span className='review-agg-text-review-count'>
                {`· ${spot.numReviews} review${spot.numReviews == 1 ?"":"s"}`}
            </span>}
        </div>
    )
}

export default ReviewAggText;
