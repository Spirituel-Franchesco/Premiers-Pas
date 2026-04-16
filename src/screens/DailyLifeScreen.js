import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Image, ActivityIndicator, Linking
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { getCity } from '../services/storageService';
import { getPlacesData } from '../services/firebaseService';

const SERVICES = [
  { key: 'grocery', emoji: '🛒', query: 'épicerie supermarché' },
  { key: 'pharmacy', emoji: '💊', query: 'pharmacie' },
  { key: 'bank', emoji: '🏦', query: 'banque' },
  { key: 'restaurant', emoji: '🍽️', query: 'restaurant' },
  { key: 'leisure', emoji: '🎭', query: 'loisirs parc' },
];

export default function DailyLifeScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [city, setCity] = useState('quebec');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const savedCity = await getCity();
    const cityCode = savedCity || 'quebec';
    setCity(cityCode);
    const data = await getPlacesData(cityCode);
    setPlaces(data);
    setLoading(false);
  };

  const handleService = async (query) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const encodedQuery = encodeURIComponent(query);
      const url = `https://www.google.com/maps/search/${encodedQuery}/@${latitude},${longitude},15z`;
      Linking.openURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlace = (place) => {
    const query = encodeURIComponent(place.maps_query);
    Linking.openURL(`https://www.google.com/maps/search/${query}`);
  };

  const getName = (place) => {
    return place[`name_${i18n.language}`] || place['name_fr'];
  };

  const getDescription = (place) => {
    return place[`description_${i18n.language}`] || place['description_fr'];
  };

  const getImageSource = (imageName) => {
    const images = {
      'quebec-vieux-quebec.jpg': require('../assets/images/places/quebec-vieux-quebec.jpg'),
      'quebec-chutes-montmorency.jpg': require('../assets/images/places/quebec-chutes-montmorency.jpg'),
      'quebec-citadelle.jpg': require('../assets/images/places/quebec-citadelle.jpg'),
      'quebec-musee-civilisation.jpg': require('../assets/images/places/quebec-musee-civilisation.jpg'),
      'quebec-plaines-abraham.jpg': require('../assets/images/places/quebec-plaines-abraham.jpg'),
      'levis-traversier.jpg': require('../assets/images/places/levis-traversier.jpg'),
      'levis-fort-numero-un.jpg': require('../assets/images/places/levis-fort-numero-un.jpg'),
      'levis-eglise-notre-dame.jpg': require('../assets/images/places/levis-eglise-notre-dame.jpg'),
      'levis-parc-domaine-sainte-croix.jpg': require('../assets/images/places/levis-parc-domaine-sainte-croix.jpg'),
      'montreal-vieux-montreal.jpg': require('../assets/images/places/montreal-vieux-montreal.jpg'),
      'montreal-basilique-notre-dame.jpg': require('../assets/images/places/montreal-basilique-notre-dame.jpg'),
      'montreal-mont-royal.jpg': require('../assets/images/places/montreal-mont-royal.jpg'),
      'montreal-la-ronde.jpg': require('../assets/images/places/montreal-la-ronde.jpg'),
      'montreal-centre-bell.jpg': require('../assets/images/places/montreal-centre-bell.jpg'),
    };
    return images[imageName] || null;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('daily.title')}</Text>
      </View>

      <FlatList
        data={places}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            {/* Services GPS */}
            <Text style={styles.sectionTitle}>{t('daily.services')}</Text>
            <View style={styles.servicesGrid}>
              {SERVICES.map(service => (
                <TouchableOpacity
                  key={service.key}
                  style={styles.serviceBtn}
                  onPress={() => handleService(service.query)}
                >
                  <Text style={styles.serviceEmoji}>{service.emoji}</Text>
                  <Text style={styles.serviceLabel}>
                    {t(`daily.${service.key}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Lieux historiques */}
            <Text style={styles.sectionTitle}>{t('daily.historical')}</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.placeCard}
            onPress={() => handlePlace(item)}
          >
            {getImageSource(item.image) && (
              <Image
                source={getImageSource(item.image)}
                style={styles.placeImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>
                {item.emoji} {getName(item)}
              </Text>
              <Text style={styles.placeDescription}>
                {getDescription(item)}
              </Text>
              <Text style={styles.placeLink}>📍 {t('daily.openMaps')}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a73e8', padding: 16, paddingTop: 50,
  },
  back: { color: '#fff', fontSize: 24, marginRight: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  sectionTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#333',
    marginHorizontal: 16, marginTop: 20, marginBottom: 12,
  },
  servicesGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 8,
  },
  serviceBtn: {
    width: '18%', backgroundColor: '#fff',
    borderRadius: 12, padding: 10, alignItems: 'center',
    elevation: 2,
  },
  serviceEmoji: { fontSize: 20 },
  serviceLabel: { fontSize: 8, color: '#333', marginTop: 4, textAlign: 'center' },
  list: { paddingBottom: 20 },
  placeCard: {
    backgroundColor: '#fff', borderRadius: 12,
    marginHorizontal: 16, marginBottom: 12,
    overflow: 'hidden', elevation: 3,
  },
  placeImage: { width: '100%', height: 160 },
  placeInfo: { padding: 12 },
  placeName: { fontSize: 17, fontWeight: 'bold', color: '#1a73e8' },
  placeDescription: { fontSize: 13, color: '#555', marginTop: 4, lineHeight: 18 },
  placeLink: { fontSize: 12, color: '#1a73e8', marginTop: 8 },
});