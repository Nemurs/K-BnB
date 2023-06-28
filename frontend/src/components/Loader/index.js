import { ClipLoader } from 'react-spinners';
import "./Loader.css";

const Loader = ({color, size}) => {
    return (
        <div className="loader-wrapper">
            <ClipLoader color={color ? color : "#f9385d"} size={size ? size : 35}/>
        </div>
    )
}

export default Loader;
