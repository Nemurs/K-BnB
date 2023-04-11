const PriceText = ({spot}) => {
    return (
        <p className='text-price' style={{fontWeight:"bold"}}>{`$${Math.round(spot.price)}`}<span style={{fontWeight:"normal"}}> night</span></p>
    )
}

export default PriceText;
