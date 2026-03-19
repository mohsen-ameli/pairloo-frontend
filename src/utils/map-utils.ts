export function zoomToRadiusMeters(zoom: number, latitude: number, circleRadiusPx = 150): number {
  const metersPerPixel = (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom)
  return Math.round(metersPerPixel * circleRadiusPx)
}

export function radiusMetersToZoom(
  distance: number,
  latitude: number,
  circleRadiusPx = 150
): number {
  const metersPerPixel = distance / circleRadiusPx
  const zoom = Math.log2((156543.03392 * Math.cos((latitude * Math.PI) / 180)) / metersPerPixel)
  return Math.round(zoom)
}
