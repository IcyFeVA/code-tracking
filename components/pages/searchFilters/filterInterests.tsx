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
import { SafeAreaView } from "react-native-safe-area-context";
import { storeData } from '@/utils/storage'; // Add this import
import { useAppContext } from '@/providers/AppProvider'; // Add this import
import AsyncStorage from '@react-native-async-storage/async-storage'; // Add this import

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

const FilterInterests = () => {
  const { searchFilters, setSearchFilters } = useAppContext();
  const session = useAuth();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserInterests = async () => {
      try {
        const storedInterests = await AsyncStorage.getItem('filter_interests');
        if (storedInterests) {
          setSelectedInterests(JSON.parse(storedInterests));
          // Update searchFilters here if needed
          setSearchFilters(prevFilters => ({
            ...prevFilters,
            interests: JSON.parse(storedInterests)
          }));
        }
      } catch (error) {
        console.error("Error fetching user interests from AsyncStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInterests();
  }, [setSearchFilters]); // Ensure setSearchFilters is in the dependency array

  const flattenedInterests = useMemo(() => {
    return hobbiesInterests.flatMap((section, index) => [
      { type: "header", title: categories[index] },
      ...section.map((item) => ({ type: "item", ...item })),
    ]);
  }, []);

  const handleInterestToggle = useCallback((value: string) => {
    const intValue = parseInt(value);
    setSelectedInterests((prevInterests) => {
      const newInterests = prevInterests.includes(intValue)
        ? prevInterests.filter((i) => i !== intValue)
        : [...prevInterests, intValue];

      // Update searchFilters here
      setSearchFilters(prevFilters => ({
        ...prevFilters,
        interests: newInterests
      }));

      return newInterests;
    });
  }, [setSearchFilters]);

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
    if (selectedInterests.length === 0) {
      console.log("No interests selected");
      return;
    }

    setIsLoading(true);
    try {
      // Store interests locally in AsyncStorage
      await AsyncStorage.setItem('filter_interests', JSON.stringify(selectedInterests));
      console.log("Interests saved successfully");
      setTimeout(() => navigation.goBack(), 50);
    } catch (error) {
      console.error("Error saving interests to AsyncStorage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={defaultStyles.SafeAreaView}>
    <View style={defaultStyles.innerContainer}>
        <Text style={defaultStyles.h2}>Interest Preference</Text>
        <Spacer height={8} />
        <Text style={defaultStyles.body}>Select your preferred interests for potential matches.</Text>
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
        </SafeAreaView>
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

export default FilterInterests;
