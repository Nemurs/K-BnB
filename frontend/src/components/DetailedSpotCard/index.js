import { useParams } from "react-router-dom";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadOneThunk } from "../../store/singleSpot";
import placeHolderImage from "../../Assets/Images/No-Image-Placeholder.png";
import "./DetailedSpotCard.css";

const DetailedSpotCard = () => {
    const dispatch = useDispatch();
    const {id} = useParams();
    const spot = useSelector(state => state.spots.singleSpot);

    useEffect(() => {
        dispatch(loadOneThunk(id));
    }, [dispatch]);

    if(!spot) return (<h1>Spot: {id} Loading...</h1>)

    const previewImage = spot.SpotImages.find(img => img?.preview === true);
    const otherImages = spot.SpotImages.filter(img => img?.preview !== true);

    console.log(otherImages)
    return (
        <div className="detailed-spot-card">
            <h1>{spot.name}</h1>
            <div className="detailed-spot-card-img-wrapper">
                <div className="detailed-spot-card-img-wrapper-left">
                    <img src={previewImage ? previewImage.url : placeHolderImage} className="detailed-spot-card-preview-img"/>
                </div>
                <div className="detailed-spot-card-img-wrapper-right">
                    <img src={otherImages && otherImages[0] ? otherImages[0].url : placeHolderImage} className="detailed-spot-card-img"/>
                    <img src={otherImages && otherImages[1] ? otherImages[1].url : placeHolderImage} className="detailed-spot-card-img"/>
                    <img src={otherImages && otherImages[2] ? otherImages[2].url : placeHolderImage} className="detailed-spot-card-img"/>
                    <img src={otherImages && otherImages[3] ? otherImages[3].url : placeHolderImage} className="detailed-spot-card-img"/>
                </div>
            </div>
        </div>
    )
}

export default DetailedSpotCard;
