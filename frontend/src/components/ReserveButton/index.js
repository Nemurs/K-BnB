import { useHistory } from 'react-router-dom';
import "./ReserveButton.css";

const ReserveButton = ({spotId}) => {
    const history = useHistory();

    function onClick(){
        history.push(`/reserve/${spotId}`)
    }
    return (
        <button
            className="reserve-button"
            onClick={onClick}
        >
            Reserve
        </button>
    )
}

export default ReserveButton;
