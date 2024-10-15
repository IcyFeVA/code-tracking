import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  StyleSheet,
  View,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Spacer from "./Spacer";
import { defaultStyles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { Button } from 'react-native-ui-lib';
import { SecondaryButton, SecondaryButtonText } from './ui/Buttons';
import { Image as ExpoImage } from 'expo-image';

type Props = {
  url: string | null;
  size?: number;
  onUpload: (originalUrl: string, pixelatedUrl: string) => void;
};

function extractFullFilename(url) {
  // Split the URL by '/' and get the last part
  const fullFilename = url.split("/").pop();

  // If there's no filename (URL ends with '/'), return null
  if (!fullFilename) return null;

  // Return the full filename
  return fullFilename;
}

export default function Avatar({ url, size = 70, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const avatarSize = { width: size };

  useEffect(() => {
    if (url) {
      if (url.toLowerCase().includes("http")) {
        downloadImage(extractFullFilename(url));
      } else {
        downloadImage(url);
      }
    }
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);

      if (error) {
        throw error;
      }

      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => {
        setAvatarUrl(fr.result as string);
      };
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error downloading image: ", error.message);
      }
    }
  }

  async function pixelateImage(uri: string, pixelBlocks = 15) {
    try {
      // Get the original image dimensions
      const originalImage = await ImageManipulator.manipulateAsync(uri, [], {
        format: "png",
      });

      // Get dimensions
      const { width, height } = await new Promise((resolve, reject) => {
        Image.getSize(
          originalImage.uri,
          (width, height) => resolve({ width, height }),
          (error) => reject(error)
        );
      });

      console.log("Original dimensions:", width, height);

      // Calculate new dimensions based on the number of pixel blocks
      const newWidth = pixelBlocks;
      const newHeight = Math.round((height / width) * pixelBlocks);

      console.log("New dimensions for pixelation:", newWidth, newHeight);

      // Resize the image to a very small size
      const smallImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: newWidth, height: newHeight } }],
        { format: "png" }
      );

      // Resize it back to original size, creating a more pronounced pixelation effect
      const pixelatedImage = await ImageManipulator.manipulateAsync(
        smallImage.uri,
        [{ resize: { width: width, height: height } }],
        { format: "png" }
      );

      console.log("Pixelation complete");
      return pixelatedImage.uri;
    } catch (error) {
      console.error("Error in pixelateImage:", error);
      throw error;
    }
  }

  async function resizeImage(uri: string, maxDimension: number = 1080) {
    // Get the original image dimensions
    const { width, height } = await new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        (error) => reject(error)
      );
    });

    // Calculate the new dimensions
    let newWidth, newHeight;
    if (width > height) {
      newWidth = maxDimension;
      newHeight = Math.round((height / width) * maxDimension);
    } else {
      newHeight = maxDimension;
      newWidth = Math.round((width / height) * maxDimension);
    }

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: newWidth, height: newHeight } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  }

  async function uploadAvatar() {
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1, // Use max quality, we'll compress later
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("User cancelled image picker.");
        return;
      }

      const image = result.assets[0];
      console.log("Got image", image);

      if (!image.uri) {
        throw new Error("No image uri!");
      }

      // Resize the original image
      const resizedUri = await resizeImage(image.uri);

      // Read the resized file as base64
      const base64 = await FileSystem.readAsStringAsync(resizedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("Base64 length:", base64.length);

      // Upload resized image
      const originalPath = `${Date.now()}_original.jpg`;
      const { data: originalData, error: originalError } =
        await supabase.storage
          .from("avatars")
          .upload(originalPath, decode(base64), {
            contentType: "image/jpeg",
          });

      if (originalError) {
        console.error("Original upload error:", originalError);
        throw originalError;
      }

      console.log("Original upload successful:", originalData);

      // Create and upload pixelated version
      const pixelatedUri = await pixelateImage(resizedUri, 15);
      const pixelatedBase64 = await FileSystem.readAsStringAsync(pixelatedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log("Pixelated Base64 length:", pixelatedBase64.length);

      const pixelatedPath = `${Date.now()}_pixelated.jpg`;
      const { data: pixelatedData, error: pixelatedError } =
        await supabase.storage
          .from("avatars")
          .upload(pixelatedPath, decode(pixelatedBase64), {
            contentType: "image/jpeg",
          });

      if (pixelatedError) {
        console.error("Pixelated upload error:", pixelatedError);
        throw pixelatedError;
      }

      console.log("Pixelated upload successful:", pixelatedData);

      // Get public URLs
      const originalUrl = supabase.storage
        .from("avatars")
        .getPublicUrl(originalData.path).data.publicUrl;
      const pixelatedUrl = supabase.storage
        .from("avatars")
        .getPublicUrl(pixelatedData.path).data.publicUrl;

      // Update profiles_test table
      const { data, error: updateError } = await supabase
        .from("profiles_test")
        .update({
          avatar_url: originalUrl,
          avatar_pixelated_url: pixelatedUrl,
        })
        .eq("id", (await supabase.auth.getUser()).data.user?.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }

      console.log(
        "Profile updated with new avatar URLs:",
        originalUrl,
        pixelatedUrl
      );

      // Call onUpload with both URLs
      onUpload(originalUrl, pixelatedUrl);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unknown error occurred");
      }
      console.error("Error in uploadAvatar:", error);
    } finally {
      setUploading(false);
    }
  }

  // Helper function to decode base64
  function decode(base64: string) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let bufferLength = base64.length * 0.75,
      length = base64.length,
      i,
      p = 0,
      encoded1,
      encoded2,
      encoded3,
      encoded4;

    const bytes = new Uint8Array(bufferLength);

    for (i = 0; i < length; i += 4) {
      encoded1 = chars.indexOf(base64[i]);
      encoded2 = chars.indexOf(base64[i + 1]);
      encoded3 = chars.indexOf(base64[i + 2]);
      encoded4 = chars.indexOf(base64[i + 3]);

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return bytes.buffer;
  }

  return (
    <View style={{ width: "100%" }}>
      <View style={[avatarSize, styles.avatar]}>
        {avatarUrl ? (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <ExpoImage
              source={{ uri: avatarUrl }}
              style={[styles.image, { width: size, height: size }]}
              placeholder={require('../assets/images/dummies/photos.png')}
              contentFit="cover"
              transition={200}
            />
          </TouchableOpacity>
        ) : (
          <Image
            source={require('../assets/images/dummies/photos.png')}
            style={[styles.image, { width: size, height: size }]}
          />
        )}
        {uploading && (
          <View style={[StyleSheet.absoluteFill, styles.uploadingOverlay]}>
            <ActivityIndicator size="large" color={Colors.light.accent} />
          </View>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <Image
            source={{ uri: avatarUrl }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>

      <Spacer height={24} />

      <SecondaryButton
        onPress={uploadAvatar}
        style={[{ width: "100%" }, defaultStyles.buttonShadow]}
        disabled={uploading}
      >
        <Ionicons name="image" size={24} color={Colors.light.primary} />

        <Spacer width={8} />

        <SecondaryButtonText>
          {uploading ? "Uploading ..." : "Replace Photo"}
        </SecondaryButtonText>
      </SecondaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 16,
    overflow: "hidden",
    aspectRatio: 1,
    margin: 'auto',
  },
  image: {
    objectFit: "cover",
    paddingTop: 0,
    marginHorizontal: "auto",
  },
  noImage: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgb(200, 200, 200)",
    borderRadius: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
  uploadingOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
