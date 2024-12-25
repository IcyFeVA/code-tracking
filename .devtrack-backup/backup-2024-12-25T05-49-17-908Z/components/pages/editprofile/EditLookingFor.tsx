import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { defaultStyles } from "@/constants/Styles";
import LookingForSelector from "@/components/profile/LookingForSelector";
import Spacer from "@/components/Spacer";

const EditLookingFor = () => {
  const navigation = useNavigation();

  const handleSelectLookingFor = (lookingFor: number) => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <View style={defaultStyles.innerContainer}>
        <View style={defaultStyles.pageHeader}>
          <Text style={defaultStyles.pageTitle}>I'm looking for a...</Text>
        </View>
        <Spacer height={24} />
        <LookingForSelector onSelectLookingFor={handleSelectLookingFor} />
      </View>
    </SafeAreaView>
  );
};

export default EditLookingFor;
