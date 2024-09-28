import { defaultStyles } from "@/constants/Styles";
import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function History() {
  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <ScrollView style={defaultStyles.innerContainer}>
        <View style={defaultStyles.pageHeader}>
          <Text style={defaultStyles.pageTitle}>History</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
