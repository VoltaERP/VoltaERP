const LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE';
const validarDNI = (nif) => {
    const match = nif.match(/^(\d{8})([A-Z])$/);
    if (!match) return false;
    return match[2] === LETRAS_DNI[parseInt(match[1]) % 23];
};
const validarNIE = (nif) => {
    const match = nif.match(/^([XYZ])(\d{7})([A-Z])$/);
    if (!match) return false;
    const prefijo = { X: '0', Y: '1', Z: '2' }[match[1]];
    return match[3] === LETRAS_DNI[parseInt(prefijo + match[2]) % 23];
};
const validarCIF = (nif) => {
    const match = nif.match(/^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/);
    if (!match) return false;
    const digitos = match[2];
    const control = match[3];
    const tipo    = match[1];
    let sumaPar = 0, sumaImpar = 0;
    for (let i = 0; i < digitos.length; i++) {
        const d = parseInt(digitos[i]);
        if ((i + 1) % 2 === 0) {
            sumaPar += d;
        } else {
            const doble = d * 2;
            sumaImpar += Math.floor(doble / 10) + (doble % 10);
        }
    }
    const digitoControl = (10 - ((sumaPar + sumaImpar) % 10)) % 10;
    const letraControl  = 'JABCDEFGHI'[digitoControl];
    if (['K', 'P', 'Q', 'S'].includes(tipo)) return control === letraControl;
    if (['A', 'B', 'E', 'H'].includes(tipo)) return control === String(digitoControl);
    return control === letraControl ||control === String(digitoControl);
};
const validarNIF = (nif) => {
    if (!nif) return false;
    const nifLimpio = nif.trim().toUpperCase();
    return validarDNI(nifLimpio) || validarNIE(nifLimpio) || validarCIF(nifLimpio);
};
export {validarNIF};