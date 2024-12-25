import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';

interface TypewriterEffectProps {
    text: string;
    speed?: number;
    styling: object;
}

const TypewriterEffect = ({ text, speed = 150, styling }: TypewriterEffectProps) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(displayedText + text[index]);
                setIndex(index + 1);
            }, speed);
            return () => clearTimeout(timeout);
        }
    }, [index, displayedText, text, speed]);

    return <Text style={styling} numberOfLines={2} ellipsizeMode='tail'>{displayedText}</Text>;
};



export default TypewriterEffect;
