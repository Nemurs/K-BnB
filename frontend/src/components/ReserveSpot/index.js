import PriceText from "../PriceText";
import ReserveButton from "../ReserveButton";
import ReviewAggText from "../ReviewAggText";
import "./ReserveSpot.css";

const ReserveSpot = ({spot, user, isSpotOwnedByLoggedInUser, isBooked}) => {
    return (
        <div className="reserve-spot">
            <div className="reserve-spot-top">
                <PriceText spot={spot}/>
                <ReviewAggText  spot={spot} includeReviewCount={true} />
            </div>
            {isSpotOwnedByLoggedInUser? <button className="reserve-button" style={{cursor:"not-allowed"}}>Manage Bookings</button> : <ReserveButton spotId={spot.id} isDisabled={Object.is(user, null)} isBooked={isBooked} />}
        </div>
    )
}

export default ReserveSpot;
