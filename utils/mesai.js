const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(
    __dirname,
    "..",
    "mesailer.json"
);

function verileriYukle() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(
                DATA_FILE,
                JSON.stringify({}, null, 4)
            );
        }

        return JSON.parse(
            fs.readFileSync(DATA_FILE, "utf8")
        );

    } catch (error) {
        console.error("❌ Mesai verileri okunamadı:", error);
        return {};
    }
}

function verileriKaydet(veriler) {
    try {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(veriler, null, 4)
        );

        return true;

    } catch (error) {
        console.error("❌ Mesai verileri kaydedilemedi:", error);
        return false;
    }
}

function sureFormatla(ms) {

    const toplamSaniye =
        Math.floor(ms / 1000);

    const saat =
        Math.floor(toplamSaniye / 3600);

    const dakika =
        Math.floor(
            (toplamSaniye % 3600) / 60
        );

    const saniye =
        toplamSaniye % 60;

    return `${saat} saat ${dakika} dakika ${saniye} saniye`;
}

module.exports = {
    verileriYukle,
    verileriKaydet,
    sureFormatla
};