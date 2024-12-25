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

interface GenderSelectorProps {
  onSelectGender: (gender: number) => void;
}

const genderOptions = [
  { label: "Male", value: 1 },
  { label: "Female", value: 2 },
  { label: "Male (Transgender)", value: 3 },
  { label: "Female (Transgender)", value: 4 },
  { label: "Non-binary", value: 5 },
  { label: "Genderqueer", value: 6 },
  { label: "Genderfluid", value: 7 },
  { label: "Agender", value: 8 },
  { label: "Two-Spirit", value: 9 },
];

const GenderSelector: React.FC<GenderSelectorProps> = ({ onSelectGender }) => {
  const [selectedGender, setSelectedGender] = useState<number | null>(null);
  const session = useAuth();

  useEffect(() => {
    if (session?.user) {
      fetchGender();
    }
  }, [session]);

  const fetchGender = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from("profiles_test")
        .select("gender")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      if (data && data.gender) {
        setSelectedGender(data.gender);
      }
    } catch (error) {
      console.error("Error fetching gender:", error);
    }
  };

  const handleSelectGender = async (gender: number) => {
    if (!session?.user) return;
    setSelectedGender(gender);
    onSelectGender(gender);

    try {
      const { error } = await supabase
        .from("profiles_test")
        .update({ gender, updated_at: new Date() })
        .eq("id", session.user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating gender:", error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {genderOptions.map((option) => (
        <RadioButton
          label={option.label}
          size={20}
          color={
            selectedGender === option.value
              ? Colors.light.text
              : Colors.light.tertiary
          }
          contentOnLeft
          containerStyle={[
            defaultStyles.radioButton,
            {
              borderColor:
                selectedGender === option.value
                  ? Colors.light.text
                  : Colors.light.tertiary,
            },
          ]}
          labelStyle={defaultStyles.radioButtonLabel}
          selected={selectedGender === option.value}
          onPress={() => handleSelectGender(option.value)}
          key={option.value}
        />
      ))}
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

export default GenderSelector;
