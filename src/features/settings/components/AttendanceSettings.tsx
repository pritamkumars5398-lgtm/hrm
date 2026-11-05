import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Check,
  Crosshair,
  Loader2,
  MapPin,
  ExternalLink,
  Shield,
  Layers,
  Building,
  Navigation2,
  Sparkles,
} from 'lucide-react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import { useAuthStore } from '@/features/auth/store/authStore'
import { hasPermission } from '@/shared/config/navigation'
import { attendanceService, getCurrentLocation } from '@/services/attendanceService'

const DEFAULT_RADIUS = 200

export default function AttendanceSettings() {
  const user = useAuthStore((s) => s.user)!
  const canEdit =
    hasPermission(user.permissions, 'attendance.manage') || hasPermission(user.permissions, 'settings.manage')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [locating, setLocating] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [enabled, setEnabled] = useState(false)
  const [latitude, setLatitude] = useState('26.860611')
  const [longitude, setLongitude] = useState('81.019746')
  const [radius, setRadius] = useState<number>(DEFAULT_RADIUS)
  const [showCoordinates, setShowCoordinates] = useState(false)

  useEffect(() => {
    let cancelled = false
    attendanceService
      .getSettings()
      .then((s) => {
        if (cancelled) return
        setEnabled(s.geofenceEnabled)
        if (s.officeLatitude != null) setLatitude(String(s.officeLatitude))
        if (s.officeLongitude != null) setLongitude(String(s.officeLongitude))
        if (s.geofenceRadiusMeters != null) setRadius(s.geofenceRadiusMeters)
      })
      .catch((err: Error) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user.activeOrganizationId])

  const useMyLocation = async () => {
    setError(null)
    setLocating(true)
    try {
      const fix = await getCurrentLocation()
      setLatitude(fix.latitude.toFixed(6))
      setLongitude(fix.longitude.toFixed(6))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not get your location.')
    } finally {
      setLocating(false)
    }
  }

  const save = async () => {
    setError(null)
    setSaved(false)

    const lat = latitude.trim() === '' ? undefined : Number(latitude)
    const lng = longitude.trim() === '' ? undefined : Number(longitude)
    const r = Number(radius)

    if (
      (lat !== undefined && (Number.isNaN(lat) || lat < -90 || lat > 90)) ||
      (lng !== undefined && (Number.isNaN(lng) || lng < -180 || lng > 180))
    ) {
      setError('Latitude must be between -90 and 90, longitude between -180 and 180.')
      return
    }
    if (!Number.isInteger(r) || r < 20 || r > 50000) {
      setError('Radius must be a whole number between 20 and 50,000 metres.')
      return
    }
    if (enabled && (lat === undefined || lng === undefined)) {
      setError('Set the office location before turning on the geofence.')
      return
    }

    setSaving(true)
    try {
      await attendanceService.updateSettings({
        geofenceEnabled: enabled,
        officeLatitude: lat,
        officeLongitude: lng,
        geofenceRadiusMeters: r,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-muted p-6">
        <Loader2 size={15} className="animate-spin text-pine" /> Loading attendance settings…
      </div>
    )
  }

  const hasPoint = latitude.trim() !== '' && longitude.trim() !== ''

  // OpenStreetMap embed URL with bounding box around lat, lng
  const delta = Math.max(0.003, (radius / 111320) * 2.2)
  const latNum = Number(latitude) || 26.860611
  const lngNum = Number(longitude) || 81.019746
  const bbox = `${lngNum - delta},${latNum - delta},${lngNum + delta},${latNum + delta}`
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latNum},${lngNum}`

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[16px] font-semibold text-ink">Attendance & Geofencing</h2>
        <p className="mt-0.5 max-w-xl text-[13px] leading-relaxed text-muted">
          Define your office premises. When enabled, employees must be physically within the geofenced radius to punch in.
        </p>
      </div>

      <Card className="p-5 sm:p-6 space-y-6">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-bold text-ink">Geofenced Attendance Enforcement</p>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  enabled ? 'bg-pine-tint text-pine border border-pine/20' : 'bg-wash text-muted'
                }`}
              >
                {enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <p className="mt-0.5 text-[12.5px] text-muted">
              {enabled
                ? 'Check-ins outside the office perimeter will be rejected.'
                : 'Off means employees can punch in from any location without coordinate checks.'}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={!canEdit}
            onClick={() => setEnabled((v) => !v)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
              enabled ? 'bg-pine' : 'bg-hairline-strong'
            }`}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white transition-[left] duration-200 shadow-sm ${
                enabled ? 'left-[1.375rem]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Visual Map & Geofence Perimeter View */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} className="text-pine" />
              Office Perimeter Map
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!canEdit || locating}
                onClick={useMyLocation}
                className="text-xs"
              >
                {locating ? <Loader2 size={13} className="animate-spin text-pine" /> : <Crosshair size={13} className="text-pine" />}
                Pin My Current Location
              </Button>
              {hasPoint && (
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-pine hover:underline px-2.5 py-1.5 rounded-ctl border border-hairline bg-wash/50"
                >
                  <ExternalLink size={12} /> Google Maps
                </a>
              )}
            </div>
          </div>

          {/* Interactive Visual Map Box */}
          <div className="relative rounded-card border border-hairline overflow-hidden bg-wash h-72 sm:h-80 shadow-2xs">
            {hasPoint ? (
              <>
                <iframe
                  title="Office Geofence Map"
                  src={osmEmbedUrl}
                  className="w-full h-full border-0 pointer-events-auto"
                  loading="lazy"
                />

                {/* Simulated Geofence Radius Radar Overlay in Center */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div
                    className="rounded-full border-2 border-pine/80 bg-pine/15 flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(31,77,63,0.25)]"
                    style={{
                      width: `${Math.min(220, Math.max(90, (radius / 1000) * 120 + 90))}px`,
                      height: `${Math.min(220, Math.max(90, (radius / 1000) * 120 + 90))}px`,
                    }}
                  >
                    <div className="size-4 rounded-full bg-pine border-2 border-white shadow-md animate-pulse" />
                  </div>
                </div>

                {/* Floating Map Legend Overlay */}
                <div className="absolute bottom-3 left-3 bg-surface/95 backdrop-blur-xs border border-hairline px-3 py-1.5 rounded-ctl text-[11px] shadow-sm flex items-center gap-2">
                  <span className="size-2 rounded-full bg-pine animate-ping" />
                  <span className="font-bold text-ink">Geofence Radius: {radius} metres</span>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted">
                <MapPin size={28} className="text-muted/60 mb-2" />
                <p className="font-semibold text-ink text-sm">No office location configured</p>
                <p className="text-xs text-muted max-w-xs mt-0.5">
                  Click "Pin My Current Location" above to automatically detect your coordinates.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Visual Radius Preset Buttons */}
        <div className="space-y-2">
          <label className="block text-[12.5px] font-bold text-ink">
            Allowed Geofence Radius: <span className="text-pine font-mono">{radius} Metres</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { val: 100, label: '100 Metres', desc: 'Single Floor / Office Room' },
              { val: 200, label: '200 Metres', desc: 'Standard Office Building' },
              { val: 500, label: '500 Metres', desc: 'Corporate Tech Campus' },
              { val: 1000, label: '1 Kilometre', desc: 'Industrial Site / Warehouse' },
            ].map((p) => {
              const isSelected = radius === p.val
              return (
                <button
                  key={p.val}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => setRadius(p.val)}
                  className={`p-3 rounded-card border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-pine-tint border-pine text-pine-deep shadow-2xs'
                      : 'bg-surface border-hairline hover:bg-wash text-ink'
                  }`}
                >
                  <div className="font-bold text-xs">{p.label}</div>
                  <div className="text-[10px] text-muted mt-0.5">{p.desc}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Optional Collapsible Coordinate Tweaks */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowCoordinates(!showCoordinates)}
            className="text-[11.5px] font-semibold text-pine hover:underline flex items-center gap-1 cursor-pointer"
          >
            {showCoordinates ? 'Hide manual GPS coordinates' : 'Adjust manual GPS coordinates'}
          </button>

          {showCoordinates && (
            <div className="grid grid-cols-2 gap-3 mt-3 p-3.5 bg-wash/40 rounded-card border border-hairline">
              <div>
                <label className="block text-[11px] font-semibold text-muted mb-1">Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  disabled={!canEdit}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-ctl border border-hairline bg-surface text-xs font-mono"
                  placeholder="e.g. 26.860611"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted mb-1">Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  disabled={!canEdit}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-ctl border border-hairline bg-surface text-xs font-mono"
                  placeholder="e.g. 81.019746"
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div role="alert" className="flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3">
            <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
            <p className="text-[13px] leading-relaxed text-clay">{error}</p>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-hairline">
          <div className="flex items-center gap-2">
            <Shield size={15} className="text-pine" />
            <span className="text-[11.5px] text-muted">
              Location check applies automatically on employee mobile & web punches.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Check size={13} /> Saved
              </span>
            )}
            {canEdit && (
              <Button type="button" disabled={saving} onClick={save}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save Geofence Settings
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
