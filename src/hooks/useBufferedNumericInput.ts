import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";

type NormalizeValue = (value: number) => number | null;

interface BufferedInputOptions {
	value: number;
	normalize: NormalizeValue;
	commit: (value: number) => void;
	debounceMs?: number;
}

function formatDraftValue(value: number) {
	return value > 0 ? String(value) : "";
}

export function useBufferedNumericInput({
	value,
	normalize,
	commit,
	debounceMs = 150,
}: BufferedInputOptions) {
	const [draftValue, setDraftValue] = useState<string | null>(null);
	const commitRef = useRef(commit);
	const latestValueRef = useRef(value);
	const pendingValueRef = useRef<number | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isFocusedRef = useRef(false);

	useEffect(() => {
		commitRef.current = commit;
	}, [commit]);

	const clearTimer = () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	};

	const commitValue = (nextValue: number) => {
		if (nextValue === latestValueRef.current) return;

		latestValueRef.current = nextValue;
		commitRef.current(nextValue);
	};

	const scheduleCommit = (nextValue: number) => {
		pendingValueRef.current = nextValue;
		clearTimer();
		timerRef.current = setTimeout(() => {
			const pendingValue = pendingValueRef.current;
			pendingValueRef.current = null;
			if (pendingValue !== null) commitValue(pendingValue);
		}, debounceMs);
	};

	const flushPending = () => {
		clearTimer();

		const pendingValue = pendingValueRef.current;
		pendingValueRef.current = null;
		if (pendingValue !== null) {
			commitValue(pendingValue);
			return pendingValue;
		}

		return latestValueRef.current;
	};

	useEffect(() => {
		latestValueRef.current = value;
	}, [value]);

	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
			const pendingValue = pendingValueRef.current;
			pendingValueRef.current = null;
			if (pendingValue !== null && pendingValue !== latestValueRef.current) {
				commitRef.current(pendingValue);
			}
		};
	}, []);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const rawValue = e.target.value;
		if (rawValue === "") {
			setDraftValue("");
			scheduleCommit(0);
			return;
		}

		const parsedValue = Number.parseFloat(rawValue);
		if (!Number.isFinite(parsedValue)) {
			setDraftValue(rawValue);
			return;
		}

		const normalizedValue = normalize(parsedValue);
		if (normalizedValue === null) return;

		setDraftValue(normalizedValue === parsedValue ? rawValue : formatDraftValue(normalizedValue));
		scheduleCommit(normalizedValue);
	};

	const handleBlur = () => {
		isFocusedRef.current = false;
		flushPending();
		setDraftValue(null);
	};

	const handleFocus = () => {
		isFocusedRef.current = true;
	};

	const handleEnterKey = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== "Enter") return;

		flushPending();
		setDraftValue(null);
		e.currentTarget.blur();
	};

	return {
		draftValue: draftValue ?? formatDraftValue(value),
		handleBlur,
		handleChange,
		handleEnterKey,
		handleFocus,
	};
}
