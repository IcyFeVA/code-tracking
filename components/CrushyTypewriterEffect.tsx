import React, { useState, useEffect } from 'react';
import { Text, TextStyle } from 'react-native';

interface TypewriterEffectProps {
    text: string;
    delay?: number;
    style?: TextStyle;
    adjustsFontSizeToFit?: boolean;
    numberOfLines?: number;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ text, delay = 100, style, adjustsFontSizeToFit, numberOfLines }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text[index]);
                index++;
            } else {
                clearInterval(timer);
            }
        }, delay);

        return () => clearInterval(timer);
    }, [text, delay]);

    return <Text style={style} adjustsFontSizeToFit={adjustsFontSizeToFit} numberOfLines={numberOfLines} >{displayedText}</Text>;
};

export default TypewriterEffect;