import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import VehicleDetails from '../customerOnboarding/VehicleDetailsScreen';
import VehicleBrand from '../customerOnboarding/BikeBrandScreen';
import VehicleModals from '../customerOnboarding/BikeModelScreen';

const Stack = createStackNavigator();

const UserOnboardingNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="VehicleDetails" component={VehicleDetails} />
    <Stack.Screen name="VehicleBrand" component={VehicleBrand} />
    <Stack.Screen name="VehicleModals" component={VehicleModals} />
  </Stack.Navigator>
);

export default UserOnboardingNavigator;