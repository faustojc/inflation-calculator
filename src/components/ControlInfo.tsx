import { InfoIcon } from "lucide-solid";
import type { JSX } from "solid-js";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/primitives/popover";

const ControlInfo = (props: Readonly<{ content: JSX.Element }>) => {
	return (
		<Popover>
			<PopoverTrigger class="cursor-pointer" aria-label="More information">
				<InfoIcon class="h-4 w-4 text-primary" />
			</PopoverTrigger>
			<PopoverContent class="text-base text-justify">{props.content}</PopoverContent>
		</Popover>
	);
};

export default ControlInfo;
