import { useRef, useState } from "react"
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { colors } from "../utils/colors"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export type DropdownMenuAction = {
  id: string
  title: string
  titleColor: string
  icon?: React.ReactNode
  visible?: boolean
}

export default function DropdownMenu({
  style,
  dropdownWidth = 150,
  anchor = "auto",
  disabled = false,
  actions,
  onPressAction,
  children,
}: {
  style?: StyleProp<ViewStyle>
  dropdownWidth?: number
  anchor?:
    | "auto"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
  disabled?: boolean
  actions: DropdownMenuAction[]
  onPressAction: (actionId: string) => void
  children: React.ReactNode
}) {
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const actionButtonRef = useRef<View>(null)
  const insets = useSafeAreaInsets()
  const windowDimensions = Dimensions.get("window")
  const menuHeight = actions.length * 49

  function openMenu() {
    actionButtonRef.current?.measureInWindow((x, y, width, height) => {
      const margin = Platform.OS === "android" ? 24 : 0

      if (anchor === "auto") {
        const spaceBelow = windowDimensions.height - (y + height) - insets.bottom
        const spaceAbove = y - insets.top
        const openAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow

        setMenuPosition({
          top: openAbove ? Math.max(margin, y - menuHeight - 8) : y + height + margin,
          left: x - dropdownWidth + width,
        })
      } else if (anchor === "top") {
        setMenuPosition({
          top: Math.max(margin, y - menuHeight - 8),
          left: x - dropdownWidth + width,
        })
      } else if (anchor === "bottom") {
        setMenuPosition({
          top: y + height + margin,
          left: x - dropdownWidth + width,
        })
      } else if (anchor === "left") {
        setMenuPosition({
          top: y - menuHeight / 2 + height / 2,
          left: Math.max(insets.left + 8, x - dropdownWidth - 8),
        })
      } else if (anchor === "right") {
        setMenuPosition({
          top: y - menuHeight / 2 + height / 2,
          left: x + width + 8,
        })
      }

      setMenuVisible(true)
    })
  }

  return (
    <>
      <TouchableOpacity ref={actionButtonRef} onPress={openMenu} disabled={disabled}>
        {children}
      </TouchableOpacity>

      <Modal visible={menuVisible} transparent animationType="fade" style={style}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View
            style={[
              styles.menuContainer,
              {
                top: menuPosition.top,
                left: menuPosition.left,
                width: dropdownWidth,
              },
            ]}
          >
            {actions.map(
              action =>
                action.visible !== false && (
                  <Pressable
                    key={action.id}
                    style={styles.menuItem}
                    onPress={() => {
                      onPressAction(action.id)
                      setMenuVisible(false)
                    }}
                  >
                    {action.icon}
                    <Text style={[styles.menuItemText, { color: action.titleColor }]}>
                      {action.title}
                    </Text>
                  </Pressable>
                )
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    cursor: "auto",
  },
  menuContainer: {
    position: "absolute",
    backgroundColor: colors.light,
    borderRadius: 8,
    overflow: "hidden",
    width: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.dark,
    marginLeft: 12,
  },
  container: {
    margin: 20,
  },
  button: {
    padding: 15,
    backgroundColor: "#3498db",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#e74c3c",
    borderRadius: 5,
  },
  closeText: {
    color: "white",
    textAlign: "center",
  },
})
