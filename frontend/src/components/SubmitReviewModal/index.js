import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal.js";
import StarRatingInput from "../StarRatingInput";
import "./SubmitReviewModal.css";
import { createNewReviewThunk, loadAllReviewsThunk } from "../../store/singleSpotReviews.js";
import { loadOneThunk } from "../../store/singleSpot.js";

function SubmitReviewModal({spotId, user}) {
    const dispatch = useDispatch();
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(5);
    const { closeModal } = useModal();

    const handleSubmit = async (e) => {
        e.preventDefault();

        let res = await dispatch(createNewReviewThunk({spotId: Number(spotId), body:{review:reviewText, stars:rating}, user}));

        if(!res.ok){
            console.log(await res.json());
            // console.log(spots);
        } else {
            await dispatch(loadAllReviewsThunk(spotId));
            await dispatch(loadOneThunk(spotId));
            closeModal();
        }
    };

    const onChange = (number) => {
        setRating(number);
    };

    return (
        <div className="submit-review-modal">
            <h1>How was your Stay?</h1>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    name='reviewText'
                    placeholder='Leave your review here...'
                    rows='10'
                ></textarea>
                <div className="star-rating-field">
                    <StarRatingInput
                        disabled={false}
                        onChange={onChange}
                        rating={rating}
                    />
                    <label >
                        Stars
                    </label>
                </div>
                <button type="submit">Submit Your Review</button>
            </form>
        </div>
    );
}

export default SubmitReviewModal;
