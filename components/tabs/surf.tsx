import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, Image, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import hobbiesInterests from '@/constants/Interests';
import { defaultStyles } from '@/constants/Styles';
import Spacer from '@/components/Spacer';
import { Chip, Fader } from 'react-native-ui-lib';
import TypewriterEffect from '@/components/CrushyTypewriterEffect';
import { useNavigation, StackActions } from '@react-navigation/native';
import { usePotentialMatches, useProfile } from '@/hooks/useApi';
import { useAuth } from "@/hooks/useAuth";

export default function Surf() {
  const session = useAuth();
  const {
    matches: potentialMatches,
    loading,
    error,
    fetchMatches,
    recordAction,
  } = usePotentialMatches();
  const { currentUserProfile, fetchCurrentUserProfile } = useProfile();
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | number>(
    require("@/assets/images/react-logo.png")
  );
  const navigation = useNavigation();
  const typewriterKey = useRef(0);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMatches();
      fetchCurrentUserProfile();
    }
  }, [session, fetchMatches, fetchCurrentUserProfile]);

  useEffect(() => {
    const currentMatch = potentialMatches[currentMatchIndex];
    if (currentMatch?.avatar_url) {
      setImageUrl(currentMatch.avatar_url);
    } else {
      setImageUrl(require("@/assets/images/react-logo.png"));
    }
  }, [currentMatchIndex, potentialMatches]);

  const currentMatch = potentialMatches[currentMatchIndex];

  const handleAction = useCallback(async (action: 'like' | 'dislike') => {
    if (!session?.user?.id || !currentMatch) return;

    try {
        const isNewMatch = await recordAction(currentMatch.id, action);

        if (action === 'like' && isNewMatch) {
            Alert.alert(
                "It's a Match!",
                `You and ${currentMatch.name} have liked each other!`,
                [{ text: "OK", onPress: () => moveToNextMatch() }]
            );
        } else {
            moveToNextMatch();
        }
    } catch (error) {
        console.error("Error in handleAction:", error);
    }
}, [session, currentMatch, recordAction, moveToNextMatch]);

const moveToNextMatch = useCallback(() => {
    if (currentMatchIndex < potentialMatches.length - 1) {
        setCurrentMatchIndex(prevIndex => prevIndex + 1);
    } else {
        fetchMatches();
        setCurrentMatchIndex(0);
    }

    typewriterKey.current += 1;
}, [currentMatchIndex, potentialMatches.length, fetchMatches]);

  const handleLike = () => handleAction("like");
  const handleDislike = () => handleAction("dislike");

  const renderInterestChips = useCallback(() => {
    if (!currentMatch || !currentUserProfile?.interests) return null;

    const sortedInterests = [...currentMatch.interests].sort((a, b) => {
      const aIsShared = currentUserProfile.interests.includes(a);
      const bIsShared = currentUserProfile.interests.includes(b);
      if (aIsShared && !bIsShared) return -1;
      if (!aIsShared && bIsShared) return 1;
      return 0;
    });

    return sortedInterests.map((interestId, index) => {
      const interestObject = hobbiesInterests
        .flat()
        .find((item) => item.value === interestId.toString());

      if (!interestObject) {
        console.error(`No label found for interest: ${interestId}`);
        return null;
      }

      const isLast = index === sortedInterests.length - 1;
      const isShared = currentUserProfile.interests.includes(interestId);

      return (
        <Chip
          key={`${currentMatch.id}-${interestId}`}
          label={interestObject.label}
          labelStyle={[styles.chipLabel, isShared && styles.sharedChipLabel]}
          containerStyle={[
            styles.chip,
            isShared && styles.sharedChip,
            isLast && { marginRight: 32 },
          ]}
          iconSource={
            isShared
              ? require("@/assets/images/icons/iconSharedInterest.png")
              : null
          }
        />
      );
    });
  }, [currentMatch, currentUserProfile]);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            An error occurred. Please try again later. ${error.message}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentMatch) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noMatchesContainer}>
          <Ionicons
            name="albums-outline"
            size={64}
            color={Colors.light.primary}
          />
          <Text style={styles.noMatchesTitle}>You've reached the end</Text>
          <Text style={styles.noMatchesText}>
            No more potential matches to show.
          </Text>
          <Text style={styles.noMatchesText}>
            Adjust search filters, or check back later.
          </Text>
          <Spacer height={40} />
          <Pressable
            style={[styles.buttonFilter]}
            onPress={() => {
              navigation.navigate("SearchFilters");
            }}
          >
            <Ionicons
              name="search"
              size={12}
              color={Colors.light.text}
              style={{ marginTop: 2 }}
            />
            <Text style={styles.buttonFilterText}>Search Filters</Text>
          </Pressable>
          <Spacer height={40} />
          <Pressable
            onPress={() => {
              navigation.dispatch(StackActions.popToTop());
            }}
          >
            <Text style={styles.refreshText}>Back Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Image
            source={require("@/assets/images/logo/logo_crushy.png")}
            style={styles.logo}
          />

          <View style={{ display: "flex", flexDirection: "row", gap: 8 }}>
            <Pressable
              style={[styles.buttonFilter]}
              onPress={() => {
                navigation.navigate("SearchFilters");
              }}
            >
              <Ionicons
                name="search"
                size={12}
                color={Colors.light.text}
                style={{ marginTop: 2 }}
              />
              <Text style={styles.buttonFilterText}>Search Filters</Text>
            </Pressable>

            <Pressable
              style={[styles.buttonFilter]}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Image
                source={require("@/assets/images/icons/tab-home.png")}
                style={{ width: 32, aspectRatio: "1" }}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.personContainer}>
          <Image
            source={typeof imageUrl === "string" ? { uri: imageUrl } : imageUrl}
            style={styles.person}
            onError={() => {
              console.log("Error loading image, setting default");
              setImageUrl(require("@/assets/images/react-logo.png"));
            }}
          />

          <Fader
            visible
            position={Fader.position.BOTTOM}
            tintColor={"#282828"}
            size={222}
          />

          {!loading && (
            <View style={{ width: "78%" }}>
              <View style={styles.personInfo}>
                <TypewriterEffect
                  key={typewriterKey.current}
                  text={currentMatch.name + ", " + currentMatch.age.toString()}
                  style={styles.personName}
                  delay={12}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                />
              </View>
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
            onPress={() => {
              navigation.navigate("Profile", {
                id: currentMatch.id,
                imageUrl: imageUrl,
              });
            }}
            style={[styles.buttonExpand, defaultStyles.buttonShadow]}
          >
            <Ionicons
              name="chevron-down"
              size={24}
              color={Colors.light.accent}
            />
          </Pressable>
        </View>
        <View style={styles.buttonsMatching}>
          <Pressable onPress={handleDislike} disabled={loading}>
            <Image
              source={require("@/assets/images/buttons/buttonMatchingDislike.png")}
              style={styles.buttonsMatchingSecondary}
            />
          </Pressable>
          <Pressable onPress={handleLike} disabled={loading}>
            <Image
              source={require("@/assets/images/buttons/buttonMatchingLike.png")}
              style={styles.buttonsMatchingPrimary}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              alert("This feature will be available in the future.");
            }}
            disabled={loading}
          >
            <Image
              source={require("@/assets/images/buttons/buttonMatchingChat.png")}
              style={styles.buttonsMatchingSecondary}
            />
          </Pressable>
        </View>

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
}

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
  logo: {
    width: 96,
    resizeMode: "contain",
  },
  buttonFilter: {
    backgroundColor: Colors.light.white,
    paddingBottom: 2,
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
  buttonFilterText: {
    fontSize: 14,
    fontFamily: "BodyRegular",
    color: Colors.light.text,
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
  personAge: {
    fontFamily: "HeadingBold",
    fontSize: 32,
    color: Colors.light.white,
    opacity: 0.7,
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
    paddingHorizontal: 4,
    marginRight: 8,
    borderRadius: 99,
    borderWidth: 0,
  },
  chipLabel: {
    color: Colors.light.text,
    fontSize: 13,
    fontFamily: "BodyRegular",
  },
  buttonExpand: {
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
  buttonsMatching: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  buttonsMatchingPrimary: {
    maxWidth: 90,
    maxHeight: 90,
  },
  buttonsMatchingSecondary: {
    maxWidth: 80,
    maxHeight: 80,
    marginHorizontal: 16,
  },
  noMatchesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noMatchesTitle: {
    fontFamily: "HeadingBold",
    fontSize: 24,
    color: Colors.light.text,
    marginTop: 16,
  },
  noMatchesText: {
    fontFamily: "BodyRegular",
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 22,
  },
  refreshText: {
    fontFamily: "BodySemiBold",
    fontSize: 18,
    color: Colors.light.accent,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: "BodyRegular",
    fontSize: 16,
    color: Colors.light.text,
    textAlign: "center",
  },
  sharedChip: {
    paddingLeft: 12,
    backgroundColor: Colors.light.white,
  },
  sharedChipLabel: {
    color: Colors.light.text,
  },
});