import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import Spacer from '@/components/Spacer';

export default function TermsOfService() {
  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <ScrollView style={defaultStyles.innerContainer} showsVerticalScrollIndicator={false}>
        <View style={defaultStyles.pageHeader}>
          <Text style={defaultStyles.pageTitle}>Terms of Service</Text>
        </View>

        <Spacer height={16} />

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using the Crushy app, you agree to be bound by these Terms of Service.
            If you disagree with any part of the terms, you may not access the service.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>2. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify or replace these Terms at any time. It is your
            responsibility to check the Terms periodically for changes.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account and password.
            You agree to accept responsibility for all activities that occur under your account.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>4. User Content</Text>
          <Text style={styles.paragraph}>
            You retain all rights to any content you submit, post or display on or through the
            service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free
            license to use, reproduce, and distribute such content in connection with the service.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>5. Prohibited Uses</Text>
          <Text style={styles.paragraph}>
            You may not use the service for any illegal purpose or to violate any laws in your
            jurisdiction. This includes, but is not limited to, copyright laws and laws regarding
            the transmission of data.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>6. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and bar access to the service immediately,
            without prior notice or liability, under our sole discretion, for any reason whatsoever.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            In no event shall Crushy, nor its directors, employees, partners, agents, suppliers, or
            affiliates, be liable for any indirect, incidental, special, consequential or punitive
            damages.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>8. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed and construed in accordance with the laws of [Your
            Country/State], without regard to its conflict of law provisions.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at support@crushy.social.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: Colors.light.white,
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'HeadingBold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    fontFamily: 'BodyRegular',
    color: Colors.light.text,
    lineHeight: 24,
  },
});
