import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../Login';
import OTPScreen from '../Otp';
import RoleSelectionScreen from '../Roleselection';
import BasicDetails from '../customerOnboarding/BasicDetails';
import VehicleDetails from '../customerOnboarding/VehicleDetailsScreen';
import VehicleBrand from '../customerOnboarding/BikeBrandScreen';
import VehicleModals from '../customerOnboarding/BikeModelScreen';
import MasterOnboarding from '../masterOnboarding/masterDetails';

const Stack = createStackNavigator();

export const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="OTP" component={OTPScreen} />
    <Stack.Screen name="roleSelection" component={RoleSelectionScreen} />
    <Stack.Screen name="BasicDetails" component={BasicDetails} />
    <Stack.Screen name="VehicleDetails" component={VehicleDetails} />
    <Stack.Screen name="VehicleBrand" component={VehicleBrand} />
    <Stack.Screen name="VehicleModals" component={VehicleModals} />
    <Stack.Screen name="masterDetails" component={MasterOnboarding} />
  </Stack.Navigator>
);