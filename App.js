import React, {useState} from "react";
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from "react";

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { RequestProvider } from './contexts/RequestContext';
import { NavigationProvider } from './contexts/NavigationContext';
import GlobalRequestHandler from './components/GlobalRequestHandler';


//basic screens
import LoginScreen from "./pages/Login";
import OTPScreen from "./pages/Otp";
import RoleSelectionScreen from "./pages/Roleselection";


//user onboarding screens
import BasicDetails from "./pages/customerOnboarding/BasicDetails";
import VehicleDetailsScreen from "./pages/customerOnboarding/VehicleDetailsScreen";
import BikeBrandScreen from "./pages/customerOnboarding/BikeBrandScreen";
import BikeModelScreen from "./pages/customerOnboarding/BikeModelScreen";

//master onboarding screens
import MasterOnboarding from "./pages/masterOnboarding/masterDetails";

//user screens
import UserHomeScreen from "./pages/userScreens/UserHomeScreen";
import UserRepairRequestScreen from "./pages/userScreens/UserRepairRequestScreen";
import UserPayNowScreen from "./pages/userScreens/UserPayNowScreen";
import UserRequestAcceptedScreen from "./pages/userScreens/UserRequestAcceptedScreen";
import UserProfileScreen from "./pages/userScreens/UserProfileScreen";
import UserToMasterRatings from "./pages/userScreens/UserToMasterRatings";

//user profile menu screens
import UserVehicles from "./pages/userScreens/profileMenuScreens/UserVehicles";
import UserTermsAndConditions from "./pages/userScreens/profileMenuScreens/UserTermsAndConditions";
import UserAboutUs from "./pages/userScreens/profileMenuScreens/UserAboutUs";
import UserHelpAndSupport from "./pages/userScreens/profileMenuScreens/UserHelpAndSupport";
import UserBookings from "./pages/userScreens/profileMenuScreens/UserBookings";

//master screens
import MasterHomeScreen from "./pages/masterScreens/MasterHomeScreen";
import MasterRequestAccepted from "./pages/masterScreens/MasterRequestAccepted";
import MasterVerifyOtp from "./pages/masterScreens/MasterVerifyOtp";
import MasterStartRepair from "./pages/masterScreens/MasterStartRepair";
import MasterRepairCompleted from "./pages/masterScreens/MasterRepairCompleted";
import MasterProfileScreen from "./pages/masterScreens/MasterProfileScreen";

//master profile menu screens
import MasterTermsAndConditions from "./pages/masterScreens/profileMenuScreens/MasterTermsAndConditions";
import MasterHelpAndSupport from "./pages/masterScreens/profileMenuScreens/MasterHelpAndSupport";
import MasterAboutUs from "./pages/masterScreens/profileMenuScreens/MasterAboutUs";
import MasterPaymentMethods from "./pages/masterScreens/profileMenuScreens/MasterPaymentMethods";
import MasterEarnings from "./pages/masterScreens/profileMenuScreens/MasterEarnings";
import MasterRepairHistory from "./pages/masterScreens/profileMenuScreens/MasterRepairHistory";

//edit screens
import EditUserProfile from "./pages/userScreens/editScreens/EditUserProfile";
import EditVehicle from "./pages/userScreens/editScreens/EditVehicle";
import AddVehicle from "./pages/userScreens/editScreens/AddVehicle";
import EditMasterProfile from "./pages/masterScreens/editScreens/EditMasterProfile";

const Stack = createStackNavigator();


export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const navigationRef = useNavigationContainerRef();

  // Save last route (optional)
  useEffect(() => {
    const saveCurrentRoute = () => {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute) {
        AsyncStorage.setItem('lastRoute', currentRoute.name);
      }
    };
    const unsubscribe = navigationRef.addListener('state', saveCurrentRoute);
    return unsubscribe;
  }, [navigationRef]);

  // Set initial route based on userData and role
  useEffect(() => {
    const checkLogin = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role === 'master') {
          setInitialRoute("MasterHomeScreen");
        } else {
          setInitialRoute("UserHome");
        }
      } else {
        setInitialRoute("Login");
      }
    };
    checkLogin();
  }, []);
  // getting the last route from AsyncStorage
  useEffect(() => {
    const getLastRoute = async () => {
      const lastRoute = await AsyncStorage.getItem('lastRoute');
      if (lastRoute) {
        console.log("Last route from AsyncStorage:", lastRoute);
        setInitialRoute(lastRoute);
      }
    };
    getLastRoute();
  }, []);

  console.log("lastRoute", initialRoute )

  // Wait for initialRoute to be set before rendering the navigator
  if (!initialRoute) return null; // or a splash/loading screen

  return (
    <AuthProvider>
      <RequestProvider>
        <NavigationProvider>
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>

        {/* Basic Screens */}

        
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="roleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="BasicDetails" component={BasicDetails} />


        {/* user onboarding screens */}

        <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
        <Stack.Screen name="BikeBrand" component={BikeBrandScreen} />
        <Stack.Screen name="BikeModel" component={BikeModelScreen} />

        {/* user screens */}

        <Stack.Screen name="UserHome" component={UserHomeScreen} />
        <Stack.Screen name="UserRepairRequestScreen" component={UserRepairRequestScreen} />
        <Stack.Screen name="UserPayNowScreen" component={UserPayNowScreen} />
        <Stack.Screen name="UserRequestAcceptedScreen" component={UserRequestAcceptedScreen} />
        <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
        <Stack.Screen name="UserToMasterRatings" component={UserToMasterRatings} />
        
        {/* user profile menu screens */}
        <Stack.Screen name="UserVehicles" component={UserVehicles} />
        <Stack.Screen name="UserTermsAndConditions" component={UserTermsAndConditions} />
        <Stack.Screen name="UserAboutUs" component={UserAboutUs} />
        <Stack.Screen name="UserHelpAndSupport" component={UserHelpAndSupport} />
        <Stack.Screen name="UserBookings" component={UserBookings} />

        {/* user edit screens */}
        <Stack.Screen name="EditUserProfile" component={EditUserProfile} />
        <Stack.Screen name="EditVehicle" component={EditVehicle} />
        <Stack.Screen name="AddVehicle" component={AddVehicle} />

        {/* master onboarding screens */}
        <Stack.Screen name="masterDetails" component={MasterOnboarding} />

        {/* Master Screens */}

        <Stack.Screen name="MasterHomeScreen" component={MasterHomeScreen} />
        <Stack.Screen name="MasterRequestAccepted" component={MasterRequestAccepted} />
        <Stack.Screen name="MasterVerifyOtp" component={MasterVerifyOtp} />
        <Stack.Screen name="MasterStartRepair" component={MasterStartRepair} />
        <Stack.Screen name="MasterRepairCompleted" component={MasterRepairCompleted} />
        <Stack.Screen name="MasterProfileScreen" component={MasterProfileScreen} />

        {/* Master Profile Menu Screens */}
        <Stack.Screen name="MasterTermsAndConditions" component={MasterTermsAndConditions} /> 
        <Stack.Screen name="MasterHelpAndSupport" component={MasterHelpAndSupport} />
        <Stack.Screen name="MasterAboutUs" component={MasterAboutUs} />
        <Stack.Screen name="MasterPaymentMethods" component={MasterPaymentMethods} />
        <Stack.Screen name="MasterEarnings" component={MasterEarnings} />
        <Stack.Screen name="MasterRepairHistory" component={MasterRepairHistory} />

        {/* master edit screens */}
        <Stack.Screen name="EditMasterProfile" component={EditMasterProfile} />
      </Stack.Navigator>
      
      {/* Global Request Handler for Masters */}
      <GlobalRequestHandler />
    </NavigationContainer>
    </GestureHandlerRootView>
        </NavigationProvider>
      </RequestProvider>
    </AuthProvider>
  );
}