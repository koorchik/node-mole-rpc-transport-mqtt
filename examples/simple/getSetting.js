function getSetting(envVarName, defaultValue) {
    let value = process.env[envVarName];

    if (value) {
        console.log(`setting ${envVarName} via process.env.${envVarName} to ${value}`);
    } else {
        value = defaultValue;
        console.log(`setting ${envVarName} by default to ${defaultValue}`);
    }

    return value;
}

module.exports = { getSetting };
