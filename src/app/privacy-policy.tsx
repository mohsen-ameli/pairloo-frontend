import { View, ScrollView, Text, Linking, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { commonStyles } from "@/src/styles/common.styles"
import { policyStyles } from "@/src/styles/policy.styles"

export default function PrivacyPolicy() {
  const insets = useSafeAreaInsets()

  return (
    <ScrollView style={commonStyles.generalContainer} showsVerticalScrollIndicator={false}>
      <View style={commonStyles.container}>
        <Text style={policyStyles.title}>Privacy Policy</Text>
        <Text style={policyStyles.lastUpdated}>Last Updated: July 17, 2026</Text>

        <Text style={policyStyles.sectionTitle}>SUMMARY OF KEY POINTS</Text>
        <Text style={policyStyles.paragraph}>
          Before diving into the details, here is a quick overview of how we handle your privacy at
          Pairloo:
        </Text>

        <BulletPoint
          bold="What personal information do we collect?"
          text="We collect your name, email address, location data, device information."
        />
        <BulletPoint
          bold="Do we process any sensitive personal information?"
          text="Yes, we process precise location data to help you connect with nearby users, and we process information from minors (strictly governed by parental consent)."
        />
        <BulletPoint
          bold="Do we collect information from third parties?"
          text="Yes, if you choose to connect your Pairloo account with your Gmail account, we receive basic profile data from them."
        />
        <BulletPoint
          bold="How do we use your information?"
          text="We use your data to run the Pairloo app, connect you with people who share your interests, keep our platform secure, and improve your user experience."
        />
        <BulletPoint
          bold="Who do we share your personal information with?"
          text="We share data only with essential service providers that keep our app running securely, specifically Amazon Web Services (AWS) and Cloudflare. We do not sell your personal information."
        />
        <BulletPoint
          bold="What are your privacy rights?"
          text="Depending on where you live, you have the right to access, correct, delete, and export your data, as well as the right to opt out of certain tracking."
        />
        <BulletPoint
          bold="How can you contact us?"
          text={
            <Text>
              You can reach our privacy team anytime at{" "}
              <Text
                style={policyStyles.link}
                onPress={() => Linking.openURL("mailto:mohsen.ameli83@gmail.com")}
              >
                mohsen.ameli83@gmail.com
              </Text>
              .
            </Text>
          }
        />

        <Section
          title="1. Introduction"
          content="Welcome to Pairloo. We are a global social media application designed to help people connect with each other over general topics, shared journeys, and highly specific interests. Whether you are looking to chat about daily life or find a lost pet, or find a new gym partner, our goal is to make those connections seamless and meaningful.\n\nTo make these connections happen, we need to collect and process some information about you. We wrote this Privacy Policy to explain exactly what we collect, why we need it, and how we protect it. We believe that privacy should be easy to understand, so we have avoided heavy legal jargon wherever possible. This policy applies to all users of the Pairloo mobile app and our website at https://www.pairloo.com, regardless of where you live in the world.\n\nIf you have any questions after reading this document, please do not hesitate to reach out to us. Your trust is the foundation of our community."
        />

        <Section
          title="2. What We Collect & Why"
          content="We only collect information that helps us provide and improve the Pairloo experience. We organize this data into three main categories based on how we receive it."
        />

        <Subsection
          title="Information You Give Us Directly"
          items={[
            {
              bold: "Account Information:",
              text: "We collect your name, email address, profile picture, and location to create and secure your account. (Legal basis: Contract)",
            },
            {
              bold: "Profile and Interest Data:",
              text: "To help you find relevant connections, we collect information you add to your profile. We track the post clicks, post contacts, and post profile views, in order to create a customized feed page. (Legal basis: Consent)",
            },
            {
              bold: "Communications:",
              text: "When you reach out to our support team, we collect the contents of those messages to assist you. (Legal basis: Legitimate Interest)",
            },
          ]}
        />

        <Subsection
          title="Information We Collect Automatically"
          items={[
            {
              bold: "Device Information:",
              text: "We collect data about the smartphone or tablet you use, including the operating system, device identifiers, and mobile network. This helps us optimize the app for your specific hardware. (Legal basis: Legitimate Interest)",
            },
            {
              bold: "Location Data:",
              text: "With your permission, we collect your location data to suggest local connections and relevant regional topics. (Legal basis: Consent)",
            },
            {
              bold: "Cookies & Tracking Data:",
              text: "We use standard tracking technologies to understand how you interact with our app, which features you use most, and how we can improve. (Legal basis: Consent for non-essential tracking; Legitimate Interest for essential operations)",
            },
          ]}
        />

        <Subsection
          title="Information From Third Parties"
          items={[
            {
              bold: "Social Media Data:",
              text: "If you register or log in using a third-party social media account, we receive basic profile information (like your public handle and profile picture) from that platform to streamline your onboarding. (Legal basis: Consent)",
            },
          ]}
        />

        <Section
          title="3. How We Use Your Information"
          content="We do not collect data just to have it. Every piece of information we gather serves a specific purpose in making Pairloo work for you."
        />

        <BulletPoint
          bold="Core Service Delivery:"
          text="We use your account and profile data to create your account, facilitate connections with other users, and power the social features of the app. (Legal basis: Contract)"
        />
        <BulletPoint
          bold="Service Improvement and Personalization:"
          text="We analyze device and tracking data to understand user behavior, fix bugs, and tailor the content and connections you see on your feed. (Legal basis: Legitimate Interest)"
        />
        <BulletPoint
          bold="Communication:"
          text="We use your email address to send you important account updates, password resets, and responses to your support inquiries. (Legal basis: Contract and Legitimate Interest)"
        />
        <BulletPoint
          bold="Security and Fraud Prevention:"
          text="We monitor network traffic and account behavior to detect spam, prevent unauthorized access, and keep the Pairloo community safe. (Legal basis: Legitimate Interest)"
        />
        <BulletPoint
          bold="Legal Compliance:"
          text="We may process your data to comply with global privacy laws, respond to lawful requests, and enforce our terms of service. (Legal basis: Legal Obligation)"
        />
        <BulletPoint
          bold="Marketing:"
          text="If you opt in, we use your email to send you newsletters, feature updates, and promotional content. You can opt out of these at any time. (Legal basis: Consent)"
        />

        <Section
          title="4. When We Share Your Information"
          content="We respect your privacy and strictly limit who has access to your data. We do not sell or share your personal information for cross-context behavioral advertising, fully complying with the California Consumer Privacy Act (CCPA) and other US state privacy laws.\n\nWhen we do share your information, it is only under the following circumstances:"
        />

        <BulletPoint
          bold="Essential Service Providers:"
          text="We share necessary technical data with trusted infrastructure partners who help us run the app. Specifically, we use Amazon Web Services (AWS) for secure cloud data hosting and Cloudflare for network security and content delivery. These providers are legally bound to protect your data and cannot use it for their own purposes."
        />
        <BulletPoint
          bold="Legal Requirements:"
          text="We will disclose your information if we are legally required to do so by a court order, subpoena, or other lawful request from public authorities."
        />
        <BulletPoint
          bold="Business Transitions:"
          text="If Pairloo is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you before your personal data is transferred and becomes subject to a different privacy policy."
        />
        <BulletPoint
          bold="With Your Consent:"
          text="If we need to share your data for any reason not listed here, we will ask for your explicit permission first."
        />

        <Section
          title="5. Your Privacy Rights"
          content="Because Pairloo operates globally, we comply with major privacy frameworks including the GDPR (EU/EEA and UK), PIPEDA (Canada), and US State Privacy Laws (such as CCPA/CPRA, VCDPA, CPA, and CTDPA). We extend these core rights to all our users, regardless of where you live.\n\nYou have the right to:"
        />

        <BulletPoint
          bold="Access Your Data:"
          text="You can request a copy of the personal information we hold about you. We will provide this within 30 days."
        />
        <BulletPoint
          bold="Correct Inaccuracies:"
          text="If your information is wrong or outdated, you can update it directly in your app settings or ask us to fix it."
        />
        <BulletPoint
          bold="Delete Your Data:"
          text="You can request that we erase your personal information. We will do so unless we have a compelling legal reason to keep it (like fraud prevention)."
        />
        <BulletPoint
          bold="Port Your Data:"
          text="You can ask for your data in a structured, commonly used, and machine-readable format so you can transfer it to another service."
        />
        <BulletPoint
          bold="Opt Out of Marketing:"
          text="You can unsubscribe from our marketing emails at any time by clicking the 'unsubscribe' link at the bottom of our emails."
        />
        <BulletPoint
          bold="Withdraw Consent:"
          text="Where we rely on your consent to process data (like location tracking), you can withdraw it at any time through your device settings. This will not affect the legality of any processing we did before you withdrew consent."
        />
        <BulletPoint
          bold="Lodge a Complaint:"
          text="If you reside in the EU, EEA, or UK, you have the right to file a complaint with your local data protection authority if you believe we have violated your privacy rights."
        />

        <Text style={policyStyles.paragraph}>
          To exercise any of these rights, please email us at{" "}
          <Text
            style={policyStyles.link}
            onPress={() => Linking.openURL("mailto:mohsen.ameli83@gmail.com")}
          >
            mohsen.ameli83@gmail.com
          </Text>
          .
        </Text>

        <Section
          title="6. Data Security"
          content="Keeping your conversations and personal details safe is a top priority. We implement robust technical and organizational measures to protect your data.\n\nWe use industry-standard encryption to protect your data while it is in transit and at rest on our AWS servers. We also utilize Cloudflare's security suite to defend against DDoS attacks and unauthorized access. Access to user data within our company is strictly limited to employees who need it to perform their jobs.\n\nHowever, we want to be honest with you: no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.\n\nYou play a vital role in security, too. Please choose a strong, unique password for your Pairloo account and keep your mobile device secure. In the unlikely event of a data breach that compromises your rights and freedoms, we will notify you and the relevant authorities within the timeframes required by law (typically within 72 hours)."
        />

        <Section
          title="7. Data Retention"
          content="We keep your personal information only for as long as we need it to fulfill the purposes outlined in this policy."
        />

        <BulletPoint
          bold="Active Account Data:"
          text="We retain your profile and connections for as long as your account is active, plus a brief 30-day buffer after you request deletion to allow for accidental deletion recovery."
        />
        <BulletPoint
          bold="Technical Logs:"
          text="We keep server and security logs for 12 months to help us identify long-term bugs and investigate security incidents."
        />
        <BulletPoint
          bold="Marketing Preferences:"
          text="We retain a record of your marketing consent (or opt-out status) indefinitely to ensure we respect your wishes over time."
        />
        <BulletPoint
          bold="Legal Obligations:"
          text="We may retain certain basic account information for longer periods if required by tax, legal, or accounting regulations."
        />

        <Text style={policyStyles.paragraph}>
          Once data is no longer needed, we securely delete or anonymize it so it can no longer be
          linked back to you.
        </Text>

        <Section
          title="8. Cookies & Tracking"
          content="Pairloo uses cookies and similar tracking technologies (like mobile device identifiers) to recognize you, remember your preferences, and understand how you use our app.\n\nWe use Essential Cookies to keep you logged in and secure your session. We also use Analytics Cookies to see which features are popular and where the app might be crashing. Because we do not sell your data, we do not use third-party advertising cookies to track you across other websites.\n\nYou can manage your cookie and tracking preferences directly through your mobile device settings. On iOS, you can manage 'App Tracking Transparency' settings, and on Android, you can manage your 'Advertising ID' preferences. Disabling certain tracking may limit your ability to use some personalized features of the app."
        />

        <Section
          title="9. Children's Privacy"
          content="Pairloo is a platform for users of various ages, and we recognize that our services may be accessed by minors. Protecting the privacy of children is incredibly important to us, and we fully comply with the Children's Online Privacy Protection Act (COPPA) and equivalent global youth privacy laws.\n\nIf a user indicates they are under the age of 13 (or the applicable age of digital consent in their jurisdiction, such as 16 in certain EU countries), we trigger a strict verifiable parental consent process."
        />

        <BulletPoint
          bold="Parental Consent:"
          text="We will not collect, use, or disclose personal information from a child without first obtaining verifiable consent from a parent or legal guardian."
        />
        <BulletPoint
          bold="Age Verification:"
          text="We use age-gating during the registration process to identify minors and route them to the parental consent flow."
        />
        <BulletPoint
          bold="Parental Rights:"
          text="Parents have the right to review the personal information we have collected from their child, request that we delete it, and refuse to allow further collection or use of the child's information."
        />

        <Text style={policyStyles.paragraph}>
          Parents who wish to exercise these rights or have questions about our youth privacy
          practices can contact us directly at{" "}
          <Text
            style={policyStyles.link}
            onPress={() => Linking.openURL("mailto:mohsen.ameli83@gmail.com")}
          >
            mohsen.ameli83@gmail.com
          </Text>
          . If we discover we have inadvertently collected data from a child without proper consent,
          we will delete that information immediately.
        </Text>

        <Section
          title="10. International Transfers"
          content="Pairloo connects users globally, which means your data may cross international borders. Our primary servers are hosted by AWS. Depending on where you live, your data may be transferred to, stored, and processed in a country different from your own, including the United States.\n\nWhen we transfer data originating from the EU, EEA, UK, or Canada to other countries, we ensure it is protected by appropriate legal safeguards. We rely on adequacy decisions where applicable, and we implement Standard Contractual Clauses (SCCs) approved by the European Commission and the UK Information Commissioner's Office to guarantee that your privacy rights travel with your data."
        />

        <Section
          title="11. Changes to This Policy"
          content="Technology moves fast, and our app will continue to evolve. As we add new features or as privacy laws change, we may need to update this Privacy Policy.\n\nWhen we make significant changes, we will provide fair notice by sending an email to the address associated with your account and displaying a prominent notification within the Pairloo app. We will also update the 'Last Updated' date at the top of this page. Your continued use of Pairloo after these changes take effect means you understand and agree to the revised policy."
        />

        <Section
          title="12. Contact Us"
          content="We want to hear from you if you have any questions, concerns, or feedback about how we handle your privacy. You can reach our dedicated privacy team through the following methods:"
        />

        <BulletPoint
          bold="Privacy Email:"
          text={
            <Text
              style={policyStyles.link}
              onPress={() => Linking.openURL("mailto:mohsen.ameli83@gmail.com")}
            >
              mohsen.ameli83@gmail.com
            </Text>
          }
        />
        <BulletPoint bold="Website:" text="https://www.pairloo.com" />

        <Text style={policyStyles.paragraph}>
          We review all privacy inquiries carefully and aim to respond to all requests within 14
          business days.
        </Text>

        <View style={{ height: insets.bottom + 20 }} />
      </View>
    </ScrollView>
  )
}

const BulletPoint = ({ bold, text }: { bold: string; text: any }) => (
  <View style={policyStyles.bulletContainer}>
    <Text style={policyStyles.bulletDot}>•</Text>
    <Text style={policyStyles.paragraph}>
      <Text style={policyStyles.bold}>{bold}</Text> {typeof text === "string" ? text : text}
    </Text>
  </View>
)

const Section = ({ title, content }: { title: string; content: string }) => (
  <View style={policyStyles.section}>
    <Text style={policyStyles.heading}>{title}</Text>
    <Text style={policyStyles.paragraph}>{content}</Text>
  </View>
)

const Subsection = ({
  title,
  items,
}: {
  title: string
  items: { bold: string; text: string }[]
}) => (
  <View style={policyStyles.subsection}>
    <Text style={policyStyles.subheading}>{title}</Text>
    {items.map((item, idx) => (
      <BulletPoint key={idx} bold={item.bold} text={item.text} />
    ))}
  </View>
)
