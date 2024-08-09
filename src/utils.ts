import { format, hoursToMilliseconds, minutesToMilliseconds, startOfMonth, startOfWeek } from "date-fns";
import type { ItemDefinition, Range, RowDefinition, Span } from "dnd-timeline";
import { nanoid } from "nanoid";
import { MarkerDefinition } from "./TimeAxis";

interface GenerateRowsOptions {
	disabled?: boolean;
}

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
				items: generateFlightItems(3, id, range)
			};
		});
};
export const generateFlightItems = (count: number, flightId: string, range: Range) => {
	return Array(count)
		.fill(0)
		.map(() => {
			let id = `item-${nanoid(5)}`;
			const span = generateRandomSpan(
				range
			);
			return {
				id,
				flightId,
				span
			};
		});
};

const getRandomInRange = (min: number, max: number) => {
	return Math.random() * (max - min) + min;
};

const DEFAULT_MIN_LENGTH = hoursToMilliseconds(24);
const DEFAULT_MAX_LENGTH = hoursToMilliseconds(24 * 28);

export const generateRandomSpan = (
	range: Range,
	minLength: number = DEFAULT_MIN_LENGTH,
	maxLength: number = DEFAULT_MAX_LENGTH,
): Span => {
	const duration = getRandomInRange(minLength, maxLength);

	const start = getRandomInRange(range.start, range.end - duration);

	const end = start + duration;

	return {
		start: start,
		end: end,
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
export const timeAxisMarkers: MarkerDefinition[] = [
	{
		value: 1000 * 60 * 60 * 24 * 7, // 1 week in milliseconds
		getLabel: (time) => format(startOfWeek(time), 'MMM dd'),
	},
	{
		value: 1000 * 60 * 60 * 24 * 30, // Approximate 1 month in milliseconds
		getLabel: (time) => format(startOfMonth(time), 'MMMM'),
	},
	{
		value: 1000 * 60 * 60 * 24 * 90, // Approximate 1 quarter in milliseconds
		getLabel: (time) => `Q${Math.ceil((time.getMonth() + 1) / 3)} ${time.getFullYear()}`,
	}
];
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