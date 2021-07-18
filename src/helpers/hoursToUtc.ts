export const hoursToUtc = (hours, offset) => {
    let updatedHours = hours + offset

    if (updatedHours > 23) {
        updatedHours = updatedHours - 24
    }

    if (updatedHours < 0) {
        updatedHours = 24 + updatedHours;
    }

    return updatedHours;
}
