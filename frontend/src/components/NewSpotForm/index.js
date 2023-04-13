import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewSpotImageThunk, createNewSpotThunk, loadAllThunk } from '../../store/allSpots';
import "./NewSpotForm.css";
import { useHistory } from 'react-router-dom';

const NewSpotForm = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
        dispatch(loadAllThunk());
    }, [dispatch]);

    const [country, setCountry] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [previewImageURL, setPreviewImageURL] = useState('');
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

        let spotRes = await dispatch(createNewSpotThunk(newSpot));
        if (spotRes.ok) {
            let spotData = await spotRes.json();
            console.log(spotData);
            let imgPayload = { id: spotData.id, body: { url: previewImageURL, preview: true } }
            let imgRes = await dispatch(createNewSpotImageThunk(imgPayload));
            if (imgRes.ok) {
                history.push(`/spots/${spotData.id}`);
                reset();
            }
            else {
                console.log("error with img data")
                console.log(imgRes);
                console.log(spotData);
            }
        }
        else {
            console.log("error with spot data")
            console.log(spotRes);
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
        if (name.length < 2 || name.length > 255) newErrors.name = "Name must be between 2 and 255 characters";

        if (!price.length || isNaN(Number(price)) || Number(price) < 0) newErrors.price = "Price must be a number greater than 0";

        if (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90) newErrors.latitude = "Latitude must be a number between -90 and 90";

        if (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180) newErrors.longitude = "Longitude must be a number between -90 and 90";

        if (description.length < 30 || description.length > 255) newErrors.description = "Description must be between 30 and 255 characters"

        if (!(previewImageURL.endsWith(".png") || previewImageURL.endsWith(".jpg") || previewImageURL.endsWith(".jpeg") || previewImageURL.length)) {
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
            <h1>Create a new Spot</h1>

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
                            required={true}
                        />
                        {(submitState && error.address) && <p className="form-error">{error.address}</p>}
                        <label>City</label>
                        <input
                            type='text'
                            onChange={(e) => setCity(e.target.value)}
                            value={city}
                            placeholder='City'
                            name='city'
                            required={true}
                        />
                        {(submitState && error.city) && <p className="form-error">{error.city}</p>}
                        <label>State</label>
                        <input
                            type='text'
                            onChange={(e) => setState(e.target.value)}
                            value={state}
                            placeholder='STATE'
                            name='state'
                            required={true}
                        />
                        {(submitState && error.state) && <p className="form-error">{error.state}</p>}
                        <label>Latitude</label>
                        <input
                            type='text'
                            onChange={(e) => setLatitude(e.target.value)}
                            value={latitude}
                            placeholder='Latitude'
                            name='latitude'
                            onBlur={() => setTouched({ ...touched, 'latitude': true })}
                        />
                        {(touched.latitude && error.latitude) && <p className="form-error">{error.latitude}</p>}
                        <label>Longitude</label>
                        <input
                            type='text'
                            onChange={(e) => setLongitude(e.target.value)}
                            value={longitude}
                            placeholder='Longitude'
                            name='longitude'
                            onBlur={() => setTouched({ ...touched, 'longitude': true })}
                        />
                        {(touched.longitude && error.longitude) && <p className="form-error">{error.longitude}</p>}
                    </div>
                    <div className='create-new-spot-form-description'>
                        <h3>Describe your place to guests</h3>
                        <p>Mention the best features of your space, any special amentities like fast wifi or parking, and what you love about the neighborhood.</p>
                        <label>Description</label>
                        <br />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            name='description'
                            placeholder='Please write at least 30 characters'
                            rows='10'
                            required={true}
                            onBlur={() => setTouched({ ...touched, 'description': true })}
                        ></textarea>
                        {(touched.description && error.description) && <p className="form-error">{error.description}</p>}
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
                            required={true}
                            onBlur={() => setTouched({ ...touched, 'name': true })}
                        />
                        {(touched.name && error.name) && <p className="form-error">{error.name}</p>}
                    </div>
                    <div className='create-new-spot-form-price'>
                        <h3>Set a base price for your spot</h3>
                        <p>Competitive pricing can help your listing stand out and rank higher in search results. </p>
                        <input
                            type='text'
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                            placeholder='Price per night (USD)'
                            name='price'
                            required={true}
                            onBlur={() => setTouched({ ...touched, 'price': true })}
                        />
                        {(touched.price && error.price) && <p className="form-error">{error.price}</p>}
                    </div>
                    <div className='create-new-spot-form-image'>
                        <h3>Liven up your spot with photos</h3>
                        <p>Submit a link to one photo to publish your spot</p>
                        <input
                            type='text'
                            onChange={(e) => setPreviewImageURL(e.target.value)}
                            value={previewImageURL}
                            placeholder='Preview Image URL'
                            name='previewImageURL'
                            required={true}
                            onBlur={() => setTouched({ ...touched, 'previewImageURL': true })}
                        />
                        {(touched.previewImageURL && error.previewImageURL) && <p className="form-error">{error.previewImageURL}</p>}
                    </div>
                    <button type='submit'>Create Spot</button>
                </form>
            </div>
        </div>
    )
}

export default NewSpotForm;
