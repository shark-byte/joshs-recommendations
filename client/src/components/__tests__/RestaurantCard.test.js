import React from 'react';
import { shallow, mount, render } from 'enzyme';

import RestaurantCard from '../RestaurantCard';

describe('A RestaurantCard', function() {
  it('should render a .restaurant-card class', function() {
    const component = mount(<RestaurantCard />);
    expect(component.find('.restaurant-card').length).toEqual(1);
  });

  it('should render a .photo-carousel class', function() {
    const component = mount(<RestaurantCard />);
    expect(component.find('.photo-carousel').length).toEqual(1);
  });

  it('should render a .restaurant-details class', function() {
    const component = mount(<RestaurantCard />);
    expect(component.find('.restaurant-details').length).toEqual(1);
  });

});
