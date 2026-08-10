# Workspace Rules & Technical Specifications

## Our Story Interactive Map Mechanics (`narsh2026/our-story/`)

### 1. Camera Flight & Line Drawing Rules
- **Camera-Line Locking**: Line progress MUST be strictly locked to the 3D globe camera coordinate `mapInstance.getCenter()`. As the camera moves across Earth, the end of the line must stay physically underneath the camera lens on every WebGL frame.
- **Waypoint Flights (2-Leg Sweeps)**:
  - **Leg 1 (Sweep to Hub/Origin)**: When moving from Stop A ➔ Stop B via a hub (e.g. Cayman ➔ India before NZ, or Honolulu ➔ Seattle before Zurich), Leg 1 sweeps camera to the hub. Line length MUST remain 100% steady during Leg 1. No lines draw during Leg 1.
  - **Leg 2 (Flight to Destination)**: Leg 2 flies camera from the hub to Destination B. Line length grows dynamically from 0% to 100% in exact lockstep with camera position during Leg 2.
- **Hub & Spoke Trip ERA**:
  - All vacation trips depart FROM Seattle (`SEATTLE_HUB = [-122.3421, 47.6097]`).
  - Only outward lines (`Seattle ➔ Destination`) are drawn. No redundant return lines are drawn back to Seattle.
  - When navigating to a new trip, camera sweeps back along the existing outward line to Seattle (Leg 1), and then draws the new line outward from Seattle to the new destination (Leg 2).
  - Camera STOPS and stays focused at the destination stop.

### 2. Senior Design Cartography Braid Engine (Dynamic High-Res Sampling + Harmonized 250km Density)
- **Shared Journey (Waterloo Onward)**: When Arash and Natalie travel together, their paths form **ONE ultra-tight braided rope helix of Teal + Gold** (`buildBraidedRope`).
- **Dynamic Arc Sample Resolution**:
  - Point density is calculated dynamically along Great Circle geodesic distance (`numPoints = Math.max(24, Math.round(segDistKm / 30))`), sampling 1 point every ~30 km. Prevents spiky/jagged sine wave breakdown on long trans-oceanic flights!
- **Harmonized Scale-Aware Braids**:
  - Twist frequency is set to 1 twist every 250 km (`numTwists = Math.max(2, Math.round(segDistKm / 250))`), with a scale-harmonized `ROPE_AMPLITUDE = 0.12` offset.
  - Guarantees smooth, elegant, high-definition braided ropes across both short flights and trans-oceanic journeys.

### 3. Date Line / Antimeridian Navigation & Convergence Normalization
- All line coordinates and camera target longitudes MUST be continuously unwrapped relative to the previous point (`unwrapLongitudes` / `unwrapTargetLng`).
- Once Arash converges at Saskatchewan and Waterloo, longitudes are normalized back to standard $[-180^\circ, +180^\circ]$ domain to prevent 360° line displacement bugs.

### 4. Card Transition Lifecycle & Photo Carousel
- Card IMMEDIATELY fades out when scroll/navigation begins.
- Card remains hidden while camera sweeps across the globe.
- Card text & multi-photo carousel update and smoothly fade in ONLY when camera settles on the final destination stop.

### 5. Finale Animation & Interactive User Controls
- On the final stop (Kelowna Wedding), after camera settles and card fades in, camera zooms out wide (`zoom: 2.1`) and starts a gentle 360-degree globe spin showcasing all journeys.
- Full interactive globe controls (`dragPan`, `scrollZoom`, `dragRotate`, `touchZoomRotate`) are enabled.
- **User Control Yielding**: The instant the user touches or drags the globe, auto-spin immediately stops (`isUserInteracting = true`), granting the user 100% uninhibited, manual drag and tilt control!
