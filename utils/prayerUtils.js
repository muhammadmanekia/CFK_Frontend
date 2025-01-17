// src/utils/prayerUtils.js
import axios from 'axios';
import moment from 'moment-hijri'; // Import moment-hijri

// Convert time string to minutes since midnight
export const timeToMinutes = timeStr => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Get current time in minutes since midnight
export const getCurrentTimeInMinutes = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

// Get the current prayer period index
export const getCurrentPrayer = prayerTimes => {
  const currentMinutes = getCurrentTimeInMinutes();
  const prayerTimeMinutes = prayerTimes.map(prayer =>
    timeToMinutes(prayer.time),
  );

  // Handle time before Fajr
  if (currentMinutes < prayerTimeMinutes[0]) {
    return 0; // Previous day's Isha period
  }

  // Handle time after Isha
  if (currentMinutes >= prayerTimeMinutes[5]) {
    return 5; // Current day's Isha period
  }

  // Find current prayer period
  for (let i = 0; i < prayerTimeMinutes.length - 1; i++) {
    if (
      currentMinutes >= prayerTimeMinutes[i] &&
      currentMinutes < prayerTimeMinutes[i + 1]
    ) {
      // Handle special cases
      if (i === 1) {
        return 2; // Between Sunrise and Dhuhr, still considered Fajr period
      }
      return i + 1;
    }
  }

  return 0; // Default to Fajr if something goes wrong
};

// Convert 24h time to 12h format with AM/PM
export const formatTime = time => {
  const minutes = timeToMinutes(time);
  const period = minutes < 720 ? 'AM' : 'PM';

  let [hours, mins] = time.split(':').map(Number);
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  return {
    time: `${hours}:${mins.toString().padStart(2, '0')}`,
    period,
  };
};

// Helper function to normalize Arabic month names
const islamicMonths = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  'Shaban',
  'Ramadan',
  'Shawwal',
  'Dhu al-Qadah',
  'Dhu al-Hijjah',
];

export const getHijriDate = async (gregorianDate, adjustment) => {
  try {
    // If the input is a Date object, format it as a string and adjust the date
    const formattedDate =
      gregorianDate instanceof Date
        ? moment(gregorianDate).add(adjustment, 'days').format('DD-MM-YYYY') // Use moment to format the Date object and adjust the date
        : moment(gregorianDate, 'DD-MM-YYYY')
            .add(adjustment, 'days')
            .format('DD-MM-YYYY');

    // Use moment's hijri() method to convert the Gregorian date to Hijri
    const hijriDate = moment(formattedDate, 'DD-MM-YYYY');

    // Normalize the month name
    const monthIndex = hijriDate.iMonth();
    const day = hijriDate.iDate();
    const year = hijriDate.iYear();

    const normalizedMonth = islamicMonths[monthIndex]; // Assuming this function exists

    return {
      day,
      month: normalizedMonth,
      year,
      format: 'iYYYY-iMMMM-iDD', // Example Hijri format
      designation: 'Hijri', // Designation is not available in the moment library, so you can define it as needed
      fullDate: `${day} ${normalizedMonth}, ${year} AH`,
    };
  } catch (error) {
    console.error('Error fetching Hijri date:', error);
    return null;
  }
};

// Fetch prayer times from Aladhan API
export const fetchPrayerTimes = async (date, address) => {
  try {
    // Format date as DD-MM-YYYY if it's a Date object
    const formattedDate =
      date instanceof Date
        ? `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
        : date;

    // Make API call using axios
    const {data} = await axios.get(
      `https://api.aladhan.com/v1/timingsByAddress/${formattedDate}`,
      {
        params: {
          address: address,
          method: 0,
        },
      },
    );

    // Extract and format the prayer times
    const timings = data.data.timings;
    return [
      {name: 'Fajr', time: timings.Fajr},
      {name: 'Sunrise', time: timings.Sunrise},
      {name: 'Dhuhr', time: timings.Dhuhr},
      {name: 'Asr', time: timings.Asr},
      {name: 'Maghrib', time: timings.Maghrib},
      {name: 'Isha', time: timings.Isha},
    ];
  } catch (error) {
    console.error(
      'Error fetching prayer times:',
      error.response?.data || error.message,
    );
    // Return default prayer times in case of error
    return DEFAULT_PRAYER_TIMES;
  }
};

// Example usage:
// const prayerTimes = await fetchPrayerTimes('25-01-2024', 'London, UK');
