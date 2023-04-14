import { useModal } from "../../context/Modal.js";
import { useDispatch, useSelector } from 'react-redux';
import { deleteReviewThunk, loadAllReviewsThunk } from '../../store/singleSpotReviews.js';
import { loadOneThunk } from "../../store/singleSpot";

const DeleteReviewModal = ({revId, spotId}) => {
    console.log(revId, spotId)
    const dispatch = useDispatch();
    const { closeModal } = useModal();

    async function onClickYes(e){
        e.preventDefault();
        let res = await dispatch(deleteReviewThunk(revId))
        if(!res.ok){
            console.log(await res.json());
            // console.log(spots);
        } else {
            closeModal();
            await dispatch(loadAllReviewsThunk(spotId));
            await dispatch(dispatch(loadOneThunk(spotId)))

        }
    }

    return (
        <div className="delete-review-modal">
            <h2>Confirm Delete</h2>
            <button onClick={onClickYes}>{"YES (Delete Review)"}</button>
            <button onClick={closeModal}>{"NO (Keep Review)"}</button>
        </div>
    )
}

export default DeleteReviewModal;
