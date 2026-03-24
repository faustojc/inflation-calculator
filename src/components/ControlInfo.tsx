import { InfoIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ControlInfo = ({ content }: Readonly<{ content: ReactNode }>) => {
	return (
		<Popover>
			<PopoverTrigger className="cursor-pointer" aria-label="More information">
				<InfoIcon className="h-4 w-4 text-primary" />
			</PopoverTrigger>
			<PopoverContent className="text-base">{content}</PopoverContent>
		</Popover>
	);
};

export default ControlInfo;
