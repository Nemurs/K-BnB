import "./ReserveButton.css";

const ReserveButton = () => {
    function onClick(){
        alert("Feature Coming Soon");
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
