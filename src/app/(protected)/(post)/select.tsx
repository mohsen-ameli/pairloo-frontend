import { Link } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "@/src/styles/select.styles";
import Feather from "@expo/vector-icons/Feather";

export default function Select() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What are you looking for?</Text>
      </View>

      <View style={styles.content}>
        <Link
          push
          href={{
            pathname: "/category",
            params: { action: "need" },
          }}
          asChild
        >
          <TouchableOpacity>
            <View style={[styles.optionCard, styles.needCard]}>
              <View style={styles.cardContent}>
                <Feather name="search" size={45} color="#7C3AED" />
                <Text style={[styles.cardTitle, styles.needCardTitle]}>
                  I need something
                </Text>
                <Text style={[styles.cardDescription, styles.needCardTitle]}>
                  Looking for products or services? Browse and find what you
                  need.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Link>

        <Link
          push
          href={{
            pathname: "/category",
            params: { action: "provide" },
          }}
          asChild
        >
          <TouchableOpacity>
            <View style={[styles.optionCard, styles.provideCard]}>
              <View style={styles.cardContent}>
                <Feather name="gift" size={45} color="#10B981" />
                <Text style={[styles.cardTitle, styles.provideCardTitle]}>
                  I provide something
                </Text>
                <Text style={[styles.cardDescription, styles.provideCardTitle]}>
                  Offer your products or services to the community.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
