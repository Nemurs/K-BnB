import { useModal } from "../../context/Modal.js";
import { useDispatch } from 'react-redux';
import { deleteReviewThunk, loadAllReviewsThunk } from '../../store/singleSpotReviews.js';
import { loadOneThunk } from "../../store/singleSpot";
import "./DeleteReviewModal.css";

const DeleteReviewModal = ({revId, spotId}) => {

    const dispatch = useDispatch();
    const { closeModal } = useModal();

    async function onClickYes(e){
        e.preventDefault();
        let res = await dispatch(deleteReviewThunk(revId))
        if(res.ok){
            closeModal();
            await dispatch(loadAllReviewsThunk(spotId));
            await dispatch(loadOneThunk(spotId));
        }
    }

    return (
        <div className="delete-review-modal">
            <h2>Are you sure?</h2>
            <button className="delete-review-modal-button-yes" onClick={onClickYes}>{"YES (Delete Review)"}</button>
            <button className="delete-review-modal-button-no" onClick={closeModal}>{"NO (Keep Review)"}</button>
        </div>
    )
}

export default DeleteReviewModal;
