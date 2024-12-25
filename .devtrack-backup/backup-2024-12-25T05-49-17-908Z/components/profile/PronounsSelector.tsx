import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button, Checkbox } from "react-native-ui-lib";
import { defaultStyles } from "@/constants/Styles";
import Toast from "react-native-toast-message";
import Spacer from "@/components/Spacer";

interface PronounsSelectorProps {
  onSelectPronouns: (pronouns: string[]) => void;
}

const pronounsOptions = [
  { key: 1, title: "he/him" },
  { key: 2, title: "she/her" },
  { key: 3, title: "they/them" },
  { key: 4, title: "ze/zir" },
  { key: 5, title: "xe/xem" },
  { key: 6, title: "ve/ver" },
  { key: 7, title: "ey/em" },
  { key: 99, title: "other" },
];

const PronounsSelector: React.FC<PronounsSelectorProps> = ({
  onSelectPronouns,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const session = useAuth();

  useEffect(() => {
    if (session?.user) {
      fetchPronouns();
    }
  }, [session]);

  const fetchPronouns = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from("profiles_test")
        .select("pronouns")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      setSelectedValues(data.pronouns);
    } catch (error) {
      console.error("Error fetching pronouns:", error);
    }
  };

  const handlePress = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((item) => item !== value));
    } else {
      if (selectedValues.length >= 2) {
        return;
      }
      setSelectedValues([...selectedValues, value]);
    }
  };

  const handleSave = async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles_test")
        .update({ pronouns: selectedValues, updated_at: new Date() })
        .eq("id", session.user.id);

      if (error) throw error;
      onSelectPronouns(selectedValues);
    } catch (error) {
      console.error("Error updating pronouns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={defaultStyles.body}>
        Choose <Text style={defaultStyles.bodyBold}>up to two</Text> pronouns.
        If you don't find your pronouns listed, you'll have the option to add
        them in a future update.
      </Text>
      <Spacer height={48} />
      <FlatList
        data={pronounsOptions}
        renderItem={({ item }) => (
          <Pressable onPress={() => handlePress(item.key)}>
            <Checkbox
              color={
                selectedValues.includes(item.key)
                  ? Colors.light.text
                  : Colors.light.tertiary
              }
              label={item.title}
              value={selectedValues.includes(item.key)}
              containerStyle={[
                defaultStyles.checkboxButton,
                {
                  borderColor: selectedValues.includes(item.key)
                    ? Colors.light.text
                    : Colors.light.tertiary,
                },
              ]}
              labelStyle={defaultStyles.checkboxButtonLabel}
              onValueChange={() => handlePress(item.key)}
            />
          </Pressable>
        )}
        keyExtractor={(item) => item.key.toString()}
        showsVerticalScrollIndicator={false}
        bounces={false}
      />
      <Spacer height={24} />

      <Button
        onPress={handleSave}
        style={[
          defaultStyles.button,
          defaultStyles.buttonShadow,
          selectedValues.length === 0 && defaultStyles.disabledButton,
        ]}
        disabled={selectedValues.length === 0 || isLoading}
      >
        <Text
          style={[
            defaultStyles.buttonLabel,
            selectedValues.length === 0 && defaultStyles.disabledButtonText,
          ]}
        >
          {isLoading ? "Updating..." : "Update Pronouns"}
        </Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 8,
    flex: 1,
  },
});

export default PronounsSelector;
