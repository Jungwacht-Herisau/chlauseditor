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

  calcPercentage(time: number | Date, relative = false): string {
    return this.calcFraction(time, relative) * 100 + "%";
  }

  calcFraction(time: number | Date, relative = false): number {
    if (time instanceof Date) {
      time = time.getHours() + time.getMinutes() * 60;
    }
    return (time - (relative ? 0 : this.start)) / this.span();
  }
}
