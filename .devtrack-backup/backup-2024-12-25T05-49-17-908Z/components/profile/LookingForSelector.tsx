import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { RadioButton } from "react-native-ui-lib";
import { defaultStyles } from "@/constants/Styles";
import { storeData } from "@/utils/storage";
import Spacer from "@/components/Spacer";

interface LookingForSelectorProps {
  onSelectLookingFor: (relationshipType: number) => void;
}

const lookingForOptions = [
  { label: "Relationship", value: 1 },
  { label: "Friendship", value: 2 },
  { label: "Casual (Image Focused)", value: 3 },
];
const LookingForSelector: React.FC<LookingForSelectorProps> = ({
  onSelectLookingFor,
}) => {
  const [selectedLookingFor, setSelectedLookingFor] = useState<number | null>(
    null
  );
  const session = useAuth();

  useEffect(() => {
    if (session?.user) {
      fetchLookingFor();
    }
  }, [session]);

  const fetchLookingFor = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from("profiles_test")
        .select("looking_for")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      if (data && data.looking_for) {
        setSelectedLookingFor(data.looking_for);
      }
    } catch (error) {
      console.error("Error fetching gender:", error);
    }
  };

  const handleSelectLookingFor = async (looking_for: number) => {
    if (!session?.user) return;
    setSelectedLookingFor(looking_for);
    onSelectLookingFor(looking_for);

    await storeData("lookingFor", looking_for);

    try {
      const { error } = await supabase
        .from("profiles_test")
        .update({ looking_for, updated_at: new Date() })
        .eq("id", session.user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating gender:", error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {lookingForOptions.map((option) => (
        <RadioButton
          label={option.label}
          size={20}
          color={
            selectedLookingFor === option.value
              ? Colors.light.text
              : Colors.light.tertiary
          }
          contentOnLeft
          containerStyle={[
            defaultStyles.radioButton,
            {
              borderColor:
                selectedLookingFor === option.value
                  ? Colors.light.text
                  : Colors.light.tertiary,
            },
          ]}
          labelStyle={defaultStyles.radioButtonLabel}
          selected={selectedLookingFor === option.value}
          onPress={() => handleSelectLookingFor(option.value)}
          key={option.value}
        />
      ))}
      <Spacer height={24} />

      <View style={{ paddingHorizontal: 8 }}>
        <Text style={defaultStyles.bodyBold}>Your selection matters: </Text>
        <Text style={defaultStyles.body}>
          If you're looking for a casual connection, your discovery experience
          is more focused on images. We call this 'Surf' mode.
        </Text>
        <Spacer height={8} />
        <Text style={defaultStyles.body}>
          Otherwise, if you're looking for a relationship or a friend, 'Dive'
          mode prioritizes personality, focusing on bios and interests while
          initially pixelating photos. As you continue chatting, the photos will
          gradually become clearer.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.gray,
  },
  selectedOption: {
    backgroundColor: Colors.light.primary,
  },
  optionText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  selectedOptionText: {
    color: "white",
  },
});

export default LookingForSelector;
