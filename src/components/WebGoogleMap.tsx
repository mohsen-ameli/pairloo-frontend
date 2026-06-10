import { GoogleMap, useJsApiLoader } from "@react-google-maps/api"
import { memo, RefObject, useCallback, useEffect, useRef } from "react"
import { MapRegion } from "@/src/app/(util)/map-selector"
import { GOOGLE_API_KEY } from "@/src/utils/constants"

function WebGoogleMap({
  cameraPosition,
  zoomControl = true,
  region,
}: {
  cameraPosition: { coordinates: { lat: number; lng: number }; zoom: number }
  zoomControl?: boolean
  region?: RefObject<MapRegion>
}) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_API_KEY })

  useEffect(() => {
    mapRef.current?.setCenter(cameraPosition.coordinates)
    mapRef.current?.setZoom(cameraPosition.zoom)
  }, [cameraPosition])

  const onLoad = useCallback((map: google.maps.Map) => {
    map.setCenter(cameraPosition.coordinates)
    map.setZoom(cameraPosition.zoom)
    mapRef.current = map
  }, [])

  if (!isLoaded) return <></>

  return (
    <GoogleMap
      mapContainerStyle={{
        width: "100%",
        height: "100%",
      }}
      options={{
        zoomControl,
        disableDefaultUI: true,
        draggableCursor: "default",
        draggingCursor: "default",
        gestureHandling: "greedy",
      }}
      onZoomChanged={() => {
        const zoom = mapRef.current?.getZoom()
        if (zoom && region) {
          region.current.zoom = zoom
        }
      }}
      onDragEnd={() => {
        const center = mapRef.current?.getCenter()
        const zoom = mapRef.current?.getZoom()
        if (center && zoom && region) {
          region.current.latitude = center.lat()
          region.current.longitude = center.lng()
          region.current.zoom = zoom
        }
      }}
      onLoad={onLoad}
    />
  )
}

export default memo(WebGoogleMap)
