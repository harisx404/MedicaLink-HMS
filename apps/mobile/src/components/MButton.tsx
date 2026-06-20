import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';
import { tokens } from '../lib/tokens';

interface MButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function MButton({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: MButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': return 'bg-indigo-600 border-transparent';
      case 'secondary': return 'bg-teal-600 border-transparent';
      case 'outline': return 'bg-transparent border border-indigo-600';
      case 'ghost': return 'bg-transparent border-transparent';
      case 'danger': return 'bg-red-600 border-transparent';
      default: return 'bg-indigo-600 border-transparent';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'outline':
      case 'ghost': return 'text-indigo-600';
      default: return 'text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return 'h-10 px-4 rounded-lg';
      case 'lg': return 'h-14 px-8 rounded-2xl';
      case 'md':
      default: return 'h-12 px-6 rounded-xl';
    }
  };

  const activeOpacity = variant === 'ghost' ? 0.6 : 0.8;
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={`flex-row items-center justify-center ${getVariantStyles()} ${getSizeStyles()} ${isDisabled ? 'opacity-50' : ''} ${className}`}
      activeOpacity={activeOpacity}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? tokens.colors.primary.DEFAULT : '#fff'} />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={`font-bold ${size === 'sm' ? 'text-sm' : 'text-base'} ${getTextStyles()}`}>
            {label}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
