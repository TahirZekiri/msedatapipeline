// src/utils/dateHelper.js
function getDateRangeForLast10Years() {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setFullYear(toDate.getFullYear() - 10);

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    return {
        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate),
    };
}

module.exports = getDateRangeForLast10Years;