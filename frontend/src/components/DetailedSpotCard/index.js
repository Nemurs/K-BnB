import { useParams } from "react-router-dom";

const DetailedSpotCard = () => {
    const {id} = useParams();
    console.log(id)
    return (
        <h1>{`Spot: ${id}`}</h1>
    )
}

export default DetailedSpotCard;
