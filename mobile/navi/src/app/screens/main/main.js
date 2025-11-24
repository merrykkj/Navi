import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import CustomNavbar from "../../components/CustomNavbar";
import CustomSidebar from "../../components/CustomSidebar";
import FooterNav from "./FooterNav";

import HomeScreen from "./HomeScreen";
import ProfileScreen from "./ProfileScreen";
import SettingsScreen from "./SettingsScreen";
import HistoricoScreen from "./HistoricoScreen";

const SIDEBAR_WIDTH = 270;
const DARK_TEXT = "#1f2937";

export default function Main({ navigation }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const animatedValue = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [activeTab, setActiveTab] = useState("home");

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isSidebarOpen ? 0 : -SIDEBAR_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isSidebarOpen]);

  const handleNavigate = (screenName) => {
    setIsSidebarOpen(false);
    setActiveTab(screenName);
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen />;
        case "historico":
          return <HistoricoScreen />;
      case "profile":
        return <ProfileScreen />;
      case "settings":
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <CustomNavbar toggleSidebar={toggleSidebar} title="Navi" />

      <View style={styles.content}>{renderContent()}</View>

      <FooterNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <CustomSidebar
        isSidebarOpen={isSidebarOpen}
        animatedValue={animatedValue}
        onClose={toggleSidebar}
        onNavigate={handleNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
});
