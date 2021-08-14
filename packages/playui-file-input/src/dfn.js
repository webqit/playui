
/**
 * ---------------------------
 * Class definitions
 * ---------------------------
 */
export default function(window) {

    /**
     * @File
    */
    const file = class extends window.HTMLInputElement {
        
        constructor() {
            super();
            // A new DataTransfer object
            this._dataTransfer = new DataTransfer;
            // On-direct choosing
            this.addEventListener('change', e => {
                if (this.data.dropArea) {
                    this._addFiles(this.files, true);
                }
            });
        }

        connectedCallback() {
            if (this.data.dropArea) {
                const dropArea = this.closest(this.data.dropArea);
                // On drag-and-drop
                [ 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop' ].forEach(eventName => {
                    dropArea.removeEventListener(eventName, this._handlerDrag);
                    dropArea.addEventListener(eventName, this._handlerDrag);
                });
			}
        }

        _handlerDrag(e) {
            if (e.type === 'dragover' || e.type === 'dragenter') {
                if (this.state) {
                    this.state.dragging = true;
                }
            } else if (e.type === 'dragleave' || e.type === 'dragend' || e.type === 'drop') {
                e.preventDefault();
                if (this.state) {
                    this.state.dragging = false;
                }
                if (e.type === 'drop') {
                    this._addFiles(e.dataTransfer.files);
                }
            }
        }

        _addFiles(files, isDirectSelection = false) {
            if (isDirectSelection) {
                if (this._prevFilesDirectSelection) {
                    for (let i = 0; i < this._prevFilesDirectSelection.length; i++) {
                        this._dataTransfer.items.remove(this._prevFilesDirectSelection[i]);
                    }
                }
                this._prevFilesDirectSelection = files;
            }
            if (this.multiple) {
                // Add new files each time
                for (let i = 0; i < files.length; i++) {
                    this._dataTransfer.items.add(files[i])
                }
            } else {
                // Clear existing
                this._dataTransfer.items.clear();
                this._dataTransfer.items.add(files[0]);
            }
            // Assign the files to the input element
            this.files = this._dataTransfer.files;
            if (this.state) {
                this.state.thumbnails = Array.from(this.files).map(file => this._createThumbnail(file));
            }
        }

        /**
         * Craete a thumbnail object for a file.
         *
         * @param File  file
         *
         * @return Object
         */
        _createThumbnail(file) {
            // Show thumnails
            var desc = `${file.name}: ${file.size / 1024}KB`;
            var revokeURL = el => window.URL.revokeObjectURL(el.src);
            if (/^image\//.test(file.type)) {
                var img = document.createElement('img');
                img.onload = e => { revokeURL(img); };
                img.src = window.URL.createObjectURL(file);
                return { thumbnail:img, type:'image', mime:file.type, desc, };
            }
            if (/^video\//.test(file.type)) {
                var media = document.createElement('video');
                media.onloadstart/*canplay*/ = e => { revokeURL(media); media.play(); };
                media.src = window.URL.createObjectURL(file);
                media.muted = true;
                return { thumbnail:media, type:'video', mime:file.type, desc, };
            }
            var type = 'file';
            if (/^audio\//.test(file.type)) {
                type = 'audio';
            } else if (/msword|ms-word|wordprocessing/.test(file.type)) {
                type = 'word';
            } else if (/powerpoint|presentation/.test(file.type)) {
                type = 'powerpoint';
            } else if (/excel|spreadsheet/.test(file.type)) {
                type = 'excel';
            } else if (/^text\//.test(file.type)) {
                type = 'text';
            } else if (/\/pdf/.test(file.type)) {
                type = 'pdf';
            } else if (/\/zip/.test(file.type)) {
                type = 'zip';
            }
            return { type, mime:file.type, desc, };
        }

    };

    return {
        file,
    }
};
