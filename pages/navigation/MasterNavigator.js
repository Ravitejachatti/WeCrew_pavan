// 📁 navigation/MasterNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MasterHomeScreen from '../masterScreens/MasterHomeScreen';
import MasterRequestAccepted from '../masterScreens/MasterRequestAccepted';
import MasterVerifyOtp from '../masterScreens/MasterVerifyOtp';
import MasterStartRepair from '../masterScreens/MasterStartRepair';
import MasterRepairCompleted from '../masterScreens/MasterRepairCompleted';
import MasterProfileScreen from '../masterScreens/MasterProfileScreen';
import MasterTermsAndConditions from '../masterScreens/profileMenuScreens/MasterTermsAndConditions';
import MasterHelpAndSupport from '../masterScreens/profileMenuScreens/MasterHelpAndSupport';
import MasterAboutUs from '../masterScreens/profileMenuScreens/MasterAboutUs';
import MasterPaymentMethods from '../masterScreens/profileMenuScreens/MasterPaymentMethods';
import MasterEarnings from '../masterScreens/profileMenuScreens/MasterEarnings';
import MasterRepairHistory from '../masterScreens/profileMenuScreens/MasterRepairHistory';
import EditMasterProfile from '../masterScreens/editScreens/EditMasterProfile';


const Stack = createStackNavigator();

export const MasterNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MasterHomeScreen" component={MasterHomeScreen} />
    <Stack.Screen name="MasterRequestAccepted" component={MasterRequestAccepted} />
    <Stack.Screen name="MasterVerifyOtp" component={MasterVerifyOtp} />
    <Stack.Screen name="MasterStartRepair" component={MasterStartRepair} />
    <Stack.Screen name="MasterRepairCompleted" component={MasterRepairCompleted} />
    <Stack.Screen name="MasterProfileScreen" component={MasterProfileScreen} />
    <Stack.Screen name="MasterTermsAndConditions" component={MasterTermsAndConditions} />
    <Stack.Screen name="MasterHelpAndSupport" component={MasterHelpAndSupport} />
    <Stack.Screen name="MasterAboutUs" component={MasterAboutUs} />
    <Stack.Screen name="MasterPaymentMethods" component={MasterPaymentMethods} />
    <Stack.Screen name="MasterEarnings" component={MasterEarnings} />
    <Stack.Screen name="MasterRepairHistory" component={MasterRepairHistory} />
    <Stack.Screen name="EditMasterProfile" component={EditMasterProfile} />
    
  </Stack.Navigator>
);