export type Body = {
  phoneNumber: number | string;
  maxAge?: number;
};

export default async function (
  route: string,
  body: Body,
  _accessToken: string,
) {
  const phoneNumberStr = body.phoneNumber.toString();
  const endsWith = (suffix: string) => phoneNumberStr.endsWith(suffix);

  if (route === "/sim-swap/v0/check") {
    if (endsWith("111")) {
      return { swapped: true };
    }
    return { swapped: false };
  }

  if (route === "/number-verification/v0/verify") {
    if (endsWith("222")) {
      return { devicePhoneNumberVerified: false };
    }
    return { devicePhoneNumberVerified: true };
  }

  if (route === "/device-status/v0/roaming") {
    if (endsWith("333")) {
      return { roaming: true };
    }
    return { roaming: false };
  }
}
