import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ProductsScreen from './src/presentation/ProductsScreen';
import ProductDetailsScreen from './src/presentation/ProductDetailsScreen';
import CartScreen from './src/presentation/CartScreen';
import CheckoutScreen from './src/presentation/CheckoutScreen';
import { MoreScreen, NotificationsScreen } from './src/presentation/AccountScreens';
import { CartProvider } from './src/presentation/CartContext';
import { RootStackParamList } from './src/presentation/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Products" component={ProductsScreen} />
            <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} getId={({ params }) => String(params.productId)} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="More" component={MoreScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </SafeAreaProvider>
  );
}
