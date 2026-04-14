import { useColorScheme } from 'react-native'
import { LightColors, DarkColors } from '@/constants/Colors'

export function useThemeColors() {
  const scheme = useColorScheme()
  return scheme === 'dark' ? DarkColors : LightColors
}
