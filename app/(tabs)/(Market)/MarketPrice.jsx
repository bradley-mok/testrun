import {
  Clock,
  Equal,
  Info,
  MapPin,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ScreenWrapper from '../../../components/ScreenWrapper';
import { createClient } from '@supabase/supabase-js';

// ------------------------
// SUPABASE CONNECTION
// ------------------------
const SUPABASE_URL = 'https://zyvilaqlbsmbwxtdulvt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dmlsYXFsYnNtYnd4dGR1bHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzg0NzcsImV4cCI6MjA3NjY1NDQ3N30.yWKACrRr_7mTLK5IDx-Ty0P00vF9ZkAea3FIWFPb7dM';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ------------------------
// DEFAULT POLLING INTERVAL
// ------------------------
const POLL_INTERVAL = 30_000;

// Map Supabase data to your existing format
function mapSupabaseToMarketItem(item) {
  return {
    crop: item.crop_name || 'Unknown',
    currentPrice: Number(item.current_price) || 0,
    previousPrice: Number(item.previous_price) || 0,
    change: Number(item.price_change) || 0,
    unit: item.unit || 'per kg',
    trend: item.trend || 'stable',
    market: item.market || 'Market',
    volume: item.volume || '',
    lastUpdated: item.last_updated ? new Date(item.last_updated).toLocaleDateString() : '',
  };
}

export default function MarketPrices() {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up": return <TrendingUp size={16} color="#137f2f" />;
      case "down": return <TrendingDown size={16} color="#b91c1c" />;
      case "stable": return <Equal size={16} color="#6b7280" />;
      default: return <Equal size={16} color="#6b7280" />;
    }
  };

  const formatChange = (change) => {
    if (change === 0) return "0.0%";
    return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  const fetchMarketData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) throw error;

      const mapped = data.map(mapSupabaseToMarketItem);
      setMarketData(mapped);
      setError(null);
    } catch (e) {
      console.warn('MarketPrices: fetch failed', e);
      setError(String(e.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const id = setInterval(fetchMarketData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const avgChange = marketData.length
    ? marketData.reduce((acc, i) => acc + (i.change ?? 0), 0) / marketData.length
    : 0;

  // Keep your existing DUMMY_UPDATES for the updates section
  const DUMMY_UPDATES = [
    { text: "Market data refreshed from live sources", meta: "Live Feed • Just now" },
    { text: "Automatic price updates every 30 seconds", meta: "System • Active" },
  ];

  return (
    <ScreenWrapper bg="#f6fef9">
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          {loading && <ActivityIndicator size="small" color="#2e7d32" style={{ marginVertical: 12 }} />}
          {error && <Text style={{ color: 'red', marginVertical: 8 }}>Failed to fetch live data: {error}</Text>}

        {/* Market Overview */}
       <LinearGradient
         colors={[ "#e8f3ebff","#A7F3D0"]}
         start={{ x: 0, y: 0 }}
         end={{ x: 1, y: 1 }}
         style={[styles.overviewCard, styles.overviewGradient]}
       >


          <Text style={styles.overviewTitle}>
            <TrendingUp size={18} color="#2e7d32" />{" "}
            Today's Market Overview
          </Text>

          <View style={styles.overviewStats}>
            <View>
              <Text style={styles.statLabel}>Active Markets</Text>
              <Text style={styles.statValue}>{marketData.length}</Text>
            </View>

            <View>
              <Text style={styles.statLabel}>Avg Price Change</Text>
              <Text style={[styles.statValue, { color: avgChange >= 0 ? "#137f2f" : "#b91c1c" }]}>
                {formatChange(avgChange)}
              </Text>
            </View>
          </View>

          <View style={styles.trendRow}>
            <Text style={{ color: "#137f2f" }}>
              {marketData.filter(item => item.change > 0).length} Rising
            </Text>
            <Text style={{ color: "#b91c1c" }}>
              {marketData.filter(item => item.change < 0).length} Falling
            </Text>
            <Text style={{ color: "#6b7280" }}>
              {marketData.filter(item => item.change === 0).length} Stable
            </Text>
          </View>
         </LinearGradient>

        {/* Price Cards */}
        {marketData.map((item, index) => {
          const positive = item.change > 0;
          return (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cropName}>{item.crop}</Text>
                    <View style={{ width: 6 }} />
                    {getTrendIcon(item.trend)}
                  </View>
                  <View style={styles.marketRow}>
                    <MapPin size={12} color="gray" />
                    <Text style={styles.marketText}>{item.market}</Text>
                  </View>
                </View>

                {/* pill badge */}
                <View style={[styles.badgePill, positive ? styles.badgePositive : item.change < 0 ? styles.badgeNegative : styles.badgeNeutral]}>
                  <Text style={[styles.badgeText, positive ? { color: "#075e2a" } : { color: "#7a1a1a" }]}>
                    {formatChange(item.change)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>R{item.currentPrice.toFixed(2)}</Text>
                    <Text style={styles.unit}>{item.unit}</Text>
                  </View>
                  <Text style={styles.previousPrice}>Previous: R{item.previousPrice.toFixed(2)}</Text>
                </View>

                <View style={styles.volumeBlock}>
                  <Text style={styles.volumeText}>Volume: {item.volume}</Text>
                  <View style={styles.timeRow}>
                    <Clock size={12} color="gray" />
                    <Text style={styles.timeText}>{item.lastUpdated}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Market Updates */}
        <View style={styles.updateCard}>
          <Text style={styles.updateTitle}>
            <Info size={16} color="#d97706" /> Latest Market Updates
          </Text>

          {DUMMY_UPDATES.map((u, i) => (
            <View key={i} style={styles.updateItem}>
              <View style={styles.dot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.updateText}>{u.text}</Text>
                <Text style={styles.updateMeta}>{u.meta}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer small block */}
        <View style={styles.footerCard}>
          <View style={styles.footerRow}>
            <View style={styles.statusRow}>
              <View style={styles.activeDot} />
              <Text style={styles.statusText}>Markets Active</Text>
            </View>
            <Text style={styles.footerTime}>
              Last updated: {new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>
        </ScrollView>
    </ScreenWrapper>
  );
}

// KEEP ALL YOUR EXISTING STYLES EXACTLY THE SAME
const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 12, paddingBottom: 30 },

  overviewCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#45d84dff",
  },
  overviewGradient: { marginTop: -12 },
  overviewTitle: { fontSize: 16, fontWeight: "600", color: "#1b5e20", marginBottom: 8 },
  overviewStats: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  statLabel: { fontSize: 12, color: "#555" },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#1b5e20" },
  trendRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 4 },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#DBFCE6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  cropName: { fontWeight: "600", fontSize: 14, color: "#1b5e20" },
  marketRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  marketText: { fontSize: 12, color: "gray", marginLeft: 6 },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    minWidth: 62,
    alignItems: "center",
    justifyContent: "center",
  },
  badgePositive: { backgroundColor: "#ecfdf3", borderWidth: 1, borderColor: "#bbefcd" },
  badgeNegative: { backgroundColor: "#fff1f2", borderWidth: 1, borderColor: "#f8d0d3" },
  badgeNeutral: { backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#e5e7eb" },
  badgeText: { fontWeight: "700", fontSize: 12 },
  cardBody: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  priceRow: { flexDirection: "row", alignItems: "flex-end" },
  price: { fontSize: 20, fontWeight: "bold", color: "#2e7d32" },
  unit: { fontSize: 12, color: "gray", marginLeft: 8 },
  previousPrice: { fontSize: 12, color: "gray" },
  volumeBlock: { alignItems: "flex-end" },
  volumeText: { fontSize: 12, color: "gray" },
  timeRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  timeText: { fontSize: 12, color: "gray", marginLeft: 6 },
  updateCard: {
    backgroundColor: "#fff7ed",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#fde7ce",
  },
  updateTitle: { fontSize: 14, fontWeight: "600", color: "#92400e", marginBottom: 8 },
  updateItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8 },
  dot: { width: 6, height: 6, backgroundColor: "#f97316", borderRadius: 3, marginTop: 6, marginRight: 8 },
  updateText: { fontSize: 12, fontWeight: "500", color: "#b45309" },
  updateMeta: { fontSize: 12, color: "#d97706", marginTop: 4 },
  footerCard: {
    backgroundColor: "#f1f8f4",
    borderRadius: 8,
    padding: 12,
    borderColor: "#2e7d32",
    borderWidth: 1,
    marginBottom: 30,
  },
  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusRow: { flexDirection: "row", alignItems: "center" },
  activeDot: { width: 10, height: 10, backgroundColor: "green", borderRadius: 5, marginRight: 8 },
  statusText: { fontSize: 12, fontWeight: "600", color: "#1b5e20" },
  footerTime: { fontSize: 12, color: "gray" },
});