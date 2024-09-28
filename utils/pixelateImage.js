import * as ImageManipulator from 'expo-image-manipulator';

async function pixelateImage(uri, pixelSize = 20) {
    // Resize the image to a smaller size
    const smallImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 100 } }],
        { format: 'png' }
    );

    // Resize it back to original size, creating pixelation effect
    const pixelatedImage = await ImageManipulator.manipulateAsync(
        smallImage.uri,
        [{ resize: { width: 300 } }],
        { format: 'png' }
    );

    return pixelatedImage.uri;
}