import { InfoIcon } from "lucide-solid";
import type { JSX } from "solid-js";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";

const ControlInfo = (props: Readonly<{ content: JSX.Element }>) => {
	return (
		<Popover>
			<PopoverTrigger class="cursor-pointer" aria-label="More information">
				<InfoIcon class="h-4 w-4 text-primary" />
			</PopoverTrigger>
			<PopoverContent class="w-max max-w-sm text-sm text-left leading-relaxed">
				<p>{props.content}</p>
			</PopoverContent>
		</Popover>
	);
};

export default ControlInfo;
