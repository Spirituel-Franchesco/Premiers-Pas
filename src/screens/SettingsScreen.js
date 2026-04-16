import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Switch, ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { saveLanguage, saveCity, getCity, getLanguage } from '../services/storageService';
import i18n from 'i18next';

export default function SettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { isDark, toggleTheme, theme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [selectedCity, setSelectedCity] = useState('quebec');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const lang = await getLanguage();
    const city = await getCity();
    setSelectedLanguage(lang || 'fr');
    setSelectedCity(city || 'quebec');
  };

  const handleLanguage = async (lang) => {
    setSelectedLanguage(lang);
    await saveLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleCity = async (city) => {
    setSelectedCity(city);
    await saveCity(city);
  };

  const styles = makeStyles(theme);

return (
  <View style={styles.container}>

    {/* Header — EN DEHORS du ScrollView */}
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{t('settings.title')}</Text>
    </View>

    {/* Contenu — DANS le ScrollView */}
    <ScrollView>
      <View style={styles.content}>

        {/* Langue */}
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <View style={styles.card}>
          {[
            { code: 'fr', label: '🇫🇷 Français' },
            { code: 'en', label: '🇬🇧 English' },
            { code: 'es', label: '🇪🇸 Español' },
          ].map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.option, selectedLanguage === lang.code && styles.optionActive]}
              onPress={() => handleLanguage(lang.code)}
            >
              <Text style={[styles.optionText, selectedLanguage === lang.code && styles.optionTextActive]}>
                {lang.label}
              </Text>
              {selectedLanguage === lang.code && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Ville */}
        <Text style={styles.sectionTitle}>{t('settings.city')}</Text>
        <View style={styles.card}>
          {[
            { code: 'quebec', label: '🏙️ Québec' },
            { code: 'levis', label: '🌉 Lévis' },
            { code: 'montreal', label: '🏙️ Montréal' },
          ].map(city => (
            <TouchableOpacity
              key={city.code}
              style={[styles.option, selectedCity === city.code && styles.optionActive]}
              onPress={() => handleCity(city.code)}
            >
              <Text style={[styles.optionText, selectedCity === city.code && styles.optionTextActive]}>
                {city.label}
              </Text>
              {selectedCity === city.code && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Thème */}
        <Text style={styles.sectionTitle}>{t('settings.theme')}</Text>
        <View style={styles.card}>
          <View style={styles.themeRow}>
            <Text style={styles.themeLabel}>
              {isDark ? `🌙 ${t('settings.dark')}` : `☀️ ${t('settings.light')}`}
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#ddd', true: '#1a73e8' }}
              thumbColor={isDark ? '#fff' : '#fff'}
            />
          </View>
        </View>

        {/* À propos */}
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>Premiers Pas</Text>
          <Text style={styles.aboutSubtext}>Version 1.0.0</Text>
          <Text style={styles.aboutSubtext}>© 2026 — Collège O'Sullivan Québec</Text>
        </View>

      </View>
    </ScrollView>

  </View>
);
}

const makeStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.header, padding: 16, paddingTop: 50,
  },
  back: { color: '#fff', fontSize: 24, marginRight: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 16 },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold',
    color: theme.text, marginTop: 20, marginBottom: 8,
  },
  card: {
    backgroundColor: theme.card, borderRadius: 12,
    overflow: 'hidden', elevation: 2,
  },
  option: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  optionActive: { backgroundColor: theme.primary + '15' },
  optionText: { fontSize: 15, color: theme.text },
  optionTextActive: { color: theme.primary, fontWeight: 'bold' },
  check: { color: theme.primary, fontSize: 18, fontWeight: 'bold' },
  themeRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
  },
  themeLabel: { fontSize: 15, color: theme.text },
  aboutText: {
    fontSize: 16, fontWeight: 'bold',
    color: theme.text, padding: 16, paddingBottom: 4,
  },
  aboutSubtext: {
    fontSize: 13, color: theme.subtext,
    paddingHorizontal: 16, paddingBottom: 8,
  },
});