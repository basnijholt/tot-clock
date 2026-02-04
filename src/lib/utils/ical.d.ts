declare module 'ical.js' {
  export function parse(input: string): any;

  export class Component {
    constructor(jCal: any, parent?: Component);
    getAllSubcomponents(name?: string): Component[];
    getFirstPropertyValue(name: string): any;
  }

  export class Event {
    constructor(component: Component);
    summary: string;
    startDate: Time | null;
    endDate: Time | null;
    duration: Duration | null;
  }

  export class Time {
    toJSDate(): Date;
  }

  export class Duration {
    toSeconds(): number;
  }
}
