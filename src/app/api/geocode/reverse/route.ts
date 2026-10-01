import { NextRequest, NextResponse } from 'next/server';

interface ReverseGeocodeResult {
  detailedAddress: string;
  ward: string;
  district: string;
  city: string;
  fullAddress: string;
}

function normalizeCity(rawCity: string): string {
  if (!rawCity) return '';
  const city = rawCity.trim();
  if (city.includes('Hồ Chí Minh') || city.includes('TP.HCM') || city.includes('TP HCM') || city.includes('Ho Chi Minh')) {
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  // Provider 1: Nominatim OpenStreetMap (with custom User-Agent to comply with usage policy)
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1&accept-language=vi`;
    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'EcommerceApp/1.0 (contact@ecommerce.local)',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = normalizeCity(
        addr.city || addr.province || addr.state || addr.region || ''
      );
      const district =
        addr.suburb ||
        addr.district ||
        addr.county ||
        addr.city_district ||
        '';
      const ward =
        addr.quarter ||
        addr.neighbourhood ||
        addr.village ||
        addr.town ||
        '';

      const street = addr.road || addr.street || '';
      const houseNumber = addr.house_number || '';
      const detailedAddress = [houseNumber, street].filter(Boolean).join(' ') || data.display_name?.split(',')[0] || '';

      const result: ReverseGeocodeResult = {
        detailedAddress,
        ward,
        district,
        city,
        fullAddress: data.display_name || '',
      };

      return NextResponse.json({ success: true, data: result });
    }
  } catch (error) {
    console.warn('Nominatim reverse geocode server fetch failed:', error);
  }

  // Provider 2: BigDataCloud reverse geocode client API
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&localityLanguage=vi`;
    const res = await fetch(bdcUrl, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const city = normalizeCity(data.principalSubdivision || data.city || '');
      const district = data.locality || '';
      const ward = '';
      const detailedAddress = [data.localityInfo?.informative?.[0]?.name, district].filter(Boolean).join(', ') || '';

      const result: ReverseGeocodeResult = {
        detailedAddress,
        ward,
        district,
        city,
        fullAddress: `${district ? district + ', ' : ''}${city}`,
      };

      return NextResponse.json({ success: true, data: result });
    }
  } catch (error) {
    console.warn('BigDataCloud reverse geocode fetch failed:', error);
  }

  return NextResponse.json(
    { error: 'Unable to reverse geocode location' },
    { status: 502 }
  );
}
