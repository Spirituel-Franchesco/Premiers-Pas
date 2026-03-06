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
import colors from "../styles/colors";
import { getCity } from "../services/storageService";
import { getTransportData } from "../services/firebaseService";
import i18n from 'i18next';

export default function TransportScreen({ navigation }) {
  const { t } = useTranslation();
  const [transportData, setTransportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const city = await getCity();
        const data = await getTransportData(city);
        if (data) {
          setTransportData(data);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={styles.loadingText}>{t("transport.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !transportData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{t("transport.error")}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryText}>← Retour</Text>
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
          <Text style={styles.headerTitle}>{t("transport.title")}</Text>
          <Text style={styles.headerSubtitle}>{transportData.network}</Text>
        </View>

        {/* Carte Réseau */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardEmoji}>🚌</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>{t("transport.network")}</Text>
              <Text style={styles.cardValue}>{transportData.network}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <Text style={styles.cardEmoji}>📞</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>{t("transport.phone")}</Text>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${transportData.phone}`)}
              >
                <Text style={styles.cardLink}>{transportData.phone}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardRow}>
            <Text style={styles.cardEmoji}>🌐</Text>
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>{t("transport.website")}</Text>
              <TouchableOpacity
                onPress={() => Linking.openURL(transportData.website)}
              >
                <Text style={styles.cardLink}>{transportData.website}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Carte Tarifs */}
        <Text style={styles.sectionTitle}>{t("transport.fares")}</Text>
        <View style={styles.faresCard}>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>👨 {t("transport.fare_adult")}</Text>
            <Text style={styles.fareValue}>{transportData.fare_adult}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>
              🎓 {t("transport.fare_reduced")}
            </Text>
            <Text style={styles.fareValue}>{transportData.fare_reduced}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>
              📅 {t("transport.fare_monthly")}
            </Text>
            <Text style={styles.fareValue}>{transportData.fare_monthly}</Text>
          </View>
        </View>

        {/* Carte Conseils */}
        <Text style={styles.sectionTitle}>{t("transport.tips")}</Text>
        <View style={styles.card}>
          {[1, 2, 3].map((num, index) => {
            const tip =
              transportData[`tip_${i18n.language}_${num}`] ||
              transportData[`tip_fr_${num}`];
            if (!tip) return null;
            return (
              <View key={index}>
                <View style={styles.tipRow}>
                  <Text style={styles.tipBullet}>💡</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
                {index < 2 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

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
    marginTop: 8,
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

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.darkGray,
  },
  cardLink: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primaryBlue,
    textDecorationLine: "underline",
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginHorizontal: 12,
  },

  // Section titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkGray,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },

  // Fares
  faresCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  fareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  fareLabel: {
    fontSize: 15,
    color: colors.darkGray,
    fontWeight: "500",
  },
  fareValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryBlue,
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
  bottomSpacing: {
    height: 24,
  },
});
