import { createMemo, createRoot, createSignal } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

export type SignalAtom<T> = {
	get: () => T;
	peek: () => T;
	set: (value: T | ((previous: T) => T)) => void;
};

export type MemoAtom<T> = {
	get: () => T;
	peek: () => T;
};

type FieldAtom<T> = {
	get: () => T;
	peek: () => T;
	set: (value: T | ((previous: T) => T)) => void;
};

export type StoreAtom<T extends object> = {
	get: () => T;
	peek: () => T;
	set: (value: T | ((previous: T) => T)) => void;
	assign: (value: Partial<T>) => void;
	_setStore: (...args: unknown[]) => void;
} & {
	[K in keyof T]: FieldAtom<T[K]>;
};

export function createSignalAtom<T>(initialValue: T): SignalAtom<T> {
	return createRoot(() => {
		const [value, setValue] = createSignal(initialValue, { equals: false });
		return {
			get: value,
			peek: value,
			set: (next) => setValue(next as never),
		};
	});
}

export function createMemoAtom<T>(fn: () => T): MemoAtom<T> {
	return createRoot(() => {
		const value = createMemo(fn);
		return { get: value, peek: value };
	});
}

function isPlainObjectOrArray(value: unknown): value is object {
	if (Array.isArray(value)) return true;
	if (value === null || typeof value !== "object") return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}

export function createStoreAtom<T extends object>(initialValue: T): StoreAtom<T> {
	return createRoot(() => {
		const [state, setState] = createStore<T>(initialValue);

		const base = {
			get: () => state,
			peek: () => state,
			set: (next: T | ((previous: T) => T)) => {
				const value = typeof next === "function" ? (next as (previous: T) => T)(state) : next;
				setState(reconcile(value) as never);
			},
			assign: (value: Partial<T>) => {
				setState(value as never);
			},
			_setStore: (...args: unknown[]) => {
				(setState as (...args: unknown[]) => void)(...args);
			},
		};

		return new Proxy(base, {
			get(target, property, receiver) {
				if (property in target) return Reflect.get(target, property, receiver);
				return {
					get: () => state[property as keyof T],
					peek: () => state[property as keyof T],
					set: (next: T[keyof T] | ((previous: T[keyof T]) => T[keyof T])) => {
						const previous = state[property as keyof T];
						const value =
							typeof next === "function" ? (next as (previous: T[keyof T]) => T[keyof T])(previous) : next;

						if (isPlainObjectOrArray(value)) {
							setState(
								property as never,
								reconcile(Array.isArray(value) ? [...value] : { ...(value as object) }, {
									merge: false,
								}) as never,
							);
						} else {
							setState(property as never, value as never);
						}
					},
				};
			},
		}) as StoreAtom<T>;
	});
}
