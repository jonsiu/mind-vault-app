import { createNavigationContainerRef } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

// Navigation types
export type RootStackParamList = {
  Home: undefined
  Library: undefined
  Reader: { bookId: string }
  Settings: undefined
  SignIn: undefined
  SignUp: undefined
}

export type TabParamList = {
  Home: undefined
  Library: undefined
  Settings: undefined
}

// Navigation ref for programmatic navigation
export const navigationRef = createNavigationContainerRef<RootStackParamList>()

// Stack navigator
export const Stack = createNativeStackNavigator<RootStackParamList>()

// Tab navigator
export const Tab = createBottomTabNavigator<TabParamList>()

// Navigation utilities
export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params)
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack()
  }
}
