import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import UserHomeScreen from '../userScreens/UserHomeScreen';
import UserRepairRequestScreen from '../userScreens/UserRepairRequestScreen';
import UserPayNowScreen from '../userScreens/UserPayNowScreen';
import UserRequestAcceptedScreen from '../userScreens/UserRequestAcceptedScreen';
import UserProfileScreen from '../userScreens/UserProfileScreen';
import UserToMasterRatings from '../userScreens/UserToMasterRatings';
import UserVehicles from '../userScreens/profileMenuScreens/UserVehicles';
import UserTermsAndConditions from '../userScreens/profileMenuScreens/UserTermsAndConditions';
import UserAboutUs from '../userScreens/profileMenuScreens/UserAboutUs';
import UserHelpAndSupport from '../userScreens/profileMenuScreens/UserHelpAndSupport';
import UserBookings from '../userScreens/profileMenuScreens/UserBookings';
import EditUserProfile from '../userScreens/editScreens/EditUserProfile';
import EditVehicle from '../userScreens/editScreens/EditVehicle';
import AddVehicle from '../userScreens/editScreens/AddVehicle';
import vehicleDetails from '../customerOnboarding/VehicleDetailsScreen'
import VehicleBrand from "../customerOnboarding/BikeBrandScreen"
import VehicleModals from '../customerOnboarding/BikeModelScreen'

const Stack = createStackNavigator();

export const UserNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="UserHome">
    <Stack.Screen name="UserHome" component={UserHomeScreen} />
    <Stack.Screen name="UserRepairRequestScreen" component={UserRepairRequestScreen} />
    <Stack.Screen name="UserPayNowScreen" component={UserPayNowScreen} />
    <Stack.Screen name="UserRequestAcceptedScreen" component={UserRequestAcceptedScreen} />
    <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
    <Stack.Screen name="UserToMasterRatings" component={UserToMasterRatings} />
    <Stack.Screen name="UserVehicles" component={UserVehicles} />
    <Stack.Screen name="UserTermsAndConditions" component={UserTermsAndConditions} />
    <Stack.Screen name="UserAboutUs" component={UserAboutUs} />
    <Stack.Screen name="UserHelpAndSupport" component={UserHelpAndSupport} />
    <Stack.Screen name="UserBookings" component={UserBookings} />
    <Stack.Screen name="EditUserProfile" component={EditUserProfile} />
    <Stack.Screen name="EditVehicle" component={EditVehicle} />
    <Stack.Screen name="AddVehicle" component={AddVehicle} />
    {/* <Stack.Screen name="VehicleDetails" component={vehicleDetails}/>
    <Stack.Screen name="VehicleBrand" component={VehicleBrand}/>
    <Stack.Screen name="VehicleModals" component={VehicleModals}/> */}
  </Stack.Navigator>
);