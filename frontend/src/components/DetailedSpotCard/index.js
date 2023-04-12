import { useParams } from "react-router-dom";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadOneThunk } from "../../store/singleSpot";
import placeHolderImage from "../../Assets/Images/No-Image-Placeholder.png";
import "./DetailedSpotCard.css";
import ReserveSpot from "../ReserveSpot";

const DetailedSpotCard = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const spot = useSelector(state => state.spots.singleSpot);
    const user = useSelector(state => state.session.user)

    useEffect(() => {
        dispatch(loadOneThunk(id));
    }, [dispatch]);

    if (!spot || !spot.Owner) return (<h1>Spot: {id} Loading...</h1>)

    const previewImage = spot.SpotImages?.find(img => img?.preview === true);
    const otherImages = spot.SpotImages?.filter(img => img?.preview !== true);

    return (
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
                    <p className='detailed-spot-card-host-text'>{user && user.id && user.id === spot.Owner.id ? `Hosted by You`: `Hosted by ${spot.Owner.firstName} ${spot.Owner.lastName}`}</p>
                    <p className='detailed-spot-card-description-text'>{spot.description}</p>
                </div>
                <ReserveSpot spot={spot} />
            </div>
        </div>
    )
}

export default DetailedSpotCard;
