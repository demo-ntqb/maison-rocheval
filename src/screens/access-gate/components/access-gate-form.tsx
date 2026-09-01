import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

interface AccessGateFormProps {
  action: string;
  error: string;
  hasError: boolean;
  placeholder: string;
  submit: string;
}

export function AccessGateForm({ action, error, hasError, placeholder, submit }: AccessGateFormProps) {
  return (
    <form action={action} className="flex w-full flex-col items-center gap-3" method="get">
      <div className="flex w-[300px] max-w-full flex-col gap-3 lg:flex-row lg:justify-center" data-plumb-id="frame-2085667289">
        <label className="sr-only" htmlFor="access-code">{placeholder}</label>
        <Input
          aria-describedby={hasError ? "access-code-error" : undefined}
          aria-invalid={hasError}
          autoComplete="one-time-code"
          className="h-10 border-0 bg-white/40 px-3 text-center text-sm placeholder:text-[#343434] focus-visible:ring-1 focus-visible:ring-navy-darker lg:h-8 lg:w-[219px] lg:px-4 lg:text-left"
          data-plumb-id="enter-your-code"
          id="access-code"
          name="pin"
          placeholder={placeholder}
          required
          type="password"
        />
        <Button className="h-10 w-full px-6 text-base lg:h-8 lg:w-auto lg:px-4 lg:text-sm" data-plumb-id="button" type="submit">
          {submit}
        </Button>
      </div>
      {hasError && <p className="text-center text-sm leading-5 text-[#343434]" data-plumb-id="code-was-incorrect" id="access-code-error">{error}</p>}
    </form>
  );
}
