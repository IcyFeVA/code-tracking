import { Colors } from '@/constants/Colors';
import { Platform, StyleSheet } from 'react-native';

export const defaultStyles = StyleSheet.create({
    SafeAreaView: {
        flex: 1,
        padding: 16,
        backgroundColor: Colors.light.background,
    },
    innerContainer: {
        flex: 1,
    },
    pageHeader: {
        width: "100%",
        backgroundColor: Colors.light.white,
        paddingHorizontal: 8,
        paddingBottom: 8,
    },
    pageTitle: {
        fontSize: 28,
        fontFamily: 'HeadingBold',
        color: Colors.light.text
    },
    body: {
        fontFamily: 'BodyRegular',
        color: Colors.light.text,
        fontSize: 16,
        lineHeight: 24
    },
    bodyBold: {
        fontFamily: 'BodyBold',
        color: Colors.light.text,
        fontSize: 16,
        lineHeight: 24
    },
    buttonShadow: {
        ...Platform.select({
            ios: {
                shadowColor: "#ccc",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 3,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    h2: {
        fontSize: 24,
        fontFamily: 'HeadingBold',
        color: Colors.light.text
    },
    inputLabel: {
        fontSize: 16,
        fontFamily: 'BodySemiBold',
        color: Colors.light.text
    },
    button: {
        display: 'flex',
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.light.primaryLight,
        paddingTop: 6,
        paddingHorizontal: 32,
        borderRadius: 8,
        minHeight: 48,
    },
    buttonLabel: {
        fontSize: 14,
        fontFamily: 'BodyBold',
        color: Colors.light.textInverted,
        textTransform: 'uppercase'
    },
    buttonSecondary: {
        display: 'flex',
        backgroundColor: Colors.light.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.light.tertiary,
        paddingTop: 6,
        paddingHorizontal: 32,
        borderRadius: 8,
        minHeight: 48,
    },
    buttonSecondaryLabel: {
        fontSize: 14,
        fontFamily: 'BodyBold',
        color: Colors.light.primary,
        textTransform: 'uppercase'
    },
    disabledButtonText: {
        color: Colors.light.textInverted
    },
    disabledButton: {
        backgroundColor: Colors.light.tertiary,
        borderColor: Colors.light.tertiary
    },
    settingListButton: {
        display: 'flex',
        backgroundColor: Colors.light.background,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.light.tertiary,
        padding: 16,
        borderRadius: 8,
        height: 64,
        maxHeight: 64,
        borderTopWidth: 0,
    },
    settingListButtonLabel: {
        fontSize: 16,
        fontFamily: 'BodySemiBold',
        color: Colors.light.text
    },
    radioButton: {
        flex: 1,
        backgroundColor: Colors.light.background,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.light.tertiary,
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        height: 64,
        minHeight: 64,
    },
    radioButtonLabel: {
        fontSize: 16,
        fontFamily: 'BodySemiBold',
        color: Colors.light.text
    },
    checkboxButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: Colors.light.tertiary,
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        height: 64,
        backgroundColor: Colors.light.background,
    },
    checkboxButtonLabel: {
        fontSize: 16,
        fontFamily: 'BodySemiBold',
        color: Colors.light.text
    },
    noRadius: {
        borderRadius: 0
    },
    headerBackButton: {
        marginLeft: 16,
        flexDirection: "row",
    },
    headerMoreButton: {
        marginRight: 16,
        flexDirection: "row",
    },
    backButtonText: {
        fontSize: 16,
        fontFamily: 'BodySemiBold',
        color: Colors.light.primary
    }
});
