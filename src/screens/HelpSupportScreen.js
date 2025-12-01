import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const SUPPORT_PHONE = '+91 98765 00000';
const SUPPORT_WHATSAPP = '+91 98765 00000';
const SUPPORT_EMAIL = 'support@urbanfleetx.in';

const HelpSupportScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const openPhone = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  const openWhatsApp = () => {
    const phone = SUPPORT_WHATSAPP.replace('+', '');
    Linking.openURL(`https://wa.me/${phone}`);
  };

  const openEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <Ionicons name="headset-outline" size={24} color="#1f7cff" />
          <Text style={styles.introTitle}>We’re here to help</Text>
          <Text style={styles.introText}>
            For booking issues, car problems, or app help, you can reach our support team using the options below.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact options</Text>

          <TouchableOpacity style={styles.actionRow} onPress={openPhone}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="call-outline" size={20} color="#1f7cff" />
            </View>
            <View style={styles.actionTextBlock}>
              <Text style={styles.actionTitle}>Call support</Text>
              <Text style={styles.actionSubtitle}>{SUPPORT_PHONE}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={openWhatsApp}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="logo-whatsapp" size={20} color="#22c55e" />
            </View>
            <View style={styles.actionTextBlock}>
              <Text style={styles.actionTitle}>WhatsApp</Text>
              <Text style={styles.actionSubtitle}>Chat with UrbanFleet X support on WhatsApp</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={openEmail}>
            <View style={styles.actionIconCircle}>
              <Ionicons name="mail-outline" size={20} color="#1f7cff" />
            </View>
            <View style={styles.actionTextBlock}>
              <Text style={styles.actionTitle}>Email</Text>
              <Text style={styles.actionSubtitle}>{SUPPORT_EMAIL}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common topics</Text>
          <View style={styles.faqCard}>
            <Text style={styles.faqText}>
              {`• Deposit rules and refunds\n• Booking cancellation policy\n• What to do if the car has an issue during the day`}
            </Text>
            <Text style={styles.faqHint}>We’ll add detailed FAQs here later.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...FONTS.body1,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  introCard: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: SIZES.padding,
    alignItems: 'flex-start',
    shadowColor: '#9fb5d6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 4,
  },
  introTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    marginTop: 8,
  },
  introText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginHorizontal: SIZES.padding,
    marginTop: 20,
  },
  sectionTitle: {
    ...FONTS.body1,
    fontWeight: '600',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e0ecff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  actionTextBlock: {
    flex: 1,
  },
  actionTitle: {
    ...FONTS.body3,
    fontWeight: '600',
  },
  actionSubtitle: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  faqCard: {
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    padding: 12,
  },
  faqText: {
    ...FONTS.body3,
    color: '#111827',
  },
  faqHint: {
    ...FONTS.body4,
    color: '#4b5563',
    marginTop: 6,
  },
});

export default HelpSupportScreen;
