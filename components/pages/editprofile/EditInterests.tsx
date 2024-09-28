import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { defaultStyles } from "@/constants/Styles";
import Spacer from "@/components/Spacer";
import InterestSelector from "@/components/profile/InterestSelector";
import Toast, { ToastRef } from "react-native-toast-message";
import { Colors } from "@/constants/Colors";

const toastConfig = {
  default: ({ text1, text2, props }) => (
    <View
      style={{
        display: "flex",
        justifyContent: "center",
        width: "94%",
        backgroundColor: Colors.light.accent,
        borderColor: Colors.light.white,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontFamily: "HeadingBold",
          color: Colors.light.textInverted,
        }}
      >
        {text1}
      </Text>
      <Text
        style={{
          fontFamily: "BodyRegular",
          color: Colors.light.textInverted,
        }}
      >
        {text2}
      </Text>
    </View>
  ),
};

const EditInterests = () => {
  const navigation = useNavigation();

  const handleSelecInterests = (selectedInterests: Array<string>) => {
    if (selectedInterests.length === 0) {
      Toast.show({
        type: "default",
        text1: "👋 Hey",
        text2: "Please select at least one hobby or interest",
      });
      return;
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
      <View style={defaultStyles.innerContainer}>
        <View style={defaultStyles.pageHeader}>
          <Text style={defaultStyles.pageTitle}>Edit Interests</Text>
        </View>
        <Spacer height={24} />
        <View style={{ paddingHorizontal: 8, flex: 1 }}>
          <InterestSelector onSelectInterests={handleSelecInterests} />
        </View>
      </View>
      <Toast config={toastConfig} />
    </SafeAreaView>
  );
};

export default EditInterests;
