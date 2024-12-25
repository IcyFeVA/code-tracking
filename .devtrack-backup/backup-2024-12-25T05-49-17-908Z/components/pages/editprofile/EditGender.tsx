import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { defaultStyles } from "@/constants/Styles";
import GenderSelector from "@/components/profile/GenderSelector";
import Spacer from "@/components/Spacer";

const EditGender = () => {
  const navigation = useNavigation();

  const handleSelectGender = (gender: number) => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <View style={defaultStyles.innerContainer}>
        <View style={defaultStyles.pageHeader}>
          <Text style={defaultStyles.pageTitle}>Edit Gender</Text>
        </View>
        <Spacer height={24} />
        <GenderSelector onSelectGender={handleSelectGender} />
      </View>
    </SafeAreaView>
  );
};

export default EditGender;
