const getQueryParams = () => {
    let vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (_, key, value) => {
        vars[key] = value;
    });
    return vars;
};

const parameters = () => {
    const params = getQueryParams();
    const currentDay = new Date()
        .toLocaleDateString("fi", {
            weekday: "long"
        })
        .toLowerCase();

    const day = params.paiva || currentDay;

    return {
        ...params,
        day
    };
};

export default parameters;
