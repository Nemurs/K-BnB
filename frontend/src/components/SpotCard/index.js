import "./SpotCard.css";

const SpotCard = ({spot}) => {
  return (
    <div className='spot-card'>
      <img src={spot.previewImage} alt={spot.name} className='spot-card-img'/>
      <div className='spot-card-text'>
        <div className='spot-card-text-left'>
            <p className='spot-card-text-city-name'>{`${spot.city}, ${spot.state}`}</p>
            <p className='spot-card-text-price' style={{fontWeight:"bold"}}>{`$${Math.round(spot.price)}`}<span style={{fontWeight:"normal"}}> night</span></p>
        </div>
        <div className='spot-card-text-right'>
            <p className='spot-card-text-rating'><i className='fas fa-star'></i>{` ${Number.parseFloat(spot.avgRating).toFixed(2)}`}</p>
        </div>
      </div>
    </div>
  );
};

export default SpotCard;
