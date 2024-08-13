import { format, hoursToMilliseconds, startOfMonth, startOfWeek } from "date-fns";
import type { ItemDefinition, Range, RowDefinition, Span } from "dnd-timeline";
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
				items: generateFlightItems(Math.floor(Math.random() * 5), id, range)
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
	const startOfDay = new Date(date.setHours(0, 0, 0, 0)).valueOf();
	const endOfDay = new Date(startOfDay).setHours(23, 59, 59, 999).valueOf();

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
export interface FlightItem extends ItemDefinition {

}
export interface Flight extends RowDefinition {
	items: ItemDefinition[];
}
export const timeAxisMarkers: { [key: string]: MarkerDefinition[] } = {
	week: [
		{
			value: 1000 * 60 * 60 * 24, // 1 day in milliseconds
		},
		{
			value: 1000 * 60 * 60 * 24 * 7, // 1 week in milliseconds
			minRangeSize: 1000 * 60 * 60 * 24 * 7, // Show for ranges >= 1 week
			maxRangeSize: 1000 * 60 * 60 * 24 * 60, // Show for ranges <= 2 months
			getLabel: (time) => format(startOfWeek(time), 'MMM dd'),
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

interface Group {
	id: string;
	flights: {
		id: string;
		groupId: string;
		items: {
			id: string;
			flightId: string;
			span: any
		}[]
	}[]
}