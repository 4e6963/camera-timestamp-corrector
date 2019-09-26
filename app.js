export class App {

    constructor() {
    }


    extractDates = scannerResult => {
        const actualTime = new Date(scannerResult.qrCodeData * 1)
        const cameraTime = this.parseExifDate(scannerResult.exifTags.DateTime.value[0]);
        return new Promise(resolve => resolve({ actualTime: actualTime, cameraTime: cameraTime }));
    }

    parseExifDate = dateString => {
        var pattern = /^(\d\d\d\d):(\d\d):(\d\d) (\d\d):(\d\d):(\d\d)$/;
        var matches = pattern.exec(dateString);
        if (!matches) {
            throw new Error("Invalid string: " + string);
        }
        var year = matches[1];
        var month = matches[2] - 1;
        var day = matches[3];
        var hour = matches[4];
        var minute = matches[5];
        var second = matches[6];
        return new Date(year, month, day, hour, minute, second)
    }

    compareDates = times => {
        return new Promise(resolve => resolve(Math.round((times.cameraTime - times.actualTime) / 1000)))
    }


    toDataUrl = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });



    buildCommand = timeDifference => new Promise(resolve => {
        const operator = timeDifference > -1 ? '+' : '-';
        resolve(`exiftool -AllDates${operator}=${timeDifference}s *.jpg`)
    });

    readQrCode = file => {
        return new Promise((resolve, reject) => {
            this.toDataUrl(file).then(dataUrl => {
                qrcode.callback = qrCodeData => {
                    if (qrCodeData === 'error decoding QR Code') {
                        reject(qrCodeData);
                    }
                    const reader = new FileReader();
                    reader.onload = e => {
                        const tags = ExifReader.load(e.target.result);
                        const scannerResult = {
                            qrCodeData: qrCodeData,
                            exifTags: tags
                        }
                        resolve(scannerResult);
                    };
                    reader.onerror = error => reject(error);
                    reader.readAsArrayBuffer(file);
                };
                qrcode.decode(dataUrl)
            }, err => reject(err));

        });

    }
}