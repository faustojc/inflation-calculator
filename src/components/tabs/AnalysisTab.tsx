import { Info } from "lucide-react";

const AnalysisTab = ({ interpretation }: { interpretation: string[] }) => {
    return (
        <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="font-bold uppercase tracking-wide text-base text-foreground">Analysis</h3>
            </div>
            <ul className="list-disc list-inside space-y-2">
                {interpretation.map((p, i) => (
                    <li key={i} className="text-base leading-relaxed text-foreground">
                        {p}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default AnalysisTab;
