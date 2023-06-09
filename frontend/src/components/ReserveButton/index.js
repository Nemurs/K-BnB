import { useHistory } from 'react-router-dom';
import "./ReserveButton.css";

const ReserveButton = ({spotId, isDisabled, isBooked}) => {
    const history = useHistory();

    function onClick(){
        history.push(`/reserve/${spotId}`)
    }
    return (
        <button
            className={`reserve-button ${isDisabled?"disabled-button":""}`}
            onClick={onClick}
            disabled={isDisabled}
        >
            {isBooked ? "Update Reservation": "Reserve"}
        </button>
    )
}

export default ReserveButton;
