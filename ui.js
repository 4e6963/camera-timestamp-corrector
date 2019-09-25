export class UI {

    constructor (app) {
        this.app = app;
        this.qrCodeInterval();
    }

    qrCodeInterval(){
        setInterval(() => {
            var qrCodeZone = document.querySelector('#qr-code-zone');
            var qrCodeZoneComputedStyle = window.getComputedStyle(qrCodeZone);
            var width = parseInt(qrCodeZoneComputedStyle.width, 10)
            var height = parseInt(qrCodeZoneComputedStyle.height, 10)
            var canvas = document.querySelector('#canvas');
            QRCode.toCanvas(canvas, new Date().valueOf() + '', { errorCorrectionLevel: 'H', width: Math.min(width, height) }, err => !err || console.log(err));
        }, 500);
    }

    dropHandler = evt => {
        evt.preventDefault();
        this.setFileHover(false);
        this.app.readQrCode(this.getFirstFile(evt.dataTransfer))
            .then(this.app.extractDates)
            .then(this.app.compareDates)
            .then(this.app.buildCommand)
            .then(command => {
                const dropZoneText = document.querySelector('#drop-zone-text');
                dropZoneText.innerText = command;
            })
            .catch(err => console.error(err));
    }

    setFileHover = (state, evt) => {
        !evt || evt.preventDefault();
        const dropZone = document.querySelector('#drop-zone');
        state ? dropZone.classList.add('file-hover') : dropZone.classList.remove('file-hover');
    }

    getFirstFile = dataTransfer => {
        if (dataTransfer.items && dataTransfer.items[0] && dataTransfer.items[0].kind === 'file') {
            return dataTransfer.items[0].getAsFile();
        } else if (dataTransfer.files && dataTransfer.files[0]) {
            return dataTransfer.files[0];
        }
    }
}