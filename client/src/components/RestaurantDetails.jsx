import React from 'react';

const RestaurantDetails = (props) => {
  const {restaurant} = props;

  var numDollarSign = (priceLevel) => {
    var dollarSigns = '';
    for(var i = 0; i < priceLevel; i++){
      dollarSigns += '$';
    }
    return dollarSigns;
  }

  var starsPercentage = (googleRating) => {
    var percent = googleRating / 5 * 100;
    return percent + '%';
  }

  return(
    <div className="restaurant-card-details">
      <div className="restaurant-card-details-title"><span className="restaurant-card-details-title-text">{restaurant.name}</span></div>
      <div className="restaurant-card-details-tags">{restaurant.types[0]} · {restaurant.neighborhood} · {numDollarSign(restaurant.price_level)}</div>
      <div className="restaurant-card-details-ratings">
        <img src="http://res.cloudinary.com/madlicorice/image/upload/v1520407648/WeGot_small_logo_circle.png" alt="wegot-logo" className="restaurant-card-details-zagat-rating-icon"></img><span className="restaurant-card-details-zagat-rating">Food </span><span className="restaurant-card-details-zagat-rating-value">{restaurant.zagat_food_rating}</span>
        <div className="restaurant-card-details-rating-divider"></div>
        <img src="http://res.cloudinary.com/madlicorice/image/upload/q_80/v1520448623/google-logo-icon.png" alt="google-log" className="restaurant-card-details-google-rating-icon"></img><span className="restaurant-card-details-google-rating-value">{restaurant.google_rating}</span>
        <div className="restaurant-card-details-google-rating-stars">
          <div className="restaurant-card-details-star-ratings-top" style={{width : starsPercentage(restaurant.google_rating)}}><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          <div className="restaurant-card-details-star-ratings-bottom"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
        </div>
        <span className="restaurant-card-details-google-rating-count">({restaurant.review_count})</span>
      </div>
      <div className="restaurant-card-details-description">{restaurant.short_description}.</div>
    </div>
  )
}

export default RestaurantDetails;
