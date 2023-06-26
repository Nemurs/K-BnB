import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewSpotImageThunk, createNewSpotThunk, editSpotThunk, loadAllThunk } from '../../store/allSpots';
import "./NewSpotForm.css";
import { useHistory, useParams } from 'react-router-dom';

const NewSpotForm = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const { id } = useParams();
    const spot = useSelector(state => state.spots.singleSpot);
    // let prevImg = spot?.SpotImages?.find(img => img.preview === true); FOR LATER
    const user = useSelector(state => state.session.user)

    useEffect(() => {
        dispatch(loadAllThunk());
    }, [dispatch]);

    let editBool = id && user && user?.id && user?.id === spot?.Owner?.id;


    const [country, setCountry] = useState(editBool ? spot.country : '');
    const [address, setAddress] = useState(editBool ? spot.address : '');
    const [city, setCity] = useState(editBool ? spot.city : '');
    const [state, setState] = useState(editBool ? spot.state : '');
    const [latitude, setLatitude] = useState(editBool ? String(spot.lat) : '');
    const [longitude, setLongitude] = useState(editBool ? String(spot.lng) : '');
    const [description, setDescription] = useState(editBool ? spot.description : '');
    const [name, setName] = useState(editBool ? spot.name : '');
    const [price, setPrice] = useState(editBool ? String(spot.price) : '');
    const [previewImageURL, setPreviewImageURL] = useState('');
    // const [previewImageURL, setPreviewImageURL] = useState(editBool ? prevImg.url : ''); FOR LATER
    const [error, setError] = useState({});
    const [touched, setTouched] = useState({});
    const [submitState, setSubmitState] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitState(true);

        const newSpot = {
            country,
            address,
            city,
            state,
            lat: Number(latitude),
            lng: Number(longitude),
            name,
            price: Number(price),
            description,
        };

        const errorMsgs = Object.values(error);

        if (errorMsgs.length >= 1) {
            let alertMsg = errorMsgs.reduce((acc, val) => acc + `    ${val}\n`, "")
            alert(`Please fix the following errors before submitting: \n${alertMsg}`);
            return;
        };
        if (editBool) {
            //TODO: UPDATE IMAGES
            let spotRes = await dispatch(editSpotThunk({ id, ...newSpot }));
            if (spotRes.ok) {
                let spotData = await spotRes.json();
                // console.log(spotData);
                history.push(`/spots/${spotData.id}`);
            }
            else {
                // console.log("error with spot data")
                // console.log(await spotRes.json());
            }
        } else {
            let spotRes = await dispatch(createNewSpotThunk(newSpot));
            if (spotRes.ok) {
                let spotData = await spotRes.json();
                // console.log(spotData);
                let imgPayload = { id: spotData.id, body: { url: previewImageURL, preview: true } }
                let imgRes = await dispatch(createNewSpotImageThunk(imgPayload));
                if (imgRes.ok) {
                    history.push(`/spots/${spotData.id}`);
                    reset();
                }
                else {
                    // console.log("error with img data")
                    // console.log(imgRes);
                    // console.log(spotData);
                }
            }
            else {
                // console.log("error with spot data")
                // console.log(spotRes);
            }
        }

    };

    const reset = () => {
        setCountry('');
        setAddress('');
        setCity('');
        setState('');
        setLatitude('');
        setLongitude('');
        setDescription('');
        setName('');
        setPrice('');
        setPreviewImageURL('');
    };

    useEffect(() => {
        let newErrors = {}
        //Special Errors
        if (name.length < 2 || name.length > 50) newErrors.name = "Name must be between 2 and 50 characters";

        if (!price.length || isNaN(Number(price)) || Number(price) < 0) newErrors.price = "Price must be a number greater than 0";

        if (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90) newErrors.latitude = "Latitude must be a number between -90 and 90";

        if (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180) newErrors.longitude = "Longitude must be a number between -180 and 180";

        if (description.length < 30 || description.length > 255) newErrors.description = "Description must be between 30 and 255 characters"

        if (!editBool && !(previewImageURL.endsWith(".png") || previewImageURL.endsWith(".jpg") || previewImageURL.endsWith(".jpeg") || previewImageURL.length)) {
            //TODO: remove !editBool when implementing edit image feature
            newErrors.previewImageURL = "Image URL must end in .png, .jpg, or .jpeg"
        }

        //Missing Required Field Errors
        if (!country.length) newErrors.country = "Country is Required";
        if (!address.length) newErrors.address = "Address is Required";
        if (!city.length) newErrors.city = "City is Required";
        if (!state.length) newErrors.state = "State is Required";

        setError(newErrors)

        return () => setError({});


    }, [country, address, city, state, latitude, longitude, description, name, price, previewImageURL]);

    return (
        <div className='create-new-spot-page'>
            <h1 className='create-new-spot-page-title'>{editBool ? "Update your Spot" : "Create a new Spot"}</h1>

            <div className='create-new-spot-form-div'>
                <form className='create-new-spot-form' onSubmit={handleSubmit}>
                    <div className='create-new-spot-form-location'>
                        <h3>Where's your place located?</h3>
                        <p>Guests will only get your exact address once they booked a reservation</p>
                        <label>Country</label>
                        <input
                            type='text'
                            onChange={(e) => setCountry(e.target.value)}
                            value={country}
                            placeholder='Country'
                            name='country'
                        />
                        {(submitState && error.country) && <p className="form-error">{error.country}</p>}
                        <label>Street Address</label>
                        <input
                            type='text'
                            onChange={(e) => setAddress(e.target.value)}
                            value={address}
                            placeholder='Address'
                            name='address'
                        />
                        {(submitState && error.address) && <p className="form-error">{error.address}</p>}
                        <div className='create-new-spot-form-city-state'>
                            <label>{"City\t"}</label>
                            <input
                                type='text'
                                onChange={(e) => setCity(e.target.value)}
                                value={city}
                                placeholder='City'
                                name='city'
                                className='city-input'
                            />
                            {(submitState && error.city) && <p className="form-error">{error.city}</p>} {",\t"}
                            <label>{"State\t"}</label>
                            <input
                                type='text'
                                onChange={(e) => setState(e.target.value)}
                                value={state}
                                placeholder='STATE'
                                name='state'
                                className='state-input'
                            />
                            {(submitState && error.state) && <p className="form-error">{error.state}</p>}
                        </div>
                        <div className='create-new-spot-form-lng-lat'>
                            <label>{"Latitude\t"}</label>
                            <input
                                type='text'
                                onChange={(e) => setLatitude(e.target.value)}
                                value={latitude}
                                placeholder='Latitude'
                                name='latitude'
                                className='latitude-input'
                                onBlur={() => setTouched({ ...touched, 'latitude': true })}
                            />
                            {(touched.latitude && error.latitude) && <p className="form-error">{error.latitude}</p>}
                            {"\t,\t"}
                            <label>{"Longitude\t"}</label>
                            <input
                                type='text'
                                onChange={(e) => setLongitude(e.target.value)}
                                value={longitude}
                                placeholder='Longitude'
                                name='longitude'
                                className='longitude-input'
                                onBlur={() => setTouched({ ...touched, 'longitude': true })}
                            />
                            {(touched.longitude && error.longitude) && <p className="form-error">{error.longitude}</p>}
                        </div>
                    </div>
                    <div className='create-new-spot-form-description'>
                        <h3>Describe your place to guests</h3>
                        <p>Mention the best features of your space, any special amentities like fast wifi or parking, and what you love about the neighborhood.</p>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            name='description'
                            placeholder='Please write at least 30 characters'
                            rows='10'
                            onBlur={() => setTouched({ ...touched, 'description': true })}
                        ></textarea>
                        {((touched.description || submitState) && error.description) && <p className="form-error">{error.description}</p>}
                    </div>
                    <div className='create-new-spot-form-name'>
                        <h3>Create a title for your spot</h3>
                        <p>Catch guests' attention with a spot title that highlights what makes your place special.</p>
                        <input
                            type='text'
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            placeholder='Name of your spot'
                            name='name'
                            onBlur={() => setTouched({ ...touched, 'name': true })}
                        />
                        {((touched.name || submitState) && error.name) && <p className="form-error">{error.name}</p>}
                    </div>
                    <div className='create-new-spot-form-price'>
                        <h3>Set a base price for your spot</h3>
                        <p>Competitive pricing can help your listing stand out and rank higher in search results. </p>
                        {"$   "}
                        <input
                            type='text'
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                            placeholder='Price per night (USD)'
                            name='price'
                            onBlur={() => setTouched({ ...touched, 'price': true })}
                        />
                        {((touched.price || submitState) && error.price) && <p className="form-error">{error.price}</p>}
                    </div>
                    {!editBool && <div className='create-new-spot-form-image'>
                        {/* TODO: remove !editBool when implementing edit image feature */}
                        <h3>Liven up your spot with photos</h3>
                        <p>Submit a link to one photo in odrder to publish your spot</p>
                        <input
                            type='text'
                            onChange={(e) => setPreviewImageURL(e.target.value)}
                            value={previewImageURL}
                            placeholder='Preview Image URL'
                            name='previewImageURL'
                            onBlur={() => setTouched({ ...touched, 'previewImageURL': true })}
                        />
                        {((touched.previewImageURL || submitState) && error.previewImageURL) && <p className="form-error">{error.previewImageURL}</p>}
                    </div>}
                    <button className="create-new-spot-button" type='submit'>{editBool ? "Update Spot" : "Create Spot"}</button>
                </form>
            </div>
        </div>
    )
}

export default NewSpotForm;
