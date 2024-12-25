import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import Spacer from '@/components/Spacer';

export default function Contact() {
  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <ScrollView style={defaultStyles.innerContainer} showsVerticalScrollIndicator={false}>
        <View style={defaultStyles.pageHeader}>
          <Text style={defaultStyles.pageTitle}>Contact Us</Text>
        </View>

        <Spacer height={16} />

        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Email</Text>
          <Text style={styles.paragraph}>support@crushy.social</Text>

          <Spacer height={32} />

          <Text style={styles.sectionTitle}>Instagram</Text>
          <Text style={styles.paragraph}>@crushyapp</Text>
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
