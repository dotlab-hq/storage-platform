import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ProviderFormFieldProps = {
    label: string
    value: string
    onChange: (value: string) => void
    type?: "text" | "password"
}

export function ProviderFormField( {
    label,
    value,
    onChange,
    type = "text",
}: ProviderFormFieldProps ) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <Input type={type} value={value} onChange={( event ) => onChange( event.target.value )} />
        </div>
    )
}
