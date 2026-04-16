import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { getCity } from "../services/storageService";
import { getTransportData } from "../services/firebaseService";
import * as Location from "expo-location";
import i18n from "i18next";
import { useTheme } from "../context/ThemeContext";

const getCityTransitName = (cityCode) => {
  const names = { quebec: "RTC", levis: "STLévis", montreal: "STM" };
  return names[cityCode] || "RTC";
};

export default function TransportScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState(null);
  const [transportData, setTransportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [city, setCity] = useState("quebec");

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedCity = await getCity();
        setCity(savedCity || "quebec");
        const data = await getTransportData(savedCity || "quebec");
        if (data) setTransportData(data);
        else setError(true);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOpenItinerary = () => {
    Linking.openURL(
      "https://www.google.com/maps/dir/?api=1&travelmode=transit&hl=fr",
    );
  };

  const handleFindStations = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("transport.stations.permissionTitle"),
          t("transport.stations.permissionMsg"),
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const queries = {
        quebec: "arrêts RTC",
        levis: "arrêts de bus Lévis",
        montreal: "stations STM métro",
      };
      const query = encodeURIComponent(queries[city] || queries.quebec);
      Linking.openURL(
        `https://www.google.com/maps/search/${query}/@${latitude},${longitude},15z`,
      );
    } catch (e) {
      Alert.alert("Erreur", t("transport.stations.error"));
    }
  };

  const MENU_ITEMS = [
    { key: "fares", emoji: "💳", color: "#E3F2FD" },
    { key: "guides", emoji: "📖", color: "#F3E5F5" },
    { key: "itinerary", emoji: "🗺️", color: "#E8F5E9" },
    { key: "stations", emoji: "🚏", color: "#FFF3E0" },
  ];

  const styles = makeStyles(theme);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>{t("transport.loading")}</Text>
        </View>
      </View>
    );
  }

  if (error || !transportData) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{t("transport.error")}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryText}>← {t("onboarding.back")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{t("onboarding.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("transport.title")} 🚌</Text>
        <Text style={styles.headerSubtitle}>
          {getCityTransitName(city)} — {t("transport.subtitle")}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Menu */}
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuCard,
                { backgroundColor: item.color },
                activeSection === item.key && styles.menuCardActive,
              ]}
              onPress={() =>
                setActiveSection(activeSection === item.key ? null : item.key)
              }
              activeOpacity={0.7}
            >
              <Text style={styles.menuEmoji}>{item.emoji}</Text>
              <Text style={styles.menuTitle}>
                {t(`transport.menu.${item.key}`)}
              </Text>
              <Text style={styles.menuSub}>
                {item.key === "fares"
                  ? `${t("transport.menu.faresSub_prefix")} ${getCityTransitName(city)}`
                  : t(`transport.menu.${item.key}Sub`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section Tarifs */}
        {activeSection === "fares" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💳 {t("transport.fares")}</Text>
            <View style={styles.card}>
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>
                  🧑 {t("transport.fare_adult")}
                </Text>
                <Text style={styles.fareValue}>{transportData.fare_adult}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>
                  🎓 {t("transport.fare_reduced")}
                </Text>
                <Text style={styles.fareValue}>
                  {transportData.fare_reduced}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>
                  📅 {t("transport.fare_monthly")}
                </Text>
                <Text style={styles.fareValue}>
                  {transportData.fare_monthly}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Section Guides */}
        {activeSection === "guides" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📖 {t("transport.tips")}</Text>
            <View style={styles.card}>
              {[1, 2, 3].map((num, index) => {
                const tip =
                  transportData[`tip_${i18n.language}_${num}`] ||
                  transportData[`tip_fr_${num}`];
                if (!tip) return null;
                return (
                  <View key={num}>
                    <View style={styles.tipRow}>
                      <Text style={styles.tipBullet}>💡</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                    {num < 3 && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={() => Linking.openURL(transportData.website)}
            >
              <Text style={styles.websiteButtonText}>
                🌐 {transportData.network}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section Itinéraires */}
        {activeSection === "itinerary" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🗺️ {t("transport.itinerary.title")}
            </Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoEmoji}>📞</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t("transport.phone")}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`tel:${transportData.phone}`)
                    }
                  >
                    <Text style={styles.infoLink}>{transportData.phone}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.mapsButton}
              onPress={handleOpenItinerary}
            >
              <Text style={styles.mapsButtonText}>
                🗺️ {t("transport.itinerary.open")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section Stations */}
        {activeSection === "stations" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🚏 {t("transport.stations.title")}
            </Text>
            <TouchableOpacity
              style={styles.mapsButton}
              onPress={handleFindStations}
            >
              <Text style={styles.mapsButtonText}>
                📍 {t("transport.stations.open")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
    },
    loadingText: { fontSize: 16, color: theme.subtext },
    errorEmoji: { fontSize: 48 },
    errorText: { fontSize: 16, color: theme.subtext, textAlign: "center" },
    retryButton: {
      marginTop: 8,
      padding: 12,
      backgroundColor: theme.primary,
      borderRadius: 12,
    },
    retryText: { color: "#fff", fontWeight: "600" },
    header: {
      backgroundColor: theme.header,
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 28,
    },
    backButton: { marginBottom: 12 },
    backButtonText: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 14,
      fontWeight: "600",
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: "#fff",
      marginBottom: 4,
    },
    headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
    menuGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 16,
      paddingTop: 20,
      gap: 12,
    },
    menuCard: { width: "47%", borderRadius: 16, padding: 16, elevation: 3 },
    menuCardActive: { borderWidth: 2, borderColor: theme.primary },
    menuEmoji: { fontSize: 32, marginBottom: 8 },
    menuTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#333333",
      // color: theme.text,
      marginBottom: 4,
    },
    menuSub: { fontSize: 12, color: '#666666' /*theme.subtext*/ },
    section: { marginTop: 20, paddingHorizontal: 16 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 12,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 4,
      elevation: 3,
      marginBottom: 12,
    },
    divider: { height: 1, backgroundColor: theme.border, marginHorizontal: 12 },
    fareRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },
    fareLabel: { fontSize: 15, color: theme.text, fontWeight: "500" },
    fareValue: { fontSize: 18, fontWeight: "700", color: theme.primary },
    tipRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 12,
      gap: 10,
    },
    tipBullet: { fontSize: 18 },
    tipText: { flex: 1, fontSize: 14, color: theme.text, lineHeight: 20 },
    websiteButton: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: "center",
    },
    websiteButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    mapsButton: {
      backgroundColor: "#2A9D8F",
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: "center",
    },
    mapsButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      gap: 12,
    },
    infoEmoji: { fontSize: 24 },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 12, color: theme.subtext, marginBottom: 2 },
    infoLink: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.primary,
      textDecorationLine: "underline",
    },
  });
