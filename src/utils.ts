import { Bin } from './types';

export function getPredictedTimeToFull(bin: Bin): string {
  if (bin.fillLevel >= 100) return 'Full';

  // Custom fill rates per hour based on bin type to make it incredibly realistic
  let ratePerHour = 3.5; // default % per hour
  if (bin.type === 'general') ratePerHour = 4.2;
  else if (bin.type === 'recyclable') ratePerHour = 3.1;
  else if (bin.type === 'organic') ratePerHour = 2.4;
  else if (bin.type === 'glass') ratePerHour = 1.2;

  // Add a slight deterministic variance based on ID so they don't look completely uniform
  const idNum = parseInt(bin.id.replace(/\D/g, '')) || 0;
  const variance = ((idNum % 5) - 2) * 0.25; // -0.5% to +0.5%
  ratePerHour = Math.max(0.6, ratePerHour + variance);

  const hoursRemaining = (100 - bin.fillLevel) / ratePerHour;

  if (hoursRemaining <= 0) {
    return 'Full Now';
  } else if (hoursRemaining < 1) {
    const mins = Math.max(5, Math.round(hoursRemaining * 60));
    return `${mins}m to full`;
  } else if (hoursRemaining < 24) {
    return `${Math.round(hoursRemaining)}h to full`;
  } else {
    const days = Math.floor(hoursRemaining / 24);
    const hrs = Math.round(hoursRemaining % 24);
    if (hrs === 0) return `${days}d to full`;
    return `${days}d ${hrs}h to full`;
  }
}
