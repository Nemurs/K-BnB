import { useParams } from "react-router-dom";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadOneThunk } from "../../store/singleSpot";

const DetailedSpotCard = () => {
    const dispatch = useDispatch();
    const {id} = useParams();
    const spot = useSelector(state => Object.values(state.spots.singleSpot));


    useEffect(() => {
        dispatch(loadOneThunk(id));
    }, [dispatch]);

    console.log(id)
    console.log(spot)
    return (
        <h1>{`Spot: ${id}`}</h1>
    )
}

export default DetailedSpotCard;
