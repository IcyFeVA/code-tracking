import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text } from "react-native-ui-lib";
import { useNavigation } from "@react-navigation/native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Colors } from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { Ionicons } from "@expo/vector-icons";

const EditBio = () => {
  const session = useAuth();
  const navigation = useNavigation();
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [editorHeight, setEditorHeight] = useState(200);
  const richText = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    const fetchBio = async () => {
      try {
        if (!session?.user) return;

        setLoading(true);

        const { data, error } = await supabase
          .from("profile_details") // Make sure this matches your table name
          .select("bio")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;

        if (data && data.bio) {
          setBio(data.bio);
          richText.current?.setContentHTML(data.bio);
        }
      } catch (error) {
        console.error("Error fetching bio:", error);
        Alert.alert("Error", "Failed to load bio");
      } finally {
        setLoading(false);
      }
    };

    fetchBio();
  }, [session]);

  const handleSave = useCallback(async () => {
    try {
      if (!session?.user) return;

      const { error } = await supabase
        .from("profile_details")
        .update({ bio: bio })
        .eq("id", session.user.id);

      if (error) throw error;

      console.log("Your bio has been updated.");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating bio:", error);
      Alert.alert("Error", "Failed to update bio");
    }
  }, [session, bio, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 50}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          <View style={styles.pageHeader}>
            <Text style={defaultStyles.pageTitle}>Edit Bio</Text>
          </View>

          <RichToolbar
            editor={richText}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.heading2,
              actions.heading3,
              actions.setParagraph,
            ]}
            iconMap={{
              [actions.heading2]: ({ tintColor }) => (
                <Text style={[styles.tib1, { color: tintColor }]}>A</Text>
              ),
              [actions.heading3]: ({ tintColor }) => (
                <Text style={[styles.tib2, { color: tintColor }]}>A</Text>
              ),
              [actions.setParagraph]: ({ tintColor }) => (
                <Text style={[styles.tib3, { color: tintColor }]}>A</Text>
              ),
            }}
          />

          <RichEditor
            ref={richText}
            initialContentHTML={bio}
            onChange={setBio}
            placeholder="Write your bio here. Tip: Don't keep it short. Write about you, who you are, and what you're looking for."
            style={[styles.richEditor, { height: editorHeight }]}
            initialHeight={200}
            onHeightChange={setEditorHeight}
          />

          <Button
            onPress={handleSave}
            style={[defaultStyles.button, defaultStyles.buttonShadow]}
            disabled={loading}
          >
            <Text style={defaultStyles.buttonLabel}>
              {loading ? "Updating ..." : "Update Bio"}
            </Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  pageHeader: {
    marginBottom: 24,
  },
  richEditor: {
    minHeight: 200,
    flex: 1,
    backgroundColor: Colors.light.secondary,
    borderRadius: 8,
    padding: 8,
  },
  tib1: {
    textAlign: "center",
    color: Colors.light.text,
    fontSize: 20,
    fontFamily: "BodyBold",
  },
  tib2: {
    textAlign: "center",
    color: Colors.light.text,
    fontSize: 16,
    fontFamily: "BodyBold",
  },
  tib3: {
    textAlign: "center",
    color: Colors.light.text,
    fontSize: 14,
    fontFamily: "BodyBold",
  },
});

export default EditBio;
