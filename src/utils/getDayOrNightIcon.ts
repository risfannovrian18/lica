export function getDayOrNightIcon (
    iconName: string,
    dateTimeString: string
): string {
    const hours = new Date(dateTimeString).getHours(); // get hours from the given date and time string

    const isDayTime = hours >= 6 && hours < 18; // Consider daytime from 6 AM to 6 AM

    return isDayTime ? iconName.replace(/.$/, "d") : iconName.replace(/.$/, "n");
}