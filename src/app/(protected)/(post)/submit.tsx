import { colors } from "@/src/utils/colors";
import { Pressable, PressableProps, Text } from "react-native";

type CustomProps = PressableProps & {
  text: string;
  color?: string;
};

export default function SubmitButton({ text, color, ...rest }: CustomProps) {
  return (
    <Pressable
      style={{
        width: "100%",
        paddingVertical: 16,
        backgroundColor: color ? color : colors.purple,
        borderRadius: 10,
        alignItems: "center",
      }}
      {...rest}
    >
      <Text
        style={{
          color: colors.light,
          fontSize: 20,
        }}
      >
        {text}
      </Text>
    </Pressable>
  );
}
