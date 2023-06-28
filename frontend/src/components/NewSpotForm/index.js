import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { createNewSpotImageThunk, deleteSpotImageThunk, createNewSpotThunk, editSpotThunk, loadAllThunk } from '../../store/allSpots';
import { loadOneThunk } from '../../store/singleSpot';
import Loader from '../Loader';
import "./NewSpotForm.css";

const NewSpotForm = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const { id } = useParams();
    const spot = useSelector(state => state.spots.singleSpot);
    const user = useSelector(state => state.session.user)

    useEffect(() => {
        dispatch(loadAllThunk());
        if (id) {
            dispatch(loadOneThunk(id))
        } else {
            reset()
        }
    }, [dispatch, id]);

    const [editBool, setEditBool] = useState(false);
    const [country, setCountry] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [description, setDescription] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    // const [previewImageURL, setPreviewImageURL] = useState('');
    // const [previewImageURL, setPreviewImageURL] = useState(editBool ? prevImg.url : ''); FOR LATER
    const [previewImg, setPreviewImg] = useState(null);
    // const [oldPreviewImgURL, setOldPreviewImg] = useState(editBool && oldPrevImg ? oldPrevImg.url : "");
    const [oldPrevImg, setOldPrevImg] = useState(null);
    const [oldImgs, setOldImgs] = useState([]);
    const [previewImgURL, setPreviewImgURL] = useState(null);
    const [images, setImages] = useState([]);
    const [imageURLs, setImageURLs] = useState([]);
    const [imageLoading, setImageLoading] = useState(false);
    const [deleteIds, setDeleteIds] = useState([]);
    const [error, setError] = useState({});
    const [touched, setTouched] = useState({});
    const [submitState, setSubmitState] = useState(false);

    const reset = () => {
        setEditBool(false);
        setCountry('');
        setAddress('');
        setCity('');
        setState('');
        setLatitude('');
        setLongitude('');
        setDescription('');
        setName('');
        setPrice('');
        setPreviewImg(null);
        setPreviewImgURL(null);
        setOldPrevImg(null)
        setImages([]);
        setImageURLs([]);
        setOldImgs([]);
        setImageLoading(false);
        setDeleteIds([]);
        setError({});
        setTouched({});
        setSubmitState(false);
    };

    useEffect(() => {
        setEditBool(id && user && user?.id && user.id === spot.Owner?.id)
    }, [spot, user])

    useEffect(() => {
        if (editBool) {
            setCountry(spot.country);
            setAddress(spot.address);
            setCity(spot.city);
            setState(spot.state);
            setLatitude(spot.latitude ? String(spot.latitude) : "");
            setLongitude(spot.longitude ? String(spot.longitude) : "");
            setDescription(spot.description);
            setName(spot.name);
            setPrice(String(spot.price));
            setOldPrevImg(spot?.SpotImages?.find(img => img.preview === true))
            setOldImgs(spot?.SpotImages?.filter(img => img.preview === false))
        }
    }, [editBool])


    /* PREVIEW IMAGES FOR UPLOADS */
    useEffect(() => {
        if (!previewImg) {
            setPreviewImgURL(null);
            return;
        }

        const objectUrl = URL.createObjectURL(previewImg);
        setPreviewImgURL(objectUrl);

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl);
    }, [previewImg])

    useEffect(() => {
        if (!images.length) {
            setImageURLs([]);
            return;
        }
        let urls = []
        for (let img of images) {
            urls.push(URL.createObjectURL(img));
        }
        setImageURLs(urls);

        // free memory when ever this component is unmounted
        return () => {
            for (let url of imageURLs) {
                URL.revokeObjectURL(url)
            }
        };
    }, [images])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitState(true); //Display errors ony after submission


        let forms = []
        if (images.length) {
            for (let idx = 0; idx < images.length; idx++) {
                let img = images[idx]
                if (img) {
                    forms.push(new FormData())
                    forms[idx].append("image", img)
                    forms[idx].append("preview", false);
                }
            }
        }
        if (previewImg) {
            const previewImgformData = new FormData();
            previewImgformData.append("image", previewImg);
            previewImgformData.append("preview", true);
            forms.push(previewImgformData)
        }

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
                setImageLoading(true);
                for (let id of deleteIds) {
                    await dispatch(deleteSpotImageThunk({ spotId: spot.id, imgId: id }));
                }
                let imgResponses = []
                for (let form of forms) {
                    form.append("spot_id", id)
                    imgResponses.push(await dispatch(createNewSpotImageThunk(form)));
                }
                if (imgResponses.every(res => res.ok)) {
                    history.push(`/spots/${id}`);
                    reset();
                }
                else {
                    setImageLoading(false)
                    // console.log("error with img data")
                    // console.log(imgRes);
                    // console.log(spotData);
                }
            }
            else {
                // console.log("error with spot data")
                // console.log(await spotRes.json());
            }
        } else {
            let spotRes = await dispatch(createNewSpotThunk(newSpot));
            if (spotRes.ok) {
                let spotData = await spotRes.json();
                setImageLoading(true);
                const id = spotData.id
                let imgResponses = []
                for (let form of forms) {
                    form.append("spot_id", id)
                    imgResponses.push(await dispatch(createNewSpotImageThunk(form)));
                }
                if (imgResponses.every(res => res.ok)) {
                    history.push(`/spots/${id}`);
                    reset();
                }
                else {
                    setImageLoading(false)
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



    const removeImg = (e, isPreviewImg = false, idx) => {
        e.preventDefault()

        if (isPreviewImg) {
            setPreviewImg(null);
            let previewImgInput = document.getElementById('spotPreviewImgFileInput')
            previewImgInput.value = ""
        } else {
            let list = new DataTransfer();
            // list.items.clear()
            // console.log(list)
            let newImgList = [...images]
            newImgList.splice(idx, 1)
            setImages(newImgList)
            for (let file of newImgList) {
                list.items.add(file)
            }
            // console.log(list)
            let myFileList = list.files;
            // console.log(myFileList)
            let previewImgInput = document.getElementById('spotImgFileInput')
            // console.log(previewImgInput.files)
            previewImgInput.files = myFileList;
            // console.log(previewImgInput.files)
        }
    }

    const removeOldImg = (e, imageId) => {
        e.preventDefault()
        setDeleteIds(prev => [...prev, imageId])
        console.log(deleteIds)
        return;
    }

    useEffect(() => {
        let newErrors = {}
        //Special Errors
        if (name.length < 2 || name.length > 50) newErrors.name = "Name must be between 2 and 50 characters";

        if (!price.length || isNaN(Number(price)) || Number(price) < 0) newErrors.price = "Price must be a number greater than 0";

        if (isNaN(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90) newErrors.latitude = "Latitude must be a number between -90 and 90";

        if (isNaN(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180) newErrors.longitude = "Longitude must be a number between -180 and 180";

        if (description.length < 30 || description.length > 255) newErrors.description = "Description must be between 30 and 255 characters"

        if ((images.length + oldImgs.filter(img => !deleteIds.includes(img.id)).length) > 4) newErrors.additionalImgs = "Only 4 non-preview images are allows";

        //Missing Required Field Errors
        if (!country.length) newErrors.country = "Country is Required";
        if (!address.length) newErrors.address = "Address is Required";
        if (!city.length) newErrors.city = "City is Required";
        if (!state.length) newErrors.state = "State is Required";
        if (!previewImg && deleteIds.includes(oldPrevImg?.id)) newErrors.previewImg = "Preview Image is Required";

        setError(newErrors)

        return () => setError({});


    }, [country, address, city, state, latitude, longitude, description, name, price, previewImg, deleteIds, oldImgs]);

    return (
        <div className='create-new-spot-page'>
            <h1 className='create-new-spot-page-title'>{editBool ? "Update your Spot" : "Create a new Spot"}</h1>

            <div className='create-new-spot-form-div'>
                <form className='create-new-spot-form' onSubmit={handleSubmit} encType="multipart/form-data">
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
                    <div className='create-new-spot-form-image'>
                        {editBool && spot.id < 6 ? <h3>To edit images please make a new spot</h3> : (
                            <>
                                <h3>Liven up your spot with a preview photo</h3>
                                {editBool && (
                                    <div className='edit-spot-preview-images-wrapper'>
                                        {oldPrevImg && !deleteIds.includes(oldPrevImg.id) && (<div>
                                            <p>Old Image</p>
                                            <div className='preview-image-wrapper' onClick={e => (removeOldImg(e, oldPrevImg.id))}><img src={oldPrevImg.url} className='preview-image' /></div>
                                        </div>)}
                                        {previewImg && (
                                            <div>
                                                <p>New Image</p>
                                                <div className='preview-image-wrapper' onClick={e => (removeImg(e, true))}><img src={previewImgURL} className='preview-image' /></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    id='spotPreviewImgFileInput'
                                    onChange={(e) => setPreviewImg(e.target.files[0])}
                                    style={{ marginTop: "5px" }}
                                />
                                {!editBool && previewImg ? <div className='preview-image-wrapper' onClick={e => (removeImg(e, true))} style={{ marginTop: "5px" }}><img src={previewImgURL} className='preview-image' /></div> : <></>}

                                {!editBool ?
                                    (<h3>Add up to {images.length ? `${4 - images.length}` : 4} more image{images.length === 3 ? "" : "s"}</h3>)
                                    :
                                    (<h3>Add up to {images.length || oldImgs.length ? `${4 - (images.length + oldImgs.filter(img => !deleteIds.includes(img.id)).length)}` : 4} more image{(images.length + oldImgs.filter(img => deleteIds.includes(img.id)).length) === 3 ? "" : "s"}</h3>
                                    )}
                                {editBool && (
                                    <div className='edit-spot-image-gallery-wrapper'>
                                        {oldImgs.length && oldImgs.filter(img => deleteIds.includes(img.id)).length !== oldImgs.length ? <div>
                                            <p>Old Images</p>
                                            <div className='preview-image-gallery'>
                                                {oldImgs.map(img => {
                                                    if (!deleteIds.includes(img.id)) {
                                                        return (
                                                            <div className='preview-image-wrapper' onClick={e => (removeOldImg(e, img.id))}><img src={img.url} className='preview-image' /></div>
                                                        )
                                                    } else return (<></>)
                                                })}
                                            </div>
                                        </div> : <></>}
                                        {images.length ? (
                                            <div>
                                                <p>New Images</p>
                                                <div className='preview-image-gallery'>
                                                    {imageURLs.map((url, idx) => (
                                                        <div className='preview-image-wrapper' onClick={e => (removeImg(e, false, idx))}>
                                                            <img src={url} className='preview-image' />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : <></>}
                                        {!oldImgs.length && !images.length ? (<p>No Images {":("}</p>) : (<></>)}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    id='spotImgFileInput'
                                    multiple
                                    onChange={(e) => setImages(Array.from(e.target.files))}
                                    style={{ marginTop: "5px" }}
                                />
                                {!editBool && images.length ?
                                    <div className='preview-image-gallery'>
                                        {imageURLs.map((url, idx) => (
                                            <div className='preview-image-wrapper' onClick={e => (removeImg(e, false, idx))}>
                                                <img src={url} className='preview-image' />
                                            </div>
                                        ))}
                                    </div>
                                    : <></>}
                                {(imageLoading) && <Loader size={50} />}
                            </>)}
                    </div>
                    <button className="create-new-spot-button" type='submit'>{editBool ? "Update Spot" : "Create Spot"}</button>
                </form>
            </div>
        </div>
    )
}

export default NewSpotForm;
