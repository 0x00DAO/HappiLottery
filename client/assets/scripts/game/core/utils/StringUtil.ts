export class StringUtil {
  static isEmpty(str: string | null | undefined) {
    return !str || str === "";
  }

  static shortAddress(address: string, length: number = 4) {
    if (this.isEmpty(address) || address.length < length + 1) {
      return address;
    }
    return `${address.substring(0, length)}...${address.substring(
      address.length - length,
      address.length
    )}`;
  }

  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const hoursString = hours.toString();
    const minutesString = minutes < 10 ? `0${minutes}` : minutes.toString();
    const secondsString =
      remainingSeconds < 10
        ? `0${remainingSeconds}`
        : remainingSeconds.toString();

    if (hours >= 100) {
      return `${hoursString}:${minutesString}:${secondsString}`;
    }

    return `${hoursString.padStart(2, "0")}:${minutesString}:${secondsString}`;
  }
}
