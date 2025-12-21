import { Link } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./_styles/select.styles";

export default function Select() {
  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What do you want?</Text>
        <Text style={styles.headerSubtitle}>
          Choose whether you are looking for something or offering something
        </Text>
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
          <TouchableOpacity style={styles.touchableWrapper}>
            <View style={[styles.optionCard, styles.needCard]}>
              <View style={styles.cardContent}>
                <Text style={styles.cardIcon}>🔍</Text>
                <Text style={[styles.cardTitle, styles.needCardTitle]}>
                  I need something
                </Text>
                <Text style={[styles.cardDescription, styles.needCardDescription]}>
                  Looking for products or services? Browse and find what you need.
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
          <TouchableOpacity style={styles.touchableWrapper}>
            <View style={[styles.optionCard, styles.provideCard]}>
              <View style={styles.cardContent}>
                <Text style={styles.cardIcon}>🎁</Text>
                <Text style={[styles.cardTitle, styles.provideCardTitle]}>
                  I provide something
                </Text>
                <Text style={[styles.cardDescription, styles.provideCardDescription]}>
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
