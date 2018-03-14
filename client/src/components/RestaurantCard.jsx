import React from 'react';
import RestaurantDetails from './RestaurantDetails.jsx'
import PhotoCarousel from './PhotoCarousel.jsx'

const RestaurantCard = (props) => {
  const {restaurant} = props;

  return(
    <div className="restaurant-card" onClick={props.switchRestaurant.bind(this,restaurant.place_id)}>
      <PhotoCarousel photos={restaurant.photos} />
      <RestaurantDetails restaurant={restaurant} />
    </div>
  )
}

export default RestaurantCard;
