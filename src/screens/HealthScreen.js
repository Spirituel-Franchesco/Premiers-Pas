import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import { getCity } from "../services/storageService";
import { getHealthData } from "../services/firebaseService";
import { useTheme } from "../context/ThemeContext";
import i18n from "i18next";

export default function HealthScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [locationStatus, setLocationStatus] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const city = await getCity();
        const data = await getHealthData(city);
        if (data) setHealthData(data);
        else setError(true);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleFindLocation = async (type) => {
    setLocationStatus("loading");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationStatus("permission");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const query = type === "clsc" ? "CLSC" : "clinique+sans+rendez-vous";
      Linking.openURL(
        `https://www.google.com/maps/search/${query}/@${latitude},${longitude},14z`,
      );
      setLocationStatus(null);
    } catch (e) {
      setLocationStatus("error");
    }
  };

  const MENU_ITEMS = [
    { key: "ramq", emoji: "🏥", color: "#E3F2FD" },
    { key: "clsc", emoji: "🏨", color: "#E8F5E9" },
    { key: "clinic", emoji: "👨‍⚕️", color: "#FFF3E0" },
    { key: "infoSante", emoji: "📞", color: "#FCE4EC" },
  ];

  const styles = makeStyles(theme);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>{t("health.loading")}</Text>
        </View>
      </View>
    );
  }

  if (error || !healthData) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{t("health.error")}</Text>
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
        <Text style={styles.headerTitle}>{t("health.title")} 🏥</Text>
        <Text style={styles.headerSubtitle}>{t("health.subtitle")}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Bouton 811 */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => Linking.openURL("tel:811")}
        >
          <Text style={styles.emergencyEmoji}>📞</Text>
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>{t("health.infoSante")}</Text>
            <Text style={styles.emergencySub}>{t("health.infoSanteSub")}</Text>
          </View>
          <Text style={styles.emergencyCall}>{t("health.infoSanteCall")}</Text>
        </TouchableOpacity>

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
              <Text style={styles.menuTitle}>{t(`health.${item.key}`)}</Text>
              <Text style={styles.menuSub}>{t(`health.${item.key}Sub`)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section RAMQ */}
        {activeSection === "ramq" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏥 {t("health.ramq")}</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoEmoji}>⏳</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t("health.ramqDelay")}</Text>
                  <Text style={styles.infoValue}>
                    {healthData[`ramq_delay_${i18n.language}`] ||
                      healthData.ramq_delay_fr}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoEmoji}>📞</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t("health.ramqPhone")}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`tel:${healthData.ramq_phone}`)
                    }
                  >
                    <Text style={styles.infoLink}>{healthData.ramq_phone}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoEmoji}>🌐</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    {t("health.ramqWebsite")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(healthData.ramq_website)}
                  >
                    <Text style={styles.infoLink}>
                      {healthData.ramq_website}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <Text style={styles.tipsTitle}>💡 {t("health.ramqTips")}</Text>
            <View style={styles.card}>
              {[1, 2, 3].map((num) => {
                const tip =
                  healthData[`ramq_tip${num}_${i18n.language}`] ||
                  healthData[`ramq_tip${num}_fr`];
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
          </View>
        )}

        {/* Section CLSC */}
        {activeSection === "clsc" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏨 {t("health.clsc")}</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardText}>📍 {t("health.clscSub")}</Text>
            </View>
            {locationStatus === "loading" && (
              <View style={styles.locationCard}>
                <ActivityIndicator color={theme.primary} />
                <Text style={styles.locationText}>{t("health.locating")}</Text>
              </View>
            )}
            {locationStatus === "permission" && (
              <Text style={styles.locationError}>
                ⚠️ {t("health.locationPermission")}
              </Text>
            )}
            {locationStatus === "error" && (
              <Text style={styles.locationError}>
                😕 {t("health.locationError")}
              </Text>
            )}
            <TouchableOpacity
              style={styles.mapsButton}
              onPress={() => handleFindLocation("clsc")}
            >
              <Text style={styles.mapsButtonText}>
                📍 {t("health.openMaps")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section Clinique */}
        {activeSection === "clinic" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👨‍⚕️ {t("health.clinic")}</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardText}>
                📍 {t("health.clinicSub")}
              </Text>
            </View>
            {locationStatus === "loading" && (
              <View style={styles.locationCard}>
                <ActivityIndicator color={theme.primary} />
                <Text style={styles.locationText}>{t("health.locating")}</Text>
              </View>
            )}
            {locationStatus === "permission" && (
              <Text style={styles.locationError}>
                ⚠️ {t("health.locationPermission")}
              </Text>
            )}
            {locationStatus === "error" && (
              <Text style={styles.locationError}>
                😕 {t("health.locationError")}
              </Text>
            )}
            <TouchableOpacity
              style={styles.mapsButton}
              onPress={() => handleFindLocation("clinic")}
            >
              <Text style={styles.mapsButtonText}>
                📍 {t("health.openMaps")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section Info-Santé */}
        {activeSection === "infoSante" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📞 {t("health.infoSante")}</Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoEmoji}>ℹ️</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoValue}>
                    {t("health.infoSanteSub")}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => Linking.openURL("tel:811")}
            >
              <Text style={styles.callButtonText}>
                📞 {t("health.infoSanteCall")}
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
    emergencyButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FCE4EC",
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: "#E63946",
      gap: 12,
    },
    emergencyEmoji: { fontSize: 32 },
    emergencyContent: { flex: 1 },
    emergencyTitle: { fontSize: 16, fontWeight: "700", color: "#E63946" },
    emergencySub: { fontSize: 12, color: theme.subtext, marginTop: 2 },
    emergencyCall: { fontSize: 13, fontWeight: "700", color: "#E63946" },
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
      fontSize: 15,
      fontWeight: "700",
      color: "#333333",
      marginBottom: 4,
    },
    menuSub: { fontSize: 12, color: "#666666" },
    section: { marginTop: 20, paddingHorizontal: 16 },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 12,
    },
    tipsTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
      marginTop: 12,
      marginBottom: 8,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 4,
      elevation: 3,
      marginBottom: 12,
    },
    infoCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      elevation: 3,
    },
    infoCardText: { fontSize: 15, color: theme.text },
    divider: { height: 1, backgroundColor: theme.border, marginHorizontal: 12 },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      gap: 12,
    },
    infoEmoji: { fontSize: 24 },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 12, color: theme.subtext, marginBottom: 2 },
    infoValue: { fontSize: 15, fontWeight: "600", color: theme.text },
    infoLink: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.primary,
      textDecorationLine: "underline",
    },
    tipRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 12,
      gap: 10,
    },
    tipBullet: { fontSize: 18 },
    tipText: { flex: 1, fontSize: 14, color: theme.text, lineHeight: 20 },
    mapsButton: {
      backgroundColor: "#2A9D8F",
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: "center",
      marginBottom: 12,
    },
    mapsButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    callButton: {
      backgroundColor: "#E63946",
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: "center",
      marginBottom: 12,
    },
    callButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    locationCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      marginBottom: 12,
      flexDirection: "row",
      gap: 12,
      justifyContent: "center",
    },
    locationText: { fontSize: 15, color: theme.subtext },
    locationError: {
      fontSize: 15,
      color: "#E63946",
      textAlign: "center",
      marginBottom: 12,
    },
  });
