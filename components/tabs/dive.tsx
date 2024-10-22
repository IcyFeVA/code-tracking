import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  StackActions,
  useRoute,
} from "@react-navigation/native";
import { Chip } from "react-native-ui-lib";

import { Colors } from "@/constants/Colors";
import hobbiesInterests from "@/constants/Interests";
import { defaultStyles } from "@/constants/Styles";

import Spacer from "@/components/Spacer";

import { usePotentialMatches, useProfile } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import RenderHtml from "react-native-render-html";

// Constants for actions
const ACTION_LIKE = "like";
const ACTION_DISLIKE = "dislike";

const DEFAULT_IMAGE = require("@/assets/images/react-logo.png");
const LOGO_IMAGE = require("@/assets/images/logo/logo_crushy.png");
const ICON_SHARED_INTEREST = require("@/assets/images/icons/iconSharedInterest.png");
const BUTTON_DISLIKE = require("@/assets/images/buttons/buttonMatchingDislike.png");
const BUTTON_LIKE = require("@/assets/images/buttons/buttonMatchingLike.png");
const BUTTON_CHAT = require("@/assets/images/buttons/buttonMatchingChat.png");
const ICON_HOME = require("@/assets/images/icons/tab-home.png");

// Reusable Components
const Header = ({ onFilterPress, onHomePress }) => (
  <View style={styles.header}>
    <Image source={LOGO_IMAGE} style={styles.logo} />
    <View style={styles.headerButtons}>
      <Pressable style={styles.buttonFilter} onPress={onFilterPress}>
        <Ionicons
          name="search"
          size={16}
          color={Colors.light.text}
          style={styles.icon}
        />
        <Text style={styles.buttonFilterText}>Search Filters</Text>
      </Pressable>
      <Pressable style={styles.buttonFilter} onPress={onHomePress}>
        <Image
          source={ICON_HOME}
          style={styles.homeIcon}
          accessibilityLabel="Home"
        />
      </Pressable>
    </View>
  </View>
);

const ErrorView = () => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>
      An error occurred. Please try again later.
    </Text>
  </View>
);

const NoMatchesView = ({ onSearchFiltersPress, onBackHomePress }) => (
  <View style={styles.noMatchesContainer}>
    <Ionicons
      name="albums-outline"
      size={64}
      color={Colors.light.primary}
      accessibilityLabel="No Matches Icon"
    />
    <Text style={styles.noMatchesTitle}>You've reached the end</Text>
    <Text style={styles.noMatchesText}>No more potential matches to show.</Text>
    <Text style={styles.noMatchesText}>
      Adjust search filters, or check back later.
    </Text>
    <Spacer height={40} />
    <Pressable style={styles.buttonFilter} onPress={onSearchFiltersPress}>
      <Ionicons
        name="search"
        size={16}
        color={Colors.light.text}
        style={styles.icon}
      />
      <Text style={styles.buttonFilterText}>Search Filters</Text>
    </Pressable>
    <Spacer height={40} />
    <Pressable onPress={onBackHomePress}>
      <Text style={styles.refreshText}>Back Home</Text>
    </Pressable>
  </View>
);

const Dive = () => {
  const session = useAuth();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const route = useRoute();
  const { lookingFor } = route.params;

  const {
    matches: potentialMatches,
    loading: matchesLoading,
    error: matchesError,
    fetchFilteredMatches,
    recordAction,
    createInteraction, // Add this
  } = usePotentialMatches();

  const {
    currentUserProfile,
    loading: profileLoading,
    error: profileError,
    fetchCurrentUserProfile,
    fetchProfileDetails,
  } = useProfile();

  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const scrollViewRef = useRef(null);
  const [currentMatchProfile, setCurrentMatchProfile] = useState(null);
  const [webViewHeight, setWebViewHeight] = useState(1);

  const currentMatch = potentialMatches[currentMatchIndex];

  useEffect(() => {
    if (session?.user?.id) {
      fetchFilteredMatches();
      fetchCurrentUserProfile();
    }
  }, [session, fetchFilteredMatches, fetchCurrentUserProfile]);

  // Fetch profile details for the current match
  useEffect(() => {
    const fetchProfile = async () => {
      if (currentMatch?.id) {
        try {
          const profile = await fetchProfileDetails(currentMatch.id);
          if (profile) {
            setCurrentMatchProfile(profile);
          } else {
            console.log(`No profile details found for user ${currentMatch.id}`);
            setCurrentMatchProfile(null);
          }
        } catch (error) {
          console.error("Error fetching profile details:", error);
          setCurrentMatchProfile(null);
        }
      }
    };

    fetchProfile();
  }, [currentMatch, fetchProfileDetails]);

  // Update image URL when current match changes
  useEffect(() => {
    if (currentMatch?.avatar_url) {
      setImageUrl(currentMatch.avatar_url);
    } else {
      setImageUrl(DEFAULT_IMAGE);
    }
  }, [currentMatch]);

  const moveToNextMatch = useCallback(() => {
    setCurrentMatchIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < potentialMatches.length) {
        return nextIndex;
      } else {
        fetchFilteredMatches();
        return 0;
      }
    });
  }, [potentialMatches.length, fetchFilteredMatches]);

  const scrollToTop = useCallback(() => {
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  }, []);

  const handleAction = useCallback(
    async (action) => {
      if (!session?.user?.id || !currentMatch) return;

      scrollToTop();

      try {
        // Create interaction
        await createInteraction(currentMatch.id, action, 2); // 2 for Dive mode

        const isNewMatch = await recordAction(currentMatch.id, action);

        if (action === ACTION_LIKE && isNewMatch) {
          Alert.alert(
            "It's a Match!",
            `You and ${currentMatch.name} have liked each other!`,
            [{ text: "OK", onPress: moveToNextMatch }]
          );
        } else {
          moveToNextMatch();
        }
      } catch (error) {
        console.error("Error in handleAction:", error);
        Alert.alert(
          "Error",
          "An error occurred while processing your action. Please try again."
        );
      }
    },
    [session, currentMatch, recordAction, moveToNextMatch, scrollToTop, createInteraction]
  );

  // Memoize sorted interests at the top level to adhere to Rules of Hooks
  const sortedInterests = useMemo(() => {
    if (!currentMatch?.interests || !currentUserProfile?.interests) {
      return [];
    }

    const matchInterests = currentMatch.interests;
    const userInterests = currentUserProfile.interests;

    return [...matchInterests].sort((a, b) => {
      const aIncluded = userInterests.includes(a);
      const bIncluded = userInterests.includes(b);
      if (aIncluded && !bIncluded) return -1;
      if (!aIncluded && bIncluded) return 1;
      return 0;
    });
  }, [currentMatch, currentUserProfile]);

  const renderInterestChips = useCallback(
    (type) => {
      if (sortedInterests.length === 0) {
        return null;
      }

      return sortedInterests.map((interestId) => {
        const interestObject = hobbiesInterests
          .flat()
          .find((item) => parseInt(item.value, 10) === interestId);

        if (!interestObject) return null;

        const isShared = currentUserProfile.interests.includes(interestId);

        if (type === "shared" && isShared) {
          return (
            <Chip
              key={interestId}
              label={interestObject.label}
              labelStyle={[styles.chipLabel, styles.sharedChipLabel]}
              containerStyle={[styles.chip, styles.sharedChip]}
              iconSource={ICON_SHARED_INTEREST}
            />
          );
        } else if (type !== "shared" && !isShared) {
          return (
            <Chip
              key={interestId}
              label={interestObject.label}
              labelStyle={styles.chipLabel}
              containerStyle={styles.chip}
            />
          );
        }

        return null;
      });
    },
    [sortedInterests, currentUserProfile]
  );

  // Memoize the htmlStyles object
  const htmlStyles = useMemo(
    () => ({
      html: {
        fontFamily: "BodyRegular",
        fontSize: 18,
        lineHeight: 26,
        marginBottom: 16,
      },
      h2: {
        fontFamily: "HeadingBold",
        fontSize: 20,
        marginBottom: 16,
      },
      "h3 span": {
        fontSize: "20%",
      },
      body: {
        fontFamily: "BodyRegular",
        fontSize: 16,
        lineHeight: 26,
        marginBottom: 16,
      },
    }),
    []
  );

  // Memoize the renderBioHtml function
  const renderBioHtml = useMemo(
    () => (bio: string) =>
      (
        <RenderHtml
          contentWidth={width - 32}
          source={{ html: bio }}
          tagsStyles={htmlStyles}
        />
      ),
    [width, htmlStyles]
  );

  // Combined loading state
  const isLoading = matchesLoading || profileLoading;

  if (matchesError || profileError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorView />
      </SafeAreaView>
    );
  }

  if (!currentMatch) {
    return (
      <SafeAreaView style={styles.container}>
        <NoMatchesView
          onSearchFiltersPress={() => navigation.navigate("SearchFilters")}
          onBackHomePress={() => {
            navigation.dispatch(StackActions.popToTop());
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && (
        <ActivityIndicator
          size="small"
          color={Colors.light.accent}
          style={styles.loader}
        />
      )}
      <Header
        onFilterPress={() => navigation.navigate("SearchFilters")}
        onHomePress={() => navigation.goBack()}
      />
      <ScrollView ref={scrollViewRef} style={styles.pageContent}>
        <View style={styles.personContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={
                typeof imageUrl === "string" ? { uri: imageUrl } : imageUrl
              }
              style={styles.person}
              onError={() => setImageUrl(DEFAULT_IMAGE)}
              accessibilityLabel="Profile Image"
            />
          </View>
          <View style={styles.personInfo}>
            <Text style={styles.personName}>
              {!isLoading ? `${currentMatch.name}, ${currentMatch.age}` : "..."}
            </Text>
          </View>
          {currentMatch.interests?.length > 0 &&
            currentUserProfile?.interests?.length > 0 && (
              <View style={styles.sectionContainer}>
                <Spacer height={32} />
                <Text style={styles.sectionTitle}>
                  Shared Hobbies & Interests
                </Text>
                <View style={styles.chipsContainer}>
                  {renderInterestChips("shared")}
                </View>
              </View>
            )}
          <Spacer height={32} />
          {currentMatchProfile?.bio && (
            <View style={styles.bioContainer}>
              <View style={styles.sectionInnerContainer}>
                <Text style={styles.sectionTitle}>Bio</Text>
                <Spacer height={8} />
                {renderBioHtml(currentMatchProfile.bio)}
              </View>
              <Spacer height={32} />
            </View>
          )}
          {currentMatch.interests?.length > 0 &&
            currentUserProfile?.interests?.length > 0 && (
              <View style={styles.sectionContainer}>
                <Spacer height={32} />
                <Text style={styles.sectionTitle}>
                  Other Hobbies & Interests
                </Text>
                <View style={styles.chipsContainer}>
                  {renderInterestChips()}
                </View>
              </View>
            )}
        </View>
        <View style={styles.buttonsMatching}>
          <Pressable
            onPress={() => handleAction(ACTION_DISLIKE)}
            disabled={isLoading}
            accessibilityLabel="Dislike"
          >
            <Image
              source={BUTTON_DISLIKE}
              style={styles.buttonsMatchingSecondary}
            />
          </Pressable>
          <Pressable
            onPress={() => handleAction(ACTION_LIKE)}
            disabled={isLoading}
            accessibilityLabel="Like"
          >
            <Image source={BUTTON_LIKE} style={styles.buttonsMatchingPrimary} />
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "This feature will be available in the future."
              )
            }
            disabled={isLoading}
            accessibilityLabel="Chat"
          >
            <Image
              source={BUTTON_CHAT}
              style={styles.buttonsMatchingSecondary}
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dive;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loader: {
    position: "absolute",
    top: 8,
    left: 16,
    zIndex: 5,
  },
  header: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: Colors.light.tertiary,
    backgroundColor: Colors.light.background,
  },
  logo: {
    width: 96,
    resizeMode: "contain",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  buttonFilter: {
    backgroundColor: Colors.light.white,
    paddingHorizontal: 12,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.light.tertiary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
  },
  buttonFilterText: {
    fontSize: 14,
    fontFamily: "BodyRegular",
    color: Colors.light.text,
  },
  homeIcon: {
    width: 32,
    height: 32,
  },
  personContainer: {
    marginTop: 32,
    paddingHorizontal: 8,
  },
  imageContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  person: {
    width: 120,
    height: 120,
    resizeMode: "cover",
    borderRadius: 60,
    backgroundColor: Colors.light.tertiary,
  },
  personInfo: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  personName: {
    fontFamily: "HeadingBold",
    fontSize: 24,
    color: Colors.light.text,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    rowGap: 8,
  },
  chip: {
    backgroundColor: Colors.light.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 99,
    shadowColor: Colors.light.black,
    marginRight: 8,
  },
  sharedChip: {
    paddingLeft: 16,
    backgroundColor: Colors.light.white,
  },
  sharedChipLabel: {
    color: Colors.light.text,
  },
  chipLabel: {
    color: Colors.light.text,
    fontSize: 13,
    fontFamily: "BodyRegular",
  },
  sectionContainer: {
    paddingHorizontal: 16,
  },
  sectionInnerContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: "HeadingBold",
    fontSize: 22,
    color: Colors.light.text,
    marginTop: 16,
  },
  bioContainer: {
    paddingHorizontal: 0,
  },
  bioText: {
    fontFamily: "BodyRegular",
    fontSize: 18,
    lineHeight: 26,
  },
  buttonsMatching: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  buttonsMatchingPrimary: {
    width: 90,
    height: 90,
  },
  buttonsMatchingSecondary: {
    width: 80,
    height: 80,
    marginHorizontal: 16,
  },
  noMatchesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
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
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  errorText: {
    fontFamily: "BodyRegular",
    fontSize: 16,
    color: Colors.light.text,
    textAlign: "center",
  },
  icon: {
    marginTop: 2,
    marginRight: 4,
  },
});
