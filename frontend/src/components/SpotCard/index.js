import { Tooltip } from 'react-tooltip'
import PriceText from '../PriceText'
import "./SpotCard.css";
import ReviewAggText from '../ReviewAggText';

const SpotCard = ({spot, tooltip}) => {
  return (
    <div className='spot-card'
    data-tooltip-id="my-tooltip"
    data-tooltip-content={tooltip}
    >
      <img src={spot.previewImage} alt={spot.name} className='spot-card-img'/>
      <div className='spot-card-text'>
        <div className='spot-card-text-left'>
            <p className='spot-card-text-city-name'>{`${spot.city}, ${spot.state}`}</p>
            <PriceText spot={spot}/>
        </div>
        <div className='spot-card-text-right'>
           <ReviewAggText spot={spot} includeReviewCount={false}/>
        </div>
      </div>
      <Tooltip id="my-tooltip" />
    </div>
  );
};

export default SpotCard;
