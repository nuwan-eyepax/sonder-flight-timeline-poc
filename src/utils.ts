import { format, hoursToMilliseconds, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import type { Range, Span } from "dnd-timeline";
import { nanoid } from "nanoid";
import { MarkerDefinition } from "./TimeAxis";

export const generateGroups = (count: number, range: Range): Group[] => {
	const groups = Array(count).fill(0).map(() => {
		let id = `group-${nanoid(5)}`;
		return {
			id,
			flights: generateFlights(5, id, range)
		};
	})
	return groups;
}
export const generateFlights = (count: number, groupId: string, range: Range) => {
	return Array(count)
		.fill(0)
		.map(() => {
			let id = `flight-${nanoid(5)}`;
			return {
				id,
				groupId,
				items: []
			};
		});
};
export const generateFlightItems = (
	count: number,
	flightId: string,
	range: Range
) => {
	const usedSpans: Span[] = [];

	return Array(count)
		.fill(0)
		.map(() => {
			let id = `item-${nanoid(5)}`;
			let span: Span;

			// Generate a span that doesn't overlap with existing ones
			do {
				span = generateRandomSpan(range);
			} while (isOverlapping(span, usedSpans));

			usedSpans.push(span);

			return {
				id,
				flightId,
				span,
			};
		});
};
export const isOverlapping = (newSpan: Span, usedSpans: Span[]): boolean => {
	return usedSpans.some(
		(span) =>
			(newSpan.start >= span.start && newSpan.start < span.end) ||
			(newSpan.end > span.start && newSpan.end <= span.end) ||
			(newSpan.start < span.start && newSpan.end > span.end)
	);
};
const getRandomInRange = (min: number, max: number) => {
	return Math.random() * (max - min) + min;
};

const DEFAULT_MIN_LENGTH = hoursToMilliseconds(24);
const DEFAULT_MAX_LENGTH = hoursToMilliseconds(24 * 60);

export function roundToNearestDay(epochTime: number): number {
	const date = new Date(epochTime);
	const startOfDay = new Date(date.setHours(0, 0, 0, 0)).getTime();
	const endOfDay = new Date(new Date(startOfDay).setHours(23, 59, 59, 999)).getTime();

	// Get milliseconds since start of the day
	const millisecondsSinceStart = epochTime - startOfDay;
	const halfDayMilliseconds = (endOfDay - startOfDay) / 2;

	// Round to nearest half day
	const roundedTime = millisecondsSinceStart >= halfDayMilliseconds ? endOfDay : startOfDay;

	return roundedTime;
}



export const generateRandomSpan = (
	range: Range,
	minLength: number = DEFAULT_MIN_LENGTH,
	maxLength: number = DEFAULT_MAX_LENGTH,
): Span => {
	const duration = getRandomInRange(minLength, maxLength);

	const start = getRandomInRange(range.start, range.end - duration);

	const end = start + duration;

	return {
		start: roundToNearestDay(start),
		end: roundToNearestDay(end),
	};
};


export enum ItemType {
	ListItem = 0,
	SidebarItem = 1,
	FlightRow = 2
}
// Constants for milliseconds in days, weeks, and months
const DAY_IN_MS = 1000 * 60 * 60 * 24; // 1 day in milliseconds
const WEEK_IN_MS = 1000 * 60 * 60 * 24 * 7; // 1 week in milliseconds
const MONTH_IN_MS = 1000 * 60 * 60 * 24 * 30; // Approximate 1 month in milliseconds

export const timeAxisMarkers: { [key: string]: MarkerDefinition[] } = {
	week: [
		{
			value: DAY_IN_MS, // 1 day in milliseconds
			minRangeSize: DAY_IN_MS, // Show for ranges >= 1 day
			maxRangeSize: DAY_IN_MS * 30, // Show for ranges <= 30 days
			getLabel: (time) => format(startOfDay(time), 'dd MMM'), // Day of the month and month
		},
		{
			value: WEEK_IN_MS, // 1 week in milliseconds
			minRangeSize: WEEK_IN_MS, // Show for ranges >= 1 week
			maxRangeSize: WEEK_IN_MS * 8, // Show for ranges <= 8 weeks (about 2 months)
			getLabel: (time) => format(startOfWeek(time), 'MMM dd'), // Month and day of the week
		},
		{
			value: MONTH_IN_MS, // 1 month in milliseconds (approximate)
			minRangeSize: MONTH_IN_MS, // Show for ranges >= 1 month
			maxRangeSize: MONTH_IN_MS * 6, // Show for ranges <= 6 months
			getLabel: (time) => format(startOfMonth(time), 'MMM yyyy'), // Month and year
		}
	],
	month: [{
		value: 1000 * 60 * 60 * 24 * 7, // 1 week in milliseconds
		minRangeSize: 1000 * 60 * 60 * 24 * 7, // Show for ranges >= 1 week
		maxRangeSize: 1000 * 60 * 60 * 24 * 60, // Show for ranges <= 2 months
		getLabel: (time) => format(startOfWeek(time), 'MMM dd'),
	}, {

		value: 1000 * 60 * 60 * 24 * 30, // Approximate 1 month in milliseconds
		minRangeSize: 1000 * 60 * 60 * 24 * 30, // Show for ranges >= 1 month
		maxRangeSize: 1000 * 60 * 60 * 24 * 365, // Show for ranges <= 1 year
		getLabel: (time) => format(startOfMonth(time), 'MMMM'),
	},
	],
	quarter: [{

		value: 1000 * 60 * 60 * 24 * 30, // Approximate 1 month in milliseconds
		minRangeSize: 1000 * 60 * 60 * 24 * 30, // Show for ranges >= 1 month
		maxRangeSize: 1000 * 60 * 60 * 24 * 365, // Show for ranges <= 1 year
		getLabel: (time) => format(startOfMonth(time), 'MMMM'),
	}, {
		value: 1000 * 60 * 60 * 24 * 90, // Approximate 1 quarter in milliseconds
		minRangeSize: 1000 * 60 * 60 * 24 * 60, // Show for ranges >= 2 months
		maxRangeSize: 1000 * 60 * 60 * 24 * 365 * 5, // Show for ranges <= 5 years
		getLabel: (time) => `Q${Math.ceil((time.getMonth() + 1) / 3)} ${time.getFullYear()}`,
	}]
}

export interface Group {
	id: string;
	flights: {
		id: string;
		groupId: string;
		items: {
			id: string;
			flightId: string;
			span: Span,
			isCreating: boolean
		}[]
	}[]
}

export function removeRandomItems<T>(array: T[], numberOfItemsToRemove: number) {
	// Clone the array to avoid modifying the original one
	const arrayCopy = [...array];
  
	// Loop to remove the specified number of items
	for (let i = 0; i < numberOfItemsToRemove; i++) {
	  // Generate a random index
	  const randomIndex = Math.floor(Math.random() * arrayCopy.length);
  
	  // Remove the item at the random index
	  arrayCopy.splice(randomIndex, 1);
	}
  
	return arrayCopy;
  }
  