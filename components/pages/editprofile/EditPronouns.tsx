import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { defaultStyles } from "@/constants/Styles";
import PronounsSelector from "@/components/profile/PronounsSelector";
import Spacer from "@/components/Spacer";

const EditPronouns = () => {
  const navigation = useNavigation();

  const handleSelectPronouns = (pronouns: string) => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <View style={defaultStyles.innerContainer}>
        <View style={defaultStyles.pageHeader}>
          <Text style={defaultStyles.pageTitle}>Edit Pronouns</Text>
        </View>
        <Spacer height={24} />
        <PronounsSelector onSelectPronouns={handleSelectPronouns} />
      </View>
    </SafeAreaView>
  );
};

export default EditPronouns;
