import React from 'react';

class PhotoCarousel extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      photoIndex: 0
    }
  }

  nextPhoto(e){
    e.stopPropagation();
    var numPhotos = this.props.photos.length;
    var newIndex = (this.state.photoIndex + 1) % numPhotos;
    this.setState({ photoIndex: newIndex })
  }
  prevPhoto(e){
    e.stopPropagation();
    var numPhotos = this.props.photos.length;
    var newIndex = (this.state.photoIndex - 1 + numPhotos) % numPhotos;
    this.setState({ photoIndex: newIndex })
  }

  render(){
    return(
      <div className="restaurant-card-photo-carousel">
        <img src={this.props.photos[this.state.photoIndex]} className="restaurant-card-photos"></img>
        <button className="restaurant-card-photo-carousel-arrow-left" onClick={this.prevPhoto.bind(this)}>&#10094;</button>
        <button className="restaurant-card-photo-carousel-arrow-right" onClick={this.nextPhoto.bind(this)}>&#10095;</button>
      </div>
    )
  }
}

export default PhotoCarousel;
