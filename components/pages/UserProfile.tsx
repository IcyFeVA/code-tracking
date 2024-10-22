import { Colors } from '@/constants/Colors';
import { defaultStyles } from '@/constants/Styles';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import hobbiesInterests from '@/constants/Interests';
import { Chip } from 'react-native-ui-lib';
import { useAuth } from '@/hooks/useAuth';
import Spacer from '@/components/Spacer';
import { useRoute } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';

const statusBarHeight = Constants.statusBarHeight;

type RootStackParamList = {
  UserProfile: { userId: string; looking_for: string; imageStr: string };
};

type UserProfileProps = {
  route: RouteProp<RootStackParamList, 'UserProfile'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserProfile'>;
};

export default function UserProfile({ route, navigation }: UserProfileProps) {
  const { user } = useAuth();
  const { userId, looking_for, imageStr } = route.params;
  const [loading, setLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<{
    name: string;
    age: string;
    interests: string[];
  }>({
    name: '',
    age: '0',
    interests: [],
  });
  const interestsList = useMemo(() => flattenArray(hobbiesInterests), []);
  const [hasSharedInterests, setHasSharedInterests] = useState<boolean>(false);
  const [myData, setMyData] = useState<any>({});

  useEffect(() => {
    const fetchMe = async () => {
      if (!user) return;
      console.log('looking_for', looking_for);
      setLoading(true);

      const { data } = await supabase.from('profiles_test').select('*').eq('id', user.id);
      if (data) {
        setMyData(data[0]);
        setLoading(false);
      }
    };

    fetchMe();
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      const { data } = await supabase.from('profiles_test').select('*').eq('id', userId);
      if (data) {
        setUserData(data[0]);
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const bioText = `I\’m looking for a new partner, perhaps a partner for life. I never used a dating app before, but I heard good things about this one.

I\’m a great listener, and a fantastic cook. I love walking along the beach, and deep conversations.
\nTalking is important to me. I need to be able to talk about anything with you.

I also love dogs and cats, though I don’t have any pets at the moment. But please keep away snakes, spiders and any kind of insects! I\’m afraid I will get a heart attack with those.

Videogames is also something that is important to me. I play mostly online, to not feel alone all the time. I enjoy board games as well, and TCG\’s.

When it comes to music, I like most pop bands and dance music. My favorite are Christina Aguilera, Taylor Swift, and the Woodys.

Let me know what  you like and let’s get connected here on this cool platform!`;

  function flattenArray(arr: any[]): any[] {
    return arr.flat();
  }

  const sortInterests = (a: string, b: string) => {
    const aIncluded = myData.interests?.includes(parseInt(a));
    const bIncluded = myData.interests?.includes(parseInt(b));
    if (aIncluded && !bIncluded) return -1;
    if (!aIncluded && bIncluded) return 1;
    return 0;
  };

  const renderInterestChips = (type: string) => {
    if (!userData.interests || !myData.interests) return null;

    const sortedInterests = [...userData.interests].sort(sortInterests);

    return sortedInterests.map((interest: string, index: number) => {
      const interestObject = interestsList.find((item) => item.value === interest.toString());

      if (!interestObject) {
        console.error(`No label found for interest: ${interest}`);
        return null;
      }

      const isActive = myData.interests.includes(parseInt(interestObject.value));
      if (!hasSharedInterests && isActive) {
        setHasSharedInterests(true);
      }
      if (type === 'shared') {
        if (isActive) {
          return (
            <Chip
              key={index}
              label={interestObject.label}
              labelStyle={[styles.chipLabel, styles.sharedChipLabel]}
              containerStyle={[styles.chip, styles.sharedChip]}
              iconSource={require('@/assets/images/icons/iconSharedInterest.png')}
            />
          );
        }
      } else {
        if (!isActive) {
          return (
            <Chip
              key={index}
              label={interestObject.label}
              labelStyle={[styles.chipLabel]}
              containerStyle={[styles.chip]}
            />
          );
        }
      }
    });
  };

  const DiveHeader = () => {
    return (
      <View>
        <View style={styles.personContainer}>
          <View style={styles.imageContainerDive}>
            <Image
              source={{ uri: imageStr || userData.avatar_pixelated_url }}
              style={styles.person}
              accessibilityLabel="Profile Image"
            />
          </View>
          <View style={styles.personInfoDive}>
            <Text style={styles.personName}>
              {userData.name}, {userData.age}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const SurfHeader = () => {
    return (
      <View>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: imageStr || userData.avatar_url,
            }}
            style={styles.image}
          />
        </View>
        <View style={{ padding: 16 }}>
          <View style={styles.personInfo}>
            {userData.name && (
              <Text style={styles.personName}>
                {userData.name}
                <Text style={styles.personAge}>, {userData.age.toString()}</Text>
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <ScrollView style={styles.innerContainer}>
        {loading && (
          <ActivityIndicator
            size="large"
            color={Colors.light.accent}
            style={{ position: 'absolute', top: 32, left: 32, zIndex: 2 }}
          />
        )}

        {looking_for !== 3 ? <DiveHeader /> : <SurfHeader />}

        <View style={{ padding: 16 }}>
          {hasSharedInterests === true && (
            <View>
              <Spacer height={32} />

              <Text
                style={{
                  fontFamily: 'HeadingBold',
                  fontSize: 22,
                  color: Colors.light.text,
                  marginTop: 16,
                }}>
                Shared Hobbies & Interests
              </Text>
              <View style={styles.chipsContainer}>{renderInterestChips('shared')}</View>
            </View>
          )}

          <Spacer height={32} />

          <Text
            style={{
              fontFamily: 'HeadingBold',
              fontSize: 22,
              color: Colors.light.text,
              marginTop: 16,
            }}>
            Bio
          </Text>
          <Spacer height={8} />
          <Text
            style={{
              fontFamily: 'BodyRegular',
              fontSize: 18,
              lineHeight: 26,
            }}></Text>
          <WebView
            originWhitelist={['*']}
            source={{ html: bioText }}
            style={{
              height: 500,
              width: Dimensions.get('window').width - 32,
            }}
            scrollEnabled={true}
          />
          <Spacer height={32} />

          <Text
            style={{
              fontFamily: 'HeadingBold',
              fontSize: 22,
              color: Colors.light.text,
              marginTop: 16,
            }}>
            Other Hobbies & Interests
          </Text>
          <View style={styles.chipsContainer}>{renderInterestChips()}</View>
        </View>
      </ScrollView>
      <Pressable
        onPress={() => {
          navigation.pop();
        }}
        style={[styles.buttonCollapse, defaultStyles.buttonShadow]}>
        <Ionicons name="close" size={24} color={Colors.light.accent} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  imageContainerDive: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: Colors.light.backgroundSecondary,
  },
  personInfo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  personInfoDive: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  personName: {
    fontFamily: 'HeadingBold',
    fontSize: 28,
    color: Colors.light.text,
  },
  personAge: {
    fontFamily: 'HeadingBold',
    fontSize: 28,
    color: Colors.light.text,
    opacity: 0.7,
  },
  buttonCollapse: {
    backgroundColor: Colors.light.white,
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: Colors.light.tertiary,
    borderRadius: 99,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.black,
    position: 'absolute',
    top: statusBarHeight + 32,
    right: 16,
  },
  chipsContainer: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    rowGap: 8,
  },
  chip: {
    backgroundColor: Colors.light.white,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginRight: 8,
    borderRadius: 99,
    shadowColor: Colors.light.black,
  },
  sharedChip: {
    paddingLeft: 12,
    backgroundColor: Colors.light.white,
  },
  sharedChipLabel: {
    color: Colors.light.text,
  },
  chipLabel: {
    color: Colors.light.text,
    fontSize: 13,
    fontFamily: 'BodyRegular',
  },
  scrollContainer: {
    marginLeft: 16,
  },
  personContainer: {
    marginTop: 32,
    paddingHorizontal: 8,
  },
  person: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
    borderRadius: 60,
    backgroundColor: Colors.light.tertiary,
  },
});
