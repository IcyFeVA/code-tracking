import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { defaultStyles } from "@/constants/Styles";
import { FlashList } from "@shopify/flash-list";
import { Checkbox, Button } from "react-native-ui-lib";
import Spacer from "@/components/Spacer";
import hobbiesInterests from "@/constants/Interests";
import { useNavigation } from "@react-navigation/native";


const categories = [
  "Outdoor Activities",
  "Sports & Fitness",
  "Creative Arts",
  "Entertainment & Media",
  "Culinary Interests",
  "Social Activities",
  "Tech & Science",
  "Intellectual Pursuits",
  "Nature & Animals",
  "Miscellaneous",
];

const InterestSelector = ({ onSelectInterests }) => {
  const session = useAuth();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (session?.user) {
      fetchUserInterests();
    }
  }, [session]);

  const fetchUserInterests = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from("profiles_test")
        .select("interests")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      if (data && data.interests) {
        setSelectedInterests(data.interests);
      }
    } catch (error) {
      console.error("Error fetching user interests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const flattenedInterests = useMemo(() => {
    return hobbiesInterests.flatMap((section, index) => [
      { type: "header", title: categories[index] },
      ...section.map((item) => ({ type: "item", ...item })),
    ]);
  }, []);

  const handleInterestToggle = useCallback((value: string) => {
    const intValue = parseInt(value);
    setSelectedInterests((prevInterests) => {
      if (prevInterests.includes(intValue)) {
        return prevInterests.filter((i) => i !== intValue);
      } else {
        return [...prevInterests, intValue];
      }
    });
  }, []);

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === "header") {
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{item.title}</Text>
          </View>
        );
      }
      const isSelected = selectedInterests.includes(parseInt(item.value));
      return (
        <Pressable onPress={() => handleInterestToggle(item.value)}>
          <Checkbox
            color={isSelected ? Colors.light.text : Colors.light.tertiary}
            label={item.label}
            value={isSelected}
            containerStyle={[
              defaultStyles.checkboxButton,
              {
                borderColor: isSelected
                  ? Colors.light.text
                  : Colors.light.tertiary,
              },
            ]}
            labelStyle={defaultStyles.checkboxButtonLabel}
            onValueChange={() => handleInterestToggle(item.value)}
          />
        </Pressable>
      );
    },
    [selectedInterests, handleInterestToggle]
  );

  const saveInterests = async () => {
    if (!session?.user) return;

    if (selectedInterests.length === 0) {
      console.log("No interests selected");
      onSelectInterests(selectedInterests);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles_test")
        .update({ interests: selectedInterests, updated_at: new Date() })
        .eq("id", session.user.id);

      if (error) throw error;

      console.log("Interests saved successfully");
      onSelectInterests(selectedInterests);
    } catch (error) {
      console.error("Error saving interests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={defaultStyles.h2}>
        Interests ({selectedInterests.length})
      </Text>
      <Spacer height={8} />
      <View>
        <Text style={defaultStyles.body}>
          This helps people find you based on your interests.
        </Text>
      </View>
      <Spacer height={24} />
      <FlashList
        data={flattenedInterests}
        renderItem={renderItem}
        estimatedItemSize={75}
        keyExtractor={(item, index) =>
          item.type === "header" ? `header-${index}` : item.value
        }
        extraData={selectedInterests}
        contentContainerStyle={styles.listContentContainer}
      />
      <Spacer height={24} />

      <Button
        onPress={saveInterests}
        style={[defaultStyles.button, defaultStyles.buttonShadow]}
        disabled={isLoading}
      >
        <Text style={defaultStyles.buttonLabel}>
          {isLoading ? "Updating ..." : "Update Interests"}
        </Text>
      </Button>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tertiary,
  },
  selectedOption: {
    backgroundColor: Colors.light.primary,
  },
  optionText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  selectedOptionText: {
    color: Colors.light.textInverted,
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.background,
    marginTop: 32,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.accent,
  },
  listContentContainer: {
    paddingBottom: 24,
  },
});

export default InterestSelector;
