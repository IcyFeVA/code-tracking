import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, StackActions } from "@react-navigation/native";
import { Chip, Fader } from "react-native-ui-lib";

import { Colors } from "@/constants/Colors";
import hobbiesInterests from "@/constants/Interests";
import { defaultStyles } from "@/constants/Styles";

import Spacer from "@/components/Spacer";
import TypewriterEffect from "@/components/CrushyTypewriterEffect";

import { usePotentialMatches, useProfile } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";

// Constants
const DEFAULT_IMAGE = require("@/assets/images/react-logo.png");
const LOGO_IMAGE = require("@/assets/images/logo/logo_crushy.png");
const SEARCH_ICON = require("@/assets/images/icons/iconSharedInterest.png");
const BUTTONS = {
  dislike: require("@/assets/images/buttons/buttonMatchingDislike.png"),
  like: require("@/assets/images/buttons/buttonMatchingLike.png"),
  chat: require("@/assets/images/buttons/buttonMatchingChat.png"),
  home: require("@/assets/images/icons/tab-home.png"),
};

const Surf = () => {
  const session = useAuth();
  const navigation = useNavigation();

  const {
    matches: potentialMatches,
    loading,
    error,
    fetchMatches,
    recordAction,
  } = usePotentialMatches();

  const { currentUserProfile, fetchCurrentUserProfile } = useProfile();

  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const [imageStr, setImageStr] = useState("");

  const typewriterKey = useRef(0);

  // Fetch matches and user profile on session change
  useEffect(() => {
    if (session?.user?.id) {
      fetchMatches();
      fetchCurrentUserProfile();
    }
  }, [session, fetchMatches, fetchCurrentUserProfile]);

  // Update imageUrl when the current match changes
  useEffect(() => {
    const currentMatch = potentialMatches[currentMatchIndex];
    if (currentMatch?.avatar_url) {
      setImageUrl({ uri: currentMatch.avatar_url });
      setImageStr(currentMatch.avatar_url);
    } else {
      setImageUrl(DEFAULT_IMAGE);
    }
  }, [currentMatchIndex, potentialMatches]);

  const currentMatch = potentialMatches[currentMatchIndex];

  // Handles like and dislike actions
  const handleAction = useCallback(
    async (action) => {
      if (!session?.user?.id || !currentMatch) return;

      try {
        const isNewMatch = await recordAction(currentMatch.id, action);

        if (action === "like" && isNewMatch) {
          Alert.alert(
            "It's a Match!",
            `You and ${currentMatch.name} have liked each other!`,
            [{ text: "OK", onPress: moveToNextMatch }]
          );
        } else {
          moveToNextMatch();
        }
      } catch (err) {
        console.error("Error in handleAction:", err);
      }
    },
    [session, currentMatch, recordAction, moveToNextMatch]
  );

  const handleLike = useCallback(() => handleAction("like"), [handleAction]);
  const handleDislike = useCallback(
    () => handleAction("dislike"),
    [handleAction]
  );

  // Move to the next match or refetch matches if at the end
  const moveToNextMatch = useCallback(() => {
    setCurrentMatchIndex((prevIndex) => {
      if (prevIndex < potentialMatches.length - 1) {
        return prevIndex + 1;
      } else {
        fetchMatches();
        return 0;
      }
    });
    typewriterKey.current += 1;
  }, [potentialMatches.length, fetchMatches]);

  // Renders interest chips, prioritizing shared interests
  const renderInterestChips = useCallback(() => {
    if (!currentMatch || !currentUserProfile?.interests) return null;

    const sortedInterests = [...currentMatch.interests].sort((a, b) => {
      const aShared = currentUserProfile.interests.includes(a);
      const bShared = currentUserProfile.interests.includes(b);
      if (aShared && !bShared) return -1;
      if (!aShared && bShared) return 1;
      return 0;
    });

    return sortedInterests.map((interestId, index) => {
      const interest = hobbiesInterests
        .flat()
        .find((item) => item.value === String(interestId));
      if (!interest) {
        console.error(`No label found for interest: ${interestId}`);
        return null;
      }

      const isLast = index === sortedInterests.length - 1;
      const isShared = currentUserProfile.interests.includes(interestId);

      return (
        <Chip
          key={`${currentMatch.id}-${interestId}`}
          label={interest.label}
          labelStyle={[styles.chipLabel, isShared && styles.sharedChipLabel]}
          containerStyle={[
            styles.chip,
            isShared && styles.sharedChip,
            isLast && styles.lastChip,
          ]}
          iconSource={isShared ? SEARCH_ICON : null}
        />
      );
    });
  }, [currentMatch, currentUserProfile]);

  // Navigation handlers
  const navigateToSearchFilters = useCallback(() => {
    navigation.navigate("SearchFilters");
  }, [navigation]);

  const navigateBackHome = useCallback(() => {
    navigation.dispatch(StackActions.popToTop());
  }, [navigation]);

  const navigateToProfile = useCallback(() => {
    if (!currentMatch) return;
    navigation.navigate("Profile", {
      id: currentMatch.id,
      imageStr,
    });
  }, [navigation, currentMatch, imageUrl]);

  // Render different states: Error, No Matches, or Main Content
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>
            An error occurred. Please try again later.
            {"\n"}
            {error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentMatch) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <Ionicons
            name="albums-outline"
            size={64}
            color={Colors.light.primary}
          />
          <Text style={styles.noMatchesTitle}>You've reached the end</Text>
          <Text style={styles.noMatchesText}>
            No more potential matches to show.
            {"\n"}
            Adjust search filters, or check back later.
          </Text>
          <Spacer height={40} />
          <Pressable style={styles.button} onPress={navigateToSearchFilters}>
            <Ionicons
              name="search"
              size={12}
              color={Colors.light.text}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Search Filters</Text>
          </Pressable>
          <Spacer height={40} />
          <Pressable onPress={navigateBackHome}>
            <Text style={styles.refreshText}>Back Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={LOGO_IMAGE} style={styles.logo} />
          <View style={styles.headerButtons}>
            <Pressable style={styles.button} onPress={navigateToSearchFilters}>
              <Ionicons
                name="search"
                size={12}
                color={Colors.light.text}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Search Filters</Text>
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <Image source={BUTTONS.home} style={styles.homeIcon} />
            </Pressable>
          </View>
        </View>

        {/* Match Card */}
        <View style={styles.personContainer}>
          <Image
            source={imageUrl}
            style={styles.person}
            onError={() => setImageUrl(DEFAULT_IMAGE)}
          />
          <Fader
            visible
            position={Fader.position.BOTTOM}
            tintColor="#282828"
            size={222}
          />
          {!loading && (
            <View style={styles.personInfo}>
              <TypewriterEffect
                key={typewriterKey.current}
                text={`${currentMatch.name}, ${currentMatch.age}`}
                style={styles.personName}
                delay={12}
                numberOfLines={1}
                adjustsFontSizeToFit
              />
            </View>
          )}
          <ScrollView
            horizontal
            style={styles.chipsContainer}
            showsHorizontalScrollIndicator={false}
          >
            {renderInterestChips()}
          </ScrollView>
          <Pressable
            onPress={navigateToProfile}
            style={[styles.expandButton, defaultStyles.buttonShadow]}
          >
            <Ionicons
              name="chevron-down"
              size={24}
              color={Colors.light.accent}
            />
          </Pressable>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable onPress={handleDislike} disabled={loading}>
            <Image source={BUTTONS.dislike} style={styles.secondaryButton} />
          </Pressable>
          <Pressable onPress={handleLike} disabled={loading}>
            <Image source={BUTTONS.like} style={styles.primaryButton} />
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "This feature will be available in the future."
              )
            }
            disabled={loading}
          >
            <Image source={BUTTONS.chat} style={styles.secondaryButton} />
          </Pressable>
        </View>

        {/* Loader */}
        {loading && (
          <ActivityIndicator
            size="small"
            color={Colors.light.accent}
            style={styles.loader}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Surf;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  innerContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    width: "100%",
    marginTop: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  logo: {
    width: 96,
    resizeMode: "contain",
  },
  button: {
    backgroundColor: Colors.light.white,
    paddingVertical: 2,
    paddingHorizontal: 12,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.light.tertiary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
    gap: 4,
  },
  buttonIcon: {
    marginTop: 2,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: "BodyRegular",
    color: Colors.light.text,
  },
  iconButton: {
    backgroundColor: Colors.light.white,
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: Colors.light.tertiary,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
  },
  homeIcon: {
    width: 32,
    height: 32,
  },
  personContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    width: "100%",
    height: "100%",
  },
  person: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    backgroundColor: Colors.light.backgroundSecondary,
  },
  loader: {
    position: "absolute",
    top: 8,
    left: 16,
    zIndex: 5,
  },
  personInfo: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    position: "absolute",
    bottom: 64,
    left: 16,
  },
  personName: {
    fontFamily: "HeadingBold",
    fontSize: 32,
    color: Colors.light.white,
  },
  chipsContainer: {
    flex: 1,
    position: "absolute",
    bottom: 16,
    paddingHorizontal: 16,
  },
  chip: {
    backgroundColor: Colors.light.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 99,
  },
  lastChip: {
    marginRight: 32,
  },
  chipLabel: {
    color: Colors.light.text,
    fontSize: 13,
    fontFamily: "BodyRegular",
  },
  sharedChip: {
    paddingLeft: 12,
    backgroundColor: Colors.light.white,
  },
  sharedChipLabel: {
    color: Colors.light.text,
  },
  expandButton: {
    backgroundColor: Colors.light.white,
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: Colors.light.tertiary,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.light.black,
    position: "absolute",
    bottom: 68,
    right: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  primaryButton: {
    maxWidth: 90,
    maxHeight: 90,
  },
  secondaryButton: {
    maxWidth: 80,
    maxHeight: 80,
    marginHorizontal: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noMatchesTitle: {
    fontFamily: "HeadingBold",
    fontSize: 24,
    color: Colors.light.text,
    marginTop: 16,
    textAlign: "center",
  },
  noMatchesText: {
    fontFamily: "BodyRegular",
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 22,
    textAlign: "center",
  },
  refreshText: {
    fontFamily: "BodySemiBold",
    fontSize: 18,
    color: Colors.light.accent,
  },
  errorText: {
    fontFamily: "BodyRegular",
    fontSize: 16,
    color: Colors.light.text,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
