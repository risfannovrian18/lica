
export function convertKelvinToCelcius(tempInKelvin: number): number {
    const tempInCelcius = tempInKelvin - 273.15;
    return Math.floor(tempInCelcius); // Removes decimal part and keeps integer part
}