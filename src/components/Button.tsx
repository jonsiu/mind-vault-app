import React from 'react'
import { Pressable, Text, StyleSheet } from 'react-native'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '' // eslint-disable-line @typescript-eslint/no-unused-vars
}: ButtonProps) {
  const buttonStyles = getButtonStyles(variant, size, disabled)
  const textStyles = getTextStyles(variant, size, disabled)

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        buttonStyles,
        pressed && styles.pressed,
        disabled && styles.disabled
      ]}
    >
      <Text style={[styles.text, textStyles]}>
        {title}
      </Text>
    </Pressable>
  )
}

function getButtonStyles(variant: string, size: string, disabled: boolean) {
  const base = {
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  }
  
  const variants = {
    primary: { backgroundColor: '#0f172a' },
    secondary: { backgroundColor: '#f1f5f9' },
    outline: { 
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#cbd5e1'
    }
  }
  
  const sizes = {
    sm: { paddingHorizontal: 12, paddingVertical: 8 },
    md: { paddingHorizontal: 16, paddingVertical: 12 },
    lg: { paddingHorizontal: 24, paddingVertical: 16 }
  }
  
  return {
    ...base,
    ...variants[variant],
    ...sizes[size],
    opacity: disabled ? 0.5 : 1
  }
}

function getTextStyles(variant: string, size: string, _disabled: boolean) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const base = {
    fontWeight: '600' as const,
  }
  
  const variants = {
    primary: { color: '#f8fafc' },
    secondary: { color: '#0f172a' },
    outline: { color: '#475569' }
  }
  
  const sizes = {
    sm: { fontSize: 14 },
    md: { fontSize: 16 },
    lg: { fontSize: 18 }
  }
  
  return {
    ...base,
    ...variants[variant],
    ...sizes[size]
  }
}

const styles = StyleSheet.create({
  base: {
    // Base styles handled by getButtonStyles
  },
  text: {
    // Text styles handled by getTextStyles
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
})
