import PriceText from "../PriceText";
import ReserveButton from "../ReserveButton";
import ReviewAggText from "../ReviewAggText";
import "./ReserveSpot.css";

const ReserveSpot = ({spot, isSpotOwnedByLoggedInUser}) => {
    return (
        <div className="reserve-spot">
            <div className="reserve-spot-top">
                <PriceText spot={spot}/>
                <ReviewAggText  spot={spot} includeReviewCount={true} />
            </div>
            {isSpotOwnedByLoggedInUser? <button className="reserve-button" style={{cursor:"not-allowed"}}>Manage Bookings</button> : <ReserveButton spotId={spot.id}/>}
        </div>
    )
}

export default ReserveSpot;
