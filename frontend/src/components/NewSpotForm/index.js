import { useState, useEffect } from 'react';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
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

        let spotRes = await dispatch(createNewSpotThunk(newSpot));
        if(spotRes.ok){
            let spotData = await spotRes.json();
            console.log(spotData);
            let imgPayload = {id: spotData.id, body:{url: previewImageURL, preview: true}}
            let imgRes = await dispatch(createNewSpotImageThunk(imgPayload));
            if(imgRes.ok){
                history.push(`/spots/${spotData.id}`);
                reset();
            }
            else{
                console.log("error with img data")
                console.log(imgRes);
                console.log(spotData);
            }
        }
        else{
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
                        <label>Street Address</label>
                        <input
                            type='text'
                            onChange={(e) => setAddress(e.target.value)}
                            value={address}
                            placeholder='Address'
                            name='address'
                        />
                        <label>City</label>
                        <input
                            type='text'
                            onChange={(e) => setCity(e.target.value)}
                            value={city}
                            placeholder='City'
                            name='city'
                        />
                        <label>State</label>
                        <input
                            type='text'
                            onChange={(e) => setState(e.target.value)}
                            value={state}
                            placeholder='STATE'
                            name='state'
                        />
                        <label>Latitude</label>
                        <input
                            type='text'
                            onChange={(e) => setLatitude(e.target.value)}
                            value={latitude}
                            placeholder='Latitude'
                            name='latitude'
                        />
                        <label>Longitude</label>
                        <input
                            type='text'
                            onChange={(e) => setLongitude(e.target.value)}
                            value={longitude}
                            placeholder='Longitude'
                            name='longitude'
                        />

                    </div>
                    <div className='create-new-spot-form-description'>
                        <h3>Describe your place to guests</h3>
                        <p>Mention the best features of your space, any special amentities like fast wifi or parking, and what you love about the neighborhood.</p>
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            name='description'
                            placeholder='Please write at least 30 characters'
                            rows='10'
                        ></textarea>
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
                        />
                    </div>
                    <div className='create-new-spot-form-price'>
                        <h3>Set a base price for your spot</h3>
                        <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
                        <input
                            type='text'
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                            placeholder='Price per night (USD)'
                            name='price'
                        />
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
                        />
                    </div>
                    <button type='submit'>Create Spot</button>
                </form>
            </div>
        </div>
    )
}

export default NewSpotForm;
