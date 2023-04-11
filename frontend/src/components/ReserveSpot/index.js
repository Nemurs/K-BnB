import PriceText from "../PriceText";
import ReserveButton from "../ReserveButton";
import ReviewAggText from "../ReviewAggText";
import "./ReserveSpot.css";

const ReserveSpot = ({spot}) => {
    return (
        <div className="reserve-spot">
            <div className="reserve-spot-top">
                <PriceText spot={spot}/>
                <ReviewAggText  spot={spot} includeReviewCount={true} />
            </div>
            <ReserveButton/>
        </div>
    )
}

export default ReserveSpot;
