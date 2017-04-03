import React from 'react';
import { FileUpload } from 'elemental';

export default React.createClass({

   propTypes: {
      file: React.PropTypes.object,
   },

   getDefaultProps() {
      return {
         file: {},
      };
   },

   setElement(element) {
      const file = this.props.file;
      const setDataUri = dataURI => element.setState({ dataURI, file });

      if (!file.filename) return;
      this.getDataUri(file.filename, file.mimetype, setDataUri);
   },

   // from https://davidwalsh.name/convert-image-data-uri-javascript
   getDataUri(url, mimetype = 'image/png', callback) {
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

   render() {
      return (
         <FileUpload
            ref={this.setElement}
            {...this.props}
         />
      );
   },

});
