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
}
