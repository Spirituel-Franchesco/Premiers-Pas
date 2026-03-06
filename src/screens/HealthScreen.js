import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import colors from "../styles/colors";
import { getCity } from "../services/storageService";
import { getHealthData } from "../services/firebaseService";
import i18n from "i18next";

export default function HealthScreen({ navigation }) {
  const { t } = useTranslation();
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
        if (data) {
          setHealthData(data);
        } else {
          setError(true);
        }
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
      const url = `https://www.google.com/maps/search/${query}/@${latitude},${longitude},14z`;
      Linking.openURL(url);
      setLocationStatus(null);
    } catch (e) {
      setLocationStatus("error");
    }
  };

  const MENU_ITEMS = [
    {
      key: "ramq",
      emoji: "🏥",
      color: "#E3F2FD",
    },
    {
      key: "clsc",
      emoji: "🏨",
      color: "#E8F5E9",
    },
    {
      key: "clinic",
      emoji: "👨‍⚕️",
      color: "#FFF3E0",
    },
    {
      key: "infoSante",
      emoji: "📞",
      color: "#FCE4EC",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={styles.loadingText}>{t("health.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !healthData) {
    return (
      <SafeAreaView style={styles.container}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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

        {/* Bouton Info-Santé 811 — toujours visible */}
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

        {/* Menu 4 sections */}
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

            {/* Tips RAMQ */}
            <Text style={styles.tipsTitle}>💡 {t("health.ramqTips")}</Text>
            <View style={styles.card}>
              {[1, 2, 3].map((num, index) => {
                const tip =
                  healthData[`ramq_tip${num}_${i18n.language}`] ||
                  healthData[`ramq_tip${num}_fr`];
                if (!tip) return null;
                return (
                  <View key={index}>
                    <View style={styles.tipRow}>
                      <Text style={styles.tipBullet}></Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                    {index < 2 && <View style={styles.divider} />}
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
              <Text style={styles.infoCardText}>
                📍{" "}
                {t("health.locating") === locationStatus
                  ? t("health.locating")
                  : t("health.clscSub")}
              </Text>
            </View>

            {locationStatus === "loading" && (
              <View style={styles.locationCard}>
                <ActivityIndicator color={colors.primaryBlue} />
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
                <ActivityIndicator color={colors.primaryBlue} />
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

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.mediumGray,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 16,
    color: colors.mediumGray,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
  },
  retryText: {
    color: colors.white,
    fontWeight: "600",
  },

  // Header
  header: {
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },

  // Bouton urgence 811
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCE4EC",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.emergencyRed,
    gap: 12,
  },
  emergencyEmoji: {
    fontSize: 32,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.emergencyRed,
  },
  emergencySub: {
    fontSize: 12,
    color: colors.mediumGray,
    marginTop: 2,
  },
  emergencyCall: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.emergencyRed,
  },

  // Menu Grid
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  menuCard: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  menuCardActive: {
    borderWidth: 2,
    borderColor: colors.primaryBlue,
  },
  menuEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.darkGray,
    marginBottom: 4,
  },
  menuSub: {
    fontSize: 12,
    color: colors.mediumGray,
  },

  // Sections
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkGray,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.darkGray,
    marginTop: 12,
    marginBottom: 8,
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  infoCardText: {
    fontSize: 15,
    color: colors.darkGray,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginHorizontal: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  infoEmoji: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.darkGray,
  },
  infoLink: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primaryBlue,
    textDecorationLine: "underline",
  },

  // Tips
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    gap: 10,
  },
  tipBullet: {
    fontSize: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
  },

  // Boutons
  mapsButton: {
    backgroundColor: colors.healthGreen,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  mapsButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  callButton: {
    backgroundColor: colors.emergencyRed,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  callButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  // Location
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  locationText: {
    fontSize: 15,
    color: colors.mediumGray,
  },
  locationError: {
    fontSize: 15,
    color: colors.emergencyRed,
    textAlign: "center",
    marginBottom: 12,
  },
  bottomSpacing: {
    height: 24,
  },
});
