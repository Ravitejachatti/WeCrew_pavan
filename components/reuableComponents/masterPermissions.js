// components/WeCrewPermissionsGate.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Linking,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import messaging from '@react-native-firebase/messaging';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/constants';
import { NativeModules } from 'react-native';

const { BatteryOptimizationModule, OverlayPermissionModule } = NativeModules;

/**
 * Props:
 * - onReady(): called when ALL permissions are granted
 */
export default function WeCrewPermissionsGate({ onReady }) {
  const [checking, setChecking] = useState(true);

  const [fgLoc, setFgLoc] = useState(false);
  const [bgLoc, setBgLoc] = useState(false);
  const [notif, setNotif] = useState(false);
  const [overlay, setOverlay] = useState(Platform.OS === 'ios'); // iOS N/A -> treat as true
  const [battery, setBattery] = useState(Platform.OS === 'ios'); // iOS N/A -> treat as true

  const allOk = useMemo(
    () => fgLoc && bgLoc && notif && overlay && battery,
    [fgLoc, bgLoc, notif, overlay, battery]
  );

  const checkForegroundLocation = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      const res = await Location.requestForegroundPermissionsAsync();
      setFgLoc(res.status === 'granted');
    } else {
      setFgLoc(true);
    }
  }, []);

  const checkBackgroundLocation = useCallback(async () => {
    if (Platform.OS === 'android') {
      // Background location requires explicit permission on Android 10+
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
      );
      if (!granted) {
        const res = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
        );
        setBgLoc(res === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setBgLoc(true);
      }
    } else {
      const { status } = await Location.getBackgroundPermissionsAsync();
      if (status !== 'granted') {
        const res = await Location.requestBackgroundPermissionsAsync();
        setBgLoc(res.status === 'granted');
      } else {
        setBgLoc(true);
      }
    }
  }, []);

  const checkNotifications = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        // Android 13+ needs POST_NOTIFICATIONS
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (!granted) {
            const res = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            setNotif(res === PermissionsAndroid.RESULTS.GRANTED);
          } else {
            setNotif(true);
          }
        } else {
          setNotif(true);
        }
      } else {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        setNotif(enabled);
      }
    } catch {
      // Fallback: try to open settings if it fails
      setNotif(false);
    }
  }, []);

  const checkOverlay = useCallback(async () => {
    if (Platform.OS === 'android' && OverlayPermissionModule?.checkOverlayPermission) {
      try {
        const ok = await OverlayPermissionModule.checkOverlayPermission(); // boolean
        setOverlay(!!ok);
      } catch {
        setOverlay(false);
      }
    } else {
      setOverlay(true);
    }
  }, []);

  const checkBatteryOpt = useCallback(async () => {
    if (Platform.OS === 'android' && BatteryOptimizationModule?.isIgnoringBatteryOptimizations) {
      try {
        const ok = await BatteryOptimizationModule.isIgnoringBatteryOptimizations(); // boolean
        setBattery(!!ok);
      } catch {
        setBattery(false);
      }
    } else {
      setBattery(true);
    }
  }, []);

  const checkAll = useCallback(async () => {
    setChecking(true);
    await Promise.allSettled([
      checkForegroundLocation(),
      checkBackgroundLocation(),
      checkNotifications(),
      checkOverlay(),
      checkBatteryOpt(),
    ]);
    setChecking(false);
  }, [checkForegroundLocation, checkBackgroundLocation, checkNotifications, checkOverlay, checkBatteryOpt]);

  useEffect(() => {
    checkAll();
  }, [checkAll]);

  useEffect(() => {
    if (!checking && allOk) {
      onReady?.();
    }
  }, [checking, allOk, onReady]);

  // Requesters for individual rows
  const reqForeground = () => checkForegroundLocation();
  const reqBackground = () => checkBackgroundLocation();
  const reqNotif = () => checkNotifications();
  const reqOverlay = async () => {
    if (Platform.OS === 'android' && OverlayPermissionModule?.requestOverlayPermission) {
      try {
        const ok = await OverlayPermissionModule.requestOverlayPermission();
        setOverlay(!!ok);
      } catch {
        setOverlay(false);
      }
    } else {
      Linking.openSettings();
    }
  };
  const reqBattery = async () => {
    if (Platform.OS === 'android' && BatteryOptimizationModule?.requestIgnoreBatteryOptimizations) {
      try {
        const ok = await BatteryOptimizationModule.requestIgnoreBatteryOptimizations();
        setBattery(!!ok);
      } catch {
        setBattery(false);
      }
    } else {
      Linking.openSettings();
    }
  };

  // If everything granted, render nothing (parent shows main UI)
  if (allOk) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Text style={styles.title}>Enable Required Permissions</Text>
        <Text style={styles.subtitle}>
          To receive and fulfill bookings reliably (like Rapido/Swiggy flow), please enable the
          following:
        </Text>

        <PermRow
          icon="location-outline"
          label="Foreground Location"
          ok={fgLoc}
          onPress={reqForeground}
          note="Needed to fetch your current location while on duty."
        />
        <PermRow
          icon="navigate-outline"
          label="Background Location"
          ok={bgLoc}
          onPress={reqBackground}
          note="Needed to track and route you when the app is closed."
        />
        <PermRow
          icon="notifications-outline"
          label="Notifications"
          ok={notif}
          onPress={reqNotif}
          note="Needed to alert you when a new repair request arrives."
        />
        {Platform.OS === 'android' && (
          <PermRow
            icon="albums-outline"
            label="Display Over Other Apps"
            ok={overlay}
            onPress={reqOverlay}
            note="Needed to show the request modal on top of other screens."
          />
        )}
        {Platform.OS === 'android' && (
          <PermRow
            icon="battery-charging-outline"
            label="Disable Battery Optimization"
            ok={battery}
            onPress={reqBattery}
            note="Prevents Android from killing the background tracking service."
          />
        )}

        <TouchableOpacity style={styles.refreshBtn} onPress={checkAll} disabled={checking}>
          {checking ? <ActivityIndicator /> : <Text style={styles.refreshText}>Re-check</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PermRow({ icon, label, ok, onPress, note }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={22} color={COLORS.primary} style={{ marginRight: 10 }} />
        <View>
          <Text style={styles.rowTitle}>{label}</Text>
          {!!note && <Text style={styles.rowNote}>{note}</Text>}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.cta, ok && styles.ctaOk]}
        onPress={onPress}
        disabled={ok}
      >
        <Text style={[styles.ctaText, ok && styles.ctaTextOk]}>{ok ? 'Granted' : 'Grant'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#555',
    marginBottom: 16,
  },
  row: {
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: '#222' },
  rowNote: { fontSize: 11, color: '#777', marginTop: 2 },
  cta: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  ctaOk: {
    backgroundColor: '#E6F4EA',
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  ctaTextOk: { color: '#1E7E34' },
  refreshBtn: {
    marginTop: 6,
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#EDF5FF',
  },
  refreshText: { color: COLORS.primary, fontWeight: '700' },
});