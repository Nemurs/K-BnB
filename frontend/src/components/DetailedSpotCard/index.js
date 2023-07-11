import { useParams } from "react-router-dom";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadOneThunk } from "../../store/singleSpot";
import { loadOneBookingThunk } from '../../store/singleBooking';
import { loadAllReviewsThunk } from "../../store/singleSpotReviews";
import placeHolderImage from "../../Assets/Images/No-Image-Placeholder.png";
import ReserveSpot from "../ReserveSpot";
import ReviewAggText from "../ReviewAggText";
import OpenModalButton from "../OpenModalButton";
import DeleteReviewModal from "../DeleteReviewModal";
import SubmitReviewModal from "../SubmitReviewModal";
import "./DetailedSpotCard.css";

const DetailedSpotCard = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const spot = useSelector(state => state.spots.singleSpot);
    const user = useSelector(state => state.session.user);
    const reviews = useSelector(state => Object.values(state.reviews.spot));
    reviews.sort((a, b) => Date.parse(b["createdAt"]) - Date.parse(a["createdAt"]));
    const booking = useSelector(state => state.bookings.singleBooking)
    const isBooked = !booking.expired && Object.values(booking).length > 0;

    function processDate(dateString) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Augus', 'September', 'October', 'November', 'December']
        let date = new Date(dateString);
        return `${months[date.getMonth() - 1]} ${date.getFullYear()}`;
    }

    useEffect(() => {
        dispatch(loadOneThunk(id));
        dispatch(loadAllReviewsThunk(id));
        dispatch(loadOneBookingThunk(id));
    }, [dispatch]);

    if (!spot || !spot.Owner) return (<h1>Spot: {id} Loading...</h1>)

    const previewImage = spot.SpotImages?.find(img => img?.preview === true);
    const otherImages = spot.SpotImages?.filter(img => img?.preview !== true);

    let isSpotOwnedByLoggedInUser = user && user.id && user.id === spot.Owner.id;

    let isReviewedByLoggedInUser = user && user.id && reviews.length && reviews.find(rev => user.id === rev?.User?.id);

    return (
        <div className="detailed-spot-page">
            <div className="detailed-spot-card">
                <h1>{spot.name}</h1>
                <p className='detailed-spot-card-location-text'>{spot.city}, {spot.state}, {spot.country}</p>
                <div className="detailed-spot-card-img-wrapper">
                    <div className="detailed-spot-card-img-wrapper-left">
                        <img src={previewImage ? previewImage.url : placeHolderImage} className="detailed-spot-card-preview-img" />
                    </div>
                    <div className="detailed-spot-card-img-wrapper-right">
                        <img src={otherImages && otherImages[0] ? otherImages[0].url : placeHolderImage} className="detailed-spot-card-img" />
                        <img src={otherImages && otherImages[1] ? otherImages[1].url : placeHolderImage} className="detailed-spot-card-img" />
                        <img src={otherImages && otherImages[2] ? otherImages[2].url : placeHolderImage} className="detailed-spot-card-img" />
                        <img src={otherImages && otherImages[3] ? otherImages[3].url : placeHolderImage} className="detailed-spot-card-img" />
                    </div>
                </div>
                <div className="detailed-spot-card-bottom">
                    <div className='detailed-spot-card-host-description'>
                        <p className='detailed-spot-card-host-text'>{isSpotOwnedByLoggedInUser ? `Hosted by You` : `Hosted by ${spot?.Owner?.firstName} ${spot?.Owner?.lastName}`}</p>
                        <p className='detailed-spot-card-description-text'>{spot.description}</p>
                    </div>
                    <ReserveSpot spot={spot} {...{ user, isSpotOwnedByLoggedInUser, isBooked }} />
                </div>
            </div>
            <div className="detailed-spot-reviews">
                <ReviewAggText spot={spot} includeReviewCount={true} style={"large"} />
                {user && !(isSpotOwnedByLoggedInUser || isReviewedByLoggedInUser) && <OpenModalButton
                    buttonText="Post Your Review"
                    cssClass={"detailed-spot-post-review-button"}
                    modalComponent={<SubmitReviewModal spotId={spot.id} user={user}
                    />}
                />}
                {!reviews.length && user && !(isSpotOwnedByLoggedInUser || isReviewedByLoggedInUser) && <p>Be the first to post a review!</p>}
                <ul className="review-list">
                    {reviews.length ? reviews.map((rev) => (
                        <li key={rev["id"]} className='review-list-item'>
                            <h3>{rev.User.firstName}</h3>
                            <h4>{processDate(rev.updatedAt)}</h4>
                            <p className="review-text">{rev.review}</p>
                            {user && user.id === rev.User.id ?
                                <div className="review-modal-button-wrapper">
                                    <OpenModalButton
                                        buttonText="Edit"
                                        cssClass="detailed-spot-post-review-button"
                                        modalComponent={<SubmitReviewModal spotId={spot.id} user={user} isEdit={true} oldReview={rev}/>}
                                    />
                                    <OpenModalButton
                                        buttonText="Delete"
                                        cssClass={"detailed-spot-post-delete-button"}
                                        modalComponent={<DeleteReviewModal revId={rev.id} spotId={spot.id} />}
                                    />
                                </div>
                                : <></>}
                        </li>
                    )) : <></>}
                </ul>
            </div>
        </div>
    )
}

export default DetailedSpotCard;
