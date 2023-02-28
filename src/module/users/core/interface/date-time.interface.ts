export interface DateTimeInterface {
  gregorianDateWithTimezone(date: string, inputFormat?: string): Date;

  gregorianWithTimezoneString(date: Date, format?: string): string;

  gregorianCurrentDateWithTimezone(): Date;

  gregorianCurrentDateWithTimezoneString(format?: string): string;
}
