
export type DeviceLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;

  country?: string | null;
  region?: string | null;
  city?: string | null;
  district?: string | null;
};

/**
 * Login time only.
 *
 * - GPS permission denied -> login continues
 * - Browser does not support geolocation -> login continues
 * - GPS timeout -> login continues
 * - Reverse geocoding fails -> coordinates are still returned
 */
export function getDeviceLocation(): Promise<DeviceLocation | null> {
  if (
    typeof navigator === "undefined" ||
    !navigator.geolocation
  ) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (location: DeviceLocation | null) => {
      if (settled) return;

      settled = true;
      clearTimeout(timer);

      resolve(location);
    };

    // Keep the login page from waiting forever for a browser permission prompt.
    const timer = setTimeout(() => {
      finish(null);
    }, 9500);

    try {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const {
            latitude,
            longitude,
            accuracy,
          } = coords;

          const valid =
            Number.isFinite(latitude) &&
            latitude >= -90 &&
            latitude <= 90 &&
            Number.isFinite(longitude) &&
            longitude >= -180 &&
            longitude <= 180 &&
            Number.isFinite(accuracy) &&
            accuracy >= 0;

          if (!valid) {
            finish(null);
            return;
          }

          const baseLocation: DeviceLocation = {
            latitude,
            longitude,
            accuracy,
          };

          try {
            const url =
              `https://api-bdc.net/data/reverse-geocode-client` +
              `?latitude=${encodeURIComponent(latitude)}` +
              `&longitude=${encodeURIComponent(longitude)}` +
              `&localityLanguage=en`;

            const response = await fetch(url, {
              method: "GET",
              cache: "no-store",
              headers: {
                Accept: "application/json",
              },
            });

            if (!response.ok) {
              finish(baseLocation);
              return;
            }

            const data = await response.json();

            const country =
              typeof data?.countryName === "string"
                ? data.countryName.trim()
                : null;

            const region =
              typeof data?.principalSubdivision === "string"
                ? data.principalSubdivision.trim()
                : null;

            const city =
              typeof data?.city === "string" && data.city.trim()
                ? data.city.trim()
                : typeof data?.locality === "string" && data.locality.trim()
                  ? data.locality.trim()
                  : null;

            const locality =
              typeof data?.locality === "string" && data.locality.trim()
                ? data.locality.trim()
                : null;

            const district =
              locality &&
              locality.toLowerCase() !==
                String(city || "").toLowerCase()
                ? locality
                : null;

            finish({
              ...baseLocation,

              country,
              region,
              city,
              district,
            });
          } catch {
            // Reverse geocoding failure must never block login.
            finish(baseLocation);
          }
        },

        () => {
          // Permission denied / unavailable / timeout.
          finish(null);
        },

        {
          enableHighAccuracy: true,
          timeout: 9000,
          maximumAge: 300000,
        }
      );
    } catch {
      finish(null);
    }
  });
}

export function locationPayload(
  location: DeviceLocation | null
) {
  return {
    latitude:
      location?.latitude ?? null,

    longitude:
      location?.longitude ?? null,

    locationAccuracy:
      location?.accuracy ?? null,

    country:
      location?.country ?? null,

    region:
      location?.region ?? null,

    city:
      location?.city ?? null,

    district:
      location?.district ?? null,
  };
}
