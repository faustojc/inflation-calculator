import { ChevronDown } from "lucide-solid";
import { createSignal, For, type JSX } from "solid-js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/primitives/collapsible";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/primitives/dialog";
import { cn } from "@/lib/utils";
import { $openFaq } from "@/stores/faqStore";

type FaqItem = {
	question: string;
	answer: JSX.Element;
};

const faqs: FaqItem[] = [
	{
		question: "What is the Personal Inflation Calculator Application and what does it do?",
		answer: (
			<p>
				The Personal Inflation Calculator is an application that would allow an individual to{" "}
				<strong>calculate inflation rate based on their personal expenditure patterns</strong>. This
				application intends to answer the common observation of the public that the inflation rate released by
				the Philippine Statistics Authority does not reflect the inflation felt by the consumers.
			</p>
		),
	},
	{
		question:
			"What is the difference between the official inflation rate released by the PSA and the inflation rate computed by the application?",
		answer: (
			<>
				<p>
					The inflation rate released by the PSA is based on the{" "}
					<strong>average consumption pattern and commodity preferences of all Filipino households</strong> in
					a given reference period, which is <strong>2018 in the current CPI data</strong>. Since the data
					refers to the average of all households, this may not reflect the specific individual’s expenditure
					and pattern. The average Filipino households is composed of a father, a mother, and three kids,
					meaning the majority of families followed this composition.
				</p>
				<p>
					The expenditure pattern used by the CPI mostly reflects this household composition. However, the CPI
					also takes into account other family structures such as one-member households, a couple without
					children, a household composed of multiple non-married members, and others.
				</p>
				<p>
					A specific individual or family’s expenditure pattern may not resemble the average expenditure
					pattern, hence, the{" "}
					<strong>difference between the official inflation rate and the perceived inflation rate</strong>.
				</p>
			</>
		),
	},
	{
		question: "How does the PSA compute the CPI and inflation rate?",
		answer: (
			<>
				<p>
					The CPI and inflation rate is a measure of the{" "}
					<strong>year-on-year change in the average prices of commonly purchased goods and services</strong>{" "}
					by the Filipino households. These goods and services are selected using the result of the Commodity
					and Outlet Survey (COS) of the Survey of Key Informants (SKI). These surveys aim to know the
					specific goods and services that are commonly consumed by the Filipino households in a reference
					year. These sets goods and services are compiled by province and forms the provincial CPI market
					basket.
				</p>
				<p>
					Prices of these goods and services are collected on a regular basis by the PSA regular staff and
					hired price collectors. These prices are then used to compute for the monthly inflation rates.
				</p>
			</>
		),
	},
	{
		question: "How would the personal inflation rate be computed?",
		answer: (
			<p>
				The personal inflation rate application will require the user to supply their regular expenditure
				pattern by providing the <strong>average monthly or annual expenses for each commodity group</strong>{" "}
				used in computing the CPI. The application will also ask the user the{" "}
				<strong>location where they usually buy or consume the goods and services</strong>. The application
				will then use the collected prices of products and services in the location selected by the user
				together with the provided expenditure pattern to compute the personal inflation rate of the user.
			</p>
		),
	},
	{
		question: "What type of output will the application produce?",
		answer: (
			<>
				<p>
					The application will produce the computed{" "}
					<strong>personal CPI, purchasing power of the peso, and inflation</strong>. It will also display the
					following:
				</p>
				<ul class="ml-1 space-y-2">
					<li class="flex gap-2">
						<span class="text-primary mt-0.5">•</span>
						<span>
							<strong>Line graph of CPI or inflation rate</strong>: comparison of personal and official CPI or
							inflation rate for the last 13 months
						</span>
					</li>
					<li class="flex gap-2">
						<span class="text-primary mt-0.5">•</span>
						<span>
							<strong>Contribution to inflation</strong>: percent contribution of each commodity group to the
							computed inflation
						</span>
					</li>
					<li class="flex gap-2">
						<span class="text-primary mt-0.5">•</span>
						<span>
							<strong>Analysis</strong>: short analysis of the results
						</span>
					</li>
				</ul>
			</>
		),
	},
	{
		question:
			"Can the computed personal inflation rate be used as replacement for the official inflation rate released by the PSA?",
		answer: (
			<p>
				<strong>No</strong>, the computed personal inflation rate by the application is{" "}
				<strong>
					intended only to provide the user information on the inflation rate that the user may feel
				</strong>{" "}
				in relation to their specific expenditure. The additional information on the contributors to inflation
				should also inform the user of the commodity groups that drives their inflation to assist them in
				managing their expenses.
			</p>
		),
	},
	{
		question: "Does the personal inflation calculator application collect personal information?",
		answer: (
			<p>
				<strong>No</strong>, the application <strong>does not collect and save personal information</strong>{" "}
				such as name, age, monthly income, address, or job. It will only collect information on the location
				where the user accessed the application. This is to monitor the awareness of the general public on the
				availability of the application. This data will provide the PSA information on the concentration of
				individuals who access the application.
			</p>
		),
	},
];

const Faq = () => {
	const [openIndexes, setOpenIndexes] = createSignal<Set<number>>(new Set([0]));

	const toggleIndex = (index: number, next: boolean) => {
		setOpenIndexes((prev) => {
			const updated = new Set(prev);
			if (next) {
				updated.add(index);
			} else {
				updated.delete(index);
			}
			return updated;
		});
	};

	return (
		<Dialog open={$openFaq.get()} onOpenChange={$openFaq.set}>
			<DialogContent class="max-h-[85vh] gap-0 overflow-auto p-0 sm:max-w-2xl">
				<DialogHeader class="border-b px-6 pt-6 pb-4">
					<div class="flex items-center gap-2">
						<DialogTitle class="text-lg font-bold tracking-tight md:text-2xl">
							Frequently Asked Questions
						</DialogTitle>
					</div>
					<DialogDescription class="text-justify">
						Talking points for the Personal Inflation Calculator Application. Tap a question to expand it.
					</DialogDescription>
				</DialogHeader>

				<div class="overflow-y-auto px-3 py-3 sm:px-4">
					<ul class="flex flex-col gap-2">
						<For each={faqs}>
							{(faq, index) => {
								const isOpen = () => openIndexes().has(index());

								return (
									<li>
										<Collapsible
											open={isOpen()}
											onOpenChange={(next) => toggleIndex(index(), next)}
											class="bg-card rounded-lg border"
										>
											<CollapsibleTrigger class="hover:bg-primary/5 focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none">
												<span class="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
													{index() + 1}
												</span>
												<span class="flex-1 text-sm font-semibold md:text-base">{faq.question}</span>
												<ChevronDown
													class={cn(
														"text-muted-foreground size-5 shrink-0 transition-transform duration-200",
														isOpen() && "rotate-180",
													)}
													aria-hidden="true"
												/>
											</CollapsibleTrigger>
											<CollapsibleContent class="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
												<div class="text-muted-foreground space-y-3 px-4 pt-1 pb-4 text-sm leading-relaxed md:text-[0.95rem] [&_strong]:text-foreground text-justify">
													{faq.answer}
												</div>
											</CollapsibleContent>
										</Collapsible>
									</li>
								);
							}}
						</For>
					</ul>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default Faq;
