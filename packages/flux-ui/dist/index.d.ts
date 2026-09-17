import { ClassValue } from 'clsx';
import * as React$1 from 'react';
import { ButtonHTMLAttributes, HTMLAttributes, ReactNode, ComponentProps, AnchorHTMLAttributes, CSSProperties, ComponentPropsWithoutRef } from 'react';
import * as class_variance_authority_types from 'class-variance-authority/types';
import * as LabelPrimitive from '@radix-ui/react-label';
import { VariantProps } from 'class-variance-authority';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { LucideIcon } from 'lucide-react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { DayPickerProps, DayButtonProps } from 'react-day-picker';
export { DateRange } from 'react-day-picker';
import * as RechartsPrimitive from 'recharts';
import { TooltipValueType } from 'recharts';
import { ToasterProps } from 'sonner';
export { toast } from 'sonner';

declare function cn(...inputs: ClassValue[]): string;

/** Maps to Tailwind spacing steps used across PayGlocal dashboard surfaces */
type LayoutSpacing = "none" | "xs" | "sm" | "md" | "lg" | "xl";
type BoxProps = React$1.HTMLAttributes<HTMLDivElement> & {
    as?: React$1.ElementType;
    p?: LayoutSpacing;
    px?: LayoutSpacing;
    py?: LayoutSpacing;
};
/** Neutral block with token-aligned padding; extend with `className` for radius, borders, flex, etc. */
declare function Box({ as: Comp, className, p, px, py, ...props }: BoxProps): React$1.JSX.Element;
type StackProps = React$1.HTMLAttributes<HTMLDivElement> & {
    as?: React$1.ElementType;
    gap?: LayoutSpacing;
    align?: "start" | "center" | "stretch" | "end";
};
/** Vertical flex stack; default gap matches common section rhythm (`gap-4`). */
declare function Stack({ as: Comp, className, gap, align, ...props }: StackProps): React$1.JSX.Element;
type InlineProps = React$1.HTMLAttributes<HTMLDivElement> & {
    gap?: LayoutSpacing;
    wrap?: boolean;
    justify?: "start" | "center" | "end" | "between";
};
/** Horizontal flex row for toolbars and inline field groups */
declare function Inline({ className, gap, wrap, justify, ...props }: InlineProps): React$1.JSX.Element;

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "auto";
type ResponsiveCols = {
    base?: GridCols;
    sm?: GridCols;
    md?: GridCols;
    lg?: GridCols;
};
type GridFlow = "row" | "col" | "dense";
type GridProps = React$1.HTMLAttributes<HTMLDivElement> & {
    /** Number of columns (1–12 or "auto"), or a responsive object */
    cols?: GridCols | ResponsiveCols;
    /** Number of explicit rows */
    rows?: 1 | 2 | 3 | 4 | 5 | 6 | "auto";
    /** Gap between cells */
    gap?: LayoutSpacing;
    /** Grid auto-flow direction */
    flow?: GridFlow;
};
declare const Grid: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & {
    /** Number of columns (1–12 or "auto"), or a responsive object */
    cols?: GridCols | ResponsiveCols;
    /** Number of explicit rows */
    rows?: 1 | 2 | 3 | 4 | 5 | 6 | "auto";
    /** Gap between cells */
    gap?: LayoutSpacing;
    /** Grid auto-flow direction */
    flow?: GridFlow;
} & React$1.RefAttributes<HTMLDivElement>>;
type FlexDirection = "row" | "col" | "row-reverse" | "col-reverse";
type FlexWrap = boolean | "reverse";
type FlexAlign = "start" | "center" | "end" | "stretch" | "baseline";
type FlexJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
type FlexProps = React$1.HTMLAttributes<HTMLDivElement> & {
    /** Flex direction */
    direction?: FlexDirection;
    /** Whether children wrap */
    wrap?: FlexWrap;
    /** Align items (cross axis) */
    align?: FlexAlign;
    /** Justify content (main axis) */
    justify?: FlexJustify;
    /** Gap between children */
    gap?: LayoutSpacing;
    /** Render as inline-flex */
    inline?: boolean;
};
declare const Flex: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & {
    /** Flex direction */
    direction?: FlexDirection;
    /** Whether children wrap */
    wrap?: FlexWrap;
    /** Align items (cross axis) */
    align?: FlexAlign;
    /** Justify content (main axis) */
    justify?: FlexJustify;
    /** Gap between children */
    gap?: LayoutSpacing;
    /** Render as inline-flex */
    inline?: boolean;
} & React$1.RefAttributes<HTMLDivElement>>;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "link";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}
declare const Button: React$1.ForwardRefExoticComponent<ButtonProps & React$1.RefAttributes<HTMLButtonElement>>;

interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
    orientation?: "horizontal" | "vertical";
    variant?: ButtonProps["variant"];
}
declare const ButtonGroup: React$1.ForwardRefExoticComponent<ButtonGroupProps & React$1.RefAttributes<HTMLDivElement>>;
interface SplitButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
    label: ReactNode;
    onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
    children?: ReactNode;
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
    isLoading?: boolean;
}
declare const SplitButton: React$1.ForwardRefExoticComponent<SplitButtonProps & React$1.RefAttributes<HTMLDivElement>>;
interface SplitButtonItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
}
declare const SplitButtonItem: React$1.ForwardRefExoticComponent<SplitButtonItemProps & React$1.RefAttributes<HTMLButtonElement>>;

declare const Input: React$1.ForwardRefExoticComponent<Omit<React$1.DetailedHTMLProps<React$1.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "ref"> & React$1.RefAttributes<HTMLInputElement>>;

type PasswordInputProps = Omit<React$1.ComponentProps<typeof Input>, "type">;
declare const PasswordInput: React$1.ForwardRefExoticComponent<Omit<PasswordInputProps, "ref"> & React$1.RefAttributes<HTMLInputElement>>;

interface OtpInputProps {
    /** Current OTP value (controlled). */
    value: string;
    /** Fires with the full joined string on every change. */
    onChange: (value: string) => void;
    /** Number of digit boxes. */
    length?: number;
    /** Fired when all boxes are filled. */
    onComplete?: (value: string) => void;
    disabled?: boolean;
    invalid?: boolean;
    autoFocus?: boolean;
    "aria-label"?: string;
}
declare function OtpInput({ value, onChange, length, onComplete, disabled, invalid, autoFocus, "aria-label": ariaLabel, }: OtpInputProps): React$1.JSX.Element;

interface CheckboxSelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
interface CheckboxSelectProps {
    options: CheckboxSelectOption[];
    value: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    showSearch?: boolean;
    disabled?: boolean;
    maxDisplay?: number;
    className?: string;
}
declare const CheckboxSelect: React$1.ForwardRefExoticComponent<CheckboxSelectProps & React$1.RefAttributes<HTMLButtonElement>>;

declare const Textarea: React$1.ForwardRefExoticComponent<Omit<React$1.DetailedHTMLProps<React$1.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, "ref"> & React$1.RefAttributes<HTMLTextAreaElement>>;

declare const Label: React$1.ForwardRefExoticComponent<Omit<LabelPrimitive.LabelProps & React$1.RefAttributes<HTMLLabelElement>, "ref"> & VariantProps<(props?: class_variance_authority_types.ClassProp | undefined) => string> & React$1.RefAttributes<HTMLLabelElement>>;

type CheckboxSize = "sm" | "md" | "lg";
interface CheckboxProps extends React$1.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
    size?: CheckboxSize;
}
declare const Checkbox: React$1.ForwardRefExoticComponent<CheckboxProps & React$1.RefAttributes<HTMLButtonElement>>;

declare const RadioGroup: React$1.ForwardRefExoticComponent<Omit<RadioGroupPrimitive.RadioGroupProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
type RadioGroupItemProps = React$1.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>;
declare const RadioGroupItem: React$1.ForwardRefExoticComponent<Omit<RadioGroupPrimitive.RadioGroupItemProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;

declare const switchRootVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface SwitchProps extends React$1.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>, VariantProps<typeof switchRootVariants> {
}
declare const Switch: React$1.ForwardRefExoticComponent<SwitchProps & React$1.RefAttributes<HTMLButtonElement>>;

interface SliderProps extends React$1.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
}
declare const Slider: React$1.ForwardRefExoticComponent<SliderProps & React$1.RefAttributes<HTMLSpanElement>>;

type FormValues = Record<string, string>;
type FormErrors = Record<string, string>;
interface ValidatorRule {
    required?: boolean | string;
    minLength?: {
        value: number;
        message: string;
    };
    maxLength?: {
        value: number;
        message: string;
    };
    pattern?: {
        value: RegExp;
        message: string;
    };
    validate?: (value: string) => string | undefined;
}
interface FieldConfig {
    defaultValue?: string;
    rules?: ValidatorRule;
}
type FieldsConfig = Record<string, FieldConfig>;
interface RegisterResult {
    name: string;
    id: string;
    value: string;
    onChange: (e: React$1.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
}
interface UseFormReturn {
    values: FormValues;
    errors: FormErrors;
    register: (name: string) => RegisterResult;
    handleSubmit: (onValid: (values: FormValues) => void, onInvalid?: (errors: FormErrors) => void) => (e: React$1.FormEvent) => void;
    setError: (name: string, message: string) => void;
    clearError: (name: string) => void;
    reset: () => void;
    setValue: (name: string, value: string) => void;
}
declare function useForm(fields?: FieldsConfig): UseFormReturn;
interface FormProps extends React$1.FormHTMLAttributes<HTMLFormElement> {
}
declare const Form: React$1.ForwardRefExoticComponent<FormProps & React$1.RefAttributes<HTMLFormElement>>;
interface FormItemProps extends React$1.HTMLAttributes<HTMLDivElement> {
}
declare const FormItem: React$1.ForwardRefExoticComponent<FormItemProps & React$1.RefAttributes<HTMLDivElement>>;
interface FormLabelProps extends React$1.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}
declare const FormLabel: React$1.ForwardRefExoticComponent<FormLabelProps & React$1.RefAttributes<HTMLLabelElement>>;
interface FormControlProps extends React$1.HTMLAttributes<HTMLDivElement> {
}
declare const FormControl: React$1.ForwardRefExoticComponent<FormControlProps & React$1.RefAttributes<HTMLDivElement>>;
interface FormDescriptionProps extends React$1.HTMLAttributes<HTMLParagraphElement> {
}
declare const FormDescription: React$1.ForwardRefExoticComponent<FormDescriptionProps & React$1.RefAttributes<HTMLParagraphElement>>;
interface FormErrorProps extends React$1.HTMLAttributes<HTMLParagraphElement> {
}
declare const FormError: React$1.ForwardRefExoticComponent<FormErrorProps & React$1.RefAttributes<HTMLParagraphElement>>;
interface FormFieldProps extends React$1.HTMLAttributes<HTMLDivElement> {
}
declare const FormField: React$1.ForwardRefExoticComponent<FormFieldProps & React$1.RefAttributes<HTMLDivElement>>;

declare function FieldSet({ className, ...props }: React$1.ComponentProps<"fieldset">): React$1.JSX.Element;
declare function FieldLegend({ className, variant, ...props }: React$1.ComponentProps<"legend"> & {
    variant?: "legend" | "label";
}): React$1.JSX.Element;
declare function FieldGroup({ className, ...props }: React$1.ComponentProps<"div">): React$1.JSX.Element;
declare const fieldVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | "responsive" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Field({ className, orientation, invalid, disabled, ...props }: React$1.ComponentProps<"div"> & VariantProps<typeof fieldVariants> & {
    invalid?: boolean;
    disabled?: boolean;
}): React$1.JSX.Element;
declare function FieldContent({ className, ...props }: React$1.ComponentProps<"div">): React$1.JSX.Element;
declare function FieldLabel({ className, ...props }: React$1.ComponentProps<typeof Label>): React$1.JSX.Element;
declare function FieldTitle({ className, ...props }: React$1.ComponentProps<"div">): React$1.JSX.Element;
declare function FieldDescription({ className, ...props }: React$1.ComponentProps<"p">): React$1.JSX.Element;
declare function FieldSeparator({ children, className, ...props }: React$1.ComponentProps<"div"> & {
    children?: React$1.ReactNode;
}): React$1.JSX.Element;
declare function FieldError({ className, children, errors, ...props }: React$1.ComponentProps<"div"> & {
    errors?: Array<{
        message?: string;
    } | undefined>;
}): React$1.JSX.Element | null;

declare function InputGroup({ className, ...props }: React$1.ComponentProps<"div">): React$1.JSX.Element;
declare const inputGroupAddonVariants: (props?: ({
    align?: "inline-start" | "inline-end" | "block-start" | "block-end" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function InputGroupAddon({ className, align, ...props }: React$1.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>): React$1.JSX.Element;
declare const inputGroupButtonVariants: (props?: ({
    size?: "xs" | "sm" | "icon-xs" | "icon-sm" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function InputGroupButton({ className, type, size, ...props }: React$1.ComponentProps<"button"> & VariantProps<typeof inputGroupButtonVariants>): React$1.JSX.Element;
declare function InputGroupText({ className, ...props }: React$1.ComponentProps<"span">): React$1.JSX.Element;
declare function InputGroupInput({ className, ...props }: React$1.ComponentProps<"input">): React$1.JSX.Element;
declare function InputGroupTextarea({ className, ...props }: React$1.ComponentProps<"textarea">): React$1.JSX.Element;

interface CurrencyAmountInputProps {
    currency: string;
    amount: string;
    onCurrencyChange: (currency: string) => void;
    onAmountChange: (amount: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    currencies?: string[];
    id?: string;
}
declare function CurrencyAmountInput({ currency, amount, onCurrencyChange, onAmountChange, placeholder, disabled, required, currencies, id, }: CurrencyAmountInputProps): React$1.JSX.Element;

declare const cardVariants: (props?: ({
    size?: "sm" | "default" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare function Card({ className, size, ...props }: React$1.ComponentProps<"div"> & VariantProps<typeof cardVariants>): React$1.JSX.Element;
declare function CardHeader({ className, ...props }: React$1.ComponentProps<"div">): React$1.JSX.Element;
declare function CardTitle({ className, ...props }: React$1.ComponentProps<"div">): React$1.JSX.Element;
declare function CardDescription({ className, ...props }: React$1.ComponentProps<"div">): React$1.JSX.Element;
declare function CardAction({ className, ...props }: React$1.ComponentProps<"div">): React$1.JSX.Element;
declare function CardContent({ className, ...props }: React$1.ComponentProps<"div">): React$1.JSX.Element;
declare function CardFooter({ className, ...props }: React$1.ComponentProps<"div">): React$1.JSX.Element;

declare const Separator: React$1.ForwardRefExoticComponent<Omit<SeparatorPrimitive.SeparatorProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

declare const ScrollArea: React$1.ForwardRefExoticComponent<Omit<ScrollAreaPrimitive.ScrollAreaProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const ScrollBar: React$1.ForwardRefExoticComponent<Omit<ScrollAreaPrimitive.ScrollAreaScrollbarProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

interface SideNavProps extends React$1.ComponentPropsWithoutRef<"aside"> {
    /** "collapsed" renders icon-only at 60px; "expanded" renders full at 240px (default) */
    width?: "collapsed" | "expanded";
    /** Controlled collapsed state */
    isCollapsed?: boolean;
    /** Called when the sidebar requests a collapse/expand */
    onCollapse?: (collapsed: boolean) => void;
}
interface SideNavItemProps extends React$1.ComponentPropsWithoutRef<"a"> {
    /** Icon element — required, rendered at size-4 shrink-0 */
    icon: React$1.ReactNode;
    /** Visible label — hidden when sidebar is collapsed */
    label: string;
    /** Highlights the item as the current route */
    isActive?: boolean;
    /** Navigable href — renders an <a> when provided */
    href?: string;
    /** Click handler */
    onClick?: React$1.MouseEventHandler<HTMLElement>;
    /** Optional badge slot rendered after the label */
    badge?: React$1.ReactNode;
    /** Injected by SideNavSection — consumers should not pass this */
    _collapsed?: boolean;
}
declare const SideNav: React$1.ForwardRefExoticComponent<SideNavProps & React$1.RefAttributes<HTMLElement>>;
declare const SideNavHeader: React$1.ForwardRefExoticComponent<Omit<React$1.DetailedHTMLProps<React$1.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
interface SideNavSectionProps extends React$1.ComponentPropsWithoutRef<"div"> {
    /** Optional section label — hidden when sidebar is collapsed */
    label?: string;
}
declare const SideNavSection: React$1.ForwardRefExoticComponent<SideNavSectionProps & React$1.RefAttributes<HTMLDivElement>>;
declare const SideNavItem: React$1.ForwardRefExoticComponent<SideNavItemProps & React$1.RefAttributes<HTMLAnchorElement>>;
declare const SideNavFooter: React$1.ForwardRefExoticComponent<Omit<React$1.DetailedHTMLProps<React$1.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

declare const Breadcrumb: React$1.ForwardRefExoticComponent<Omit<React$1.DetailedHTMLProps<React$1.HTMLAttributes<HTMLElement>, HTMLElement>, "ref"> & {
    separator?: React$1.ReactNode;
} & React$1.RefAttributes<HTMLElement>>;
declare const BreadcrumbList: React$1.ForwardRefExoticComponent<Omit<React$1.DetailedHTMLProps<React$1.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>, "ref"> & React$1.RefAttributes<HTMLOListElement>>;
declare const BreadcrumbItem: React$1.ForwardRefExoticComponent<Omit<React$1.DetailedHTMLProps<React$1.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, "ref"> & React$1.RefAttributes<HTMLLIElement>>;
declare const BreadcrumbLink: React$1.ForwardRefExoticComponent<Omit<React$1.DetailedHTMLProps<React$1.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, "ref"> & React$1.RefAttributes<HTMLAnchorElement>>;
declare const BreadcrumbPage: React$1.ForwardRefExoticComponent<Omit<React$1.DetailedHTMLProps<React$1.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, "ref"> & React$1.RefAttributes<HTMLSpanElement>>;
declare const BreadcrumbSeparator: {
    ({ children, className, ...props }: React$1.ComponentProps<"li">): React$1.JSX.Element;
    displayName: string;
};
declare const BreadcrumbEllipsis: {
    ({ className, ...props }: React$1.ComponentProps<"span">): React$1.JSX.Element;
    displayName: string;
};

interface PaginationProps extends React.ComponentPropsWithoutRef<"nav"> {
}
declare const Pagination: React$1.ForwardRefExoticComponent<PaginationProps & React$1.RefAttributes<HTMLElement>>;
interface PaginationContentProps extends React.ComponentPropsWithoutRef<"ul"> {
}
declare const PaginationContent: React$1.ForwardRefExoticComponent<PaginationContentProps & React$1.RefAttributes<HTMLUListElement>>;
interface PaginationItemProps extends React.ComponentPropsWithoutRef<"li"> {
}
declare const PaginationItem: React$1.ForwardRefExoticComponent<PaginationItemProps & React$1.RefAttributes<HTMLLIElement>>;
interface PaginationLinkProps extends React.ComponentPropsWithoutRef<"a"> {
    isActive?: boolean;
}
declare const PaginationLink: React$1.ForwardRefExoticComponent<PaginationLinkProps & React$1.RefAttributes<HTMLAnchorElement>>;
interface PaginationPreviousProps extends React.ComponentPropsWithoutRef<"a"> {
    disabled?: boolean;
}
declare const PaginationPrevious: React$1.ForwardRefExoticComponent<PaginationPreviousProps & React$1.RefAttributes<HTMLAnchorElement>>;
interface PaginationNextProps extends React.ComponentPropsWithoutRef<"a"> {
    disabled?: boolean;
}
declare const PaginationNext: React$1.ForwardRefExoticComponent<PaginationNextProps & React$1.RefAttributes<HTMLAnchorElement>>;
interface PaginationEllipsisProps extends React.ComponentPropsWithoutRef<"span"> {
}
declare const PaginationEllipsis: React$1.ForwardRefExoticComponent<PaginationEllipsisProps & React$1.RefAttributes<HTMLSpanElement>>;

declare const linkVariants: (props?: ({
    variant?: "nav" | "default" | "subtle" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface LinkProps extends React$1.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkVariants> {
    asChild?: boolean;
}
declare const Link: React$1.ForwardRefExoticComponent<LinkProps & React$1.RefAttributes<HTMLAnchorElement>>;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "secondary" | "success" | "warning" | "error" | "outline";
    size?: "sm" | "md" | "lg";
    square?: boolean;
    dot?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}
declare const Badge: React$1.ForwardRefExoticComponent<BadgeProps & React$1.RefAttributes<HTMLSpanElement>>;

interface LozengeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "inprogress" | "success" | "moved" | "new" | "removed";
    isBold?: boolean;
    maxWidth?: number | string;
}
declare const Lozenge: React$1.ForwardRefExoticComponent<LozengeProps & React$1.RefAttributes<HTMLSpanElement>>;

type TagColorScheme = "neutral" | "blue" | "green" | "amber" | "red" | "purple";
interface TagProps extends React$1.HTMLAttributes<HTMLSpanElement> {
    colorScheme?: TagColorScheme;
    onRemove?: () => void;
    disabled?: boolean;
}
declare const Tag: React$1.ForwardRefExoticComponent<TagProps & React$1.RefAttributes<HTMLSpanElement>>;
interface TagGroupProps extends React$1.HTMLAttributes<HTMLDivElement> {
}
declare const TagGroup: React$1.ForwardRefExoticComponent<TagGroupProps & React$1.RefAttributes<HTMLDivElement>>;

type BadgeVariant = "success" | "info" | "warning" | "refund" | "danger" | "orange" | "muted";
type BadgeTrailIcon = "check" | "x" | "refresh" | "clock" | "alert" | "arrow-right" | "info";
interface StatusBadgeProps {
    variant: BadgeVariant;
    label: string;
    trailIcon?: BadgeTrailIcon;
    size?: "sm" | "md";
    className?: string;
}
declare const StatusBadge: React$1.ForwardRefExoticComponent<StatusBadgeProps & React$1.RefAttributes<HTMLSpanElement>>;

interface BlanketProps extends React$1.HTMLAttributes<HTMLDivElement> {
    /** Controls visibility of the blanket */
    open?: boolean;
    /** Adds semi-transparent black background (default: true) */
    isTinted?: boolean;
    /** Makes blanket completely transparent — only blocks pointer events */
    isTransparent?: boolean;
    /** Called when the blanket is clicked */
    onClick?: React$1.MouseEventHandler<HTMLDivElement>;
    /** When true, pointer events pass through the blanket */
    shouldAllowClickThrough?: boolean;
}
declare const Blanket: React$1.ForwardRefExoticComponent<BlanketProps & React$1.RefAttributes<HTMLDivElement>>;

interface SpotlightStep {
    title: string;
    body: string;
    image?: React$1.ReactNode;
}
interface SpotlightCardProps {
    title: string;
    body: string;
    image?: React$1.ReactNode;
    currentStep?: number;
    totalSteps?: number;
    onNext?: () => void;
    onBack?: () => void;
    onDismiss?: () => void;
    nextLabel?: string;
    className?: string;
}
declare const SpotlightCard: React$1.ForwardRefExoticComponent<SpotlightCardProps & React$1.RefAttributes<HTMLDivElement>>;
interface SpotlightProps {
    isOpen: boolean;
    onClose: () => void;
    children: React$1.ReactNode;
    className?: string;
}
declare const Spotlight: {
    ({ isOpen, onClose, children, className }: SpotlightProps): React$1.JSX.Element | null;
    displayName: string;
};
interface UseSpotlightReturn {
    isOpen: boolean;
    currentStep: number;
    open: () => void;
    close: () => void;
    goNext: () => void;
    goBack: () => void;
    goTo: (step: number) => void;
}
declare function useSpotlight(steps: SpotlightStep[], initialStep?: number): UseSpotlightReturn;

declare const Dialog: React$1.FC<DialogPrimitive.DialogProps>;
declare const DialogTrigger: React$1.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const DialogPortal: React$1.FC<DialogPrimitive.DialogPortalProps>;
declare const DialogClose: React$1.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & React$1.RefAttributes<HTMLButtonElement>>;
declare function DialogContent({ className, children, showClose, overlayClassName, ...props }: ComponentProps<typeof DialogPrimitive.Content> & {
    showClose?: boolean;
    overlayClassName?: string;
}): React$1.JSX.Element;
declare function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>): React$1.JSX.Element;
declare function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>): React$1.JSX.Element;

type DrawerSide = "right" | "left" | "top" | "bottom";
interface DrawerProps extends React$1.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
    side?: DrawerSide;
}
declare const Drawer: {
    ({ side, children, ...props }: DrawerProps): React$1.JSX.Element;
    displayName: string;
};
declare const DrawerTrigger: React$1.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const DrawerClose: React$1.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const DrawerContent: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DrawerHeader: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
declare const DrawerFooter: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
declare const DrawerTitle: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & React$1.RefAttributes<HTMLHeadingElement>, "ref"> & React$1.RefAttributes<HTMLHeadingElement>>;
declare const DrawerDescription: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogDescriptionProps & React$1.RefAttributes<HTMLParagraphElement>, "ref"> & React$1.RefAttributes<HTMLParagraphElement>>;

declare const Popover: React$1.FC<PopoverPrimitive.PopoverProps>;
declare const PopoverTrigger: React$1.ForwardRefExoticComponent<PopoverPrimitive.PopoverTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const PopoverAnchor: React$1.ForwardRefExoticComponent<PopoverPrimitive.PopoverAnchorProps & React$1.RefAttributes<HTMLDivElement>>;
declare const PopoverContent: React$1.ForwardRefExoticComponent<Omit<PopoverPrimitive.PopoverContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

declare const TooltipProvider: React$1.FC<TooltipPrimitive.TooltipProviderProps>;
declare const Tooltip: React$1.FC<TooltipPrimitive.TooltipProps>;
declare const TooltipTrigger: React$1.ForwardRefExoticComponent<TooltipPrimitive.TooltipTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const TooltipContent: React$1.ForwardRefExoticComponent<Omit<TooltipPrimitive.TooltipContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

declare const MenuDivider: React$1.ForwardRefExoticComponent<HTMLAttributes<HTMLHRElement> & React$1.RefAttributes<HTMLHRElement>>;
interface MenuSectionProps extends HTMLAttributes<HTMLDivElement> {
    label?: string;
    children: ReactNode;
}
declare const MenuSection: React$1.ForwardRefExoticComponent<MenuSectionProps & React$1.RefAttributes<HTMLDivElement>>;
type MenuItemBaseProps = {
    icon?: ReactNode;
    rightContent?: ReactNode;
    isSelected?: boolean;
    isDanger?: boolean;
};
type MenuItemButtonProps = MenuItemBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
};
type MenuItemAnchorProps = MenuItemBaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
};
type MenuItemProps = MenuItemButtonProps | MenuItemAnchorProps;
declare const MenuItem: React$1.ForwardRefExoticComponent<MenuItemProps & React$1.RefAttributes<HTMLAnchorElement | HTMLButtonElement>>;
interface MenuProps extends HTMLAttributes<HTMLElement> {
    children: ReactNode;
}
declare const Menu: React$1.ForwardRefExoticComponent<MenuProps & React$1.RefAttributes<HTMLElement>>;

declare const DropdownMenu: React$1.FC<DropdownMenuPrimitive.DropdownMenuProps>;
declare const DropdownMenuTrigger: React$1.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const DropdownMenuGroup: React$1.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuGroupProps & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuPortal: React$1.FC<DropdownMenuPrimitive.DropdownMenuPortalProps>;
declare const DropdownMenuSub: React$1.FC<DropdownMenuPrimitive.DropdownMenuSubProps>;
declare const DropdownMenuRadioGroup: React$1.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuRadioGroupProps & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuSubTrigger: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSubTriggerProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & {
    inset?: boolean;
} & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuSubContent: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSubContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuContent: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuItem: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & {
    inset?: boolean;
} & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuCheckboxItem: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuCheckboxItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuRadioItem: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuRadioItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuLabel: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuLabelProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & {
    inset?: boolean;
} & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuSeparator: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSeparatorProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare function DropdownMenuShortcut({ className, ...props }: React$1.HTMLAttributes<HTMLSpanElement>): React$1.JSX.Element;

declare const Select: React$1.FC<SelectPrimitive.SelectProps>;
declare const SelectGroup: React$1.ForwardRefExoticComponent<SelectPrimitive.SelectGroupProps & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectValue: React$1.ForwardRefExoticComponent<SelectPrimitive.SelectValueProps & React$1.RefAttributes<HTMLSpanElement>>;
/**
 * `md` (default) is the form-field trigger. `sm` is for dense furniture — a
 * rows-per-page picker in a table footer, a control inside a toolbar — where
 * the full-height field towers over everything beside it.
 *
 * This is a size prop rather than a job for `className` because the base sets
 * `min-h-11`, which beats an `h-8` utility: every caller wanting a short
 * trigger had to override min-height, padding, gap and text size together.
 */
type SelectTriggerSize = "sm" | "md";
declare const SelectTrigger: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectTriggerProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & {
    size?: SelectTriggerSize;
} & React$1.RefAttributes<HTMLButtonElement>>;
declare const SelectScrollUpButton: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollUpButtonProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectScrollDownButton: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollDownButtonProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectContent: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectLabel: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectLabelProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectItem: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectSeparator: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectSeparatorProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

interface CommandProps extends React$1.HTMLAttributes<HTMLDivElement> {
}
interface CommandInputProps extends React$1.InputHTMLAttributes<HTMLInputElement> {
}
interface CommandListProps extends React$1.HTMLAttributes<HTMLDivElement> {
}
interface CommandEmptyProps extends React$1.HTMLAttributes<HTMLDivElement> {
}
interface CommandGroupProps extends React$1.HTMLAttributes<HTMLDivElement> {
    heading?: string;
}
interface CommandItemProps extends React$1.HTMLAttributes<HTMLDivElement> {
    selected?: boolean;
    disabled?: boolean;
    onSelect?: () => void;
}
interface CommandSeparatorProps extends React$1.HTMLAttributes<HTMLDivElement> {
}
interface CommandShortcutProps extends React$1.HTMLAttributes<HTMLSpanElement> {
}
declare const Command: React$1.ForwardRefExoticComponent<CommandProps & React$1.RefAttributes<HTMLDivElement>>;
declare const CommandInput: React$1.ForwardRefExoticComponent<CommandInputProps & React$1.RefAttributes<HTMLInputElement>>;
declare const CommandList: React$1.ForwardRefExoticComponent<CommandListProps & React$1.RefAttributes<HTMLDivElement>>;
declare const CommandEmpty: React$1.ForwardRefExoticComponent<CommandEmptyProps & React$1.RefAttributes<HTMLDivElement>>;
declare const CommandGroup: React$1.ForwardRefExoticComponent<CommandGroupProps & React$1.RefAttributes<HTMLDivElement>>;
declare const CommandItem: React$1.ForwardRefExoticComponent<CommandItemProps & React$1.RefAttributes<HTMLDivElement>>;
declare const CommandSeparator: React$1.ForwardRefExoticComponent<CommandSeparatorProps & React$1.RefAttributes<HTMLDivElement>>;
declare const CommandShortcut: React$1.ForwardRefExoticComponent<CommandShortcutProps & React$1.RefAttributes<HTMLSpanElement>>;

declare const Tabs: React$1.ForwardRefExoticComponent<TabsPrimitive.TabsProps & React$1.RefAttributes<HTMLDivElement>>;
declare const TabsList: React$1.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsListProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const TabsTrigger: React$1.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsTriggerProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;
declare const TabsContent: React$1.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

/**
 * Two presets over the `Tabs` primitives, for the two jobs a tab row actually
 * does. They are separate components on purpose, so a page can show both
 * without the reader having to work out which row governs what:
 *
 * - {@link UnderlineTabs} is the **page-level** bar that segments a view into
 *   sections — full-width, one sliding indicator, the thing a URL usually
 *   follows.
 * - {@link SegmentedTabs} is the **compact scoping strip** for a required
 *   single choice that qualifies the content beside it: which status a list is
 *   filtered by, which period a summary describes.
 *
 * Neither is a filter chip. A chip is for an *optional* filter that can be
 * cleared; both of these always have exactly one option selected, so neither
 * ever renders a clear affordance.
 */
interface UnderlineTab {
    value: string;
    /**
     * A plain string for an ordinary tab; a node when the tab carries an
     * annotation beside its name, such as a status badge showing the state of
     * the section behind it.
     */
    label: ReactNode;
}
/**
 * Page-level tab bar with a single shared indicator that slides between tabs,
 * rather than each tab drawing its own underline.
 *
 * The indicator's position and width are measured from the DOM: text tabs have
 * different widths, so this cannot be derived from props or state. It sits
 * flush on the row's own bottom border instead of floating below the label.
 *
 * `actions` renders flush right on the same row, tabs staying left-aligned,
 * which is where a page puts its primary CTA.
 */
declare function UnderlineTabs({ tabs, value, onValueChange, actions, className, }: {
    tabs: readonly UnderlineTab[];
    value: string;
    onValueChange: (value: string) => void;
    actions?: ReactNode;
    className?: string;
}): React$1.JSX.Element;
interface SegmentedTabOption<T extends string = string> {
    value: T;
    label: string;
}
/**
 * The compact strip that scopes the content beside it.
 *
 * Plain underlined triggers, not the `Tabs` pill look: no container
 * background, border or padding — a gap row of triggers, each just an
 * underline and a colour change when active. Still Radix `Tabs` underneath, so
 * keyboard navigation and `aria-selected` come free; only the classes differ.
 *
 * With `collapseToSelect`, the strip becomes a `Select` below `md`. Both
 * controls drive the same state, so resizing mid-session can never leave the
 * two disagreeing about which option is chosen.
 */
declare function SegmentedTabs<T extends string>({ options, value, onValueChange, label, collapseToSelect, className, }: {
    options: readonly SegmentedTabOption<T>[];
    value: T;
    onValueChange: (value: T) => void;
    /** Accessible name for both controls. */
    label?: string;
    /**
     * Swap to a `Select` below `md`. Leave on for a strip that would otherwise
     * crowd a narrow screen; turn it off where the row already has the room and
     * a dropdown would read as a different control appearing.
     */
    collapseToSelect?: boolean;
    className?: string;
}): React$1.JSX.Element;

declare const Accordion: React$1.ForwardRefExoticComponent<(AccordionPrimitive.AccordionSingleProps | AccordionPrimitive.AccordionMultipleProps) & React$1.RefAttributes<HTMLDivElement>>;
declare const AccordionItem: React$1.ForwardRefExoticComponent<Omit<AccordionPrimitive.AccordionItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const AccordionTrigger: React$1.ForwardRefExoticComponent<Omit<AccordionPrimitive.AccordionTriggerProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;
declare const AccordionContent: React$1.ForwardRefExoticComponent<Omit<AccordionPrimitive.AccordionContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

type AlertVariant = "info" | "success" | "warning" | "error" | "neutral";
interface AlertProps extends React$1.HTMLAttributes<HTMLDivElement> {
    variant?: AlertVariant;
    dismissible?: boolean;
    onDismiss?: () => void;
}
declare const Alert: React$1.ForwardRefExoticComponent<AlertProps & React$1.RefAttributes<HTMLDivElement>>;
declare const AlertTitle: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLHeadingElement> & React$1.RefAttributes<HTMLHeadingElement>>;
declare const AlertDescription: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;
interface BannerProps extends React$1.HTMLAttributes<HTMLDivElement> {
    variant?: AlertVariant;
    dismissible?: boolean;
    onDismiss?: () => void;
}
declare const Banner: React$1.ForwardRefExoticComponent<BannerProps & React$1.RefAttributes<HTMLDivElement>>;

type CalloutVariant = "info" | "success" | "warning" | "error" | "neutral" | "discovery";
interface CalloutProps extends React$1.HTMLAttributes<HTMLDivElement> {
    variant?: CalloutVariant;
}
declare const Callout: React$1.ForwardRefExoticComponent<CalloutProps & React$1.RefAttributes<HTMLDivElement>>;
interface CalloutIconProps extends React$1.HTMLAttributes<HTMLDivElement> {
    variant?: CalloutVariant;
}
declare const CalloutIcon: React$1.ForwardRefExoticComponent<CalloutIconProps & React$1.RefAttributes<HTMLDivElement>>;
declare const CalloutTitle: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const CalloutText: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;

type SectionMessageVariant = "info" | "success" | "warning" | "error" | "discovery";
interface SectionMessageProps extends React$1.HTMLAttributes<HTMLDivElement> {
    variant?: SectionMessageVariant;
}
declare const SectionMessage: React$1.ForwardRefExoticComponent<SectionMessageProps & React$1.RefAttributes<HTMLDivElement>>;
declare const SectionMessageTitle: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLHeadingElement> & React$1.RefAttributes<HTMLHeadingElement>>;
declare const SectionMessageContent: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
declare const SectionMessageActions: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;

declare const sizeMap: {
    readonly xs: 12;
    readonly sm: 16;
    readonly md: 20;
    readonly lg: 28;
    readonly xl: 36;
};
declare const colorMap: {
    readonly primary: "text-primary";
    readonly muted: "text-muted-foreground";
    readonly white: "text-white";
    readonly inherit: "";
};
interface SpinnerProps extends React$1.HTMLAttributes<HTMLSpanElement> {
    size?: keyof typeof sizeMap;
    color?: keyof typeof colorMap;
}
declare const Spinner: React$1.ForwardRefExoticComponent<SpinnerProps & React$1.RefAttributes<HTMLSpanElement>>;

type ProgressVariant = "default" | "success" | "warning" | "error";
type ProgressSize = "xs" | "sm" | "md" | "lg";
interface ProgressProps extends React$1.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    variant?: ProgressVariant;
    size?: ProgressSize;
    label?: boolean;
}
declare const Progress: React$1.ForwardRefExoticComponent<ProgressProps & React$1.RefAttributes<HTMLDivElement>>;
type ProgressStepStatus = "complete" | "current" | "upcoming";
interface ProgressTrackerStep {
    label: string;
    description?: string;
    status: ProgressStepStatus;
}
interface ProgressTrackerProps extends React$1.HTMLAttributes<HTMLDivElement> {
    steps: ProgressTrackerStep[];
}
declare const ProgressTracker: React$1.ForwardRefExoticComponent<ProgressTrackerProps & React$1.RefAttributes<HTMLDivElement>>;

interface ShimmerProps {
    className?: string;
    rounded?: "sm" | "md" | "lg" | "full";
}
declare function Shimmer({ className, rounded }: ShimmerProps): React$1.JSX.Element;
declare function StatCardSkeleton(): React$1.JSX.Element;
declare function TableRowSkeleton({ cols, comfortable, density: densityProp, snug, }: {
    cols?: number;
    /** @deprecated prefer `density` */
    comfortable?: boolean;
    density?: "default" | "comfortable" | "compact";
    snug?: boolean;
}): React$1.JSX.Element;
declare function ChartSkeleton({ height }: {
    height?: string;
}): React$1.JSX.Element;

type DataTableDensity = "default" | "comfortable" | "compact";
type DataTableHeaderStyle = "surface" | "minimal";
/**
 * Footer summary text.
 * - `range` — "Showing 1–15 of 141 results" (or "Showing 1–15" when no total
 *   is knowable, i.e. cursor pagination).
 * - `count` — "141 items".
 * - `none` — no summary, just the pager.
 */
type DataTableFooterSummary = "range" | "count" | "none";
type SortOrder = "ascend" | "descend";
/** `null` means unsorted — the table is in the order the data arrived in. */
type DataTableSortState = {
    columnKey: string;
    order: SortOrder;
} | null;
/** Controls shared by every paginated mode. */
type PagerCommon = {
    /**
     * Summary text at the left of the footer. Defaults to `range`.
     */
    summary?: DataTableFooterSummary;
    /** Noun after the number when `summary="count"`. Default `item` / `items`. */
    countLabels?: {
        singular: string;
        plural: string;
    };
    /**
     * Page-size choices. Pass these — with `onPageSizeChange` — and the footer
     * grows a "Rows per page" picker at its far left. Omit and there is none.
     *
     * This lives here rather than being hand-passed as a footer slot because a
     * grid that had to hand-roll its own page-size control is how two different
     * pagers end up in the same app.
     */
    pageSizeOptions?: readonly number[];
    onPageSizeChange?: (size: number) => void;
    /** Escape hatch: an extra control at the far left, before the summary. */
    leading?: ReactNode;
};
/**
 * How the table pages. Which member you use is decided by the endpoint, not by
 * taste:
 *
 * - `client` — every row is already in `data`; the table slices it. The
 *   default when `pagination` is omitted.
 * - `page` — the response carries a row **total**, so the footer can show
 *   "Showing 1–15 of 141 results" and a full numbered strip with ellipses.
 * - `cursor` — the response carries no total (a `nextCursor` /
 *   `exclusiveStartKey` API). The footer shows "Showing 1–15" with **no**
 *   total and no page count, and the numbered strip is only ever the page
 *   before, the current page, and — when `hasNext` says so — the page after.
 *   Those are the only pages a cursor can actually reach in one step, so they
 *   are the only ones offered.
 * - `none` — no footer at all.
 */
type DataTablePagination = ({
    mode: "client";
    /** Rows per page. Default 10. */
    pageSize?: number;
} & PagerCommon) | ({
    mode: "page";
    /** 1-indexed. */
    page: number;
    pageSize: number;
    /** Total rows across all pages, from the response. */
    total: number;
    onPageChange: (page: number) => void;
} & PagerCommon) | ({
    mode: "cursor";
    /** 1-indexed, for the "Showing x–y" range and the page marker. */
    page: number;
    pageSize: number;
    /** Whether a page exists after this one. Drives the next control. */
    hasNext: boolean;
    /** Defaults to `page > 1`. */
    hasPrev?: boolean;
    onNext: () => void;
    onPrev: () => void;
} & PagerCommon) | {
    mode: "none";
};
/**
 * Sorting, modelled on antd's `Table`: a column opts in with `sorter`, and the
 * table reports state as `{ columnKey, order }` with antd's `"ascend"` /
 * `"descend"` vocabulary.
 *
 * The one deliberate difference is that client and server sorting are told
 * apart by the **column**, not by a table-level flag: `sorter: true` means "the
 * caller orders this", a comparator means "the table orders this". A grid can
 * therefore mix the two, which matters when one column is a derived value the
 * server does not know about.
 */
type DataTableSorting = {
    /**
     * Controlled sort state. Omit for uncontrolled — the table remembers, which
     * is all a client-sorted grid needs.
     */
    value?: DataTableSortState;
    /** Fires on every header activation, with the state being moved to. */
    onChange?: (next: DataTableSortState) => void;
};
/**
 * Row expansion: a disclosure column plus a full-width panel rendered directly
 * beneath the expanded row. Use it when the detail belongs *with* the row in
 * the flow of the table (a request's headers, a payload, a breakdown) rather
 * than in a drawer that covers it.
 *
 * Leave `expandedKeys` unset for uncontrolled behaviour (the table remembers
 * which rows are open). Pass `expandedKeys` + `onExpandedChange` to drive it
 * from outside — needed when opening a row triggers a fetch.
 */
type DataTableExpandable<T> = {
    /** The panel shown under an expanded row. */
    render: (row: T, index: number) => ReactNode;
    /**
     * Which rows can open at all. Rows that cannot get no toggle and no chevron,
     * keeping the column's width without implying an affordance that isn't there.
     * Defaults to every row.
     */
    isExpandable?: (row: T, index: number) => boolean;
    /** Controlled open rows, as `rowKey` values. Omit for uncontrolled. */
    expandedKeys?: string[];
    /** Fires on every open/close in controlled mode. */
    onExpandedChange?: (keys: string[]) => void;
    /**
     * Fires only when a row opens, in both modes — the hook for lazily fetching
     * that row's detail. Not called on close.
     */
    onExpand?: (row: T, index: number) => void;
    /** Accessible name for the toggle. Default "Toggle row details". */
    toggleLabel?: string;
};
type Column<T> = {
    key: string;
    header: ReactNode;
    /**
     * Table column width: `48px`, `18%`, or `minmax(12rem, 1fr)` for a floor
     * that can still grow into whatever the other columns leave over.
     *
     * `minmax(min, max)` is translated rather than passed straight through: this
     * is a real `<table>`/`<colgroup>`, and `minmax()` is a CSS Grid function
     * that is not a legal `width` value outside a grid — the browser drops the
     * whole declaration and the column gets no floor at all. `min` becomes the
     * `<col>`'s `min-width`, and `max` becomes its `width` unless `max` is `1fr`
     * (or any other flex unit), in which case no `width` is set and the column
     * takes its share of whatever `table-layout: fixed` has left over, the same
     * way a grid track's `1fr` would.
     *
     * `overflow-x-auto` on the table's own scroll container is what makes the
     * floor mean something: once every column's minimum no longer fits, the
     * table grows past its container and scrolls instead of every column
     * shrinking under its `min-width` and the header text — deliberately not
     * truncated, see the `<th>` render below — overlapping the column beside it.
     */
    width?: string;
    minWidth?: number;
    maxWidth?: number;
    align?: "left" | "right" | "center";
    /** Allow cell text to wrap instead of truncating. */
    wrap?: boolean;
    /** Extra classes on `<th>` / `<td>` (e.g. wider horizontal padding per column) */
    cellClassName?: string;
    /**
     * Inline styles on `<th>` / `<td>`.
     *
     * For a value Tailwind cannot generate a class for because it is computed —
     * a sticky column's `left`, which is the running total of the widths before
     * it. Expressing that as a class means keeping a hand-written lookup table of
     * every offset the layout can produce, and silently getting the wrong one the
     * moment a column width changes. See `frozenColumn`.
     */
    cellStyle?: CSSProperties;
    /**
     * Makes this header a sort control.
     *
     * - `true` — the **caller** orders the rows (a server-side `sortBy` query).
     *   The table reports the change through `sorting.onChange` and leaves `data`
     *   exactly as given.
     * - a comparator — the **table** orders the rows with it, before paging.
     *   Same contract as `Array.prototype.sort`'s argument, and the same as
     *   antd's `sorter`.
     */
    sorter?: boolean | ((a: T, b: T) => number);
    /**
     * The orders this header cycles through before returning to unsorted.
     * Default `["ascend", "descend"]`. Pass `["descend", "ascend"]` for a column
     * where "most recent" or "largest" is the obvious first click.
     */
    sortDirections?: SortOrder[];
    render: (row: T, index: number) => ReactNode;
};
interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    skeletonRows?: number;
    emptyTitle?: string;
    emptyDescription?: string;
    /**
     * Pagination and the footer that carries it. Omit for client-side paging at
     * 10 rows a page. See {@link DataTablePagination}.
     */
    pagination?: DataTablePagination;
    /** Column sorting. See {@link DataTableSorting}. */
    sorting?: DataTableSorting;
    className?: string;
    rowKey: (row: T) => string;
    /** Optional hover CTA shown on the right of every row */
    rowCta?: {
        label: string;
        onClick?: (row: T) => void;
    };
    /**
     * Custom action revealed on row hover — typically a `<Button>` or
     * `<ButtonGroup>`, but any `ReactNode` is accepted. Pass a **function** to
     * render per-row: it receives `(row, index)`, so the action always has the
     * record for its row (e.g. to navigate or open a drawer for that row).
     *
     * It is not a real column: it floats as an overlay **pinned to the right edge
     * of the viewport**, so it stays in view as the table scrolls horizontally
     * (no scrolling to the end to reach it) while the last data column stays
     * flush with nothing trailing it. Takes precedence over `rowCta`.
     */
    rowAction?: ReactNode | ((row: T, index: number) => ReactNode);
    /**
     * Makes the whole row a click target — the row itself opens a drawer, a
     * detail page, whatever the table drills into — instead of that living in a
     * per-cell wrapper or a hover-revealed button.
     *
     * The handler sits on the `<tr>`, so the entire row including cell padding
     * and the empty space between columns is clickable, and the row gets
     * `cursor-pointer` plus keyboard access (focusable, Enter / Space).
     *
     * Clicks that originate inside something interactive — a `<button>`, `<a>`,
     * a form control, a Radix trigger, or anything marked
     * `data-row-click-ignore` — do NOT fire this. Copy buttons, per-row menus
     * and the `rowAction` overlay therefore keep doing only their own job
     * without each having to stop propagation.
     */
    onRowClick?: (row: T, index: number) => void;
    /** Row / cell vertical rhythm and horizontal gutters */
    density?: DataTableDensity;
    /**
     * Column-sizing strategy:
     * - `fixed` — widths come only from `colgroup` hints (`width`/`minWidth`/
     *   `maxWidth`); content is ignored and overflow is clipped. Table fills 100%.
     * - `auto` — columns size to content but the table still fills 100%, so any
     *   leftover space is distributed into the columns (they stretch).
     * - `content` — columns size to their content's intrinsic width and the table
     *   shrinks to fit. Leftover space stays empty to the right of the last
     *   column; it scrolls horizontally only once content exceeds the container.
     */
    tableLayout?: "auto" | "fixed" | "content";
    theadClassName?: string;
    headerStyle?: DataTableHeaderStyle;
    /** With `density="compact"`, use tighter cell gutters (`pl-1.5 pr-2.5` vs `px-3`). Footer keeps normal horizontal padding. */
    snug?: boolean;
    /** Per-row disclosure panel rendered beneath the row. See `DataTableExpandable`. */
    expandable?: DataTableExpandable<T>;
}
declare function DataTable<T>({ columns, data, isLoading, skeletonRows, emptyTitle, emptyDescription, pagination, sorting, className, rowKey, rowCta, rowAction, onRowClick, density, tableLayout, theadClassName, headerStyle, snug, expandable, }: DataTableProps<T>): React$1.JSX.Element;
/**
 * The classes and offset for a column frozen to the left edge, so a grid that
 * pins its identifier columns does not have to reinvent the recipe. Five
 * feature files in the internal console had five copies of it, all carrying the
 * same two faults below.
 *
 * Spread the result onto the column:
 *
 * ```tsx
 * let left = 0;
 * columns.map((col) => {
 *   if (!FROZEN.includes(col.key)) return col;
 *   const frozen = { ...col, ...frozenColumn({ left, isLast: col.key === lastFrozen }) };
 *   left += widthOf(col);
 *   return frozen;
 * });
 * ```
 *
 * Two things it gets right that a hand-rolled version tends not to:
 *
 * **The background is opaque and is the table's own.** It has to be opaque or
 * the rows scrolling underneath show through the pinned block. It should not be
 * a tint, because a tint at full strength next to a row that highlights at 40%
 * makes the frozen block the heaviest thing on screen — the divider and the
 * shadow are what say "pinned", and the shadow is the honest signal anyway,
 * since it is what reads as content passing underneath.
 *
 * **It follows the row's hover.** The frozen cells are part of the row; pinning
 * them to a fixed colour makes a hovered row highlight in two different shades
 * and read as two rows. The hover colour is mixed rather than given an alpha,
 * for the same opacity reason.
 */
declare function frozenColumn({ left, right, isLast, }: {
    /** Offset from the left edge in px — the widths of the frozen columns before this one. */
    left?: number;
    /** Offset from the right edge in px, for a column pinned to that side instead. */
    right?: number;
    /** The column at the boundary, which carries the divider and the shadow. */
    isLast?: boolean;
}): Pick<Column<unknown>, "cellClassName" | "cellStyle">;

/**
 * The canonical table surface: one bordered card holding a title, tabs, a
 * filter toolbar, the grid, and a footer — in that order, with the same
 * dividers and gutters every time.
 *
 * `DataTable` on its own is the grid. This is everything around it, and it
 * exists because that surrounding chrome is where tables actually drift: one
 * feature puts its filters above the card, another inside it; one draws a
 * divider under the tabs, another does not; one pads the toolbar `py-3` and the
 * next `py-2.5`. None of that is a decision a feature should be making.
 *
 * Pagination goes through `pagination`, in every mode — including cursor APIs
 * that carry no row total. The `footer` slot is for a footer that is genuinely
 * not a pager; passing one hides the table's own.
 */
interface DataTableCardProps<T> {
    columns: Column<T>[];
    data: T[];
    rowKey: (row: T) => string;
    isLoading?: boolean;
    /**
     * Section title. For a grid that names itself — an analytics section like
     * "Top 10 Merchants by Volume" — rather than a page-level grid, whose name is
     * the page header. Renders above `tabs`.
     */
    title?: string;
    /** One line under the title. Only meaningful with `title`. */
    description?: string;
    /** Controls on the title row, flush right (a period toggle, Refresh, …). */
    actions?: ReactNode;
    /** Tab bar near the top of the card, above the toolbar. */
    tabs?: ReactNode;
    /** Filters / search / action buttons, as a row inside the card top. */
    toolbar?: ReactNode;
    /**
     * A non-pager footer inside the card bottom. Hides the table's own footer, so
     * do NOT use it for pagination — that is what `pagination` is for, in every
     * mode. Hand-rolling a pager here is how two different pagers end up in one
     * app.
     */
    footer?: ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    /**
     * Replaces the grid when there are no rows — an illustrated placeholder,
     * typically.
     *
     * `emptyTitle` / `emptyDescription` give the table's own text-only empty
     * state, which keeps the column headers and is right for "nothing matched
     * your filters". This is for the first-run case, where there is no data yet
     * because none has ever existed, and a drawn state says that better than a
     * header row over nothing.
     */
    emptyState?: ReactNode;
    /**
     * Replaces the rows entirely when the request failed.
     *
     * Distinct from an empty result with error-worded copy: that keeps the
     * column headers, which is right for "nothing matched" and wrong for "we
     * could not load this" — headers imply data was fetched and found empty.
     */
    errorState?: ReactNode;
    /** See {@link DataTablePagination}. Omit for client-side paging at 10/page. */
    pagination?: DataTablePagination;
    /** See {@link DataTableSorting}. */
    sorting?: DataTableSorting;
    rowAction?: ReactNode | ((row: T, index: number) => ReactNode);
    /**
     * Makes the whole row a click target, for a grid that drills into a detail
     * view. Passed straight through, so it brings the keyboard affordances with
     * it and does not fire for clicks landing on a button, link or form control
     * inside a cell.
     */
    onRowClick?: (row: T, index: number) => void;
    /** Defaults to "content"; pass "fixed" for grids with frozen sticky columns. */
    tableLayout?: "auto" | "fixed" | "content";
    /** Per-row disclosure panel rendered beneath the row. */
    expandable?: DataTableExpandable<T>;
    /** Row rhythm. Defaults to `compact`, which is what a data-dense grid wants. */
    density?: DataTableDensity;
    skeletonRows?: number;
    /**
     * CSS max-height for the internally scrolling body, so the toolbar and footer
     * stay put while the rows scroll and the page itself does not grow.
     *
     * The default assumes a page header plus this card's toolbar; a card that
     * also carries a `tabs` row needs a smaller cap, or the page starts scrolling
     * as well. Pass `"none"` to let the card grow with its content instead.
     */
    maxBodyHeight?: string;
    className?: string;
}
declare function DataTableCard<T>({ columns, data, rowKey, isLoading, title, description, actions, tabs, toolbar, footer, emptyTitle, emptyDescription, emptyState, errorState, pagination, sorting, rowAction, onRowClick, tableLayout, expandable, density, skeletonRows, maxBodyHeight, className, }: DataTableCardProps<T>): React$1.JSX.Element;
/** Right-aligned group for toolbar action buttons. */
declare function TableToolbarActions({ children }: {
    children: ReactNode;
}): React$1.JSX.Element;

/**
 * The narrow-viewport counterpart to {@link DataTableCard}: the same records as
 * a stack of cards.
 *
 * It is a separate component rather than a mode of the table on purpose. A
 * card list is not a table with its columns hidden — it chooses a handful of
 * fields, gives them a hierarchy, and drops the rest. Folding that into
 * `DataTableCard` would mean one component carrying two layouts and a
 * breakpoint, and every table paying for props it does not use.
 *
 * Pair the two with CSS, not a media-query hook:
 *
 * ```tsx
 * <DataTableCard className="hidden lg:block" … />
 * <DataCardList className="lg:hidden" … />
 * ```
 *
 * Both render; CSS shows one. A JS breakpoint would have to start with a guess
 * on the server, so one cohort sees the wrong layout on first paint, and a
 * resize across the breakpoint unmounts the visible half — taking scroll
 * position and any open row with it.
 *
 * What it owns is the surface, not the card: the bordered container, the
 * loading skeletons, the empty state and the pager. Those are the four things
 * every hand-rolled card list in the apps reimplemented, and the four that had
 * drifted. The card itself stays with the feature, via `renderCard` — that is
 * the part that genuinely differs per record.
 */
interface DataCardListProps<T> {
    rows: T[];
    rowKey: (row: T) => string;
    /** One record as a card. The only part a feature has to write. */
    renderCard: (row: T, index: number) => ReactNode;
    isLoading?: boolean;
    /**
     * The loading placeholder for one card. Omit for a generic card-shaped
     * shimmer — good enough for most lists, and worth replacing only where the
     * real card has a distinctive shape worth pre-announcing.
     */
    renderSkeleton?: (index: number) => ReactNode;
    skeletonCount?: number;
    emptyTitle?: string;
    emptyDescription?: string;
    /**
     * Replaces the list when there are no rows — an illustrated placeholder,
     * typically. Same split as `DataTableCard`: the title/description pair is the
     * plain "nothing matched" state, this is the drawn first-run one.
     */
    emptyState?: ReactNode;
    /**
     * Replaces the rows entirely when the request failed.
     *
     * Distinct from an empty result with error-worded copy: that keeps the
     * column headers, which is right for "nothing matched" and wrong for "we
     * could not load this" — headers imply data was fetched and found empty.
     */
    errorState?: ReactNode;
    /**
     * The same {@link DataTablePagination} the table takes, so a list and the
     * table beside it cannot disagree about which page they are on. Rendered as
     * a compact Prev / Next pager rather than a numbered strip: a row of page
     * numbers is the first thing to go wrong on a phone.
     */
    pagination?: DataTablePagination;
    /** Wraps the list in the same bordered card the table uses. Default true. */
    bordered?: boolean;
    className?: string;
}
declare function DataCardList<T>({ rows, rowKey, renderCard, isLoading, renderSkeleton, skeletonCount, emptyTitle, emptyDescription, emptyState, errorState, pagination, bordered, className, }: DataCardListProps<T>): React$1.JSX.Element;

interface CopyableCellProps {
    /**
     * The full value. This is what reaches the clipboard, the tooltip and the
     * accessible name — always, even when `display` shortens what is on screen.
     * Shortening what is shown must never shorten what the user walks away with.
     */
    value?: string | null;
    /** What to render instead of `value` — an elided form, typically. */
    display?: string;
    /** The noun in the tooltip and the toast: "Transaction ID copied". */
    label?: string;
    /**
     * Makes the value the handle that opens the row, rendered as a link. Without
     * it the value is plain text that can still be copied.
     *
     * The copy button stops propagation, so an id that opens a row does not also
     * open it when copied.
     */
    onClick?: () => void;
    /** Render the value in the primary colour. */
    accent?: boolean;
    monospace?: boolean;
    /** What an absent value renders as. Default the em dash every grid uses. */
    fallback?: string;
    /**
     * - `inline` (default) — the value, with its own copy button beside it.
     * - `cell` — the **whole** element is the copy target and the value
     *   underlines on hover. For a fixed-width column where a separate button
     *   would cost more room than the value it copies.
     *
     * `cell` ignores `onClick`: a cell cannot both copy and open the row on the
     * same click.
     */
    variant?: "inline" | "cell";
    /**
     * Keep the copy button invisible until the row (or any `group` ancestor) is
     * hovered, or the button itself is focused. Opacity only — it keeps its
     * space, so revealing it never shifts the row.
     *
     * Defaults to `true`, which is what a table wants: twelve permanent copy
     * buttons are twelve pieces of chrome competing with the data. Pass `false`
     * for a detail field, where there is no row to hover and the control would
     * simply never appear. Pointer-coarse devices have no hover to give, so it
     * stays visible there regardless.
     */
    revealOnHover?: boolean;
    /**
     * Announce the copy with a toast. Off for a field whose tick and tooltip are
     * feedback enough, and where a toast per copy would be noise.
     */
    showToast?: boolean;
    /** Extra classes on the value itself, e.g. a muted secondary placement. */
    valueClassName?: string;
    className?: string;
}
/**
 * The canonical identifier cell: a value plus a copy button that fades in on
 * the row's hover.
 *
 * Reveal-on-hover is the point. A table of twelve ids with twelve permanent
 * copy buttons is twelve pieces of chrome competing with the data; the row the
 * pointer is on is the only one whose button is useful.
 *
 * It relies on the row's own `group` class, which every `DataTable` `<tr>`
 * already carries. Outside a DataTable row, pass `className="group"` on an
 * ancestor or the button stays hidden.
 */
declare function CopyableCell({ value, display, label, onClick, accent, monospace, fallback, variant, revealOnHover, showToast, valueClassName, className, }: CopyableCellProps): React$1.JSX.Element;

interface RotatingSearchInputProps {
    /** Controlled value. Omit to let the field own it. */
    value?: string;
    /** Fires on the debounced value, not on every keystroke. */
    onSearch: (value: string) => void;
    /** The hints to cycle through: "Amount", "Transaction ID", "Email". */
    words: string[];
    /** Debounce before `onSearch` fires. Default 300ms. */
    debounceDelay?: number;
    className?: string;
    /** Screen-reader name for the field. */
    ariaLabel?: string;
}
/**
 * The table search box: one field whose placeholder cycles through what it can
 * actually match — "Search by Amount", then "Transaction ID", then "Email".
 *
 * That rotation is the whole point. A single grid search usually spans half a
 * dozen fields, and a static "Search" placeholder tells the user none of them,
 * so they guess at what is searchable and conclude the box is broken when their
 * guess misses. Naming the fields in turn costs no space and answers it.
 *
 * `onSearch` is debounced, so a search that hits the network fires once the
 * user pauses rather than once per keystroke.
 */
declare function RotatingSearchInput({ value, onSearch, words, debounceDelay, className, ariaLabel, }: RotatingSearchInputProps): React$1.JSX.Element;

/**
 * A column as the manager sees it: a key and something to call it in the list.
 * `label` is separate from the table's `header` because a header can be a node
 * (an icon, a tooltip, a two-line stack) and this list needs plain text.
 */
interface ManagedColumn {
    key: string;
    label: string;
}
interface ColumnManagerProps {
    /** Every manageable column, in the table's *declared* order. */
    columns: ManagedColumn[];
    /** Current arrangement, as column keys. */
    order: string[];
    onOrderChange: (order: string[]) => void;
    /**
     * Column keys currently hidden. Omit — along with `onHiddenKeysChange` — to
     * drop the tick boxes entirely and keep this a reorder-only popover.
     */
    hiddenKeys?: string[];
    onHiddenKeysChange?: (hidden: string[]) => void;
    /**
     * Columns that cannot be **hidden**. Says nothing about where they sit — a
     * column the table cannot do without is still one the user may want to move.
     *
     * They keep a tick box rather than losing it, so the list reads as one set of
     * columns with some locked rather than as two lists — but the box is grey,
     * not primary, because nobody chose it.
     */
    fixedKeys?: string[];
    /**
     * Columns that cannot be **reordered**. Says nothing about whether they can
     * be hidden.
     *
     * The usual case is a frozen (sticky) column: its left offset is the running
     * total of the widths of the frozen columns before it, so the block only
     * works while they stay first and contiguous — drag one into the middle and
     * it keeps `left-0`, leaving a pinned column floating over the scrolling
     * ones. Hiding it is fine; that just shortens the block.
     *
     * A key can appear in both lists, and then neither control is offered.
     */
    pinnedKeys?: string[];
    /**
     * Why a fixed column cannot be hidden, shown on hover and focus. A disabled
     * control that stays silent leaves the user to guess whether they are doing
     * something wrong, so every caller should say something; the default is
     * deliberately generic so a missing one is still an answer.
     */
    fixedReason?: string;
    /**
     * Why a pinned column cannot be moved, shown on hover. Same reasoning as
     * `fixedReason`: a dead affordance should say why it is dead.
     */
    pinnedReason?: string;
    /**
     * Discards the saved arrangement so the table falls back to `columns`' own
     * order with nothing hidden. Separate from `onOrderChange` rather than
     * passing the default order through it, since "no saved preference" is its
     * own state in the caller, not just another arrangement.
     */
    onReset: () => void;
    /** Trigger label. Default "Columns". */
    label?: string;
    /** Render the trigger as an icon-only button — for a crowded toolbar. */
    iconOnly?: boolean;
    /** Extra classes on the trigger button. */
    className?: string;
    /** Popover alignment against the trigger. Default "end". */
    align?: "start" | "center" | "end";
}
/**
 * Column manager: drag to reorder, tick to show or hide, with locked columns
 * and a reset. One implementation for every grid in every app, so a merchant
 * and an internal operator arrange their columns the same way.
 *
 * Reordering is @dnd-kit, the same stack the dashboard's widget grid uses, so
 * the rows animate out of each other's way as one is dragged past them. A
 * hand-rolled pointer drag can reorder the list correctly and still feel wrong:
 * without a per-row transform the rows simply teleport into their new slots,
 * and there is nothing to follow.
 *
 * dnd-kit is `external` in the build rather than bundled, because both
 * consuming apps already depend on it — two copies of `DndContext` in one app
 * is the kind of thing that breaks only in the app, never in the library.
 *
 * Keyboard users reorder without a mouse at all: Space picks a row up, the
 * arrows move it, Space drops it, Escape abandons it, and dnd-kit announces
 * each step as it goes.
 */
declare function ColumnManager({ columns, order, onOrderChange, hiddenKeys, onHiddenKeysChange, fixedKeys, pinnedKeys, fixedReason, pinnedReason, onReset, label, iconOnly, className, align, }: ColumnManagerProps): React$1.JSX.Element;
interface ColumnPreferences {
    order: string[];
    hidden: string[];
}
interface UseColumnPreferencesOptions {
    /**
     * `localStorage` key. Omit and the arrangement lives only for the session —
     * which is what a grid whose columns depend on the signed-in user's role
     * wants, since a saved order from another role would resurrect columns that
     * no longer exist.
     */
    storageKey?: string;
}
interface UseColumnPreferencesResult extends ColumnPreferences {
    setOrder: (order: string[]) => void;
    setHidden: (hidden: string[]) => void;
    reset: () => void;
    /** Spread straight onto `<ColumnManager>`. */
    managerProps: Pick<ColumnManagerProps, "order" | "onOrderChange" | "hiddenKeys" | "onHiddenKeysChange" | "onReset">;
}
/**
 * Owns a grid's column arrangement, optionally persisted.
 *
 * `defaultOrder` is the source of truth for which columns exist: a stored order
 * is reconciled against it on every read, so a column added in a release shows
 * up for someone who saved an arrangement before it existed, and a removed one
 * disappears instead of leaving a hole.
 */
declare function useColumnPreferences(defaultOrder: string[], { storageKey }?: UseColumnPreferencesOptions): UseColumnPreferencesResult;
/**
 * Applies a saved arrangement to a built column list.
 *
 * `pinnedKeys` stay where they are declared regardless of the saved order —
 * for the trailing "action" column, which is a utility, not a data field
 * anybody wants to move. Columns missing from `order` (a field that only
 * exists for some roles, say) are appended before them rather than dropped.
 */
declare function applyColumnPreferences<T extends {
    key: string;
}>(columns: T[], { order, hidden }?: Partial<ColumnPreferences>, pinnedKeys?: string[]): T[];

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}
declare function EmptyState({ icon: Icon, title, description, action, className, }: EmptyStateProps): React$1.JSX.Element;

interface PageHeaderProps {
    title: ReactNode;
    /** When title is non-plain text (e.g. includes a flag), set for screen readers. */
    titleAriaLabel?: string;
    subtitle?: string;
    actions?: ReactNode;
    className?: string;
}
declare function PageHeader({ title, titleAriaLabel, subtitle, actions, className }: PageHeaderProps): React$1.JSX.Element;

type CodeProps = HTMLAttributes<HTMLElement>;
declare const Code: React$1.ForwardRefExoticComponent<CodeProps & React$1.RefAttributes<HTMLElement>>;
interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
    /** The raw code string to display and optionally copy. */
    code: string;
    /** Optional filename shown in the header. */
    filename?: string;
    /** Optional language label shown as a badge in the header. */
    language?: string;
    /** Hide the copy button. Defaults to false. */
    hideCopy?: boolean;
}
declare const CodeBlock: React$1.ForwardRefExoticComponent<CodeBlockProps & React$1.RefAttributes<HTMLDivElement>>;

declare const Avatar: React$1.ForwardRefExoticComponent<Omit<AvatarPrimitive.AvatarProps & React$1.RefAttributes<HTMLSpanElement>, "ref"> & React$1.RefAttributes<HTMLSpanElement>>;
declare const AvatarImage: React$1.ForwardRefExoticComponent<Omit<AvatarPrimitive.AvatarImageProps & React$1.RefAttributes<HTMLImageElement>, "ref"> & React$1.RefAttributes<HTMLImageElement>>;
declare const AvatarFallback: React$1.ForwardRefExoticComponent<Omit<AvatarPrimitive.AvatarFallbackProps & React$1.RefAttributes<HTMLSpanElement>, "ref"> & React$1.RefAttributes<HTMLSpanElement>>;

interface AvatarGroupItem {
    src?: string;
    fallback: string;
    alt?: string;
}
interface AvatarGroupProps extends React$1.HTMLAttributes<HTMLDivElement> {
    avatars: AvatarGroupItem[];
    max?: number;
    size?: "sm" | "md" | "lg";
}
declare const AvatarGroup: React$1.ForwardRefExoticComponent<AvatarGroupProps & React$1.RefAttributes<HTMLDivElement>>;

type AvatarTagSize = "sm" | "md" | "lg";
interface AvatarTagProps extends React$1.HTMLAttributes<HTMLSpanElement> {
    /** Display label for the tag */
    label: string;
    /** Optional image src for the avatar */
    src?: string;
    /** Alt text for the avatar image */
    alt?: string;
    /** Size variant */
    size?: AvatarTagSize;
    /** Called when the remove button is clicked */
    onRemove?: () => void;
    /** Disables interaction */
    disabled?: boolean;
}
declare const AvatarTag: React$1.ForwardRefExoticComponent<AvatarTagProps & React$1.RefAttributes<HTMLSpanElement>>;

type CalendarProps = DayPickerProps & {
    buttonVariant?: ButtonProps["variant"];
};
declare function Calendar({ className, classNames, showOutsideDays, captionLayout, buttonVariant, locale, formatters, components, showWeekNumber, ...props }: CalendarProps): React$1.JSX.Element;
declare function CalendarDayButton({ className, day, modifiers, ...props }: DayButtonProps): React$1.JSX.Element;

/**
 * `showTime`'s options, following antd's prop of the same name.
 *
 * Two defaults differ from antd's, both because of what flux renders elsewhere:
 * `use12Hours` is **on** (antd defaults it off) because `formatDateTime` prints
 * every timestamp in this library with `hour12`, and entering "23:55" to read it
 * back as "11:55 PM" is the mismatch that makes a reviewer check a row twice;
 * and `showSecond` is **off** (antd defaults it on) because nothing in flux
 * records a second.
 */
interface DatePickerTimeOptions {
    /** Hour column is 12-hour with an AM/PM column beside it. Default `true`. */
    use12Hours?: boolean;
    /** Add a seconds column, and put seconds in the emitted value. Default `false`. */
    showSecond?: boolean;
    hourStep?: number;
    minuteStep?: number;
    secondStep?: number;
    /** `HH:mm[:ss]` used when a day is picked before any time. Default `"00:00"`. */
    defaultValue?: string;
}
interface DatePickerProps {
    /**
     * `YYYY-MM-DD`, or `YYYY-MM-DD HH:mm` (`HH:mm:ss` with `showSecond`) when
     * `showTime` is set — the same widening antd does to its value when a time is
     * shown.
     */
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    className?: string;
    /** Earliest selectable date, `YYYY-MM-DD`. Days before it are struck out. */
    min?: string;
    /**
     * Latest selectable date, `YYYY-MM-DD`.
     *
     * Its absence is why a feature ended up hand-rolling a whole date chip to
     * enforce an upper bound on Apply instead — an error after the fact, where
     * the calendar could have said so before the click.
     */
    max?: string;
    label?: string;
    /**
     * Put time columns beside the calendar, so a day and the time on it are one
     * control rather than two fields that can disagree.
     *
     * Follows antd: the panel gains Hr / Min (/ Sec) (/ AM-PM) columns and a
     * footer, picking a day no longer closes the panel, and **OK** is what
     * commits. `onChange` still fires on every edit — OK closes, it does not
     * gate the value — so a controlled caller sees each change as it happens.
     */
    showTime?: boolean | DatePickerTimeOptions;
    /**
     * antd's `showNow`: the "Now" shortcut in the footer. Default `true` when a
     * time is shown, and ignored otherwise.
     */
    showNow?: boolean;
}
declare function DatePicker({ value, onChange, placeholder, className, min, max, label, showTime, showNow }: DatePickerProps): React$1.JSX.Element;

/**
 * Chart primitives from shadcn/ui (Recharts composition layer).
 * @see https://ui.shadcn.com/docs/components/radix/chart
 */

declare const THEMES: {
    readonly light: "";
    readonly dark: ".dark";
};
type TooltipNameType = number | string;
type ChartConfig = Record<string, {
    label?: React$1.ReactNode;
    icon?: React$1.ComponentType;
} & ({
    color?: string;
    theme?: never;
} | {
    color?: never;
    theme: Record<keyof typeof THEMES, string>;
})>;
declare function ChartContainer({ id, className, children, config, initialDimension, ...props }: React$1.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React$1.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
    initialDimension?: {
        width: number;
        height: number;
    };
}): React$1.JSX.Element;
declare const ChartStyle: ({ id, config }: {
    id: string;
    config: ChartConfig;
}) => React$1.JSX.Element | null;
declare const ChartTooltip: typeof RechartsPrimitive.Tooltip;
declare function ChartTooltipContent({ active, payload, className, indicator, hideLabel, hideIndicator, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey, }: React$1.ComponentProps<typeof RechartsPrimitive.Tooltip> & React$1.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
} & Omit<RechartsPrimitive.DefaultTooltipContentProps<TooltipValueType, TooltipNameType>, "accessibilityLayer">): React$1.JSX.Element | null;
declare const ChartLegend: React$1.MemoExoticComponent<(outsideProps: RechartsPrimitive.LegendProps) => React$1.ReactPortal | null>;
declare function ChartLegendContent({ className, hideIcon, payload, verticalAlign, nameKey, }: React$1.ComponentProps<"div"> & {
    hideIcon?: boolean;
    nameKey?: string;
} & RechartsPrimitive.DefaultLegendContentProps): React$1.JSX.Element | null;

/** ─── KPI + sparkline (dashboard stat tiles) ─────────────────────────── */
type MetricSparklinePoint = {
    x: string | number;
    y: number;
};
type MetricSparklineCardProps = {
    title: string;
    icon?: React$1.ReactNode;
    value: React$1.ReactNode;
    /** e.g. "+8.4% vs last month" */
    trend?: {
        direction: "up" | "down" | "flat";
        label: string;
    };
    data: MetricSparklinePoint[];
    /** Stroke / gradient accent (CSS color) */
    accentColor?: string;
    className?: string;
    onInfoClick?: () => void;
};
declare function MetricSparklineCard({ title, icon, value, trend, data, accentColor, className, onInfoClick, }: MetricSparklineCardProps): React$1.JSX.Element;
/** ─── Hero area + optional compare line + tabs + footer ──────────────── */
type DashboardAreaChartPoint = Record<string, string | number>;
type DashboardAreaChartTemplateProps = {
    title: string;
    tabs: {
        id: string;
        label: string;
    }[];
    activeTabId: string;
    onTabChange: (id: string) => void;
    headline: React$1.ReactNode;
    delta?: React$1.ReactNode;
    data: DashboardAreaChartPoint[];
    xKey: string;
    areaKey: string;
    compareLineKey?: string;
    height?: number;
    formatYAxis?: (v: number) => string;
    footer?: React$1.ReactNode;
    className?: string;
};
declare function DashboardAreaChartTemplate({ title, tabs, activeTabId, onTabChange, headline, delta, data, xKey, areaKey, compareLineKey, height, formatYAxis, footer, className, }: DashboardAreaChartTemplateProps): React$1.JSX.Element;
/** ─── Grouped vertical bars + legend (e.g. volume vs settled) ───────── */
type GroupedBarSeries = {
    key: string;
    label: string;
    color: string;
};
type GroupedBarChartTemplateProps = {
    title: string;
    subtitle?: string;
    data: DashboardAreaChartPoint[];
    xKey: string;
    series: GroupedBarSeries[];
    height?: number;
    formatYAxis?: (v: number) => string;
    className?: string;
};
declare function GroupedBarChartTemplate({ title, subtitle, data, xKey, series, height, formatYAxis, className, }: GroupedBarChartTemplateProps): React$1.JSX.Element;
/** ─── Ranked rows with horizontal bar (country / state insights) ────── */
type RankedBarItem = {
    id: string;
    leading?: React$1.ReactNode;
    label: string;
    value: string;
    /** 0–100 width of the filled bar */
    percent: number;
};
type RankedBarListTemplateProps = {
    title: string;
    subtitle?: string;
    headerRight?: React$1.ReactNode;
    items: RankedBarItem[];
    /** CSS colors for bar gradient */
    barFrom?: string;
    barTo?: string;
    className?: string;
};
declare function RankedBarListTemplate({ title, subtitle, headerRight, items, barFrom, barTo, className, }: RankedBarListTemplateProps): React$1.JSX.Element;
/** ─── Vertical category bars (e.g. T+N settlement mix) ──────────────── */
type CategoryBarPoint = {
    category: string;
    value: number;
};
type CategoryBarChartTemplateProps = {
    title: string;
    subtitle?: string;
    data: CategoryBarPoint[];
    valueLabel?: string;
    barColor?: string;
    height?: number;
    className?: string;
};
declare function CategoryBarChartTemplate({ title, subtitle, data, valueLabel, barColor, height, className, }: CategoryBarChartTemplateProps): React$1.JSX.Element;
/** ─── Mini sparkline + stat row (success / failed / avg) ────────────── */
type MiniSparklinePoint = {
    x: string | number;
    y: number;
    compare?: number;
};
type MiniSparklineStat = {
    label: string;
    value: string;
    dotClassName?: string;
};
type MiniSparklineChartCardProps = {
    title: string;
    value: React$1.ReactNode;
    data: MiniSparklinePoint[];
    accentColor?: string;
    stats: MiniSparklineStat[];
    height?: number;
    className?: string;
};
declare function MiniSparklineChartCard({ title, value, data, accentColor, height, stats, className, }: MiniSparklineChartCardProps): React$1.JSX.Element;
/** ─── “Needs attention” list with actions ───────────────────────────── */
type AttentionListItem = {
    id: string;
    title: string;
    value: string;
    valueTone?: "default" | "warning" | "danger";
    meta?: string;
    actionLabel: string;
    onAction?: () => void;
};
type AttentionListTemplateProps = {
    title: string;
    items: AttentionListItem[];
    className?: string;
};
declare function AttentionListTemplate({ title, items, className }: AttentionListTemplateProps): React$1.JSX.Element;

/** Drop-in toast host; pair with `toast` from `sonner`. Resolves theme via next-themes when mounted. */
declare function Toaster({ theme, ...props }: ToasterProps): React$1.JSX.Element;

interface InlineEditProps {
    value: string;
    onConfirm: (val: string) => void;
    placeholder?: string;
    multiline?: boolean;
    disabled?: boolean;
    showButtons?: boolean;
    readClassName?: string;
    inputClassName?: string;
}
declare const InlineEdit: React$1.ForwardRefExoticComponent<InlineEditProps & React$1.RefAttributes<HTMLDivElement>>;

interface InlineDialogProps extends React$1.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {
}
interface InlineDialogContentProps extends Omit<React$1.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>, "side" | "sideOffset"> {
    side?: "top" | "right" | "bottom" | "left";
    sideOffset?: number;
    /** Hide the built-in close button */
    hideClose?: boolean;
}
declare const InlineDialog: React$1.FC<PopoverPrimitive.PopoverProps>;
declare const InlineDialogTrigger: React$1.ForwardRefExoticComponent<PopoverPrimitive.PopoverTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const InlineDialogContent: React$1.ForwardRefExoticComponent<InlineDialogContentProps & React$1.RefAttributes<HTMLDivElement>>;

type FlagVariant = "info" | "success" | "warning" | "error";
type FlagGroupPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";
interface FlagAction {
    label: string;
    onClick: () => void;
}
interface FlagProps extends React$1.HTMLAttributes<HTMLDivElement> {
    /** Heading text shown in bold */
    title: string;
    /** Optional body copy shown below the title */
    description?: string;
    /** Visual severity / colour */
    variant?: FlagVariant;
    /** Override the default lucide icon */
    icon?: React$1.ReactNode;
    /** Called when the close button is pressed */
    onDismiss?: () => void;
    /** Action buttons rendered below the content. Pass `false` to disable. */
    autoDismiss?: number | false;
    /** Optional CTA buttons */
    actions?: FlagAction[];
}
interface FlagGroupProps extends React$1.HTMLAttributes<HTMLDivElement> {
    /** Corner to anchor the stack */
    position?: FlagGroupPosition;
}
interface UseFlagGroupReturn {
    flags: Array<FlagProps & {
        id: string;
    }>;
    addFlag: (flag: Omit<FlagProps, "onDismiss"> & {
        id?: string;
    }) => string;
    removeFlag: (id: string) => void;
    clearAll: () => void;
}
declare const Flag: React$1.ForwardRefExoticComponent<FlagProps & React$1.RefAttributes<HTMLDivElement>>;
declare const FlagGroup: React$1.ForwardRefExoticComponent<FlagGroupProps & React$1.RefAttributes<HTMLDivElement>>;
declare function useFlagGroup(): UseFlagGroupReturn;

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";
interface ShowProps extends React$1.HTMLAttributes<HTMLElement> {
    /** Render children at this breakpoint and above. */
    above?: Breakpoint;
    /** Render children strictly below this breakpoint. */
    below?: Breakpoint;
    /** HTML element to render. Defaults to "div". */
    as?: React$1.ElementType;
    /** Display value to restore when visible. Defaults to "block". */
    display?: "block" | "flex" | "inline" | "inline-block" | "grid" | "inline-flex";
    children?: React$1.ReactNode;
}
declare const Show: React$1.ForwardRefExoticComponent<ShowProps & React$1.RefAttributes<HTMLElement>>;
interface HideProps extends React$1.HTMLAttributes<HTMLElement> {
    /** Hide children at this breakpoint and above. */
    above?: Breakpoint;
    /** Hide children strictly below this breakpoint (i.e. visible at/above). */
    below?: Breakpoint;
    /** HTML element to render. Defaults to "div". */
    as?: React$1.ElementType;
    /** Display value to restore when visible. Defaults to "block". */
    display?: "block" | "flex" | "inline" | "inline-block" | "grid" | "inline-flex";
    children?: React$1.ReactNode;
}
declare const Hide: React$1.ForwardRefExoticComponent<HideProps & React$1.RefAttributes<HTMLElement>>;
interface UseBreakpointReturn {
    /** The currently active (highest matching) breakpoint, or null on SSR / xs viewport. */
    breakpoint: Breakpoint | null;
    /** Returns true when the viewport is at or above `bp`. */
    isAbove: (bp: Breakpoint) => boolean;
    /** Returns true when the viewport is strictly below `bp`. */
    isBelow: (bp: Breakpoint) => boolean;
    /** True when no breakpoint is active (viewport < 640 px). */
    isMobile: boolean;
    /** True when active breakpoint is md (768–1023 px). */
    isTablet: boolean;
    /** True when active breakpoint is lg or above (≥ 1024 px). */
    isDesktop: boolean;
}
declare function useBreakpoint(): UseBreakpointReturn;

interface Country {
    code: string;
    name: string;
    flag: string;
    dialCode: string;
}
declare const COUNTRIES: Country[];
interface CountrySelectProps {
    value?: string;
    onValueChange?: (code: string) => void;
    placeholder?: string;
    showDialCode?: boolean;
    disabled?: boolean;
    className?: string;
}
declare const CountrySelect: React$1.ForwardRefExoticComponent<CountrySelectProps & React$1.RefAttributes<HTMLButtonElement>>;

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    "aria-label": string;
    variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    isLoading?: boolean;
    rounded?: "sm" | "md" | "lg" | "full";
}
declare const IconButton: React$1.ForwardRefExoticComponent<IconButtonProps & React$1.RefAttributes<HTMLButtonElement>>;

interface TimePickerProps {
    /** Controlled value in 24-hour "HH:MM" format. Pass "" for no selection. */
    value: string;
    /** Called with a new "HH:MM" string, or "" when cleared. */
    onValueChange: (value: string) => void;
    /** Show 12-hour (AM/PM) columns instead of 24-hour. Default: false. */
    use24Hour?: boolean;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    className?: string;
}
declare const TimePicker: React$1.ForwardRefExoticComponent<TimePickerProps & React$1.RefAttributes<HTMLButtonElement>>;

interface HeadingProps extends React$1.HTMLAttributes<HTMLHeadingElement> {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    as?: React$1.ElementType;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
    color?: "default" | "subtle" | "primary";
}
declare const Heading: React$1.ForwardRefExoticComponent<HeadingProps & React$1.RefAttributes<HTMLHeadingElement>>;
interface TextProps extends React$1.HTMLAttributes<HTMLElement> {
    as?: "p" | "span" | "div" | "label";
    size?: "xs" | "sm" | "md" | "lg";
    weight?: "normal" | "medium" | "semibold";
    color?: "default" | "subtle" | "primary" | "disabled";
    truncate?: boolean;
}
declare const Text: React$1.ForwardRefExoticComponent<TextProps & React$1.RefAttributes<any>>;
interface MetricTextProps extends Omit<React$1.HTMLAttributes<HTMLSpanElement>, "prefix"> {
    size?: "sm" | "md" | "lg" | "xl";
    trend?: "up" | "down" | "neutral";
    prefix?: React$1.ReactNode;
    suffix?: React$1.ReactNode;
}
declare const MetricText: React$1.ForwardRefExoticComponent<MetricTextProps & React$1.RefAttributes<HTMLSpanElement>>;

type ProgressIndicatorSize = "sm" | "md" | "lg";
interface ProgressIndicatorProps extends Omit<React$1.HTMLAttributes<HTMLDivElement>, "onChange"> {
    selectedIndex: number;
    values: string[];
    size?: ProgressIndicatorSize;
    onChange?: (index: number) => void;
}
declare const ProgressIndicator: React$1.ForwardRefExoticComponent<ProgressIndicatorProps & React$1.RefAttributes<HTMLDivElement>>;

interface VisuallyHiddenProps extends React$1.HTMLAttributes<HTMLElement> {
    as?: React$1.ElementType;
    focusable?: boolean;
}
declare const VisuallyHidden: React$1.ForwardRefExoticComponent<VisuallyHiddenProps & React$1.RefAttributes<HTMLElement>>;

interface FilterChipOption {
    value: string;
    label: string;
    /** Optional leading glyph — a flag, a brand mark, a status dot. */
    icon?: ReactNode;
    /** Secondary text to the right, e.g. a matching count. */
    hint?: string;
}
/**
 * Wraps a row of filter chips so only one popover is open at a time — and,
 * crucially, so switching between two chips does not make the second one flash.
 *
 * The flash comes from every chip sharing one `openChip` value while Radix
 * reports the two halves of the switch as separate events: the chip being
 * *opened* fires `onOpenChange(true)` and the chip being *dismissed* fires
 * `onOpenChange(false)`. A naive `setOpenChip(open ? key : null)` lets whichever
 * event lands second win, so when the dismissal lands second it wipes out the
 * chip that just opened — it mounts, paints, and unmounts.
 *
 * The fix is that a close only counts if the chip closing is still the one on
 * screen. A stale dismissal from the chip the user just left is then a no-op,
 * whatever order the events arrive in. This lives here rather than in each
 * toolbar because it is invisible until it is wrong, and it was wrong in every
 * toolbar that hand-rolled it.
 */
declare function FilterChipGroup({ children, className, }: {
    children: ReactNode;
    className?: string;
}): React$1.JSX.Element;
/**
 * Open state for one chip. Inside a {@link FilterChipGroup} the group owns it
 * so opening this chip closes its siblings; outside one, the chip keeps its own
 * state, so a lone chip works with no wrapper.
 *
 * Every chip below calls this rather than taking `open` / `onOpenChange` props,
 * which is what stops a call site from reintroducing the flicker by wiring the
 * state up itself. A chip that genuinely needs outside control can still pass
 * `open` / `onOpenChange` — a mounted-but-hidden twin of a chip, say — and
 * those win.
 */
declare function useFilterChipState(key: string, controlled?: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}): {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Spread onto the chip's `PopoverContent`. See below. */
    onCloseAutoFocus: (event: Event) => void;
};
/** The `open` / `onOpenChange` pair every chip accepts for outside control. */
interface FilterChipControl {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}
/**
 * Every filter chip is built from three pieces: this visual shell (the dashed
 * pill), a label trigger that opens the popover, and — only once the filter has
 * a value — a separate clear button to its left.
 *
 * The clear button and the trigger are two independent `<button>`s side by side
 * rather than one button whose leading icon doubles as a clear action: clicking
 * × must clear *without* opening the popover, and a real `<button>` cannot nest
 * inside another. Keeping them siblings means stopping the clear click from
 * also opening the popover needs no `stopPropagation` gymnastics — they are
 * simply two separate click targets.
 *
 * Inactive it reads as an "add a filter" affordance: a dashed outline in the
 * muted border colour. Active it flips to a solid primary ring with a tinted
 * fill, so an applied filter is unmistakable at a glance rather than a subtle
 * recolour of the same dashed outline.
 */
declare function FilterChipShell({ active, children, className, }: {
    active: boolean;
    children: ReactNode;
    className?: string;
}): React$1.JSX.Element;
/**
 * Leading × segment, rendered only when the filter is active.
 *
 * A `Button` rather than an `IconButton` so the `h-auto` / `min-h-0` height
 * override behaves the same way the label trigger's already does: IconButton
 * sizes with Tailwind's `size-*` utility, which a plain `h-auto` does not
 * reliably beat the way it beats Button's `h-9`.
 */
declare function FilterChipClearButton({ label, onClick, }: {
    label: string;
    onClick: () => void;
}): React$1.JSX.Element;
/**
 * Trailing label segment — the actual `PopoverTrigger` target.
 *
 * A leading plus shows only while inactive, since once active the clear button
 * to its left already carries a leading icon. A trailing dot then marks
 * "active"; `count` replaces it with a number when *how many* values are
 * applied is worth saying.
 *
 * Must forward its ref and spread the rest of its props onto the underlying
 * Button: `PopoverTrigger asChild` clones its single child to inject
 * onClick/ref/aria-*, and a component that swallows those renders a chip that
 * looks right and does nothing when clicked.
 */
declare const FilterChipLabelTrigger: React$1.ForwardRefExoticComponent<{
    label: string;
    active: boolean;
    /** Show this number instead of the plain active dot. */
    count?: number;
} & Omit<Omit<ButtonProps & React$1.RefAttributes<HTMLButtonElement>, "ref">, "children"> & React$1.RefAttributes<HTMLButtonElement>>;
/**
 * Apply / Clear footer shared by every panel, so the two buttons sit in the
 * same place and read the same wherever a chip's editor puts them.
 *
 * Both buttons **commit and close**. Clear is not "untick everything and let me
 * carry on" — that reading leaves the panel open over a filter that is still
 * applied, so the chip still reads "Type 1" while the list in front of you
 * shows nothing ticked, and closing the panel silently keeps the old filter.
 * Clear is the same act as the chip's own little x, reached from inside the
 * panel: it drops the filter and gets out of the way.
 */
declare function FilterChipActions({ onClear, onApply, clearDisabled, applyDisabled, }: {
    onClear: () => void;
    onApply: () => void;
    clearDisabled?: boolean;
    applyDisabled?: boolean;
}): React$1.JSX.Element;
/**
 * The full chip — shell, clear button, trigger and popover — with the editor
 * supplied as `children`. Build a bespoke chip on this rather than reassembling
 * the pieces, so a one-off filter still opens, closes and clears like the rest.
 */
declare function FilterChip({ chipKey, label, active, count, onClear, children, align, contentClassName, open: controlledOpen, onOpenChange: controlledOnOpenChange, onOpen, }: {
    /** Identity within a {@link FilterChipGroup}. Must be unique in the row. */
    chipKey: string;
    label: string;
    active: boolean;
    count?: number;
    /** Omit to hide the × segment — for a chip that cannot be emptied. */
    onClear?: () => void;
    children: ReactNode;
    align?: "start" | "center" | "end";
    contentClassName?: string;
    /** Fires when the popover opens — the hook for seeding a draft from the
     *  applied value, so an abandoned edit never leaks into the next open. */
    onOpen?: () => void;
} & FilterChipControl): React$1.JSX.Element;
interface SelectFilterChipProps extends FilterChipControl {
    /** Identity within a group. Defaults to `label`. */
    chipKey?: string;
    label: string;
    options: FilterChipOption[];
    selected: string[];
    onChange: (next: string[]) => void;
    /** Show a search box above the list once there are this many options. Default 8. */
    searchThreshold?: number;
    /** Show the applied count on the chip instead of the plain active dot. */
    showCount?: boolean;
    /**
     * Adds an "Invert filter" tick below the list, turning the chosen set into an
     * exclusion. Pass both to enable it; omit for a plain include-only chip.
     *
     * It is staged with the options and applied with them, because inverting
     * without changing the set is still a change to what the table shows, and
     * committing it on the tick would make this one control in the panel behave
     * differently from the rest.
     */
    invert?: boolean;
    onInvertChange?: (next: boolean) => void;
    /** Label for the invert tick. Default "Invert filter". */
    invertLabel?: string;
    /** Empty-list line, for options that arrive from a request. */
    emptyText?: string;
    align?: "start" | "center" | "end";
}
/**
 * The workhorse chip: a checkbox list staged behind Apply, so ticking four
 * boxes is one query rather than four. Escaping or clicking away discards the
 * draft — the applied value only changes on Apply or Clear.
 */
declare function SelectFilterChip({ chipKey, label, options, selected, onChange, searchThreshold, showCount, invert, onInvertChange, invertLabel, emptyText, align, open, onOpenChange, }: SelectFilterChipProps): React$1.JSX.Element;
interface SingleSelectFilterChipProps extends FilterChipControl {
    chipKey?: string;
    label: string;
    options: FilterChipOption[];
    value: string;
    onChange: (next: string) => void;
    align?: "start" | "center" | "end";
    /** Show the chosen option's label on the chip instead of the field name. */
    showValueInLabel?: boolean;
}
/**
 * One-of-many. Picking applies immediately — there is nothing to stage when a
 * choice replaces rather than accumulates, and an Apply button for a single
 * click is a step that only costs the user time.
 */
declare function SingleSelectFilterChip({ chipKey, label, options, value, onChange, align, showValueInLabel, open, onOpenChange, }: SingleSelectFilterChipProps): React$1.JSX.Element;
interface DateRangeValue {
    /** `yyyy-mm-dd`, or "" for unset. */
    from: string;
    to: string;
}
/**
 * "Last N weeks / days / hours / minutes", counted back from now.
 *
 * A duration rather than a pair of dates, because that is what it is: "last 2
 * days" means two days before *now*, and resolving it to fixed timestamps when
 * the user picks it quietly freezes it at the moment of the click. The chip
 * reports the duration; the caller resolves it at request time with
 * {@link relativeRangeToMillis}.
 *
 * Every field is a string because each is a text input, and "" is a field the
 * user has not filled in — distinct from "0".
 */
interface RelativeRangeValue {
    weeks: string;
    days: string;
    hours: string;
    minutes: string;
}
declare const EMPTY_RELATIVE_RANGE: RelativeRangeValue;
/** Whether a relative range names any span at all. */
declare function hasRelativeRange(value: RelativeRangeValue | undefined): boolean;
/**
 * Resolves a relative range to absolute epoch millis, evaluated at call time.
 *
 * Deliberately not memoised and never computed during render: "last 2 days"
 * means two days before now, and now moves. Call it in the handler that builds
 * the request.
 */
declare function relativeRangeToMillis(value: RelativeRangeValue): {
    startTime: number;
    endTime: number;
} | null;
interface DateRangeFilterChipProps extends FilterChipControl {
    chipKey?: string;
    label?: string;
    value: DateRangeValue;
    onChange: (next: DateRangeValue) => void;
    /**
     * Turns on the "Last…" tab beside the date range. Omit both and the chip is
     * absolute-only.
     *
     * The two modes are exclusive by construction: applying one clears the other,
     * because a range that is both "last 7 days" and "1–31 Jan" cannot be
     * honoured and nothing downstream should have to guess which half won.
     */
    relativeValue?: RelativeRangeValue;
    onRelativeChange?: (next: RelativeRangeValue) => void;
    /** Earliest / latest selectable date, `YYYY-MM-DD`. */
    min?: string;
    max?: string;
    /** Shown under the fields when a picked date falls outside `min`/`max`. */
    outOfRangeHint?: string;
    align?: "start" | "center" | "end";
}
/**
 * From / To, staged behind Apply. A half-filled range cannot be applied: an
 * open-ended date filter reads as a bug far more often than it is what someone
 * meant, and the disabled Apply says so without an error message.
 */
declare function DateRangeFilterChip({ chipKey, label, value, onChange, relativeValue, onRelativeChange, min, max, outOfRangeHint, align, open, onOpenChange, }: DateRangeFilterChipProps): React$1.JSX.Element;
interface MonthRange {
    /** Inclusive "YYYY-MM" bounds. Both ends compare as plain strings. */
    start: string;
    end: string;
}
/**
 * Month RANGE chip: pick a start month and an end month on the same year grid.
 *
 * Distinct from MonthFilterChip below, which ticks an arbitrary SET of months.
 * A range is the right shape when the value is going into a request rather than
 * being matched client-side — a start/end pair is what a "from month, to month"
 * endpoint takes, and a set of months is not expressible in one.
 *
 * The value is never empty: a caller sending it to an API always has some window
 * in force, so "Reset" restores `defaultRange` rather than clearing to nothing,
 * and the chip renders the range it is on at all times. That is deliberate — a
 * filter that silently governs a request should say what it is set to, not read
 * as unset while quietly bounding every row on screen.
 *
 * Clicking cycles the way a date-range picker does: the first click starts a new
 * range, the second closes it, and a click before the open start moves the start
 * instead of making a backwards range.
 */
declare function MonthRangeFilterChip({ chipKey, label, bounds, value, defaultRange, monthsWithData, onChange, }: {
    chipKey?: string;
    label?: string;
    /** The outer limits the grid lets the merchant navigate and pick within. */
    bounds: MonthRange;
    /** The range currently in force. Always set — see the note above. */
    value: MonthRange;
    /** What Reset goes back to, typically the window the page opens on. */
    defaultRange: MonthRange;
    /** Months with a row behind them, as "YYYY-MM". Drives the grid's dots. */
    monthsWithData: Set<string>;
    onChange: (next: MonthRange) => void;
}): React$1.JSX.Element;
interface TextFilterChipProps extends FilterChipControl {
    chipKey?: string;
    label?: string;
    value: string;
    onChange: (next: string) => void;
    /** Field label inside the panel. Defaults to `<label> contains`. */
    fieldLabel?: string;
    placeholder?: string;
    /** One line under the field — what the match actually does, typically. */
    hint?: string;
    /** Soft keyboard hint on touch devices. */
    inputMode?: "text" | "email" | "tel" | "numeric" | "url" | "search";
    align?: "start" | "center" | "end";
}
/**
 * One free-text value, staged behind Apply.
 *
 * Deliberately not a live-filtering input: this chip sits in a toolbar whose
 * other chips all commit on Apply, and a field that filtered as you typed would
 * be the one control on the row that behaves differently. Enter applies, so it
 * still costs one keystroke.
 *
 * The applied value is trimmed — a trailing space pasted in with an address is
 * not something the user meant to search for.
 */
declare function TextFilterChip({ chipKey, label, value, onChange, fieldLabel, placeholder, hint, inputMode, align, open, onOpenChange, }: TextFilterChipProps): React$1.JSX.Element;
interface NumberRangeValue {
    min: string;
    max: string;
}
interface NumberRangeFilterChipProps extends FilterChipControl {
    chipKey?: string;
    label?: string;
    value: NumberRangeValue;
    onChange: (next: NumberRangeValue) => void;
    /** Prefix inside each field — a currency symbol, typically. */
    prefix?: string;
    /** One line under the fields — what the bounds mean, or which field they match. */
    hint?: string;
    align?: "start" | "center" | "end";
}
/**
 * Min / Max, staged behind Apply. Unlike a date range, one end alone is a
 * perfectly ordinary request ("over ₹10,000"), so a half-filled range applies.
 */
declare function NumberRangeFilterChip({ chipKey, label, value, onChange, prefix, hint, align, open, onOpenChange, }: NumberRangeFilterChipProps): React$1.JSX.Element;
interface AddFilterDefinition {
    key: string;
    label: string;
    /**
     * The values this filter accepts, so the search can match them directly.
     * Omit for a filter whose values are not a list — a date or amount range —
     * and it will still be findable by name.
     */
    options?: FilterChipOption[];
    /** How many values are currently applied. Drives the count beside the name. */
    activeCount?: number;
}
interface AddFilterMenuProps extends FilterChipControl {
    chipKey?: string;
    /** Every filter this toolbar can offer, including ones already shown. */
    filters: AddFilterDefinition[];
    /** Keys already on screen as their own chip. */
    visibleKeys?: string[];
    /** Reveal a filter as its own chip. */
    onAddFilter: (key: string) => void;
    /**
     * Take a filter back out of the toolbar. Omit and a shown filter is simply
     * marked as shown; supply it and the row becomes a toggle.
     *
     * Removing must also clear whatever that filter had selected — a filter that
     * is still narrowing the table from somewhere the user cannot see it is worse
     * than one they have to scroll to.
     */
    onRemoveFilter?: (key: string) => void;
    /** Apply a value picked straight out of the search results. */
    onSelectValue?: (filterKey: string, value: string) => void;
    label?: string;
    align?: "start" | "center" | "end";
}
/**
 * "Filter" — a searchable way to reach every filter a table has, instead of a
 * second-class drawer of leftovers.
 *
 * Two things it does that a nested accordion of checkbox groups does not.
 * Typing searches filter **names and their values at once**, so someone who
 * knows they want "USD" finds it without first knowing it lives under
 * Currency. And choosing anything here promotes that filter to a real chip in
 * the toolbar, so there is exactly one place a filter can be — beside its
 * peers — rather than some being chips and some being hidden rows.
 *
 * That also means the toolbar scales: a table with twenty filters shows the
 * three or four in use and keeps the rest one keystroke away.
 */
declare function AddFilterMenu({ chipKey, filters, visibleKeys, onAddFilter, onRemoveFilter, onSelectValue, label, align, open: controlledOpen, onOpenChange: controlledOnOpenChange, }: AddFilterMenuProps): React$1.JSX.Element;
/**
 * The row a table's filters live in: search at the left, chips beside it,
 * actions pinned right.
 *
 * Search and chips share one wrapping flex, so a chip that does not fit wraps
 * to the next line starting **under the search box** — a toolbar with three
 * filters is one line, one with eight grows a second, and nothing is ever
 * scrolled out of sight. Giving each group its own box instead would wrap the
 * chips inside their own column and leave a ragged left edge.
 *
 * Wraps its chips in a {@link FilterChipGroup}, so a toolbar built with it gets
 * the one-open-at-a-time behaviour without opting in.
 */
declare function FilterToolbar({ search, chips, actions, className, }: {
    search?: ReactNode;
    chips?: ReactNode;
    actions?: ReactNode;
    className?: string;
}): React$1.JSX.Element;
/**
 * The pill action button that sits at the right of a table toolbar — Refresh,
 * Columns, Export, Report.
 *
 * It exists because `Button size="sm"` is `h-9`, which towers over the chips
 * beside it; every toolbar that wanted a level row was overriding the same four
 * classes by hand. Having it here means a toolbar's actions match its chips
 * without each one rediscovering that.
 */
declare function ToolbarButton({ className, ...props }: ComponentPropsWithoutRef<typeof Button>): React$1.JSX.Element;

type DatePickMode = "single" | "range";
/** What the calendar hands back while the user is picking. */
type CalendarRange = {
    from: Date | undefined;
    to?: Date | undefined;
};
/**
 * A named span offered above the calendar — "Today", "Last 30 Days".
 *
 * `resolve` runs when the preset is chosen, not when it is declared, so "last
 * 7 days" is counted from the day the user picks it rather than from whenever
 * the options array happened to be built.
 */
interface CalendarDatePreset {
    value: string;
    label: string;
    resolve: () => {
        from: string;
        to: string;
    };
}
/**
 * The applied value: a span, plus which preset produced it.
 *
 * `preset` is `""` when the dates were picked by hand, and `to` equals `from`
 * for a single day — so a caller that only wants a window can read `from`/`to`
 * and ignore the rest.
 */
interface CalendarDateValue {
    preset: string;
    /** YYYY-MM-DD */
    from: string;
    /** YYYY-MM-DD */
    to: string;
}
interface CalendarDateFilterChipProps extends FilterChipControl {
    chipKey?: string;
    label?: string;
    value?: CalendarDateValue;
    onChange: (next: CalendarDateValue | undefined) => void;
    /** Named spans above the calendar. Omit for a calendar-only chip. */
    presets?: readonly CalendarDatePreset[];
    /** Offer "Single date" alongside "Date range". Default true. */
    allowSingle?: boolean;
    /** Months shown side by side in range mode. Default 2. */
    numberOfMonths?: number;
    align?: "start" | "center" | "end";
}
/**
 * A date filter over a real calendar, with optional named spans.
 *
 * Distinct from {@link DateRangeFilterChip}, which is two typed date fields.
 * This one is for a filter people reach for by *looking* — "the week of the
 * 14th", "that Tuesday" — where a pair of text inputs makes you count days in
 * your head. Both exist because both are right somewhere, and picking between
 * them is a call about the filter, not about the toolbar.
 *
 * Five features in pg-dashboard-v2 had built this chip separately, each with
 * its own preset list and its own value shape. They are the same control.
 */
declare function CalendarDateFilterChip({ chipKey, label, value, onChange, presets, allowSingle, numberOfMonths, align, open, onOpenChange, }: CalendarDateFilterChipProps): React$1.JSX.Element;

/**
 * The app-wide date and time format.
 *
 * Every timestamp a PayGlocal dashboard shows a user goes through here, so a
 * transaction row, a settlement detail page, an audit log line and a chart
 * tooltip all read the same: `27 Jul '26, 09:49 AM`.
 *
 * Nothing here goes through `toLocaleDateString` / `toLocaleTimeString`. That
 * is deliberate: Intl output varies with the machine's locale, so the same
 * record would read differently for an operator in Bengaluru and a merchant in
 * Frankfurt, and a screenshot in a support ticket would not match what the
 * agent sees. These build the string from fixed tables instead.
 *
 * Times are rendered in the **viewer's own timezone**, which is what every
 * `Date` getter below returns. That is the right default for an operations
 * console — "did this settle before close of business *here*" is the question
 * being asked — but it does mean two people in different zones see different
 * clock times for one event, so anywhere that matters should label the zone.
 */
declare const MONTHS_SHORT: readonly ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
declare const DAYS_SHORT: readonly ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** What an absent or unparseable value renders as, everywhere. */
declare const EMPTY_DATE = "\u2014";
/**
 * Parses the shapes PayGlocal APIs actually send, in the order they are most
 * likely to appear:
 *
 * - `DD/MM/YYYY HH:mm:ss` — the transactions search response's
 *   `formattedCreationDateTime`. Tried **first**, because `new Date()` reads
 *   `03/07/2026` as *March 7th* under US parsing rules, silently swapping the
 *   day and month for the first twelve days of every month.
 * - epoch milliseconds, as a number **or a string** — several endpoints send
 *   `"1771329858260"`. The string form needs `Number()` first: the `Date`
 *   constructor reads a string as a date *format*, not a count of
 *   milliseconds, so `new Date("1771329858260")` is an Invalid Date.
 * - ISO 8601 — `settlementDate`, and most newer endpoints.
 */
declare function parseApiDate(value: string | number | Date | null | undefined): Date | null;
/** `09:49 AM` — 12-hour, zero-padded, uppercase meridiem. */
declare function formatTime(date: Date): string;
/** `27 Jul '26` — the date half, on its own. */
declare function formatDateOnly(date: Date): string;
/** `27 Jul '26, 09:49 AM` — the canonical form. */
declare function formatDateTime(date: Date): string;
/**
 * Any API value → `27 Jul '26, 09:49 AM`.
 *
 * This is the one to reach for in a column renderer or a detail field: it takes
 * whatever shape the endpoint sends, and returns the em dash rather than
 * "Invalid Date" when there is nothing to show.
 *
 * `fallback` is what an absent or unparseable value renders as. It defaults to
 * the em dash; pass `""` where the timestamp sits inside a sentence that should
 * simply omit it rather than show a placeholder.
 */
declare function formatTimestamp(value: string | number | Date | null | undefined, fallback?: string): string;
/** Any API value → `27 Jul '26`, with no time of day. */
declare function formatDateStamp(value: string | number | Date | null | undefined, fallback?: string): string;
/** Any API value → `09:49 AM`, with no date. */
declare function formatTimeStamp(value: string | number | Date | null | undefined, fallback?: string): string;
/**
 * `Mon, 27 Jul` — weekday and date, no year. For a date close enough to the
 * present that naming the day of the week reads better than a bare calendar
 * date, such as a "next settlement" line.
 */
declare function formatWeekdayDate(value: string | number | Date | null | undefined, fallback?: string): string;
/** `Jan 2026` — a month key (`YYYY-MM`) as a label. */
declare function formatMonthLabel(monthKey: string): string;

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger, type AddFilterDefinition, AddFilterMenu, type AddFilterMenuProps, Alert, AlertDescription, type AlertProps, AlertTitle, type AttentionListItem, AttentionListTemplate, type AttentionListTemplateProps, Avatar, AvatarFallback, AvatarGroup, type AvatarGroupItem, type AvatarGroupProps, AvatarImage, AvatarTag, type AvatarTagProps, type AvatarTagSize, Badge, type BadgeProps, type BadgeTrailIcon, type BadgeVariant, Banner, type BannerProps, Blanket, type BlanketProps, Box, type BoxProps, Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, type Breakpoint, Button, ButtonGroup, type ButtonGroupProps, type ButtonProps, COUNTRIES, Calendar, CalendarDateFilterChip, type CalendarDateFilterChipProps, type CalendarDatePreset, type CalendarDateValue, CalendarDayButton, type CalendarProps, type CalendarRange, Callout, CalloutIcon, type CalloutProps, CalloutText, CalloutTitle, type CalloutVariant, Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CategoryBarChartTemplate, type CategoryBarChartTemplateProps, type CategoryBarPoint, type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartSkeleton, ChartStyle, ChartTooltip, ChartTooltipContent, Checkbox, type CheckboxProps, CheckboxSelect, type CheckboxSelectOption, type CheckboxSelectProps, Code, CodeBlock, type CodeBlockProps, type CodeProps, type Column, ColumnManager, type ColumnManagerProps, type ColumnPreferences, Command, CommandEmpty, type CommandEmptyProps, CommandGroup, type CommandGroupProps, CommandInput, type CommandInputProps, CommandItem, type CommandItemProps, CommandList, type CommandListProps, type CommandProps, CommandSeparator, type CommandSeparatorProps, CommandShortcut, type CommandShortcutProps, CopyableCell, type CopyableCellProps, type Country, CountrySelect, type CountrySelectProps, CurrencyAmountInput, DAYS_SHORT, type DashboardAreaChartPoint, DashboardAreaChartTemplate, type DashboardAreaChartTemplateProps, DataCardList, type DataCardListProps, DataTable, DataTableCard, type DataTableCardProps, type DataTableDensity, type DataTableExpandable, type DataTableFooterSummary, type DataTableHeaderStyle, type DataTablePagination, type DataTableSortState, type DataTableSorting, type DatePickMode, DatePicker, type DatePickerTimeOptions, DateRangeFilterChip, type DateRangeFilterChipProps, type DateRangeValue, Dialog, DialogClose, DialogContent, DialogDescription, DialogPortal, DialogTitle, DialogTrigger, Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, EMPTY_DATE, EMPTY_RELATIVE_RANGE, EmptyState, Field, type FieldConfig, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle, type FieldsConfig, FilterChip, FilterChipActions, FilterChipClearButton, type FilterChipControl, FilterChipGroup, FilterChipLabelTrigger, type FilterChipOption, FilterChipShell, FilterToolbar, Flag, type FlagAction, FlagGroup, type FlagGroupPosition, type FlagGroupProps, type FlagProps, type FlagVariant, Flex, type FlexAlign, type FlexDirection, type FlexJustify, type FlexProps, type FlexWrap, Form, FormControl, FormDescription, FormError, type FormErrors, FormField, type FormFieldProps, FormItem, FormLabel, type FormProps, type FormValues, Grid, type GridCols, type GridFlow, type GridProps, GroupedBarChartTemplate, type GroupedBarChartTemplateProps, type GroupedBarSeries, Heading, type HeadingProps, Hide, type HideProps, IconButton, type IconButtonProps, Inline, InlineDialog, InlineDialogContent, type InlineDialogContentProps, type InlineDialogProps, InlineDialogTrigger, InlineEdit, type InlineEditProps, type InlineProps, Input, InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea, Label, type LayoutSpacing, Link, type LinkProps, Lozenge, type LozengeProps, MONTHS_SHORT, type ManagedColumn, Menu, MenuDivider, MenuItem, type MenuItemProps, type MenuProps, MenuSection, type MenuSectionProps, MetricSparklineCard, type MetricSparklineCardProps, type MetricSparklinePoint, MetricText, type MetricTextProps, MiniSparklineChartCard, type MiniSparklineChartCardProps, type MiniSparklinePoint, type MiniSparklineStat, type MonthRange, MonthRangeFilterChip, NumberRangeFilterChip, type NumberRangeFilterChipProps, type NumberRangeValue, OtpInput, type OtpInputProps, PageHeader, Pagination, PaginationContent, type PaginationContentProps, PaginationEllipsis, type PaginationEllipsisProps, PaginationItem, type PaginationItemProps, PaginationLink, type PaginationLinkProps, PaginationNext, type PaginationNextProps, PaginationPrevious, type PaginationPreviousProps, type PaginationProps, PasswordInput, type PasswordInputProps, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, Progress, ProgressIndicator, type ProgressIndicatorProps, type ProgressProps, ProgressTracker, type ProgressTrackerProps, type ProgressTrackerStep, RadioGroup, RadioGroupItem, type RadioGroupItemProps, type RankedBarItem, RankedBarListTemplate, type RankedBarListTemplateProps, type RegisterResult, type RelativeRangeValue, type ResponsiveCols, RotatingSearchInput, type RotatingSearchInputProps, ScrollArea, ScrollBar, SectionMessage, SectionMessageActions, SectionMessageContent, type SectionMessageProps, SectionMessageTitle, type SectionMessageVariant, type SegmentedTabOption, SegmentedTabs, Select, SelectContent, SelectFilterChip, type SelectFilterChipProps, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, type SelectTriggerSize, SelectValue, Separator, Shimmer, Show, type ShowProps, SideNav, SideNavFooter, SideNavHeader, SideNavItem, type SideNavItemProps, type SideNavProps, SideNavSection, SingleSelectFilterChip, type SingleSelectFilterChipProps, Slider, type SliderProps, type SortOrder, Spinner, type SpinnerProps, SplitButton, SplitButtonItem, type SplitButtonItemProps, type SplitButtonProps, Spotlight, SpotlightCard, type SpotlightCardProps, type SpotlightProps, type SpotlightStep, Stack, type StackProps, StatCardSkeleton, StatusBadge, type StatusBadgeProps, Switch, type SwitchProps, TableRowSkeleton, TableToolbarActions, Tabs, TabsContent, TabsList, TabsTrigger, Tag, TagGroup, type TagGroupProps, type TagProps, Text, TextFilterChip, type TextFilterChipProps, type TextProps, Textarea, TimePicker, type TimePickerProps, Toaster, ToolbarButton, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, type UnderlineTab, UnderlineTabs, type UseBreakpointReturn, type UseColumnPreferencesOptions, type UseColumnPreferencesResult, type UseFlagGroupReturn, type UseFormReturn, type UseSpotlightReturn, type ValidatorRule, VisuallyHidden, type VisuallyHiddenProps, applyColumnPreferences, cn, formatDateOnly, formatDateStamp, formatDateTime, formatMonthLabel, formatTime, formatTimeStamp, formatTimestamp, formatWeekdayDate, frozenColumn, hasRelativeRange, parseApiDate, relativeRangeToMillis, useBreakpoint, useColumnPreferences, useFilterChipState, useFlagGroup, useForm, useSpotlight };
