import { Linking, ScrollView, Text, View } from "react-native"
import type { ReactNode } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { commonStyles } from "@/src/styles/common.styles"
import { policyStyles } from "@/src/styles/policy.styles"

export default function CsaeStandards() {
  const insets = useSafeAreaInsets()

  return (
    <ScrollView style={commonStyles.generalContainer} showsVerticalScrollIndicator={false}>
      <View style={commonStyles.container}>
        <Text style={policyStyles.title}>CSAE Standards</Text>
        <Text style={policyStyles.lastUpdated}>Last Updated: July 27, 2026</Text>

        <Text style={policyStyles.paragraph}>
          Pairloo is committed to protecting children and preventing child sexual abuse and
          exploitation on our platform. This page sets out our published standards, prohibited
          conduct, enforcement actions, and how users and authorities can report concerns.
        </Text>

        <BulletPoint
          bold="What is prohibited?"
          text="Any content or behavior that sexualizes, exploits, endangers, or harms minors, including child sexual abuse material, grooming, sextortion, trafficking, solicitation, and sexual content involving anyone under 18."
        />
        <BulletPoint
          bold="Who do these standards apply to?"
          text="These standards apply to the Pairloo website at https://pairloo.com and the Pairloo mobile application."
        />
        <BulletPoint
          bold="What happens when a violation is found?"
          text="We may remove content, terminate accounts, preserve evidence, and refer matters to law enforcement and relevant child protection organizations."
        />
        <BulletPoint
          bold="How do I report CSAE?"
          text={
            <Text>
              Use the in-app report tools when available or email{" "}
              <Text
                style={policyStyles.link}
                onPress={() => Linking.openURL("mailto:app@pairloo.com")}
              >
                app@pairloo.com
              </Text>
              .
            </Text>
          }
        />

        <Section
          title="1. Zero tolerance"
          content="Pairloo has zero tolerance for child sexual abuse and exploitation (CSAE), including any content or behavior that sexualizes, exploits, endangers, or harms minors. Violations may result in immediate account termination, permanent bans, removal of content, preservation of evidence, and referral to law enforcement and relevant child protection organizations."
        />

        <Subsection
          title="Examples of prohibited conduct"
          items={[
            {
              bold: "Child sexual abuse material:",
              text: "Any CSAM in any form, including images, video, audio, text, or links.",
            },
            {
              bold: "Grooming and solicitation:",
              text: "Grooming, solicitation, or enticement of minors for sexual purposes.",
            },
            {
              bold: "Sexual exploitation:",
              text: "Sextortion, trafficking, or exploitation involving minors.",
            },
            {
              bold: "Sexual content involving minors:",
              text: "Sharing, requesting, or distributing sexual content involving anyone under 18.",
            },
            {
              bold: "Facilitation:",
              text: "Accounts, groups, pages, or events created to facilitate CSAE.",
            },
            {
              bold: "Offline abuse attempts:",
              text: "Attempts to arrange offline contact with minors for abusive purposes.",
            },
            {
              bold: "Impersonation:",
              text: "Romantic or sexual content directed at minors, or impersonation of minors for sexual purposes.",
            },
          ]}
        />

        <Section
          title="2. Minimum age and child accounts"
          content="Pairloo is not directed at children. Users must meet the minimum age required in their country to use the service, which is at least 13 years old or higher where local law requires. We do not knowingly permit registration or use by children below that age. If we learn that a user is under the minimum age, or that a profile misrepresents a minor's age, we will take appropriate action, which may include account removal and deletion of associated data, consistent with our Privacy Policy and applicable law."
        />

        <Section
          title="3. User responsibilities"
          content="All users are expected to help keep Pairloo safe. You must comply with these standards and applicable laws at all times."
        />

        <Subsection
          title="You must not"
          items={[
            {
              bold: "Upload or share CSAE content:",
              text: "Do not upload, share, solicit, or promote CSAE-related content or conduct.",
            },
            {
              bold: "Use features to exploit minors:",
              text: "Do not use private messages, groups, stories, posts, comments, marketplace listings, or any other feature to harm or exploit minors.",
            },
            {
              bold: "Ignore suspicious behavior:",
              text: "Report suspected CSAE immediately using the reporting options described below.",
            },
            {
              bold: "Retaliate against reporters:",
              text: "Do not retaliate against or harass anyone who reports concerns in good faith.",
            },
          ]}
        />

        <Section
          title="4. Reporting CSAE on Pairloo"
          content="If you see content or behavior that may involve CSAE, report it immediately. Do not share, download, or forward suspected CSAM."
        />

        <Subsection
          title="On the website or app"
          items={[
            {
              bold: "Use Report:",
              text: "Use Report on posts, comments, profiles, messages, groups, or pages where available.",
            },
            { bold: "Block the user:", text: "Block the user and stop engaging with them." },
            {
              bold: "Emergency situations:",
              text: "If you are in immediate danger, contact local emergency services first.",
            },
          ]}
        />

        <Subsection
          title="Direct contact"
          items={[
            {
              bold: "Email:",
              text: (
                <Text>
                  Email us at{" "}
                  <Text
                    style={policyStyles.link}
                    onPress={() => Linking.openURL("mailto:app@pairloo.com")}
                  >
                    app@pairloo.com
                  </Text>{" "}
                  with the subject line "CSAE Report".
                </Text>
              ),
            },
            {
              bold: "Include if possible:",
              text: "Links or usernames involved, date and time, a description of what you saw, and screenshots only if safe and lawful to provide. Do not attach illegal material.",
            },
            {
              bold: "Priority handling:",
              text: "We prioritize CSAE reports and aim to review urgent child-safety reports as quickly as possible.",
            },
          ]}
        />

        <Subsection
          title="Report to authorities"
          items={[
            {
              bold: "United States:",
              text: (
                <Text>
                  National Center for Missing and Exploited Children (NCMEC) —{" "}
                  <Text
                    style={policyStyles.link}
                    onPress={() => Linking.openURL("https://www.cybertipline.org/")}
                  >
                    CyberTipline
                  </Text>
                </Text>
              ),
            },
            {
              bold: "United Kingdom:",
              text: (
                <Text>
                  Internet Watch Foundation (IWF) —{" "}
                  <Text
                    style={policyStyles.link}
                    onPress={() => Linking.openURL("https://www.iwf.org.uk/")}
                  >
                    iwf.org.uk
                  </Text>
                </Text>
              ),
            },
            {
              bold: "European Union:",
              text: (
                <Text>
                  Contact your national law enforcement or INHOPE member hotline —{" "}
                  <Text
                    style={policyStyles.link}
                    onPress={() => Linking.openURL("https://www.inhope.org/")}
                  >
                    inhope.org
                  </Text>
                </Text>
              ),
            },
            {
              bold: "Australia:",
              text: (
                <Text>
                  eSafety Commissioner —{" "}
                  <Text
                    style={policyStyles.link}
                    onPress={() => Linking.openURL("https://www.esafety.gov.au/")}
                  >
                    esafety.gov.au
                  </Text>
                </Text>
              ),
            },
          ]}
        />

        <Section
          title="5. Moderation, enforcement, and law enforcement cooperation"
          content="When we identify or receive credible reports of CSAE, Pairloo may remove content and disable accounts without prior notice, restrict or terminate access to features, preserve relevant logs and metadata as allowed by law, report to law enforcement and other appropriate organizations, and cooperate with valid legal requests from authorities investigating child exploitation. Confirmed violations result in permanent removal and banning of responsible accounts and related assets where technically feasible."
        />

        <Section
          title="6. Prevention measures"
          content="We work to reduce CSAE risk through measures that may include registration age checks, user reporting tools across social features, administrative review of reports and repeat offenders, account and content removal for policy violations, restrictions on accounts engaged in harassment, grooming patterns, or sexual solicitation, and ongoing review of safety practices as our platform evolves."
        />

        <Section
          title="7. Privacy and survivor safety"
          content="Pairloo handles CSAE reports sensitively and limits disclosure of report details to those who need them for review, enforcement, or legal compliance. We encourage reporters not to publicly share identifying details about suspected victims."
        />

        <Section
          title="8. Relationship to other policies"
          content="These CSAE standards are part of our broader rules. They work together with our Terms of Use, Privacy Policy, and community guidelines. Where there is a conflict regarding child safety, these CSAE standards prevail."
        />

        <Subsection
          title="Related policies"
          items={[
            {
              bold: "Privacy Policy:",
              text: (
                <Text>
                  <Text
                    style={policyStyles.link}
                    onPress={() => Linking.openURL("https://pairloo.com/privacy-policy")}
                  >
                    https://pairloo.com/privacy-policy
                  </Text>
                </Text>
              ),
            },
          ]}
        />

        <Section
          title="9. Changes to these standards"
          content="We may update this page to reflect legal, technical, or safety developments. The Last Updated date at the top will change when we do. Continued use of Pairloo after updates means you accept the revised standards."
        />

        <Section
          title="10. Contact"
          content="Child safety and CSAE reports can be sent directly to our safety team. For general support, you can use the same email or visit our website."
        />

        <Subsection
          title="Contact details"
          items={[
            {
              bold: "Email:",
              text: (
                <Text>
                  <Text
                    style={policyStyles.link}
                    onPress={() => Linking.openURL("mailto:app@pairloo.com")}
                  >
                    app@pairloo.com
                  </Text>{" "}
                  (subject: CSAE Report)
                </Text>
              ),
            },
            {
              bold: "Website:",
              text: (
                <Text>
                  <Text
                    style={policyStyles.link}
                    onPress={() => Linking.openURL("https://pairloo.com/")}
                  >
                    https://pairloo.com/
                  </Text>
                </Text>
              ),
            },
          ]}
        />

        <Text style={policyStyles.paragraph}>
          We review CSAE and child-safety inquiries carefully and aim to respond as quickly as
          possible.
        </Text>

        <View style={{ height: insets.bottom + 20 }} />
      </View>
    </ScrollView>
  )
}

const BulletPoint = ({ bold, text }: { bold: string; text: ReactNode }) => (
  <View style={policyStyles.bulletContainer}>
    <Text style={policyStyles.bulletDot}>•</Text>
    <Text style={policyStyles.paragraph}>
      <Text style={policyStyles.bold}>{bold}</Text> {text}
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
  items: { bold: string; text: ReactNode }[]
}) => (
  <View style={policyStyles.subsection}>
    <Text style={policyStyles.subheading}>{title}</Text>
    {items.map((item, idx) => (
      <BulletPoint key={idx} bold={item.bold} text={item.text} />
    ))}
  </View>
)
