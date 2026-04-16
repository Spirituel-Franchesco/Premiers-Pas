import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getVocabularyData } from "../services/firebaseService";
import { useTheme } from "../context/ThemeContext";

const FAVORITES_KEY = "vocabulary_favorites";

const CATEGORIES = [
  { key: "all", emoji: "🔍" },
  { key: "expressions", emoji: "💬" },
  { key: "transport", emoji: "🚗" },
  { key: "nourriture", emoji: "🍽️" },
  { key: "quotidien", emoji: "🏠" },
  { key: "emotions", emoji: "😄" },
];

export default function VocabularyScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme(); 
  const [expressions, setExpressions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getVocabularyData();
    const favs = await AsyncStorage.getItem(FAVORITES_KEY);
    setExpressions(data);
    setFiltered(data);
    setFavorites(favs ? JSON.parse(favs) : []);
    setLoading(false);
  };

  useEffect(() => {
    applyFilters();
  }, [search, activeCategory, expressions, showFavorites]);

  const applyFilters = () => {
    let result = expressions;
    if (showFavorites) result = result.filter((e) => favorites.includes(e.id));
    if (activeCategory !== "all")
      result = result.filter((e) => e.category === activeCategory);
    if (search.trim())
      result = result.filter(
        (e) =>
          e.expression &&
          e.expression.toLowerCase().includes(search.toLowerCase()),
      );
    setFiltered(result);
  };

  const toggleFavorite = async (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(updated);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  };

  const getDefinition = (item) =>
    item[`definition_${i18n.language}`] || item["definition_fr"];
  const getExample = (item) =>
    item[`example_${i18n.language}`] || item["example_fr"];

  const styles = makeStyles(theme); 

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.expression}>{item.expression}</Text>
        <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
          <Text style={styles.star}>
            {favorites.includes(item.id) ? "⭐" : "☆"}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.definition}>{getDefinition(item)}</Text>
      <Text style={styles.example}>"{getExample(item)}"</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t("vocabulary.title")}</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder={t("vocabulary.search")}
        placeholderTextColor={theme.subtext}
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={[styles.favBtn, showFavorites && styles.favBtnActive]}
        onPress={() => setShowFavorites(!showFavorites)}
      >
        <Text style={styles.favBtnText}>
          {showFavorites
            ? `⭐ ${t("vocabulary.favorites")}`
            : `☆ ${t("vocabulary.favorites")}`}
        </Text>
      </TouchableOpacity>

      <View style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.catBtn,
              activeCategory === cat.key && styles.catBtnActive,
            ]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>{t("vocabulary.empty")}</Text>
        }
      />
    </View>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.header,
      padding: 16,
      paddingTop: 50,
    },
    back: { color: "#fff", fontSize: 24, marginRight: 12 },
    title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
    searchInput: {
      margin: 12,
      padding: 10,
      backgroundColor: theme.card,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      fontSize: 16,
      color: theme.text,
    },
    categories: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingHorizontal: 12,
      marginBottom: 8,
    },
    catBtn: { padding: 8, borderRadius: 20, backgroundColor: theme.border },
    catBtnActive: { backgroundColor: theme.primary },
    catEmoji: { fontSize: 20 },
    list: { paddingHorizontal: 12, paddingBottom: 20 },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    expression: { fontSize: 20, fontWeight: "bold", color: theme.primary },
    star: { fontSize: 24 },
    definition: { fontSize: 15, color: theme.text, marginTop: 6 },
    example: {
      fontSize: 13,
      color: theme.subtext,
      fontStyle: "italic",
      marginTop: 4,
    },
    empty: {
      textAlign: "center",
      color: theme.subtext,
      marginTop: 40,
      fontSize: 16,
    },
    favBtn: {
      marginHorizontal: 12,
      marginBottom: 8,
      padding: 10,
      borderRadius: 10,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
    favBtnActive: { backgroundColor: "#FFF8E1", borderColor: "#F4B400" },
    favBtnText: { fontSize: 15, fontWeight: "600", color: theme.text },
  });
