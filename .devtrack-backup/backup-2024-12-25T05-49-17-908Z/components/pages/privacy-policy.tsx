import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import Spacer from '@/components/Spacer';

export default function PrivacyPolicy() {
  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <ScrollView style={defaultStyles.innerContainer} showsVerticalScrollIndicator={false}>
        <View style={defaultStyles.pageHeader}>
          <Text style={defaultStyles.pageTitle}>Privacy Policy</Text>
        </View>

        <Spacer height={16} />

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information you provide directly to us when you create an account, update
            your profile, or interact with other users on the platform. This may include your name,
            email address, profile picture, and any other information you choose to share.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to provide, maintain, and improve our services, to
            develop new features, and to protect Crushy and our users. This includes personalizing
            your experience, facilitating connections between users, and sending you important
            updates about our service.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>3. Information Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share your information with third-party
            service providers who perform services on our behalf, such as hosting, data analysis,
            and customer service. We may also disclose your information if required by law or to
            protect our rights and the safety of our users.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your personal
            information against unauthorized or unlawful processing, accidental loss, destruction,
            or damage. However, no method of transmission over the Internet or electronic storage is
            100% secure, and we cannot guarantee absolute security.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>5. Your Choices and Rights</Text>
          <Text style={styles.paragraph}>
            You can access, update, or delete your account information at any time through the app
            settings. You may also have certain rights under applicable data protection laws,
            including the right to access, correct, or delete your personal information.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>6. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>

          <Spacer height={16} />

          <Text style={styles.sectionTitle}>7. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy or our data practices, please
            contact us at privacy@crushy.social.
          </Text>

          <Spacer height={16} />

          <Text style={styles.paragraph}>Last Updated: October 12, 2024</Text>
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
