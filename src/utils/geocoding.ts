export interface ParsedAddress {
  detailedAddress: string;
  city: string;
  district: string;
  ward: string;
  fullAddress?: string;
}

function normalizeCityName(rawCity: string): string {
  if (!rawCity) return '';
  const city = rawCity.trim();
  if (
    city.includes('Hồ Chí Minh') ||
    city.includes('TP.HCM') ||
    city.includes('TP HCM') ||
    city.includes('Ho Chi Minh')
  ) {
    return 'Thành phố Hồ Chí Minh';
  }
  if (city.includes('Hà Nội') || city.includes('Ha Noi')) {
    return 'Thành phố Hà Nội';
  }
  if (city.includes('Đà Nẵng') || city.includes('Da Nang')) {
    return 'Thành phố Đà Nẵng';
  }
  if (city.includes('Hải Phòng') || city.includes('Hai Phong')) {
    return 'Thành phố Hải Phòng';
  }
  if (city.includes('Cần Thơ') || city.includes('Can Tho')) {
    return 'Thành phố Cần Thơ';
  }
  return city;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ParsedAddress | null> {
  // 1. Try internal Next.js API route first (avoids browser DNS/CORS issues)
  try {
    const res = await fetch(`/api/geocode/reverse?lat=${latitude}&lon=${longitude}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as ParsedAddress;
      }
    }
  } catch (err) {
    console.warn('Internal geocode API error, attempting direct fallback...', err);
  }

  // 2. Direct fallback to BigDataCloud client reverse geocoding API
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=vi`;
    const res = await fetch(bdcUrl);
    if (res.ok) {
      const data = await res.json();
      const city = normalizeCityName(data.principalSubdivision || data.city || '');
      const district = data.locality || '';
      const detailedAddress = [data.localityInfo?.informative?.[0]?.name, district]
        .filter(Boolean)
        .join(', ');

      return {
        detailedAddress,
        city,
        district,
        ward: '',
        fullAddress: [detailedAddress, district, city].filter(Boolean).join(', '),
      };
    }
  } catch (err) {
    console.warn('BigDataCloud geocode fallback failed:', err);
  }

  // 3. Direct fallback to Photon Komoot reverse geocoding API
  try {
    const photonUrl = `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`;
    const res = await fetch(photonUrl);
    if (res.ok) {
      const data = await res.json();
      const feature = data.features?.[0]?.properties;
      if (feature) {
        const city = normalizeCityName(feature.city || feature.state || '');
        const district = feature.district || feature.county || '';
        const street = [feature.housenumber, feature.street || feature.name].filter(Boolean).join(' ');

        return {
          detailedAddress: street || feature.name || '',
          city,
          district,
          ward: '',
          fullAddress: [street, district, city].filter(Boolean).join(', '),
        };
      }
    }
  } catch (err) {
    console.warn('Photon geocode fallback failed:', err);
  }

  return null;
}
