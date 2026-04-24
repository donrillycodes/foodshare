import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ngoApi, foodNeedApi } from "../../lib/api";
import { COLORS, formatCategory, truncate, getProgress } from "../../lib/utils";
import type { NGO, FoodNeed, PaginatedResponse } from "../../types";

type Tab = "ngos" | "needs";

export default function DiscoverScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("ngos");
  const [search, setSearch] = useState("");

  const { data: ngosData, isLoading: ngosLoading } = useQuery({
    queryKey: ["all-ngos", search],
    queryFn: async () => {
      const response = await ngoApi.getAll({
        search: search || undefined,
        limit: 20,
      });
      return response.data.data as PaginatedResponse<NGO>;
    },
  });

  const { data: needsData, isLoading: needsLoading } = useQuery({
    queryKey: ["all-needs", search],
    queryFn: async () => {
      const response = await foodNeedApi.getAll({
        search: search || undefined,
        limit: 20,
      });
      return response.data.data as PaginatedResponse<FoodNeed>;
    },
    enabled: activeTab === "needs",
  });

  const ngos = ngosData?.items ?? [];
  const needs = needsData?.items ?? [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={
              activeTab === "ngos" ? "Search NGOs..." : "Search food needs..."
            }
            placeholderTextColor={COLORS.grayMd}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "ngos" && styles.activeTab]}
          onPress={() => setActiveTab("ngos")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "ngos" && styles.activeTabText,
            ]}
          >
            NGOs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "needs" && styles.activeTab]}
          onPress={() => setActiveTab("needs")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "needs" && styles.activeTabText,
            ]}
          >
            Food Needs
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {activeTab === "ngos" ? (
          ngosLoading ? (
            <ActivityIndicator color={COLORS.green} style={styles.loader} />
          ) : ngos.length === 0 ? (
            <Text style={styles.empty}>No NGOs found</Text>
          ) : (
            ngos.map((ngo) => (
              <TouchableOpacity
                key={ngo.id}
                style={styles.card}
                onPress={() => router.push(`/ngo/${ngo.slug}` as any)}
                activeOpacity={0.8}
              >
                <View style={styles.ngoLogo}>
                  <Text style={styles.ngoLogoText}>{ngo.name.charAt(0)}</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{ngo.name}</Text>
                  <Text style={styles.cardCategory}>
                    {formatCategory(ngo.category)} · {ngo.city}
                  </Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {ngo.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )
        ) : needsLoading ? (
          <ActivityIndicator color={COLORS.green} style={styles.loader} />
        ) : needs.length === 0 ? (
          <Text style={styles.empty}>No food needs found</Text>
        ) : (
          needs.map((need) => (
            <TouchableOpacity
              key={need.id}
              style={styles.card}
              onPress={() => router.push(`/food-need/${need.id}` as any)}
              activeOpacity={0.8}
            >
              <View style={styles.needIcon}>
                <Text style={styles.needIconText}>📦</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.needTitleRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {need.title}
                  </Text>
                  {need.isUrgent && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>URGENT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardCategory}>{need.ngo.name}</Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${getProgress(
                            need.quantityFulfilled,
                            need.quantityRequired,
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {getProgress(need.quantityFulfilled, need.quantityRequired)}
                    %
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayMd,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.black,
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayMd,
  },
  activeTab: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.white,
  },
  list: {
    paddingHorizontal: 20,
    gap: 10,
  },
  loader: {
    marginTop: 40,
  },
  empty: {
    textAlign: "center",
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.grayMd,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  ngoLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.greenLt,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ngoLogoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.green,
  },
  needIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  needIconText: {
    fontSize: 22,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  cardCategory: {
    fontSize: 12,
    color: COLORS.green,
    fontWeight: "500",
  },
  cardDescription: {
    fontSize: 12,
    color: COLORS.gray,
    lineHeight: 17,
  },
  needTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  urgentBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentText: {
    color: "#DC2626",
    fontSize: 9,
    fontWeight: "700",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: COLORS.grayLt,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.green,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.gray,
    width: 32,
  },
  bottomPadding: {
    height: 20,
  },
});
