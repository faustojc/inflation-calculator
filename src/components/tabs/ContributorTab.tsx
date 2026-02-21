import { ContributorTable } from "@/components/ContributorTable";
import type { ContributionFactor } from "@/utils/inflationCompute";

const ContributorTab = ({ contributors }: { contributors: ContributionFactor[] }) => {
    return (
        <div className="glass-card p-4 space-y-4">
            <div>
                <h3 className="font-bold uppercase tracking-wide text-sm sm:text-base text-foreground">
                    Major Contributors to Inflation
                </h3>
                <p className="text-sm text-foreground mb-3">
                    Top 3 items that had the biggest impact on your personal inflation rate and how they
                    compare to other areas.
                </p>
            </div>
            <ContributorTable contributors={contributors} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1 border-t border-border pt-3">
                <div className="space-y-1">
                    <p className="text-base font-bold text-primary uppercase tracking-wider">
                        %SHR (Percentage Share)
                    </p>
                    <p className="text-sm text-muted-foreground leading-snug">
                        The weight of the item in your total expenditure. It shows how much of your budget
                        goes to this category.
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-base font-bold text-primary uppercase tracking-wider">
                        %PT (Percentage Point)
                    </p>
                    <p className="text-sm text-muted-foreground leading-snug">
                        The contribution of the item to the total inflation. It shows how many points of the
                        inflation rate are from this category.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ContributorTab;