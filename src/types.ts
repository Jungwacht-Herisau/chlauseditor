export type DayKey = string;

export class HourRange {
  start: number;
  end: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  span() {
    return this.end - this.start;
  }

  calcPercentage(time: number) {
    return this.calcFraction(time) * 100 + "%";
  }

  calcFraction(time: number) {
    return (time - this.start) / this.span();
  }
}
