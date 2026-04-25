import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { donationApi, pledgeApi } from "../../lib/api";
import {
  COLORS,
  formatCurrency,
  formatDate,
  formatStatus,
} from "../../lib/utils";
import type { Donation, FoodPledge, PaginatedResponse } from "../../types";
import { useLocalSearchParams } from "expo-router";
import { useNavigationStore } from '../../store/authStore';
import { useEffect } from 'react';

type Tab = "donations" | "pledges";

export default function ActivityScreen() {
  const { tab } = useLocalSearchParams<{ tab?: Tab }>();
  const [activeTab, setActiveTab] = useState<Tab>(tab ?? "donations");
  const { activityTab } = useNavigationStore();

  useEffect(() => {
    setActiveTab(activityTab);
  }, [activityTab]);

  const { data: donationsData, isLoading: donationsLoading } = useQuery({
    queryKey: ["my-donations"],
    queryFn: async () => {
      const response = await donationApi.getMyDonations();
      return response.data.data as PaginatedResponse<Donation>;
    },
  });

  const { data: pledgesData, isLoading: pledgesLoading } = useQuery({
    queryKey: ["my-pledges"],
    queryFn: async () => {
      const response = await pledgeApi.getMyPledges();
      return response.data.data as PaginatedResponse<FoodPledge>;
    },
    enabled: activeTab === "pledges",
  });

  const donations = donationsData?.items ?? [];
  const pledges = pledgesData?.items ?? [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "FULFILLED":
        return "#16A34A";
      case "PENDING":
      case "CONFIRMED":
        return "#D97706";
      case "FAILED":
      case "CANCELLED":
      case "EXPIRED":
        return "#DC2626";
      default:
        return COLORS.gray;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Activity</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "donations" && styles.activeTab]}
          onPress={() => setActiveTab("donations")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "donations" && styles.activeTabText,
            ]}
          >
            Donations
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pledges" && styles.activeTab]}
          onPress={() => setActiveTab("pledges")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pledges" && styles.activeTabText,
            ]}
          >
            Food Pledges
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {activeTab === "donations" ? (
          donationsLoading ? (
            <ActivityIndicator color={COLORS.green} style={styles.loader} />
          ) : donations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>❤️</Text>
              <Text style={styles.emptyTitle}>No donations yet</Text>
              <Text style={styles.emptyMessage}>
                Your donation history will appear here
              </Text>
            </View>
          ) : (
            donations.map((donation) => (
              <View key={donation.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.ngoLogo}>
                    <Text style={styles.ngoLogoText}>
                      {donation.ngo.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {donation.ngo.name}
                    </Text>
                    <Text style={styles.cardDate}>
                      {formatDate(donation.createdAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.amount}>
                    {formatCurrency(Number(donation.amount))}
                  </Text>
                  <Text
                    style={[
                      styles.status,
                      { color: getStatusColor(donation.status) },
                    ]}
                  >
                    {formatStatus(donation.status)}
                  </Text>
                </View>
              </View>
            ))
          )
        ) : pledgesLoading ? (
          <ActivityIndicator color={COLORS.green} style={styles.loader} />
        ) : pledges.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No pledges yet</Text>
            <Text style={styles.emptyMessage}>
              Your food pledge history will appear here
            </Text>
          </View>
        ) : (
          pledges.map((pledge) => (
            <View key={pledge.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.pledgeIcon}>
                  <Text style={styles.pledgeIconText}>📦</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {pledge.foodNeed.title}
                  </Text>
                  <Text style={styles.cardDate}>
                    {pledge.quantityPledged} {pledge.foodNeed.unit} ·{" "}
                    {pledge.ngo.name}
                  </Text>
                  <Text style={styles.cardDate}>
                    {formatDate(pledge.createdAt)}
                  </Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text
                  style={[
                    styles.status,
                    { color: getStatusColor(pledge.status) },
                  ]}
                >
                  {formatStatus(pledge.status)}
                </Text>
              </View>
            </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  emptyMessage: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.grayMd,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  ngoLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.greenLt,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  ngoLogoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.green,
  },
  pledgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  pledgeIconText: {
    fontSize: 20,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.black,
  },
  status: {
    fontSize: 12,
    fontWeight: "500",
  },
  bottomPadding: {
    height: 20,
  },
});
