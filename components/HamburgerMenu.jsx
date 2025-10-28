import { BlurView } from 'expo-blur';
import { Bell, CreditCard, HelpCircle, LogOut, MapPin, Settings, Shield, Star, User } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FarmLocationDialog from './FarmLocationDialog';
import { ProfileDialog } from './ProfileDialog';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getFarmCount } from "../services/userService";

export default function HamburgerMenu() {
  const { userData } = useAuth();
  const [visible, setVisible] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [farmDialogOpen, setFarmDialogOpen] = useState(false);

  const menuItems = [
    { icon: User, label: 'Profile', description: 'Manage your account', onPress: () => { setVisible(false); setProfileOpen(true); } },
    { icon: MapPin, label: 'Farm Locations', description: 'Manage your farms', onPress: () => { setVisible(false); setFarmDialogOpen(true); } },
    { icon: Bell, label: 'Notifications', description: 'Alerts and updates', onPress: () => setVisible(false) },
    { icon: CreditCard, label: 'Billing', description: 'Subscription and payments', onPress: () => setVisible(false) },
    { icon: Star, label: 'Premium Features', description: 'Upgrade your plan', onPress: () => setVisible(false) },
    { icon: Shield, label: 'Privacy & Security', description: 'Account security', onPress: () => setVisible(false) },
    { icon: Settings, label: 'Settings', description: 'App preferences', onPress: () => setVisible(false) },
    { icon: HelpCircle, label: 'Help & Support', description: 'Get help', onPress: () => setVisible(false) },
  ];


  const handleLogout = async () => {

    const { error } = await supabase.auth.signOut();
  
    userData(null);
    if (error) {
      console.log('Error signing out:', error.message);
      Alert.alert('Logout Failed', error.message);
    }
};

  return (
    <>
      {/* Trigger button (hamburger icon) */}
      <Pressable onPress={() => setVisible(true)} style={styles.trigger}>
        <View style={styles.bars} />
        <View style={styles.bars} />
        <View style={styles.bars} />
      </Pressable>

      {/* Modal for the menu */}
      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPressOut={() => setVisible(false)}>
          {Platform.OS !== 'web' ? (
            // Native version (with BlurView)
            <BlurView intensity={60} style={styles.blur} tint="dark">
              <View style={styles.sheet}>
                <View style={styles.header}>
                  <User size={28} color="#ebebebff" />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.userName}>{(userData && userData?.full_name) || 'User'}</Text>
                    <Text style={styles.userMeta}>Active Farms: {(userData && userData?.farm_count)}</Text>
                  </View>
                </View>

                <Text style={styles.sheetTitle}>Menu</Text>

                {menuItems.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <TouchableOpacity key={i} style={styles.item} onPress={m.onPress}>
                      <Icon size={18} color="#0b7a3a" />
                      <View style={{ marginLeft: 12 }}>
                        <Text style={styles.itemLabel}>{m.label}</Text>
                        <Text style={styles.itemDesc}>{m.description}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {/* Logout */}
                <TouchableOpacity
                  style={[styles.item, styles.logout]}
                  onPress={() => {
                    setVisible(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={18} color="#b91c1c" />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[styles.itemLabel, { color: '#b91c1c' }]}>Logout</Text>
                    <Text style={styles.itemDesc}>Sign out of your account</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </BlurView>
          ) : (
            // Web fallback (no BlurView)
            <View style={[styles.sheet, styles.sheetFallback]}>
              <View style={styles.header}>
                <User size={28} color="#065f46" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.userName}>{(userData && userData.full_name) || 'Username'}</Text>
                  <Text style={styles.userMeta}>Active Farms: {(userData && userData?.farm_count)}</Text>
                </View>
              </View>

              <Text style={styles.sheetTitle}>Menu</Text>

              {menuItems.map((m, i) => {
                const Icon = m.icon;
                return (
                  <TouchableOpacity key={i} style={styles.item} onPress={m.onPress}>
                    <Icon size={18} color="#0b7a3a" />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.itemLabel}>{m.label}</Text>
                      <Text style={styles.itemDesc}>{m.description}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Logout */}
              <TouchableOpacity
                style={[styles.item, styles.logout]}
                onPress={() => {
                  setVisible(false);
                  handleLogout();
                }}
              >
                <LogOut size={18} color="#b91c1c" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.itemLabel, { color: '#b91c1c' }]}>Logout</Text>
                  <Text style={styles.itemDesc}>Sign out of your account</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Modal>

  {/* Profile dialog */}
  <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
  {/* Farm locations dialog */}
  <FarmLocationDialog open={farmDialogOpen} onOpenChange={setFarmDialogOpen} />
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    padding: 10,
  },
  bars: {
    width: 24,
    height: 3,
    backgroundColor: '#ffffffff',
    marginVertical: 2,
    borderRadius: 2,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  blur: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetFallback: {
    marginTop: 'auto',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
  },
  userMeta: {
    fontSize: 12,
    color: '#4b5563',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#065f46',
  },
  itemDesc: {
    fontSize: 12,
    color: '#6b7280',
  },
  logout: {
    marginTop: 10,
  },
});
