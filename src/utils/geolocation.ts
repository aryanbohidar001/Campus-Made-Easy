/**
 * GPS & Geolocation Geofencing Utilities for Campus Attendance System
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const DEFAULT_CAMPUS_SETTINGS = {
  collegeName: 'Campus Main Academic Block (ITER)',
  collegeLatitude: 20.249842,
  collegeLongitude: 85.801214,
  allowedRadius: 150, // Default 150 meters
  defaultQrDuration: 5, // Default 5 minutes
  departments: [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
  ],
  subjects: [
    { code: 'CS501', name: 'Operating Systems', department: 'Computer Science & Engineering', semester: '5th' },
    { code: 'CS502', name: 'Database Management Systems (DBMS)', department: 'Computer Science & Engineering', semester: '5th' },
    { code: 'CS503', name: 'Computer Networks', department: 'Computer Science & Engineering', semester: '5th' },
    { code: 'CS504', name: 'Design & Analysis of Algorithms', department: 'Computer Science & Engineering', semester: '5th' },
    { code: 'EC401', name: 'Digital Signal Processing', department: 'Electronics & Communication Engineering', semester: '5th' },
    { code: 'IT302', name: 'Web Technologies & Cloud', department: 'Information Technology', semester: '5th' },
  ],
  sections: ['Section A', 'Section B', 'Section C'],
  classPeriods: [
    'Period 1 (09:00 AM - 10:00 AM)',
    'Period 2 (10:00 AM - 11:00 AM)',
    'Period 3 (11:15 AM - 12:15 PM)',
    'Period 4 (12:15 PM - 01:15 PM)',
    'Period 5 (02:00 PM - 03:00 PM)',
    'Period 6 (03:00 PM - 04:00 PM)',
  ],
};

/**
 * Calculates great-circle distance between two latitude/longitude points in meters
 * using the Haversine formula.
 */
export function calculateDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Formats distance into human-friendly text
 * Examples: "82 meters", "1.8 km", "240 meters"
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} meters`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km`;
}

/**
 * Retrieves the device's real GPS position using the browser Geolocation API
 */
export function getDevicePosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser or device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMsg = 'Failed to retrieve location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location permission was denied. Please allow location access in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'GPS location information is currently unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out. Please try again.';
            break;
        }
        reject(new Error(errorMsg));
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Generates simulated coordinates offset from a base center point
 */
export function getSimulatedCoordinates(
  centerLat: number,
  centerLon: number,
  distanceMeters: number
): Coordinates {
  // Approximate conversion: 1 degree latitude ~= 111,320 meters
  const deltaLat = (distanceMeters / 111320);
  return {
    latitude: centerLat + deltaLat,
    longitude: centerLon,
    accuracy: 8,
  };
}
