import { format, hoursToMilliseconds, minutesToMilliseconds } from "date-fns";
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

export const generateRows = (count: number, options?: GenerateRowsOptions) => {
	return Array(count)
		.fill(0)
		.map((): RowDefinition => {
			const disabled = options?.disabled;

			let id = `row-${nanoid(4)}`;
			if (disabled) id += " (disabled)";

			return {
				id,
				disabled,
			};
		});
};

const getRandomInRange = (min: number, max: number) => {
	return Math.random() * (max - min) + min;
};

const DEFAULT_MIN_LENGTH = minutesToMilliseconds(60);
const DEFAULT_MAX_LENGTH = minutesToMilliseconds(360);

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

interface GenerateItemsOptions {
	disabled?: boolean;
	background?: boolean;
	minLength?: number;
	maxLength?: number;
}

export const generateItems = (
	count: number,
	range: Range,
	rows: RowDefinition[],
	options?: GenerateItemsOptions,
) => {
	return Array(count)
		.fill(0)
		.map((): ItemDefinition => {
			const row = rows[Math.ceil(Math.random() * rows.length - 1)];
			const rowId = row.id;
			const disabled = row.disabled || options?.disabled;

			const span = generateRandomSpan(
				range,
				options?.minLength,
				options?.maxLength,
			);

			let id = `item-${nanoid(4)}`;
			if (disabled) id += " (disabled)";

			return {
				id,
				rowId,
				span,
				disabled,
			};
		});
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
		value: hoursToMilliseconds(24),
		getLabel: (date: Date) => format(date, "E"),
	},
	{
		value: hoursToMilliseconds(2),
		minRangeSize: hoursToMilliseconds(24),
		getLabel: (date: Date) => format(date, "k"),
	},
	{
		value: hoursToMilliseconds(1),
		minRangeSize: hoursToMilliseconds(24),
	},
	{
		value: hoursToMilliseconds(1),
		maxRangeSize: hoursToMilliseconds(24),
		getLabel: (date: Date) => format(date, "k"),
	},
	{
		value: minutesToMilliseconds(30),
		maxRangeSize: hoursToMilliseconds(24),
		minRangeSize: hoursToMilliseconds(12),
	},
	{
		value: minutesToMilliseconds(15),
		maxRangeSize: hoursToMilliseconds(12),
		getLabel: (date: Date) => format(date, "m"),
	},
	{
		value: minutesToMilliseconds(5),
		maxRangeSize: hoursToMilliseconds(6),
		minRangeSize: hoursToMilliseconds(3),
	},
	{
		value: minutesToMilliseconds(5),
		maxRangeSize: hoursToMilliseconds(3),
		getLabel: (date: Date) => format(date, "m"),
	},
	{
		value: minutesToMilliseconds(1),
		maxRangeSize: hoursToMilliseconds(2),
	},
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