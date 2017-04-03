import React from 'react';
import { FileUpload } from 'elemental';

const checkmark = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM0MUFENDk7fQo8L3N0eWxlPjxnPjxwb2x5Z29uIGNsYXNzPSJzdDAiIHBvaW50cz0iNDM0LjgsNDkgMTc0LjIsMzA5LjcgNzYuOCwyMTIuMyAwLDI4OS4yIDE3NC4xLDQ2My4zIDE5Ni42LDQ0MC45IDE5Ni42LDQ0MC45IDUxMS43LDEyNS44IDQzNC44LDQ5ICAgICAiLz48L2c+PC9zdmc+';

export default React.createClass({

   propTypes: {
      file: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]),
      onChange: React.PropTypes.func,
   },

   getDefaultProps() {
      return {
         file: {},
         onChange() {},
      };
   },

   onChange(e, data) {
      this.props.onChange(data !== null ? data.file : '');

      if (data !== null && !this.isImage(data.file.type)) {
         this.replaceDataURI(checkmark);
      }
   },

   setElement(element) {
      this.element = element;

      const file = this.props.file;
      if (!file.filename) return;
      this.getDataUri(file.filename, file.mimetype, this.replaceDataURI);
   },

   // from https://davidwalsh.name/convert-image-data-uri-javascript
   getDataUri(url, mimetype, callback) {
      if (!this.isImage(mimetype)) {
         return callback(checkmark);
      }

      const image = new window.Image();
      image.onload = () => {
         const canvas = document.createElement('canvas');
         canvas.width = image.naturalWidth;
         canvas.height = image.naturalHeight;
         canvas.getContext('2d').drawImage(image, 0, 0);
         callback(canvas.toDataURL(mimetype));
      };
      image.src = `./uploads/${url}`;
   },

   replaceDataURI(dataURI) {
      this.element.setState({
         dataURI,
         file: this.props.file,
      });
   },

   isImage(type) {
      const imageMimetypes = ['image/jpg', 'image/jpeg', 'image/gif', 'image/png', 'image/bmp', 'image/webp'];
      return imageMimetypes.includes(type);
   },

   render() {
      const { onChange, file, ...rest } = this.props; // eslint-disable-line no-unused-vars
      return (
         <FileUpload
            ref={this.setElement}
            onChange={this.onChange}
            {...rest}
         />
      );
   },

});
