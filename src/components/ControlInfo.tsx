import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InfoIcon } from "lucide-react";

const ControlInfo = ({ content }: Readonly<{ content: string }>) => {
	return (
		<Popover>
			<PopoverTrigger>
				<InfoIcon className="h-4 w-4 text-primary" />
			</PopoverTrigger>
			<PopoverContent className="text-base">{content}</PopoverContent>
		</Popover>
	);
};

export default ControlInfo;
