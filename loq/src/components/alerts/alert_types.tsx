export type AlertOptions = {};
export type AlertHandlerChangeListener = (alerts: {
    [key: string]: AlertInfo
}) => void;
export type AlertInfo = {
    content: React.ReactNode
    options?: AlertOptions
    id: string
}