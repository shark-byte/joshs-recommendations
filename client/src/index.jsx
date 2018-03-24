import React from 'react';
import ReactDOM  from 'react-dom';
import RestaurantCard from './components/RestaurantCard.jsx'
import $ from 'jquery';
import '../dist/styles.css';

class App extends React.Component{
  constructor(props){
    super(props);
    // this.state = {
    //   recommended: props.data.slice(1),
    //   restaurant: props.data.slice(0, 1)
    // }
  }

  componentDidMount(){
    // this.getRecommendedRestaurants();
  }

  // getRecommendedRestaurants(){
  //   // console.log(window.location.href);
  //   var id = window.location.href.split('/')[4];
  //   console.log('getting recommended restaurants for id: ' + id)

  //   $.ajax({
  //     url: `/api/restaurants/${id}/recommendations`,
  //     method: 'GET',
  //     success: (data) => {
  //       console.log('get success from client!', data);
  //       this.setState({
  //         restaurant: data[0],
  //         recommended: data.slice(1)
  //       });
  //     },
  //     error: (data) => {
  //       console.log('get error from client!', data);
  //     }
  //   })
  // }

  goToRestaurant(id){
    // console.log('go to restaurant ' + id)
    location.href = '/restaurants/' + id;
  }

  render(){
    const props = this.props;
    const first = props.data.slice(0, 1)[0];

    return(
      <div>
        <div className="recommendations-title">More Restaurants Near {first.name}</div>
        <div className="recommendations-container">
          {props.data.slice(1).map((restaurant, index) => (
            <RestaurantCard restaurant={restaurant} key={index} switchRestaurant={this.goToRestaurant.bind(this)}/>
          ))}
        </div>
      </div>
    )
  }
}

// 
if (typeof window !== "undefined"){ 
  ReactDOM.render(<App data={window.initData} />, document.getElementById('recommendations-app'));
}
export { App };
