import { useState } from 'react';
import "./StarRatingInput.css";

const StarRatingInput = ({ rating, disabled, onChange }) => {
  const [activeRating, setActiveRating] = useState(rating);

  const starIconHover = (index) => {
    if (!disabled) {
      setActiveRating(index);
    }
  }

  const starIconLeave = () => {
    if (!disabled) {
      setActiveRating(rating);
    }
  }

  return (
    <>
      <div className="rating-input">
        <div className={activeRating > 0 ? "filled" : "empty"}
          onMouseEnter={() => starIconHover(1)}
          onMouseLeave={() => starIconLeave()}
          onClick={() => onChange(1)}
        >
          <i className="fas fa-star"></i>
        </div>
        <div className={activeRating > 1 ? "filled" : "empty"}
          onMouseEnter={() => starIconHover(2)}
          onMouseLeave={() => starIconLeave()}
          onClick={() => onChange(2)}
        >
          <i className="fas fa-star"></i>
        </div>
        <div className={activeRating > 2 ? "filled" : "empty"}
          onMouseEnter={() => starIconHover(3)}
          onMouseLeave={() => starIconLeave()}
          onClick={() => onChange(3)}
        >
          <i className="fas fa-star"></i>
        </div>
        <div className={activeRating > 3 ? "filled" : "empty"}
          onMouseEnter={() => starIconHover(4)}
          onMouseLeave={() => starIconLeave()}
          onClick={() => onChange(4)}
        >
          <i className="fas fa-star"></i>
        </div>
        <div className={activeRating > 4 ? "filled" : "empty"}
          onMouseEnter={() => starIconHover(5)}
          onMouseLeave={() => starIconLeave()}
          onClick={() => onChange(5)}
        >
          <i className="fas fa-star"></i>
        </div>
      </div>
    </>
  );
};

export default StarRatingInput;
