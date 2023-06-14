export const dateTimeHelper = (operationDate?: string) => {
    if (!operationDate) return
    return `${new Date(operationDate).toLocaleDateString()} - ${new Date(operationDate).toLocaleTimeString()}`;
}