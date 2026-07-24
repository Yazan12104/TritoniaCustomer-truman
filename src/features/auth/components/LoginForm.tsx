import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { spacing } from '../../../shared/theme/spacing';

interface LoginFormProps {
  onSubmit: (phone: string, password?: string) => void;
  isLoading: boolean;
  error?: string | null;
  onInputChange?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading, error, onInputChange }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = () => {
    onSubmit(phone, password);
  };

  return (
    <View style={styles.container}>
      <Input
        label="رقم الهاتف"
        placeholder="أدخل رقم الهاتف"
        value={phone}
        onChangeText={(value) => {
          setPhone(value);
          onInputChange?.();
        }}
        keyboardType="phone-pad"
        autoCapitalize="none"
        autoCorrect={false}
        error={error || undefined}
      />
      <Input
        label="كلمة المرور"
        placeholder="أدخل كلمة المرور"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          onInputChange?.();
        }}
        secureTextEntry
        autoCapitalize="none"
      />
      
      <Button
        title="تسجيل الدخول"
        onPress={handleSubmit}
        loading={isLoading}
        style={styles.submitButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});
