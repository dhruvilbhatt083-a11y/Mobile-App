# Car Rental App

A React Native mobile application for car rental between owners and drivers.

## Features

- **User Authentication**: Sign up and login for both drivers and car owners
- **Car Listings**: Owners can list their cars with detailed information
- **Car Browsing**: Drivers can browse available cars with filters
- **Booking System**: Easy car rental booking process
- **User Profiles**: Manage personal information and rental history
- **Real-time Updates**: Live availability status
- **Rating System**: User ratings and reviews

## Technology Stack

- **Frontend**: React Native with Expo
- **Navigation**: React Navigation
- **Backend**: Firebase (Authentication, Firestore)
- **UI Components**: Custom components with consistent theming

## Getting Started

### Prerequisites

- Node.js installed
- Expo CLI installed (`npm install -g expo-cli`)
- Android Studio (for Android development)
- Physical Android device or Android Emulator

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd CarRentalApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a new Firebase project at https://console.firebase.google.com
   - Enable Authentication and Firestore Database
   - Update the Firebase configuration in `firebaseConfig.js`

4. Run the app:
   ```bash
   npm start
   ```

5. Scan the QR code with Expo Go app on your Android device, or run:
   ```bash
   npm run android
   ```

## Project Structure

```
CarRentalApp/
├── components/          # Reusable UI components
│   ├── Button.js
│   ├── Card.js
│   └── Input.js
├── constants/           # App constants and theme
│   └── theme.js
├── navigation/          # Navigation configuration
│   └── AppNavigator.js
├── screens/            # App screens
│   ├── WelcomeScreen.js
│   ├── HomeScreen.js
│   ├── CarListScreen.js
│   ├── CarDetailScreen.js
│   ├── AddCarScreen.js
│   └── ProfileScreen.js
├── firebaseConfig.js   # Firebase configuration
├── App.js              # Main app entry point
└── package.json        # Dependencies
```

## Theme and Design System

The app uses a consistent design system defined in `constants/theme.js`:

- **Colors**: Primary, secondary, accent, and semantic colors
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standardized padding and margins
- **Components**: Reusable buttons, cards, and input fields

## Screens Overview

1. **Welcome Screen**: Login/Signup with user type selection (Driver/Owner)
2. **Home Screen**: Dashboard with stats and quick actions
3. **Car List Screen**: Browse available cars with filters
4. **Car Detail Screen**: Detailed car information and booking
5. **Add Car Screen**: Form for owners to list their cars
6. **Profile Screen**: User profile and settings

## Firebase Setup

1. Go to Firebase Console and create a new project
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Copy your Firebase configuration
5. Update `firebaseConfig.js` with your credentials

## Development Commands

```bash
# Start the development server
npm start

# Run on Android device/emulator
npm run android

# Run on iOS (macOS only)
npm run ios

# Run in web browser
npm run web
```

## Contributing

1. Follow the existing code style and theme
2. Use the established component patterns
3. Test on different screen sizes
4. Update documentation as needed

## Future Enhancements

- Payment integration (Stripe, PayPal)
- Real-time chat between owners and drivers
- Push notifications for booking updates
- Advanced search and filtering
- Car availability calendar
- Insurance integration
- Multi-language support

## Support

For issues and questions, please refer to the React Native and Expo documentation.
