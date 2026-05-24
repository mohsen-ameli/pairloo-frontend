import { Dimensions, Platform, View } from "react-native"
import { useSharedValue } from "react-native-reanimated"
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel"
import { SlideItem } from "./SlideItem"
import { useEffect, useRef } from "react"
import { colors } from "@/src/utils/colors"
import { useSetAtom } from "jotai"
import { bigImageViewAtom } from "@/src/store/chat-store"
import { isDraggingAtom } from "@/src/store/general-store"

const w = Dimensions.get("window").width
const isWeb = Platform.OS === "web" && w > 700
let width = isWeb ? w * 0.3 : w

export default function ImageCarousel({
  images,
  widthOffset = 0,
  editable = false,
}: {
  images: string[]
  widthOffset?: number
  editable?: boolean
}) {
  const ref = useRef<ICarouselInstance>(null)
  const progress = useSharedValue<number>(0)
  const setImages = useSetAtom(bigImageViewAtom)
  const setIsDragging = useSetAtom(isDraggingAtom)

  width -= widthOffset

  useEffect(() => {
    setImages(
      images.map((att, id) => ({
        uri: att,
        id: id.toString(),
      }))
    )
  }, [images])

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    })
  }

  if (images.length === 1) {
    return <SlideItem index={0} src={images[0]} editable={editable} />
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        paddingBottom: 20,
        height: isWeb ? 550 : 350,
      }}
    >
      <Carousel
        autoPlayInterval={2000}
        data={images}
        loop={true}
        pagingEnabled={true}
        snapEnabled={true}
        width={width}
        style={{ width, height: isWeb ? 500 : 300 }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: Platform.OS === "ios" ? 60 : 65,
          parallaxAdjacentItemScale: 0.75,
        }}
        onProgressChange={(offsetProgress, absoluteProgress) => {
          progress.value = absoluteProgress
        }}
        onScrollStart={() => setIsDragging(true)}
        onScrollEnd={() => setIsDragging(false)}
        renderItem={({ index, item }) => <SlideItem index={index} src={item} editable={editable} />}
        ref={ref}
      />

      <Pagination.Basic
        progress={progress}
        data={images}
        dotStyle={{
          backgroundColor: colors.borderGray,
          borderRadius: 50,
          width: 10,
          height: 10,
        }}
        containerStyle={{ gap: 5 }}
        onPress={onPressPagination}
      />
    </View>
  )
}
