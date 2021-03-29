import { getMonth, getYear, subMonths } from "date-fns";
import {
  formatDateAsShortFormat,
  getExpireStatus,
  isCardExpired
} from "../dates";
import I18n from "../../i18n";

describe("getExpireStatus", () => {
  it("should be VALID", () => {
    const future = new Date(Date.now() + 1000 * 60 * 61 * 24 * 7); // 7 days and a minute in the future
    expect(getExpireStatus(future)).toBe("VALID");
  });

  it("should be EXPIRING", () => {
    const nearFuture = new Date(Date.now() + 1000 * 60 * 60); // 1 hour in the future
    expect(getExpireStatus(nearFuture)).toBe("EXPIRING");
  });

  it("should be EXPIRED", () => {
    const remote = new Date(Date.now() - 1000 * 60); // 1 sec ago
    expect(getExpireStatus(remote)).toBe("EXPIRED");
  });

  it("should mark the card as expired since no valid date is given", () => {
    expect(isCardExpired(Number("AAA"), Number("BBB"))).toBe(true);
  });

  it("should mark the card as expired since we're passing a valid past date with 4-digit year", () => {
    expect(isCardExpired(2, 2004)).toBe(true);
  });

  it("should mark the card as expired since we're passing the last month", () => {
    const lastMonth = subMonths(new Date(), 1);

    // We're passing the preceeding month/year, remember getMonth() is zero-based
    expect(isCardExpired(getMonth(lastMonth) + 1, getYear(lastMonth))).toBe(
      true
    );
  });

  it("should mark the card as valid, thus false", () => {
    const today = new Date();

    // We're passing the current month/year, remember getMonth() is zero-based
    expect(isCardExpired(getMonth(today) + 1, getYear(today))).toBe(false);
  });
});

describe("formatDateAsShortFormat", () => {
  const toTest: ReadonlyArray<[Date, string]> = [
    [new Date(1970, 0, 1), "01/01/1970"],
    [new Date(2020, 10, 30), "30/11/2020"],
    [new Date(1900, 5, 5), "05/06/1900"],
    [new Date(1900, 13, 55), "27/03/1901"], // handle the overflow,
    [new Date("not a date"), I18n.t("global.date.invalid")] // handle invalid date
  ];

  toTest.forEach(tt => {
    expect(formatDateAsShortFormat(tt[0])).toEqual(tt[1]);
  });
});
