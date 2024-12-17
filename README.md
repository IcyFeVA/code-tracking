# Crushy - Friend & Date Finding App

A mobile application built with React Native and Expo that helps people find friends, hookups, or partners. The app features two unique browsing modes: "Surf" (focused on profile images) and "Dive" (focused on user bios with blurred/pixelated images).

## Features

- **Dual Browsing Modes**
  - Surf Mode: Traditional profile browsing with clear images
  - Dive Mode: Focus on bios with pixelated images
- **Extensive Filtering**
  - Body type
  - Drinking habits
  - Age range
  - And more
- **Premium Membership** (coming soon)
- **History Tracking**
  - View past likes/dislikes
  - Organized by timeframe (Today, Yesterday, This Week, etc.)
  - Different avatar display based on interaction mode

## Tech Stack

- React Native
- Expo
- React Navigation
- Supabase (Backend & Authentication)
- TypeScript

## Project Structure

```

## Development Guidelines

### Code Style

- Use functional components with TypeScript
- Follow the React Native community best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch
```

## Security Considerations

- All database queries are protected by Row Level Security (RLS)
- User authentication is handled through Supabase
- Sensitive data is properly encrypted
- Regular security audits are performed
- Input validation is implemented throughout the app

## Deployment

### iOS

1. Configure app.json for iOS
2. Build the iOS version:
   ```bash
   eas build --platform ios
   ```

### Android

1. Configure app.json for Android
2. Build the Android version:
   ```bash
   eas build --platform android
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@crushy.app or join our Slack channel.

## Acknowledgments

- Supabase team for the backend infrastructure
- Expo team for the development framework
- React Navigation team for the routing solution
- All contributors who have helped shape this project
