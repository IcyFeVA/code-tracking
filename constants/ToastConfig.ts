import React from "react"
import { View, Text } from "react-native-ui-lib"
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';


export const toastConfig = {

    success: (props) => (
        <BaseToast
            { ...props }
            style={{ borderLeftColor: 'pink' }}
contentContainerStyle = {{ paddingHorizontal: 15 }}
text1Style = {{
    fontSize: 15,
        fontWeight: '400'
}}
/>
    ),

error: (props) => (
    <ErrorToast
            { ...props }
            text1Style = {{ fontSize: 17 }}
text2Style = {{ fontSize: 15 }}
/>
    ),
    /*
      Or create a completely new type - `default`,
      building the layout from scratch.
  
      I can consume any custom `props` I want.
      They will be passed when calling the `show` method (see below)
    */
    default: ({ text1, text2, props }) => (
    <View style= {{ display: 'flex', justifyContent: 'center', width: '94%', backgroundColor: Colors.light.accent, borderRadius: 8, padding: 16 }}>
        <Text style={ { fontFamily: 'HeadingBold', color: 'white' } }> { text1 } < /Text>
            < Text style = {{ fontFamily: 'BodyRegular', color: 'white' }}> { text2 } < /Text>
{/* <Text>{props.uuid}</Text> */ }
</View>
    )
};