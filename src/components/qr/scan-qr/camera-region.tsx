/** The square box the camera preview is drawn into, with any camera error on top. */
export function CameraRegion({
  regionId,
  cameraError,
}: {
  regionId: string
  cameraError: string
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-lg border bg-black">
      <div id={regionId} className="h-full w-full" />
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-4 text-center text-sm text-red-500">
          {cameraError}
        </div>
      )}
    </div>
  )
}
