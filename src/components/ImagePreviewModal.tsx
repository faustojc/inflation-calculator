import { X } from "lucide-solid";
import { onCleanup, onMount, Show } from "solid-js";

type ImagePreviewModalProps = Readonly<{
	src: string;
	alt: string;
	title?: string;
	caption?: string;
	onClose: () => void;
}>;

const ImagePreviewModal = (props: ImagePreviewModalProps) => {
	let dialogRef!: HTMLDialogElement;

	onMount(() => {
		if (!dialogRef.open) dialogRef.showModal();
	});

	onCleanup(() => {
		if (dialogRef?.open) dialogRef.close();
	});

	return (
		<dialog
			ref={dialogRef}
			class="modal"
			aria-label={props.title || props.alt}
			onCancel={(event) => {
				event.preventDefault();
				props.onClose();
			}}
		>
			<div class="modal-box relative w-[min(88vw,24rem)] max-w-none p-0 overflow-hidden">
				<button
					type="button"
					class="btn btn-sm btn-circle btn-outline absolute right-3 top-3 z-10 bg-base-100/70 backdrop-blur"
					aria-label="Close image preview"
					onClick={() => props.onClose()}
				>
					<X class="w-4 h-4" />
				</button>

				<div class="flex h-56 w-full items-center justify-center bg-base-200 p-3">
					<img src={props.src} alt={props.alt} class="h-full w-full object-contain" decoding="async" />
				</div>

				<div class="flex h-24 flex-col justify-start px-4 py-3 border-t border-border">
					<h3 class="font-semibold text-base line-clamp-1">{props.title || props.alt}</h3>
					<Show when={props.caption}>
						<p class="text-sm text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{props.caption}</p>
					</Show>
				</div>
			</div>

			<button
				type="button"
				class="modal-backdrop cursor-default"
				aria-label="Close image preview"
				onClick={() => props.onClose()}
			>
				close
			</button>
		</dialog>
	);
};

export default ImagePreviewModal;
