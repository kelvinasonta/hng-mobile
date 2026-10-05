import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../theme';
import { useAuth } from '../context/AuthContext';

export const CustomerAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const isSignUp = authModalMode === 'signup';

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        setErrorMsg(result.error || 'Google authentication failed.');
      } else {
        closeAuthModal();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        const res = await signUpWithEmail(email, password, name);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to create account.');
        } else {
          if (res.confirmationRequired) {
            setSuccessMsg('Account created! Please check your email to confirm your account, or sign in.');
          } else {
            setSuccessMsg('Account created successfully! Welcome to AETHER.');
            setTimeout(() => {
              closeAuthModal();
            }, 1200);
          }
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Invalid email or password.');
        } else {
          closeAuthModal();
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isAuthModalOpen}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={closeAuthModal}
    >
      <View style={[styles.container, { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 20) : 0 }]}>
        {/* Top Header */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 16) : 24 }]}>
          <View>
            <Text style={styles.brandTitle}>A E T H E R</Text>
            <Text style={styles.brandSub}>
              {isSignUp ? 'CREATE CUSTOMER ACCOUNT' : 'SIGN IN TO AETHER'}
            </Text>
          </View>
          <TouchableOpacity onPress={closeAuthModal} style={styles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Mode Switcher Tabs */}
          <View style={styles.tabSwitch}>
            <TouchableOpacity
              style={[styles.switchBtn, !isSignUp && styles.switchBtnActive]}
              onPress={() => {
                setAuthModalMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
            >
              <Text style={[styles.switchText, !isSignUp && styles.switchTextActive]}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchBtn, isSignUp && styles.switchBtnActive]}
              onPress={() => {
                setAuthModalMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
            >
              <Text style={[styles.switchText, isSignUp && styles.switchTextActive]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Success Message Banner (Identical to Web) */}
          {successMsg && (
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}

          {/* Error Message Banner (Identical to Web) */}
          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Google One-Tap Sign In Button */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={handleGoogleAuth}
            disabled={loading}
            activeOpacity={0.85}
          >
            <View style={styles.googleIconWrapper}>
              <Text style={styles.googleGText}>G</Text>
            </View>
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or with email & password</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Form Inputs */}
          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput
                placeholder="e.g. Alex Vance"
                placeholderTextColor={THEME.colors.textDim}
                value={name}
                onChangeText={setName}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              placeholder="your.email@example.com"
              placeholderTextColor={THEME.colors.textDim}
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={THEME.colors.textDim}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry={true}
              autoCapitalize="none"
            />
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#07090e" />
                <Text style={styles.submitBtnText}>Authenticating...</Text>
              </View>
            ) : (
              <Text style={styles.submitBtnText}>
                {isSignUp ? 'Create Customer Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Terms Footer */}
          <Text style={styles.termsText}>
            By continuing, you verify compliance with AETHER Concierge Privacy Protocols and 256-bit encrypted authentication.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.textMain,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.primary,
    letterSpacing: 1,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    fontSize: 18,
    color: THEME.colors.textDim,
  },
  body: {
    padding: 20,
  },
  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  switchBtnActive: {
    backgroundColor: THEME.colors.primary,
  },
  switchText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  switchTextActive: {
    color: '#07090e',
    fontWeight: '800',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  successIcon: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '900',
  },
  successText: {
    flex: 1,
    color: '#34d399',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorIcon: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '900',
  },
  errorText: {
    flex: 1,
    color: '#fca5a5',
    fontSize: 12,
    lineHeight: 18,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleGText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  googleBtnText: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    color: THEME.colors.textDim,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: THEME.colors.textMain,
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#07090e',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  termsText: {
    fontSize: 10,
    color: THEME.colors.textDim,
    textAlign: 'center',
    lineHeight: 16,
  },
});
