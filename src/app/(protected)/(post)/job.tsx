import CustomInput from "@/src/components/CustomInput";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  Text,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import PagerView, { usePagerView } from "react-native-pager-view";
import { styles } from "./_styles/job.styles";

export default function Job() {
  const params = useLocalSearchParams<{ action?: string; category?: string }>();

  return (
    <>
      {params.action == "need" ? <Need /> : <Provide />}
    </>
  );
}

function Need() {
  const router = useRouter();
  const { ref, setPage } = usePagerView({
    pagesAmount: 5,
  });
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const pages = [
    {
      title: "Personal Information",
      description: "Tell us about yourself",
      fields: [
        { label: "First Name", placeholder: "John" },
        { label: "Last Name", placeholder: "Doe" },
        { label: "Email Address", placeholder: "john@example.com" },
        { label: "Phone Number", placeholder: "+1 (555) 123-4567" },
      ],
    },
    {
      title: "Education",
      description: "Share your educational background",
      fields: [
        { label: "School", placeholder: "University Name" },
        { label: "Program", placeholder: "Computer Science" },
        { label: "Duration", placeholder: "2020 - 2024" },
      ],
    },
    {
      title: "Experience",
      description: "Tell us about your work experience",
      fields: [
        { label: "Company", placeholder: "Company Name" },
        { label: "Position", placeholder: "Job Title" },
        { label: "Duration", placeholder: "2022 - 2024" },
        { label: "Description", placeholder: "What did you do?" },
      ],
    },
    {
      title: "Voluntary Disclosure",
      description: "Optional - Help us build a diverse community",
      fields: [
        { label: "Gender", placeholder: "Select (optional)" },
        { label: "Sexual Orientation", placeholder: "Select (optional)" },
        { label: "Disability", placeholder: "Select (optional)" },
        { label: "Veteran Status", placeholder: "Select (optional)" },
      ],
    },
    {
      title: "Job Preferences",
      description: "What are you looking for?",
      fields: [
        { label: "Desired Companies", placeholder: "e.g., Google, Apple" },
        { label: "Desired Position", placeholder: "e.g., Software Engineer" },
        { label: "Desired Salary", placeholder: "$100,000 - $150,000" },
        { label: "Preferred Location", placeholder: "e.g., San Francisco, CA" },
        { label: "Job Type", placeholder: "e.g., Full-time, Contract" },
        { label: "Availability", placeholder: "e.g., Immediately" },
      ],
    },
  ];

  const isLastPage = currentPageIndex === pages.length - 1;
  const progressPercentage = ((currentPageIndex + 1) / pages.length) * 100;

  const handleNextPage = () => {
    if (isLastPage) {
      router.push("/");
    } else {
      const nextPage = currentPageIndex + 1;
      setCurrentPageIndex(nextPage);
      setPage(nextPage);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      const prevPage = currentPageIndex - 1;
      setCurrentPageIndex(prevPage);
      setPage(prevPage);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Dream Job</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentPageIndex + 1}/{pages.length}
          </Text>
        </View>
      </View>

      <PagerView
        ref={ref}
        style={styles.container}
        initialPage={0}
        scrollEnabled={false}
        onPageSelected={(e) => {
          setCurrentPageIndex(e.nativeEvent.position);
        }}
      >
        {pages.map((page, index) => (
          <ScrollView
            key={index}
            style={styles.pageContainer}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <View>
                <Text style={styles.pageTitle}>{page.title}</Text>
                <Text style={styles.pageDescription}>{page.description}</Text>

                <View style={styles.formContent}>
                  {page.fields.map((field, fieldIndex) => (
                    <View key={fieldIndex} style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>{field.label}</Text>
                      <CustomInput placeholder={field.placeholder} />
                    </View>
                  ))}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        ))}
      </PagerView>

      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={handlePrevPage}
        >
          <Text style={styles.backButtonText}>
            {currentPageIndex === 0 ? "Cancel" : "Back"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isLastPage ? styles.submitButton : styles.nextButton]}
          onPress={handleNextPage}
        >
          <Text
            style={isLastPage ? styles.submitButtonText : styles.nextButtonText}
          >
            {isLastPage ? "Submit" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Provide() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Post a Job</Text>
        <Text style={styles.pageDescription}>
          Share details about the job opportunity
        </Text>
      </View>

      <ScrollView style={styles.singlePageContainer}>
        <View>
          <Text style={styles.sectionTitle}>Company Information</Text>
          <View style={styles.formContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Company Name</Text>
              <CustomInput placeholder="Your Company Name" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contact Email</Text>
              <CustomInput placeholder="contact@company.com" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <CustomInput placeholder="+1 (555) 123-4567" />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.formContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Position Title</Text>
              <CustomInput placeholder="e.g., Software Engineer" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Job Description</Text>
              <CustomInput placeholder="Describe the role and responsibilities" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <CustomInput placeholder="e.g., San Francisco, CA" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Salary Range</Text>
              <CustomInput placeholder="e.g., $100,000 - $150,000" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Job Type</Text>
              <CustomInput placeholder="e.g., Full-time, Contract" />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={() => {
            router.push("/");
          }}
        >
          <Text style={styles.submitButtonText}>Post Job</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
