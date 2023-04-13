import { useModal } from "../../context/Modal.js";
import { useDispatch, useSelector } from 'react-redux';
import { deleteSpotThunk, loadUserOwnedThunk } from '../../store/allSpots';

const DeleteSpotModal = ({spotId}) => {
    const dispatch = useDispatch();
    const { closeModal } = useModal();
    const spots = useSelector(state => Object.values(state.spots.allSpots));

    async function onClickYes(e){
        e.preventDefault();
        let res = await dispatch(deleteSpotThunk({id: spotId}))
        if(!res.ok){
            console.log(res);
            console.log(spots);
        } else {
            await dispatch(loadUserOwnedThunk());
            closeModal();
        }
    }

    return (
        <div className="delete-spot-modal">
            <h2>Confirm Delete</h2>
            <button onClick={onClickYes}>{"YES (Delete Spot)"}</button>
            <button onClick={closeModal}>{"NO (Keep Spot)"}</button>
        </div>
    )
}

export default DeleteSpotModal;
